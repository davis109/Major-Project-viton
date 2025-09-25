import sqlite3

conn = sqlite3.connect('myntra.db')
cursor = conn.cursor()

# Check current dress count
cursor.execute('SELECT COUNT(*) FROM products WHERE subcategory = "Dress"')
dress_count = cursor.fetchone()[0]
print(f'Current dress count: {dress_count}')

# Check all categories
cursor.execute('SELECT subcategory, COUNT(*) FROM products GROUP BY subcategory ORDER BY COUNT(*) DESC')
results = cursor.fetchall()
print('\nAll categories:')
for category, count in results:
    print(f'  {category}: {count}')

conn.close()