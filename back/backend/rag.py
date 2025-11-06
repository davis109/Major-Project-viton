import pandas as pd
import chromadb
import chromadb.utils.embedding_functions as embedding_functions
from langchain_google_genai import ChatGoogleGenerativeAI
from gradio_client import Client, handle_file
import aiohttp
import base64
import os
from dotenv import load_dotenv

# Load environment variables (works for both local and Vercel deployment)
load_dotenv()

# Set Google API key from environment (Vercel-compatible)
GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "2")
CHROMADB_PATH = os.getenv("CHROMADB_PATH", "chroma_db")

# Environment variables with defaults for Vercel deployment
EXTRACTED_CLOTH_IMAGES_FOLDER = os.getenv("EXTRACTED_CLOTH_IMAGES_FOLDER", "extracted_cloth_images")
SOURCE_FOLDER = os.getenv("SOURCE_FOLDER", "source_images")
FITTED_IMAGES_FOLDER = os.getenv("FITTED_IMAGES_FOLDER", "fitted_images")
SQLITE_DB_PATH = os.getenv("SQLITE_DB_PATH", "myntra.db")

# Ensure paths are relative to current file location (Vercel-compatible)
if FITTED_IMAGES_FOLDER and not os.path.isabs(FITTED_IMAGES_FOLDER):
    FITTED_IMAGES_FOLDER = os.path.join(os.path.dirname(__file__), FITTED_IMAGES_FOLDER)

if EXTRACTED_CLOTH_IMAGES_FOLDER and not os.path.isabs(EXTRACTED_CLOTH_IMAGES_FOLDER):
    EXTRACTED_CLOTH_IMAGES_FOLDER = os.path.join(os.path.dirname(__file__), EXTRACTED_CLOTH_IMAGES_FOLDER)

if SQLITE_DB_PATH and not os.path.isabs(SQLITE_DB_PATH):
    SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), SQLITE_DB_PATH)

if CHROMADB_PATH and not os.path.isabs(CHROMADB_PATH):
    CHROMADB_PATH = os.path.join(os.path.dirname(__file__), CHROMADB_PATH)

chromadb_client = chromadb.PersistentClient(path=CHROMADB_PATH)
embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="thenlper/gte-base")

collection = chromadb_client.get_or_create_collection(name="myntra_data", embedding_function=embedding_function) # If not specified, by default uses the embedding function "all-MiniLM-L6-v2"


