import sqlite3
import os

conn = sqlite3.connect('myntra.db')
cursor = conn.cursor()

# Find Dress 223
cursor.execute("SELECT name, img, extract_images FROM products WHERE name = 'Dress 223'")
result = cursor.fetchone()

if result:
    print(f'Name: {result[0]}')
    print(f'img path: {result[1]}')
    print(f'extract_images: {result[2]}')
    
    # Check if files exist
    img_path = result[1]
    if img_path.startswith('/'):
        img_path = img_path[1:]  # Remove leading slash
    
    extract_path = f'fitted_images/{result[2]}'
    
    print(f'\nChecking file existence:')
    print(f'img path exists: {os.path.exists(img_path)}')
    print(f'extract path exists: {os.path.exists(extract_path)}')
    
    # List what's in fitted_images directory
    if os.path.exists('fitted_images'):
        files = os.listdir('fitted_images')
        if result[2] in files:
            print(f'✓ {result[2]} found in fitted_images')
        else:
            print(f'✗ {result[2]} NOT found in fitted_images')
            # Show similar files
            similar = [f for f in files if 'dress' in f.lower() or '223' in f]
            if similar:
                print(f'Similar files: {similar[:5]}')
else:
    print('Dress 223 not found, checking what dress names exist...')
    cursor.execute("SELECT name FROM products WHERE LOWER(subcategory) = 'dress' LIMIT 5")
    dresses = cursor.fetchall()
    for dress in dresses:
        print(f'- {dress[0]}')

conn.close()