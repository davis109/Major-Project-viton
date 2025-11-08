import requests
import json

# Test various search queries
test_queries = [
    "show me some shirts",
    "full sleeve shirts", 
    "t-shirts",
    "show me jeans",
    "denim jacket"
]

base_url = "http://localhost:8000"

print("🧪 Testing RAG Search Improvements...\n")

for query in test_queries:
    print(f"{'='*60}")
    print(f"Query: '{query}'")
    print(f"{'='*60}")
    
    try:
        response = requests.post(
            f"{base_url}/search_products",
            json={"query": query},
            timeout=30
        )
        
        if response.status_code == 200:
            products = response.json()
            print(f"✅ Found {len(products)} products")
            
            # Show first 5 products with their subcategories
            for i, product in enumerate(products[:5], 1):
                print(f"  {i}. {product['name']} - Subcategory: {product['subcategory']}")
            
            # Check subcategory distribution
            subcategories = {}
            for product in products:
                subcat = product['subcategory']
                subcategories[subcat] = subcategories.get(subcat, 0) + 1
            
            print(f"\n  📊 Subcategory Distribution:")
            for subcat, count in subcategories.items():
                print(f"     {subcat}: {count}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"   {response.text}")
    
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    print()

print("\n✨ Testing complete!")
