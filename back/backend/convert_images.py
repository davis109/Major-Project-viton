#!/usr/bin/env python3
"""
Script to convert all images in fitted_images to proper PNG format
"""

import os
from PIL import Image
from pathlib import Path

def convert_images_to_png():
    """Convert all images in fitted_images to proper PNG format"""
    fitted_images_path = "fitted_images"
    
    if not os.path.exists(fitted_images_path):
        print(f"Directory {fitted_images_path} not found!")
        return
    
    converted_count = 0
    error_count = 0
    
    for filename in os.listdir(fitted_images_path):
        if filename.endswith('.png'):
            file_path = os.path.join(fitted_images_path, filename)
            temp_path = os.path.join(fitted_images_path, f"temp_{filename}")
            
            try:
                # Open the image
                with Image.open(file_path) as img:
                    # Convert to RGB if necessary (some formats don't support transparency)
                    if img.mode in ('RGBA', 'LA'):
                        # Create a white background
                        background = Image.new('RGB', img.size, (255, 255, 255))
                        if img.mode == 'RGBA':
                            background.paste(img, mask=img.split()[-1])
                        else:
                            background.paste(img, mask=img.split()[-1])
                        img = background
                    elif img.mode != 'RGB':
                        img = img.convert('RGB')
                    
                    # Resize if too large (max 800x800)
                    if img.width > 800 or img.height > 800:
                        img.thumbnail((800, 800), Image.Resampling.LANCZOS)
                    
                    # Save as proper PNG
                    img.save(temp_path, 'PNG', optimize=True)
                
                # Replace original file with converted file
                os.replace(temp_path, file_path)
                converted_count += 1
                
                if converted_count % 50 == 0:
                    print(f"Converted {converted_count} images...")
                    
            except Exception as e:
                print(f"Error converting {filename}: {e}")
                error_count += 1
                # Clean up temp file if it exists
                if os.path.exists(temp_path):
                    os.remove(temp_path)
    
    print(f"Conversion complete! Successfully converted {converted_count} images.")
    if error_count > 0:
        print(f"Failed to convert {error_count} images.")

if __name__ == "__main__":
    convert_images_to_png()