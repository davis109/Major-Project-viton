#!/usr/bin/env python3
"""
Check image URLs in the database to debug display issues
"""

import sqlite3
import os

def check_image_urls():
    """Check the image URLs stored in the database"""
    db_path = "myntra.db"
    
    if not os.path.exists(db_path):
        print("Database not found!")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check first 10 products to see image URLs
    cursor.execute("SELECT product_id, name, subcategory, img FROM products LIMIT 10")
    products = cursor.fetchall()
    
    print("First 10 products and their image URLs:")
    print("-" * 80)
    for product_id, name, subcategory, img_url in products:
        print(f"ID: {product_id}")
        print(f"Name: {name}")
        print(f"Category: {subcategory}")
        print(f"Image URL: {img_url}")
        
        # Check if the actual file exists
        if img_url.startswith('/fitted_images/'):
            file_path = f"./fitted_images/{img_url.split('/')[-1]}"
            exists = os.path.exists(file_path)
            print(f"File exists: {exists}")
        
        print("-" * 40)
    
    # Count products by category
    cursor.execute("""
        SELECT subcategory, COUNT(*) as count 
        FROM products 
        GROUP BY subcategory 
        ORDER BY count DESC
    """)
    
    print("\nProduct count by category:")
    print("-" * 30)
    for category, count in cursor.fetchall():
        print(f"{category}: {count}")
    
    # Check specifically dress products
    cursor.execute("SELECT product_id, name, img FROM products WHERE subcategory = 'Dress' LIMIT 5")
    dress_products = cursor.fetchall()
    
    print("\nFirst 5 dress products:")
    print("-" * 50)
    for product_id, name, img_url in dress_products:
        print(f"ID: {product_id}, Name: {name}")
        print(f"Image URL: {img_url}")
        
        # Check if file exists
        if img_url.startswith('/fitted_images/'):
            file_path = f"./fitted_images/{img_url.split('/')[-1]}"
            exists = os.path.exists(file_path)
            print(f"File exists: {exists}")
        print("-" * 25)
    
    conn.close()

if __name__ == "__main__":
    check_image_urls()