def get_gemini_recommendations(selected_item_name, selected_category, selected_subcategory, num_results=5):
    """
    Use Gemini AI to intelligently recommend complementary clothing items
    Returns product data WITHOUT running virtual try-on
    """
    import sqlite3
    
    try:
        print(f"=== GEMINI RECOMMENDATIONS ===")
        print(f"Selected Item: {selected_item_name}")
        print(f"Category: {selected_category}")
        print(f"Subcategory: {selected_subcategory}")
        
        # Use Gemini to determine what would pair well with the selected item
        prompt = f"""
        You are a professional fashion stylist. A user just tried on this item:
        - Name: {selected_item_name}
        - Category: {selected_category}
        - Subcategory: {selected_subcategory}
        
        Based on this selection, recommend complementary clothing items that would create a complete, stylish outfit.
        
        Rules:
        - If they selected Top Wear, recommend Bottom Wear (jeans, pants, skirts, etc.)
        - If they selected Bottom Wear, recommend Top Wear (shirts, t-shirts, blouses, etc.)
        - If they selected Western Wear (dress), recommend accessories or complementary dresses
        - Focus on items that match the style and formality level
        - Consider color coordination and fashion trends
        
        Output ONLY the clothing types/subcategories you recommend, separated by commas.
        Examples: "Jeans, Pants, Casual Trousers" or "Shirt, T-Shirt, Blouse"
        
        Do not include any explanations, just the comma-separated list.
        """
        
        response = llm.invoke(prompt)
        recommended_types = [term.strip() for term in response.content.split(",")]
        print(f"Gemini recommended types: {recommended_types}")
        
        # Determine the complementary category
        if selected_category == "Top Wear":
            complementary_category = "Bottom Wear"
        elif selected_category == "Bottom Wear":
            complementary_category = "Top Wear"
        elif selected_category == "Western Wear":
            complementary_category = "Western Wear"
        else:
            complementary_category = "Top Wear"  # Default
        
        # Search database for matching products
        SQLITE_DB_PATH_LOCAL = os.path.join(os.path.dirname(__file__), "myntra.db")
        conn = sqlite3.connect(SQLITE_DB_PATH_LOCAL)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Build SQL query based on Gemini's recommendations
        products = []
        for recommended_type in recommended_types[:3]:  # Limit to top 3 types
            query = """
                SELECT * FROM products 
                WHERE main_category = ? 
                AND (subcategory LIKE ? OR name LIKE ?)
                AND extract_images IS NOT NULL
                ORDER BY RANDOM()
                LIMIT ?
            """
            cursor.execute(query, (
                complementary_category,
                f"%{recommended_type}%",
                f"%{recommended_type}%",
                max(2, num_results // len(recommended_types[:3]))
            ))
            products.extend(cursor.fetchall())
        
        conn.close()
        
        # Convert to list of dicts and ensure uniqueness
        seen_ids = set()
        unique_products = []
        for row in products:
            product_dict = dict(row)
            if product_dict['product_id'] not in seen_ids:
                seen_ids.add(product_dict['product_id'])
                unique_products.append(product_dict)
                if len(unique_products) >= num_results:
                    break
        
        print(f"Found {len(unique_products)} recommended products")
        return unique_products
        
    except Exception as e:
        print(f"Error in Gemini recommendations: {e}")
        import traceback
        traceback.print_exc()
        # Fallback to simple category-based recommendations
        return get_simple_recommendations(selected_category, num_results)


def get_simple_recommendations(selected_category, num_results=5):
    """
    Simple fallback recommendation without Gemini
    """
    import sqlite3
    
    try:
        # Determine complementary category
        if selected_category == "Top Wear":
            complementary_category = "Bottom Wear"
        elif selected_category == "Bottom Wear":
            complementary_category = "Top Wear"
        else:
            complementary_category = "Top Wear"
        
        SQLITE_DB_PATH_LOCAL = os.path.join(os.path.dirname(__file__), "myntra.db")
        conn = sqlite3.connect(SQLITE_DB_PATH_LOCAL)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM products 
            WHERE main_category = ? 
            AND extract_images IS NOT NULL
            ORDER BY RANDOM()
            LIMIT ?
        """, (complementary_category, num_results))
        
        products = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return products
        
    except Exception as e:
        print(f"Error in simple recommendations: {e}")
        return []


def get_data_from_db(clothing_item):
    result = collection.query(query_texts=clothing_item, n_results=1, include=["documents", "metadatas"])
    extracted_image = result["metadatas"][0][0]["extract_images"]
    print("Location of Image:", os.path.join(EXTRACTED_CLOTH_IMAGES_FOLDER, extracted_image))
    return {
        "clothing_item_found": result["documents"],
        "extracted_image": extracted_image,
        "image": result["metadatas"][0][0]["img"],
        "main_category": result["metadatas"][0][0]["main_category"],
        "seller": result["metadatas"][0][0]["seller"],
        "price": result["metadatas"][0][0]["price"],
        "discount": result["metadatas"][0][0]["discount"],
    }


def search_products_rag(query, num_results=20):
    """
    Search products using RAG with ChromaDB and Gemini LLM, with SQL fallback
    """
    try:
        print(f"=== RAG SEARCH WITH GEMINI ===")
        print(f"Original Query: '{query}'")
        
        # First, try Gemini + ChromaDB approach
        try:
            # Use Gemini to understand the query and extract search terms
            prompt = f"""
            You are a fashion search assistant. Analyze this user query: "{query}"
            
            Extract the main clothing category the user is looking for.
            Be VERY specific about the subcategory - distinguish between similar items:
            - "jeans" means Jeans (pants made of denim) NOT Denim Jacket
            - "dress" means Dress (one-piece garment) NOT shirt or top
            - "jacket" means Jacket/Coat, NOT pants or jeans
            - "shirt" means Shirt/Top, NOT pants or bottom wear
            
            Return in this exact format:
            SUBCATEGORY: <most specific clothing type>
            TERMS: <comma-separated search variations>
            
            Example for "show me jeans":
            SUBCATEGORY: Jeans
            TERMS: jeans, denim pants, blue jeans, casual jeans
            
            Example for "denim jacket":
            SUBCATEGORY: Denim Jacket
            TERMS: denim jacket, jean jacket, casual jacket
            """
            
            response = llm.invoke(prompt)
            response_text = response.content.strip()
            print(f"Gemini response: {response_text}")
            
            # Parse the response
            target_subcategory = None
            search_terms = []
            
            for line in response_text.split('\n'):
                if line.startswith('SUBCATEGORY:'):
                    target_subcategory = line.replace('SUBCATEGORY:', '').strip()
                elif line.startswith('TERMS:'):
                    terms_text = line.replace('TERMS:', '').strip()
                    search_terms = [term.strip() for term in terms_text.split(",")]
            
            print(f"Target Subcategory: {target_subcategory}")
            print(f"Search terms: {search_terms}")
            
            # Try ChromaDB search first
            chroma_results = []
            if collection.count() > 0:
                print(f"ChromaDB has {collection.count()} items, searching...")
                
                # Search ChromaDB with multiple terms
                all_results = []
                seen_product_ids = set()
                
                # Prioritize target subcategory search
                search_terms_prioritized = search_terms[:5] if not target_subcategory else [target_subcategory] + search_terms[:4]
                
                for term in search_terms_prioritized:
                    try:
                        # Build where clause to filter by subcategory if we have a target
                        where_clause = None
                        if target_subcategory and term == target_subcategory:
                            # Exact subcategory match for first term
                            where_clause = {"subcategory": {"$eq": target_subcategory}}
                            print(f"Searching with subcategory filter: {target_subcategory}")
                        
                        result = collection.query(
                            query_texts=[term],
                            n_results=min(15, num_results),
                            include=["documents", "metadatas", "distances"],
                            where=where_clause
                        )
                        
                        if result["metadatas"] and result["metadatas"][0]:
                            print(f"ChromaDB found {len(result['metadatas'][0])} results for '{term}'" + 
                                  (f" (filtered by {target_subcategory})" if where_clause else ""))
                            
                            # Process results
                            for i, metadata in enumerate(result["metadatas"][0]):
                                product_id = metadata.get("product_id")
                                product_subcategory = metadata.get("subcategory", "")
                                
                                # Skip if wrong subcategory when we have a target
                                if target_subcategory and product_subcategory != target_subcategory:
                                    continue
                                
                                if product_id and product_id not in seen_product_ids:
                                    product_data = {
                                        "product_id": product_id,
                                        "name": metadata.get("name", ""),
                                        "img": metadata.get("img", ""),
                                        "extract_images": metadata.get("extract_images", ""),
                                        "main_category": metadata.get("main_category", ""),
                                        "subcategory": product_subcategory,
                                        "seller": metadata.get("seller", ""),
                                        "price": float(metadata.get("price", 0)),
                                        "discount": float(metadata.get("discount", 0)),
                                        "distance": result["distances"][0][i] if result["distances"] else 1.0
                                    }
                                    all_results.append(product_data)
                                    seen_product_ids.add(product_id)
                                    
                    except Exception as e:
                        print(f"ChromaDB error for term '{term}': {e}")
                        continue
                
                if all_results:
                    # Sort by relevance (lower distance = more relevant)
                    all_results.sort(key=lambda x: x["distance"])
                    chroma_results = all_results[:num_results]
                    print(f"ChromaDB found {len(chroma_results)} unique products")
                    
                    if chroma_results:
                        return chroma_results
            
        except Exception as e:
            print(f"Gemini/ChromaDB approach failed: {e}")
        
        # Fallback to direct SQL search
        print("=== FALLING BACK TO SQL SEARCH ===")
        return sql_fallback_search(query, num_results)
        
    except Exception as e:
        print(f"Error in RAG search: {e}")
        import traceback
        traceback.print_exc()
        return sql_fallback_search(query, num_results)


def sql_fallback_search(query, num_results=20):
    """
    Fallback SQL search when Gemini/ChromaDB fails
    """
    try:
        # Connect to database
        import sqlite3
        
        # Construct the database path
        SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), "myntra.db")
        
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        print(f"SQL fallback for query: '{query}'")
        
        # Direct keyword matching
        query_lower = query.lower()
        products = []
        
        # Search logic based on keywords in query
        if any(term in query_lower for term in ['t-shirt', 'tshirt', 't shirt', 'tee']):
            print("SQL: Searching for T-Shirt items...")
            cursor.execute("SELECT * FROM products WHERE subcategory = 'T-Shirt' LIMIT ?", (num_results,))
        elif 'shirt' in query_lower:
            print("SQL: Searching for Shirt items...")
            cursor.execute("SELECT * FROM products WHERE subcategory IN ('Shirt', 'T-Shirt') LIMIT ?", (num_results,))
        elif 'dress' in query_lower:
            print("SQL: Searching for Dress items...")
            cursor.execute("SELECT * FROM products WHERE subcategory = 'Dress' LIMIT ?", (num_results,))
        elif any(term in query_lower for term in ['jean', 'jeans']):
            print("SQL: Searching for Jeans items...")
            cursor.execute("SELECT * FROM products WHERE subcategory = 'Jeans' LIMIT ?", (num_results,))
        elif any(term in query_lower for term in ['pant', 'pants']):
            print("SQL: Searching for Pants items...")
            cursor.execute("SELECT * FROM products WHERE subcategory = 'Pants' LIMIT ?", (num_results,))
        elif 'blazer' in query_lower:
            print("SQL: Searching for Blazer items...")
            cursor.execute("SELECT * FROM products WHERE subcategory = 'Blazer' LIMIT ?", (num_results,))
        else:
            # Generic search across name and subcategory
            print("SQL: Performing generic search...")
            search_terms = query_lower.split()
            if search_terms:
                # Search for any term in name or subcategory
                term = search_terms[0]  # Use first term
                cursor.execute("SELECT * FROM products WHERE LOWER(name) LIKE ? OR LOWER(subcategory) LIKE ? LIMIT ?", 
                             (f'%{term}%', f'%{term}%', num_results))
            else:
                cursor.execute("SELECT * FROM products LIMIT ?", (num_results,))
        
        rows = cursor.fetchall()
        products = [dict(row) for row in rows]
        
        print(f"SQL search found {len(products)} products")
        
        if products:
            print(f"Sample SQL results: {[p['name'] + ' (' + p['subcategory'] + ')' for p in products[:3]]}")
        
        conn.close()
        return products
        
    except Exception as e:
        print(f"SQL fallback error: {e}")
        import traceback
        traceback.print_exc()
        return []


def get_images_using_llm(query):
    
    prompt = f"""
    You are a clothing store helper bot. You have to figure out what clothing items the user wants to wear. The user has said: "{query}". Please output the clothing items that the user wants to wear in the following format:
    "item1, item2, item3, ..."
    """
    
    response = llm.invoke(prompt)
    final_response = response.content.split(" \n")
    items = final_response[0].split(", ")
    
    print("LLM extracted these items from the query:", items)
    # print(response.content)
    
    images = []
    categories = []
    names = []
    sellers = []
    prices = []
    discounts = []
    extracted_images = []
    
    for item in items:
        result = get_data_from_db(item)
        images.append(result["image"])
        names.append(result["clothing_item_found"])
        sellers.append(result["seller"])
        prices.append(result["price"])
        discounts.append(result["discount"])
        extracted_images.append(result["extracted_image"])
        
        category = result["main_category"]
        
        if category == "Top Wear":
            category = "Upper-body"
        elif category == "Bottom Wear":
            category = "Lower-body"
        elif category == "Dress (Full Length)":
            category = "Dress"
        else:
            category = None
        
        categories.append(category)
        
    # print(images)
    return extracted_images, images, categories, names, sellers, prices, discounts


def ootdiffusion_model(garment_img, clothing_category, person_img = 'https://levihsu-ootdiffusion.hf.space/file=/tmp/gradio/aa9673ab8fa122b9c5cdccf326e5f6fc244bc89b/model_8.png'):
    client = Client("levihsu/OOTDiffusion")
    print("Garment image:", garment_img)
    result = client.predict(
        vton_img=handle_file(person_img),
        garm_img=handle_file(garment_img),
        category=clothing_category,
        n_samples=1,
        n_steps=20,
        image_scale=2,
        seed=-1,
        api_name="/process_dc"
    )
    
    final_image = result[0]["image"]
    print(final_image)
    
    return final_image


async def to_b64(img_url: str) -> str:
    async with aiohttp.ClientSession() as session:
        async with session.get(img_url) as response:
            data = await response.read()
            return base64.b64encode(data).decode('utf-8')

# def local_image_to_base64(image_path: str) -> str:
#     print(image_path)
#     with open(image_path, "rb") as image_file:

#         base64_encoded = base64.b64encode(image_file.read()).decode('utf-8')
#     return base64_encoded

def local_image_to_base64(image_path):
    print(f"image_path type: {type(image_path)}, value: {image_path}")
    # Normalize path separators for Windows
    image_path = os.path.normpath(image_path)
    if not os.path.exists(image_path):
        print(f"File not found: {image_path}")
        raise FileNotFoundError(f"Image file not found: {image_path}")
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

    
async def segmind_diffusion(cloth_image_url: str = None, model_image_url: str = 'https://levihsu-ootdiffusion.hf.space/file=/tmp/gradio/aa9673ab8fa122b9c5cdccf326e5f6fc244bc89b/model_8.png', cloth_image_path: str = None, model_image_path: str = None, clothing_category: str = None):
    api_key = os.getenv("SEGMIND_API_KEY")
    print(f"SEGMIND_API_KEY available: {bool(api_key)}")
    
    if not api_key:
        print("ERROR: SEGMIND_API_KEY not found in environment variables!")
        print("Falling back to returning cloth image...")
        # Return the original cloth image path as fallback
        if cloth_image_path:
            cloth_filename = cloth_image_path.split("\\")[-1].split('/')[-1]
            return f"/fitted_images/{cloth_filename}"
        return "/fitted_images/fallback.png"
    
    url = "https://api.segmind.com/v1/try-on-diffusion"
    print(f"Making Segmind API request to: {url}")
    
    # Get model image base64
    if model_image_path:
        model_image_b64 = local_image_to_base64(model_image_path)
        print(f"Using local person image: {model_image_path}")
    else:
        model_image_b64 = await to_b64(model_image_url)
        print(f"Using remote person image: {model_image_url}")

    # Get cloth image base64
    if cloth_image_path:
        cloth_image_b64 = local_image_to_base64(cloth_image_path)
        print(f"Using local cloth image: {cloth_image_path}")
    else:
        cloth_image_b64 = await to_b64(cloth_image_url)
        print(f"Using remote cloth image: {cloth_image_url}")

    data = {
        "model_image": model_image_b64,
        "cloth_image": cloth_image_b64,
        "category": clothing_category,
        "num_inference_steps": 35,
        "guidance_scale": 2,
        "seed": 12467,
        "base64": False
    }

    headers = {
        'x-api-key': api_key,
        'Content-Type': 'application/json'
    }

    async with aiohttp.ClientSession() as session:
        print("Sending request to Segmind API...")
        async with session.post(url, json=data, headers=headers) as response:
            print(f"Segmind API response status: {response.status}")
            
            if response.status == 200:
                print("SUCCESS: Segmind API returned virtual try-on result!")
                image_data = await response.read()
                print(f"Received image data size: {len(image_data)} bytes")
                
                # Generate unique filename for the try-on result
                if cloth_image_url:
                    base_name = cloth_image_url.split('/')[-1].split('.')[0]
                    img_path = os.path.join(FITTED_IMAGES_FOLDER, f"{base_name}_tryon_result.png")
                elif cloth_image_path:
                    cloth_filename = cloth_image_path.split("\\")[-1].split('/')[-1]
                    base_name = cloth_filename.split('.')[0]
                    img_path = os.path.join(FITTED_IMAGES_FOLDER, f"{base_name}_tryon_result.png")
                else:
                    img_path = os.path.join(FITTED_IMAGES_FOLDER, "tryon_result.png")
                
                # Fix path separators for Windows
                img_path = os.path.normpath(img_path)
                print(f"Saving try-on result to: {img_path}")
                
                # Ensure directory exists
                os.makedirs(os.path.dirname(img_path), exist_ok=True)
                
                with open(img_path, "wb") as image_file:
                    image_file.write(image_data)
                
                # Return relative path for web serving
                relative_path = f"/fitted_images/{os.path.basename(img_path)}"
                print(f"Returning relative path: {relative_path}")
                return relative_path
            else:
                error_message = await response.text()
                print(f"ERROR: Segmind API failed with status {response.status}")
                print(f"Error message: {error_message}")
                
                # Return fallback cloth image path
                if cloth_image_path:
                    cloth_filename = cloth_image_path.split("\\")[-1].split('/')[-1]
                    fallback_path = f"/fitted_images/{cloth_filename}"
                    print(f"Returning fallback path: {fallback_path}")
                    return fallback_path
                return {"error": response.status, "message": error_message}


async def viton_model(cloth_image: str = None, cloth_category: str = None, person_image: str = 'https://levihsu-ootdiffusion.hf.space/file=/tmp/gradio/aa9673ab8fa122b9c5cdccf326e5f6fc244bc89b/model_8.png', cloth_image_path: str = None, person_image_path: str = None, model: str = DEFAULT_MODEL):
    
    # Force use of Segmind model for virtual try-on
    model = "2"
    print(f"Using model: {model} (Segmind API)")
    
    if model == "1":
        if cloth_image:
            if person_image_path:
                result = ootdiffusion_model(cloth_image, cloth_category, person_image_path)
            else:
                result = ootdiffusion_model(cloth_image, cloth_category, person_image)
        else:
            if person_image_path:
                result = ootdiffusion_model(cloth_image_path, cloth_category, person_image_path)
            else:
                result = ootdiffusion_model(cloth_image_path, cloth_category, person_image)
                
                
    elif model == "2":
        if cloth_category == "Upper-body":
            cloth_category = "Upper body"
        elif cloth_category == "Lower-body":
            cloth_category = "Lower body"
        print(f"Calling Segmind API with category: {cloth_category}")
        print("Person Image Path:", person_image_path)
        print("Cloth Image Path:", cloth_image_path)
        result = await segmind_diffusion(cloth_image_url=cloth_image, model_image_url=person_image, clothing_category=cloth_category, cloth_image_path=cloth_image_path, model_image_path=person_image_path)
    
    return result