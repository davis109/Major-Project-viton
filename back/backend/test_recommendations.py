#!/usr/bin/env python3
"""
Test the updated recommendation system
"""

from recommendation import get_top_products
import os

def test_recommendations():
    """Test that recommendations only return available products"""
    
    print("=== Testing Recommendation System ===\n")
    
    # Test different categories and audiences
    test_cases = [
        {"main_category": "Western Wear", "target_audience": "Female"},
        {"main_category": "Top Wear", "target_audience": "Male"},
        {"main_category": "Bottom Wear", "target_audience": "Unisex"},
    ]
    
    for case in test_cases:
        print(f"Testing {case['main_category']} for {case['target_audience']}...")
        
        try:
            result = get_top_products(case['main_category'], case['target_audience'])
            
            if 'error' in result:
                print(f"  ❌ Error: {result['error']}")
                continue
            
            seasonal_products = result.get('seasonal_top_products', [])
            fashion_products = result.get('fashion_trend_products', [])
            
            print(f"  📊 Seasonal products: {len(seasonal_products)}")
            print(f"  📊 Fashion trend products: {len(fashion_products)}")
            
            # Check if image files exist for each product
            all_products = seasonal_products + fashion_products
            
            for i, product in enumerate(all_products[:3]):  # Check first 3 products
                extract_image = product.get('extract_images', '')
                image_path = os.path.join('fitted_images', extract_image) if extract_image else ''
                
                exists = os.path.exists(image_path) if image_path else False
                status = "✅" if exists else "❌"
                
                print(f"    {status} {product.get('name', 'Unknown')}")
                print(f"       Image: {extract_image}")
                print(f"       Path exists: {exists}")
                
        except Exception as e:
            print(f"  ❌ Exception: {e}")
        
        print("-" * 50)

if __name__ == "__main__":
    test_recommendations()