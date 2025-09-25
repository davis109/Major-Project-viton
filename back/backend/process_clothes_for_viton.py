#!/usr/bin/env python3
"""
Script to process all clothes images through the clothes extractor for virtual try-on
"""

import os
import sys
sys.path.append('../clothes_extractor')

from PIL import Image
import cv2
import numpy as np
import torch
import torch.nn.functional as F
import torchvision.transforms as transforms
from collections import OrderedDict

# Import from clothes_extractor
from u2net_model import U2NET

def load_checkpoint(model, checkpoint_path):
    if not os.path.exists(checkpoint_path):
        print("----No checkpoints at given path----")
        return
    model_state_dict = torch.load(checkpoint_path, map_location=torch.device("cpu"))
    new_state_dict = OrderedDict()
    for k, v in model_state_dict.items():
        name = k[7:] if k.startswith('module.') else k
        new_state_dict[name] = v
    model.load_state_dict(new_state_dict)
    print("----checkpoints loaded from path: {}----".format(checkpoint_path))
    return model

def get_palette(num_cls):
    n = num_cls
    palette = [0] * (n * 3)
    for j in range(0, n):
        lab = j
        palette[j * 3 + 0] = 0
        palette[j * 3 + 1] = 0
        palette[j * 3 + 2] = 0
        i = 0
        while lab:
            palette[j * 3 + 0] |= (((lab >> 0) & 1) << (7 - i))
            palette[j * 3 + 1] |= (((lab >> 1) & 1) << (7 - i))
            palette[j * 3 + 2] |= (((lab >> 2) & 1) << (7 - i))
            i += 1
            lab >>= 3
    return palette

class Normalize_image(object):
    def __init__(self, mean, std):
        self.mean = mean
        self.std = std
        self.normalize_1 = transforms.Normalize(self.mean, self.std)
        self.normalize_3 = transforms.Normalize([self.mean] * 3, [self.std] * 3)

    def __call__(self, image_tensor):
        if image_tensor.shape[0] == 1:
            return self.normalize_1(image_tensor)
        elif image_tensor.shape[0] == 3:
            return self.normalize_3(image_tensor)
        else:
            raise ValueError("Please set proper channels! Normalization implemented only for 1 and 3 channels")

def apply_transform(img):
    transforms_list = []
    transforms_list += [transforms.ToTensor()]
    transforms_list += [Normalize_image(0.5, 0.5)]
    transform_rgb = transforms.Compose(transforms_list)
    return transform_rgb(img)

def generate_mask(input_image, net, palette, device='cpu'):
    img = input_image
    img_size = img.size
    img = img.resize((768, 768), Image.BICUBIC)
    image_tensor = apply_transform(img)
    image_tensor = torch.unsqueeze(image_tensor, 0)

    with torch.no_grad():
        output_tensor = net(image_tensor.to(device))
        output_tensor = F.log_softmax(output_tensor[0], dim=1)
        output_tensor = torch.max(output_tensor, dim=1, keepdim=True)[1]
        output_tensor = torch.squeeze(output_tensor, dim=0)
        output_arr = output_tensor.cpu().numpy()

    classes_to_save = []
    for cls in range(1, 4):
        if np.any(output_arr == cls):
            classes_to_save.append(cls)

    alpha_masks = []
    for cls in classes_to_save:
        alpha_mask = (output_arr == cls).astype(np.uint8) * 255
        alpha_mask = alpha_mask[0]
        alpha_masks.append(alpha_mask)

    if alpha_masks:
        combined_alpha_mask = np.max(alpha_masks, axis=0)
    else:
        combined_alpha_mask = np.zeros_like(output_arr[0], dtype=np.uint8)
    
    combined_alpha_mask = Image.fromarray(combined_alpha_mask, mode='L')
    combined_alpha_mask = combined_alpha_mask.resize(img_size, Image.BICUBIC)
    
    cloth_seg = Image.fromarray(output_arr[0].astype(np.uint8), mode='P')
    cloth_seg.putpalette(palette)
    cloth_seg = cloth_seg.resize(img_size, Image.BICUBIC)
    
    return combined_alpha_mask, cloth_seg

