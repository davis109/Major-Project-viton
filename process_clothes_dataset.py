#!/usr/bin/env python3
"""
Script to process the Clothes_Dataset and create a new product database
"""

import os
import pandas as pd
import shutil
from PIL import Image
import random
import uuid
from datetime import datetime, timedelta

# Paths
CLOTHES_DATASET_PATH = "c:\\Users\\sebas\\Downloads\\AI_VITON-main\\Clothes_Dataset"
BACKEND_PATH = "c:\\Users\\sebas\\Downloads\\AI_VITON-main\\AI_VITON-main\\back\\backend"
FITTED_IMAGES_PATH = os.path.join(BACKEND_PATH, "fitted_images")

# Category mapping from folder names to standardized categories
CATEGORY_MAPPING = {
    'Blazer': {'main_category': 'Top Wear', 'subcategory': 'Blazer'},
    'Celana_Panjang': {'main_category': 'Bottom Wear', 'subcategory': 'Pants'},
    'Celana_Pendek': {'main_category': 'Bottom Wear', 'subcategory': 'Shorts'},
    'Gaun': {'main_category': 'Western Wear', 'subcategory': 'Dress'},
    'Hoodie': {'main_category': 'Top Wear', 'subcategory': 'Hoodie'},
    'Jaket': {'main_category': 'Top Wear', 'subcategory': 'Jacket'},
    'Jaket_Denim': {'main_category': 'Top Wear', 'subcategory': 'Denim Jacket'},
    'Jaket_Olahraga': {'main_category': 'Sports Wear', 'subcategory': 'Sports Jacket'},
    'Jeans': {'main_category': 'Bottom Wear', 'subcategory': 'Jeans'},
    'Kaos': {'main_category': 'Top Wear', 'subcategory': 'T-Shirt'},
    'Kemeja': {'main_category': 'Top Wear', 'subcategory': 'Shirt'},
    'Mantel': {'main_category': 'Top Wear', 'subcategory': 'Coat'},
    'Polo': {'main_category': 'Top Wear', 'subcategory': 'Polo'},
    'Rok': {'main_category': 'Bottom Wear', 'subcategory': 'Skirt'},
    'Sweter': {'main_category': 'Top Wear', 'subcategory': 'Sweater'}
}

# Seller names for variety
SELLERS = [
    'FashionHub', 'StyleCraft', 'TrendWear', 'UrbanStyle', 'ClassicFit',
    'ModernThreads', 'EliteWear', 'CasualChic', 'SmartStyle', 'FreshLook',
    'VogueCollection', 'StyleZone', 'TrendSetters', 'FashionForward', 'ChicWear'
]

