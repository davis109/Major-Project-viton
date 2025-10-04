import sqlite3
import os

db_path = 'myntra.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# First, let's see the schema
cursor.execute("PRAGMA table_info(products)")
columns = cursor.fetchall()
print('Database schema:')
for col in columns:
    print(f'- {col[1]} ({col[2]})')

# Check total items
cursor.execute("SELECT COUNT(*) FROM products")
total_count = cursor.fetchone()[0]
print(f'\nTotal items in database: {total_count}')

# Get all unique subcategories 
cursor.execute("SELECT DISTINCT subcategory, COUNT(*) FROM products GROUP BY subcategory ORDER BY COUNT(*) DESC")
categories = cursor.fetchall()
print('\nAll subcategories:')
for cat, count in categories:
    print(f'- {cat}: {count} items')

# Get all unique main categories
cursor.execute("SELECT DISTINCT main_category, COUNT(*) FROM products GROUP BY main_category ORDER BY COUNT(*) DESC")
main_categories = cursor.fetchall()
print('\nAll main categories:')
for cat, count in main_categories:
    print(f'- {cat}: {count} items')

# Check dress items
cursor.execute("SELECT COUNT(*) FROM products WHERE LOWER(subcategory) LIKE '%dress%' OR LOWER(subcategory) LIKE '%gaun%'")
dress_count = cursor.fetchone()[0]
print(f'\nTotal dress items: {dress_count}')

# Sample dress items
cursor.execute("SELECT name, subcategory, img FROM products WHERE LOWER(subcategory) LIKE '%dress%' OR LOWER(subcategory) LIKE '%gaun%' LIMIT 5")
samples = cursor.fetchall()
print('\nSample dress items:')
for item in samples:
    print(f'- {item[0]} ({item[1]}) - {item[2]}')

conn.close()