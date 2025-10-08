import pandas as pd
import chromadb
import chromadb.utils.embedding_functions as embedding_functions
from langchain_google_genai import ChatGoogleGenerativeAI
from gradio_client import Client, handle_file
import aiohttp
import base64
import os
from dotenv import load_dotenv

# Load environment variables from local .env file
load_dotenv(".env")
load_dotenv()

os.environ["GOOGLE_API_KEY"] = os.environ["GEMINI_API_KEY"]

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

DEFAULT_MODEL = os.getenv("DEFAULT_MODEL")
CHROMADB_PATH = os.getenv("CHROMADB_PATH")

EXTRACTED_CLOTH_IMAGES_FOLDER = os.getenv("EXTRACTED_CLOTH_IMAGES_FOLDER")
SOURCE_FOLDER = os.getenv("SOURCE_FOLDER")
FITTED_IMAGES_FOLDER = os.getenv("FITTED_IMAGES_FOLDER")

# Ensure paths are absolute
if FITTED_IMAGES_FOLDER and not os.path.isabs(FITTED_IMAGES_FOLDER):
    FITTED_IMAGES_FOLDER = os.path.join(os.path.dirname(__file__), FITTED_IMAGES_FOLDER)

if EXTRACTED_CLOTH_IMAGES_FOLDER and not os.path.isabs(EXTRACTED_CLOTH_IMAGES_FOLDER):
    EXTRACTED_CLOTH_IMAGES_FOLDER = os.path.join(os.path.dirname(__file__), EXTRACTED_CLOTH_IMAGES_FOLDER)

chromadb_client = chromadb.PersistentClient(path=CHROMADB_PATH)
embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="thenlper/gte-base")

collection = chromadb_client.get_or_create_collection(name="myntra_data", embedding_function=embedding_function) # If not specified, by default uses the embedding function "all-MiniLM-L6-v2"


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
    Search products using RAG with ChromaDB and Gemini LLM
    """
    try:
        # First, use Gemini to understand the query and extract search terms
        prompt = f"""
        You are a fashion search assistant. Analyze this user query: "{query}"
        
        Extract the key fashion terms, colors, categories, and style preferences.
        Generate multiple search variations to find relevant products.
        
        Output only the search terms separated by commas, like:
        red dress, formal dress, evening wear, party dress
        """
        
        response = llm.invoke(prompt)
        search_terms = [term.strip() for term in response.content.split(",")]
        print(f"Generated search terms from '{query}': {search_terms}")
        
        # Search ChromaDB with multiple terms
        all_results = []
        seen_product_ids = set()
        
        for term in search_terms[:5]:  # Limit to first 5 terms to avoid too many queries
            try:
                result = collection.query(
                    query_texts=[term],
                    n_results=num_results,
                    include=["documents", "metadatas", "distances"]
                )
                
                # Process results
                for i, metadata in enumerate(result["metadatas"][0]):
                    product_id = metadata.get("product_id")
                    if product_id and product_id not in seen_product_ids:
                        product_data = {
                            "product_id": product_id,
                            "name": result["documents"][0][i],
                            "img": metadata.get("img", ""),
                            "extract_images": metadata.get("extract_images", ""),
                            "main_category": metadata.get("main_category", ""),
                            "subcategory": metadata.get("subcategory", ""),
                            "seller": metadata.get("seller", ""),
                            "price": float(metadata.get("price", 0)),
                            "discount": float(metadata.get("discount", 0)),
                            "distance": result["distances"][0][i] if result["distances"] else 1.0
                        }
                        all_results.append(product_data)
                        seen_product_ids.add(product_id)
                        
            except Exception as e:
                print(f"Error searching for term '{term}': {e}")
                continue
        
        # Sort by relevance (lower distance = more relevant)
        all_results.sort(key=lambda x: x["distance"])
        
        # Return top results
        final_results = all_results[:num_results]
        print(f"Found {len(final_results)} unique products for query '{query}'")
        
        return final_results
        
    except Exception as e:
        print(f"Error in RAG search: {e}")
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