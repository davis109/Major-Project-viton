#!/usr/bin/env python3
"""
Test API endpoints to verify products and images are served correctly
"""

import requests
import json

def test_api_endpoints():
    """Test various API endpoints"""
    base_url = "http://localhost:8001"
    
    print("=== Testing API Endpoints ===\n")
    
    # Test products endpoint
    print("1. Testing /get_myntra_data endpoint...")
    try:
        response = requests.get(f"{base_url}/get_myntra_data")
        if response.status_code == 200:
            products = response.json()
            print(f"✓ Get Myntra Data endpoint working - returned {len(products)} products")
            
            # Check first few products
            for i, product in enumerate(products[:3]):
                print(f"  Product {i+1}: {product.get('name', 'No name')}")
                print(f"    Category: {product.get('subcategory', 'No category')}")
                print(f"    Image URL: {product.get('img', 'No image')}")
                print(f"    Price: ₹{product.get('price', 'No price')}")
                
            # Count dresses
            dress_count = sum(1 for p in products if p.get('subcategory') == 'Dress')
            print(f"  Total dresses found: {dress_count}")
            
        else:
            print(f"✗ Get Myntra Data endpoint failed - Status: {response.status_code}")
            
    except Exception as e:
        print(f"✗ Error testing get_myntra_data endpoint: {e}")
    
    print("\n" + "-"*50)
    
    # Test recommendations endpoint
    print("2. Testing /get_recommendations endpoint...")
    try:
        payload = {
            "gender": "Female",
            "category": "Dress"
        }
        response = requests.post(f"{base_url}/get_recommendations", json=payload)
        if response.status_code == 200:
            recommendations = response.json()
            print(f"✓ Recommendations endpoint working - returned {len(recommendations)} items")
            
            # Check first recommendation
            if recommendations:
                first_rec = recommendations[0]
                print(f"  First recommendation: {first_rec.get('name', 'No name')}")
                print(f"    Image URL: {first_rec.get('img', 'No image')}")
                
        else:
            print(f"✗ Recommendations endpoint failed - Status: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"✗ Error testing recommendations endpoint: {e}")
    
    print("\n" + "-"*50)
    
    # Test specific image URL
    print("3. Testing direct image access...")
    try:
        image_url = f"{base_url}/fitted_images/1060_extracted.png"
        response = requests.head(image_url)
        if response.status_code == 200:
            print(f"✓ Image serving working - Status: {response.status_code}")
            print(f"  Content-Type: {response.headers.get('content-type', 'Unknown')}")
            print(f"  Content-Length: {response.headers.get('content-length', 'Unknown')} bytes")
        else:
            print(f"✗ Image serving failed - Status: {response.status_code}")
            
    except Exception as e:
        print(f"✗ Error testing image access: {e}")

if __name__ == "__main__":
    test_api_endpoints()