def generate_product_data():
    """Generate product data from Clothes_Dataset directory"""
    products_data = []
    product_id = 1000
    
    # Create fitted_images directory if it doesn't exist
    os.makedirs(FITTED_IMAGES_PATH, exist_ok=True)
    
    print("Processing clothes dataset...")
    
    for category_folder in os.listdir(CLOTHES_DATASET_PATH):
        category_path = os.path.join(CLOTHES_DATASET_PATH, category_folder)
        
        if not os.path.isdir(category_path):
            continue
            
        if category_folder not in CATEGORY_MAPPING:
            print(f"Warning: Unknown category '{category_folder}', skipping...")
            continue
        
        category_info = CATEGORY_MAPPING[category_folder]
        print(f"Processing category: {category_folder}")
        
        # Get all image files in the category
        image_files = [f for f in os.listdir(category_path) 
                      if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
        
        for i, image_file in enumerate(image_files):
            # Set different limits based on category
            if category_folder == 'Gaun':
                if i >= 200:  # Load 200 dresses
                    break
            else:
                if i >= 20:  # Limit other categories to 20 items to keep dataset manageable
                    break
                
            try:
                source_image_path = os.path.join(category_path, image_file)
                
                # Copy image to fitted_images with new naming convention
                new_filename = f"{product_id}_extracted.png"
                dest_image_path = os.path.join(FITTED_IMAGES_PATH, new_filename)
                
                # Simple copy without conversion for now
                shutil.copy2(source_image_path, dest_image_path)
                
                # Generate synthetic product data
                product_name = generate_product_name(category_info['subcategory'])
                price = random.randint(200, 2000)
                mrp = price + random.randint(100, 1000)
                discount = round(((mrp - price) / mrp) * 100)
                rating = round(random.uniform(3.5, 4.8), 1)
                rating_total = random.randint(100, 50000)
                seller = random.choice(SELLERS)
                
                # Generate random date within last 2 years
                start_date = datetime.now() - timedelta(days=730)
                random_date = start_date + timedelta(days=random.randint(0, 730))
                
                # Determine target audience based on category
                target_audience = determine_target_audience(category_folder)
                
                # Create product URL (synthetic)
                product_url = f"https://fashionstore.com/{category_folder.lower()}/{product_id}"
                
                # Create image URL (will point to local file in actual usage)
                image_url = f"/fitted_images/{new_filename}"
                
                product_data = {
                    'name': product_name,
                    'img': image_url,
                    'price': price,
                    'mrp': mrp,
                    'rating': rating,
                    'ratingTotal': rating_total,
                    'discount': discount,
                    'seller': seller,
                    'purl': product_url,
                    'target_audience': target_audience,
                    'main_category': category_info['main_category'],
                    'subcategory': category_info['subcategory'],
                    'date': random_date.strftime('%m/%d/%Y'),
                    'quantity': random.randint(50, 1000),
                    'product_id': product_id,
                    'extract_images': new_filename
                }
                
                products_data.append(product_data)
                product_id += 1
                
                if len(products_data) % 100 == 0:
                    print(f"Processed {len(products_data)} items...")
                
            except Exception as e:
                print(f"Error processing {image_file}: {e}")
                continue
    
    return products_data

def generate_product_name(subcategory):
    """Generate realistic product names"""
    adjectives = ['Classic', 'Modern', 'Stylish', 'Elegant', 'Casual', 'Premium', 'Comfort', 'Smart', 
                 'Trendy', 'Chic', 'Designer', 'Fashion', 'Cool', 'Fresh', 'Urban', 'Vintage']
    
    materials = ['Cotton', 'Denim', 'Polyester', 'Blend', 'Silk', 'Linen', 'Wool', 'Jersey']
    
    fits = ['Slim Fit', 'Regular Fit', 'Loose Fit', 'Relaxed Fit', 'Tailored']
    
    name_parts = [random.choice(adjectives)]
    
    if random.random() < 0.3:  # 30% chance to add material
        name_parts.append(random.choice(materials))
    
    name_parts.append(subcategory)
    
    if subcategory in ['T-Shirt', 'Shirt', 'Pants', 'Jeans'] and random.random() < 0.4:
        name_parts.append(random.choice(fits))
    
    return ' '.join(name_parts)

def determine_target_audience(category):
    """Determine target audience based on category name"""
    # Simple heuristic - can be improved with more sophisticated logic
    unisex_categories = ['Kaos', 'Hoodie', 'Jaket', 'Jeans', 'Polo']
    female_categories = ['Gaun', 'Rok']
    
    if category in unisex_categories:
        return random.choice(['Male', 'Female', 'Unisex'])
    elif category in female_categories:
        return 'Female'
    else:
        return random.choice(['Male', 'Unisex'])

def main():
    """Main function to process the clothes dataset"""
    print("Starting clothes dataset processing...")
    
    # Generate product data
    products_data = generate_product_data()
    
    if not products_data:
        print("No products were processed!")
        return
    
    # Create DataFrame
    df = pd.DataFrame(products_data)
    
    # Save to CSV
    output_csv = os.path.join(BACKEND_PATH, "products_final_data.csv")
    df.to_csv(output_csv, index=True)
    
    print(f"Successfully processed {len(products_data)} products!")
    print(f"Data saved to: {output_csv}")
    print(f"Extracted images saved to: {FITTED_IMAGES_PATH}")
    
    # Print summary by category
    print("\nSummary by category:")
    category_summary = df.groupby('subcategory').size().sort_values(ascending=False)
    for category, count in category_summary.items():
        print(f"  {category}: {count} items")

if __name__ == "__main__":
    main()