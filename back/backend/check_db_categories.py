#!/usr/bin/env python3
"""
Check the actual categories in the database for recommendation system
"""

import sqlite3
import os

def check_database_categories():
    """Check what categories exist in the database"""
    db_path = "myntra.db"
    
    if not os.path.exists(db_path):
        print("Database not found!")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check unique main categories
    cursor.execute("SELECT DISTINCT main_category FROM products")
    main_categories = cursor.fetchall()
    
    print("Main Categories in database:")
    for cat in main_categories:
        print(f"  - {cat[0]}")
    
    # Check unique subcategories  
    cursor.execute("SELECT DISTINCT subcategory FROM products")
    subcategories = cursor.fetchall()
    
    print("\nSubcategories in database:")
    for subcat in subcategories:
        print(f"  - {subcat[0]}")
    
    # Check target audiences
    cursor.execute("SELECT DISTINCT target_audience FROM products")
    audiences = cursor.fetchall()
    
    print("\nTarget Audiences in database:")
    for audience in audiences:
        print(f"  - {audience[0]}")
    
    # Count by main category
    cursor.execute("SELECT main_category, COUNT(*) FROM products GROUP BY main_category ORDER BY COUNT(*) DESC")
    category_counts = cursor.fetchall()
    
    print("\nProduct count by main category:")
    for category, count in category_counts:
        print(f"  {category}: {count} products")
    
    conn.close()

if __name__ == "__main__":
    check_database_categories()