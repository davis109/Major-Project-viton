"""
Large Dataset Processor - Create 1000 Images
This will create a dataset with 1000 images from all clothing categories
"""

import os
import sqlite3
import shutil
from pathlib import Path
import csv

def get_1000_images_from_dataset(dataset_path, total_images=1000):
    """Get 1000 images from ALL categories in the dataset"""
    image_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp']
    images_data = []
    
    dataset_path = Path(dataset_path)
    product_id = 1
    
    print(f"Scanning dataset at: {dataset_path.absolute()}")
    print(f"Target: {total_images} total images")
    
    # Category mappings
    category_mapping = {
        'Blazer': 'Blazer',
        'Celana_Panjang': 'Pants', 
        'Celana_Pendek': 'Shorts',
        'Gaun': 'Dress',
        'Hoodie': 'Hoodie',
        'Jaket': 'Jacket',
        'Jaket_Denim': 'Denim Jacket',
        'Jaket_Olahraga': 'Sports Jacket',
        'Jeans': 'Jeans',
        'Kaos': 'T-Shirt',
        'Kemeja': 'Shirt',
        'Mantel': 'Coat',
        'Polo': 'Polo',
        'Rok': 'Skirt',
        'Sweter': 'Sweater'
    }
    
    # First, count available images per category
    category_counts = {}
    for category_folder in dataset_path.iterdir():
        if category_folder.is_dir() and category_folder.name in category_mapping:
            count = len([f for f in category_folder.iterdir() 
                        if f.suffix.lower() in image_extensions])
            category_counts[category_folder.name] = count
    
    print(f"Available images per category:")
    for cat, count in category_counts.items():
        print(f"  {category_mapping[cat]}: {count} images")
    
    # Calculate how many images to take from each category
    total_categories = len(category_counts)
    images_per_category = total_images // total_categories
    remaining_images = total_images % total_categories
    
    print(f"\\nTaking {images_per_category} images per category (+ {remaining_images} extra)")
    
    # Process each category folder
    categories_processed = 0
    for category_folder in dataset_path.iterdir():
        if category_folder.is_dir() and category_folder.name in category_mapping:
            category = category_folder.name
            english_category = category_mapping[category]
            
            # Determine main category
            if english_category in ['Blazer', 'Hoodie', 'Jacket', 'Denim Jacket', 'Sports Jacket', 'T-Shirt', 'Shirt', 'Coat', 'Polo', 'Sweater']:
                main_category = 'Top Wear'
            elif english_category in ['Pants', 'Shorts', 'Jeans', 'Skirt']:
                main_category = 'Bottom Wear'
            elif english_category in ['Dress']:
                main_category = 'Western Wear'
            else:
                main_category = 'Sports Wear'
            
            # Calculate target for this category
            target_for_category = images_per_category
            if categories_processed < remaining_images:
                target_for_category += 1
            
            print(f"Processing {category} -> {english_category} (targeting {target_for_category} items)")
            
            # Get images from this category
            category_count = 0
            for image_file in category_folder.iterdir():
                if (image_file.suffix.lower() in image_extensions and 
                    category_count < target_for_category and 
                    len(images_data) < total_images):
                    
                    images_data.append({
                        'product_id': product_id,
                        'name': f"{english_category} {product_id}",
                        'img': f"/fitted_images/{product_id}_extracted.png",
                        'subcategory': english_category,
                        'main_category': main_category,
                        'seller': 'FashionStore',
                        'price': 1000 + (product_id % 5000),
                        'discount': (product_id % 70),
                        'target_audience': 'Unisex',
                        'extract_images': f"{product_id}_extracted.png",
                        'original_path': str(image_file.absolute())
                    })
                    
                    product_id += 1
                    category_count += 1
            
            print(f"  Added {category_count} items from {category}")
            categories_processed += 1
            
            if len(images_data) >= total_images:
                break
    
    print(f"\\nTotal items collected: {len(images_data)}")
    return images_data[:total_images]  # Ensure exactly 1000

