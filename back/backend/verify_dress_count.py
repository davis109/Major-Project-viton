#!/usr/bin/env python3
"""
Quick check of dress count in the updated database
"""

import sqlite3
import os

def check_dress_count():
    """Check how many dresses are in the database"""
    db_path = "myntra.db"
    
    if not os.path.exists(db_path):
        print("Database not found!")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Count total products
    cursor.execute("SELECT COUNT(*) FROM products")
    total_count = cursor.fetchone()[0]
    print(f"Total products in database: {total_count}")
    
    # Count dresses
    cursor.execute("SELECT COUNT(*) FROM products WHERE subcategory = 'Dress'")
    dress_count = cursor.fetchone()[0]
    print(f"Total dresses: {dress_count}")
    
    # Count by each category
    cursor.execute("SELECT subcategory, COUNT(*) FROM products GROUP BY subcategory ORDER BY COUNT(*) DESC")
    categories = cursor.fetchall()
    
    print("\nProducts by category:")
    for category, count in categories:
        print(f"  {category}: {count}")
    
    conn.close()

if __name__ == "__main__":
    check_dress_count()