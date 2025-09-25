#!/usr/bin/env python3
"""
Update image URLs in database to use full backend URLs
"""

import sqlite3
import os

def update_image_urls():
    """Update all image URLs to use full backend URLs"""
    db_path = "myntra.db"
    
    if not os.path.exists(db_path):
        print("Database not found!")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get current count
    cursor.execute("SELECT COUNT(*) FROM products")
    total_products = cursor.fetchone()[0]
    print(f"Total products in database: {total_products}")
    
    # Update all image URLs to include full backend URL
    print("Updating image URLs to full backend URLs...")
    cursor.execute("""
        UPDATE products 
        SET img = 'http://localhost:8001' || img 
        WHERE img NOT LIKE 'http://localhost:8001%'
    """)
    
    rows_updated = cursor.rowcount
    print(f"Updated {rows_updated} image URLs")
    
    # Verify the update
    cursor.execute("SELECT product_id, name, subcategory, img FROM products LIMIT 5")
    products = cursor.fetchall()
    
    print("\nFirst 5 products after update:")
    print("-" * 60)
    for product_id, name, subcategory, img_url in products:
        print(f"ID: {product_id}")
        print(f"Name: {name}")
        print(f"Category: {subcategory}")
        print(f"Image URL: {img_url}")
        print("-" * 30)
    
    conn.commit()
    conn.close()
    
    print("Database updated successfully!")

if __name__ == "__main__":
    update_image_urls()