def load_seg_model(checkpoint_path, device='cpu'):
    net = U2NET(in_ch=3, out_ch=4)
    net = load_checkpoint(net, checkpoint_path)
    net = net.to(device)
    net = net.eval()
    return net

def save_transparent_image(image_pil, alpha_mask, output_path):
    original_image = np.array(image_pil.convert('RGBA'))
    alpha_mask = cv2.resize(alpha_mask, (original_image.shape[1], original_image.shape[0]))

    if original_image.shape[2] == 4:  
        transparent_image = np.concatenate([original_image[:, :, :3], np.expand_dims(alpha_mask, axis=2)], axis=2)
    else:
        transparent_image = np.concatenate([original_image[:, :, :3], np.expand_dims(alpha_mask, axis=2)], axis=2)

    if transparent_image.shape[2] == 4:
        b, g, r, a = cv2.split(transparent_image)
        white_background = np.ones_like(transparent_image[:, :, :3]) * 255
        alpha = a / 255.0
        alpha_inv = 1.0 - alpha
        for c in range(3):
            white_background[:, :, c] = (alpha * transparent_image[:, :, c] + alpha_inv * white_background[:, :, c])
        cv2.imwrite(output_path, white_background)
    else:
        cv2.imwrite(output_path, transparent_image)

def process_clothes_images():
    """Process all clothes images in fitted_images directory"""
    fitted_images_dir = "./fitted_images"
    checkpoint_path = "../clothes_extractor/model/cloth_segm.pth"
    
    # Check if checkpoint exists
    if not os.path.exists(checkpoint_path):
        print(f"Model checkpoint not found at {checkpoint_path}")
        print("Please ensure the clothes extractor model is available.")
        return
    
    device = 'cpu'  # Use CPU for compatibility
    print("Loading clothes extraction model...")
    model = load_seg_model(checkpoint_path, device=device)
    palette = get_palette(4)
    
    # Create output directory for processed images
    output_dir = "./fitted_images_processed"
    os.makedirs(output_dir, exist_ok=True)
    
    # Process all images
    image_files = [f for f in os.listdir(fitted_images_dir) 
                  if f.endswith('.png') and '_extracted' in f]
    
    print(f"Found {len(image_files)} images to process...")
    
    processed_count = 0
    for filename in image_files:
        try:
            input_path = os.path.join(fitted_images_dir, filename)
            output_path = os.path.join(output_dir, filename)
            
            # Load image
            with Image.open(input_path) as img:
                img = img.convert('RGB')
                
                # Generate mask and extract clothes
                combined_alpha_mask, cloth_seg_image = generate_mask(img, model, palette, device)
                alpha_mask = np.array(combined_alpha_mask)
                
                # Save processed image
                save_transparent_image(img, alpha_mask, output_path)
                
                processed_count += 1
                if processed_count % 10 == 0:
                    print(f"Processed {processed_count}/{len(image_files)} images...")
                
        except Exception as e:
            print(f"Error processing {filename}: {e}")
            continue
    
    print(f"Successfully processed {processed_count} images!")
    print(f"Processed images saved to: {output_dir}")
    
    # Replace original images with processed ones
    print("Replacing original images with processed versions...")
    for filename in os.listdir(output_dir):
        src = os.path.join(output_dir, filename)
        dst = os.path.join(fitted_images_dir, filename)
        
        try:
            # Copy processed image back
            with Image.open(src) as img:
                img.save(dst)
        except Exception as e:
            print(f"Error replacing {filename}: {e}")
    
    print("All images have been processed for virtual try-on!")

if __name__ == "__main__":
    process_clothes_images()