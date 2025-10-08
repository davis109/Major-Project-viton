import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up environment for Google AI
os.environ["GOOGLE_API_KEY"] = os.environ["GEMINI_API_KEY"]

from rag import search_products_rag

print("Testing RAG search function...")

try:
    # Test the search function
    query = "I want a red dress"
    print(f"Searching for: '{query}'")
    
    results = search_products_rag(query, num_results=5)
    
    print(f"✅ RAG search successful! Found {len(results)} results")
    
    for i, product in enumerate(results[:3]):
        print(f"{i+1}. {product['name']} - ${product['price']} ({product['subcategory']})")
    
except Exception as e:
    print(f"❌ RAG search failed: {e}")
    import traceback
    traceback.print_exc()