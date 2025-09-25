#!/usr/bin/env python3
"""
Script to clear all existing product data before regenerating with more dresses
"""

import os
import sqlite3
import shutil
from pathlib import Path

def clear_database():
    """Clear the SQLite database"""
    db_path = "myntra.db"
    
    if os.path.exists(db_path):
        print("Clearing SQLite database...")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Clear the products table
        cursor.execute("DELETE FROM products")
        conn.commit()
        
        # Check count
        cursor.execute("SELECT COUNT(*) FROM products")
        count = cursor.fetchone()[0]
        print(f"Database cleared. Remaining products: {count}")
        
        conn.close()
    else:
        print("Database file not found, will be created fresh.")

def clear_fitted_images():
    """Clear fitted images directory"""
    fitted_images_dir = "./fitted_images"
    
    if os.path.exists(fitted_images_dir):
        print("Clearing fitted images directory...")
        
        # Count current images
        current_images = [f for f in os.listdir(fitted_images_dir) 
                         if f.endswith('_extracted.png')]
        print(f"Found {len(current_images)} existing images to remove")
        
        # Remove all extracted images
        for img_file in current_images:
            try:
                os.remove(os.path.join(fitted_images_dir, img_file))
            except Exception as e:
                print(f"Error removing {img_file}: {e}")
        
        # Check remaining files
        remaining_files = os.listdir(fitted_images_dir)
        print(f"Remaining files in fitted_images: {len(remaining_files)}")
    else:
        print("Fitted images directory not found, will be created fresh.")

def clear_chromadb():
    """Clear ChromaDB collections"""
    chroma_files = [
        "./chroma.sqlite3",
        "./chroma.sqlite3-journal"
    ]
    
    chroma_dirs = [
        "./6ea37555-603b-4f11-8c01-131c013ea7b7",
        "./b2a22b90-820c-4946-80c1-651d6b41c4ef"
    ]
    
    print("Clearing ChromaDB files...")
    
    # Remove database files
    for file_path in chroma_files:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                print(f"Removed {file_path}")
            except Exception as e:
                print(f"Error removing {file_path}: {e}")
    
    # Remove collection directories
    for dir_path in chroma_dirs:
        if os.path.exists(dir_path):
            try:
                shutil.rmtree(dir_path)
                print(f"Removed directory {dir_path}")
            except Exception as e:
                print(f"Error removing {dir_path}: {e}")

def clear_csv():
    """Clear CSV file"""
    csv_path = "./products_final_data.csv"
    
    if os.path.exists(csv_path):
        try:
            os.remove(csv_path)
            print(f"Removed {csv_path}")
        except Exception as e:
            print(f"Error removing {csv_path}: {e}")

def main():
    """Clear all product data for fresh regeneration"""
    print("=== Clearing All Product Data ===")
    
    clear_database()
    clear_fitted_images()  
    clear_chromadb()
    clear_csv()
    
    print("\n=== All data cleared successfully! ===")
    print("Ready to run the updated dataset processing script.")

if __name__ == "__main__":
    main()