def copy_and_rename_images(images_data, output_dir):
    """Copy original images to fitted_images folder with new names"""
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    copied_count = 0
    
    for i, item in enumerate(images_data):
        original_path = item['original_path']
        new_filename = item['extract_images']
        output_path = os.path.join(output_dir, new_filename)
        
        try:
            # Copy and rename the image
            shutil.copy2(original_path, output_path)
            copied_count += 1
            
            if (i + 1) % 100 == 0:
                print(f"Copied {i+1}/{len(images_data)} images")
                
        except Exception as e:
            print(f"Error copying {original_path}: {e}")
    
    return copied_count

def create_csv_file(images_data, csv_path):
    """Create CSV file with proper formatting"""
    
    with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['product_id', 'name', 'img', 'subcategory', 'main_category', 'seller', 'price', 'discount', 'target_audience', 'extract_images']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for item in images_data:
            row = {key: item[key] for key in fieldnames if key in item}
            writer.writerow(row)
    
    print(f"Created CSV file with {len(images_data)} entries at: {csv_path}")

def create_database(images_data, db_path):
    """Create SQLite database with 1000 products"""
    
    # Remove existing database
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"Removed existing database: {db_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create products table
    create_table_sql = '''
    CREATE TABLE IF NOT EXISTS products (
        product_id INTEGER PRIMARY KEY,
        name TEXT,
        img TEXT,
        subcategory TEXT,
        main_category TEXT,
        seller TEXT,
        price REAL,
        discount REAL,
        target_audience TEXT,
        extract_images TEXT
    )
    '''
    
    cursor.execute(create_table_sql)
    
    # Insert new data
    insert_sql = '''
    INSERT INTO products 
    (product_id, name, img, subcategory, main_category, seller, price, discount, target_audience, extract_images)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    '''
    
    for item in images_data:
        cursor.execute(insert_sql, (
            item['product_id'],
            item['name'], 
            item['img'],
            item['subcategory'],
            item['main_category'],
            item['seller'],
            item['price'],
            item['discount'],
            item['target_audience'],
            item['extract_images']
        ))
    
    conn.commit()
    conn.close()
    
    print(f"Created database with {len(images_data)} products at: {db_path}")

def main():
    print("🚀 Creating LARGE Dataset with 1000 Images...")
    
    # Paths
    dataset_path = Path("../Clothes_Dataset")
    output_dir = "back/backend/fitted_images"
    csv_path = "back/backend/products_1000_data.csv"
    db_path = "back/backend/myntra.db"
    
    # Step 1: Get 1000 images from all categories
    print("Step 1: Getting 1000 images from ALL categories...")
    images_data = get_1000_images_from_dataset(dataset_path, total_images=1000)
    
    # Step 2: Copy images
    print("Step 2: Copying images to fitted_images folder...")
    copied_count = copy_and_rename_images(images_data, output_dir)
    print(f"✅ Successfully copied {copied_count}/{len(images_data)} images")
    
    # Step 3: Create CSV
    print("Step 3: Creating CSV file...")
    create_csv_file(images_data, csv_path)
    
    # Step 4: Create database
    print("Step 4: Creating SQLite database...")
    create_database(images_data, db_path)
    
    # Show summary
    print("\\n🎉 Large dataset processing complete!")
    
    # Count by category
    from collections import defaultdict
    category_counts = defaultdict(int)
    main_category_counts = defaultdict(int)
    
    for item in images_data:
        category_counts[item['subcategory']] += 1
        main_category_counts[item['main_category']] += 1
    
    print(f"\\n📊 Processed {len(images_data)} products:")
    for main_cat, count in main_category_counts.items():
        print(f"   - {main_cat}: {count} items")
    
    print(f"\\n📝 Subcategories:")
    for subcat, count in sorted(category_counts.items()):
        print(f"   - {subcat}: {count} items")
    
    print(f"\\n📁 Files created:")
    print(f"   - Images: {output_dir}")
    print(f"   - CSV: {csv_path}")
    print(f"   - Database: {db_path}")
    
    print(f"\\n🔥 You now have 1000 fashion items with full diversity!")

if __name__ == "__main__":
    main()