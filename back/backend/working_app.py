from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import sqlite3
import os
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import uvicorn
import shutil

app = FastAPI()

# Static files
image_directory = Path(__file__).parent / "fitted_images"
app.mount("/fitted_images", StaticFiles(directory=image_directory), name="fitted_images")

user_images_directory = Path(__file__).parent / "user_images"
user_images_directory.mkdir(exist_ok=True)
app.mount("/user_images", StaticFiles(directory=user_images_directory), name="user_images")

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), "myntra.db")
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "user_images")
UPLOADED_PERSON_IMAGE_NAME = None

print(f"Database path: {SQLITE_DB_PATH}")
print(f"User images directory: {UPLOAD_DIR}")
print(f"Fitted images directory: {image_directory}")

@app.get("/get_myntra_data")
def get_myntra_data(category: Optional[str] = None):
    try:
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        if category:
            cursor.execute("SELECT * FROM products WHERE extract_images IS NOT NULL AND LOWER(subcategory) = LOWER(?)", (category,))
            print(f"Query executed with category filter: {category}")
        else:
            cursor.execute("SELECT * FROM products WHERE extract_images IS NOT NULL")
            
        rows = cursor.fetchall()
        conn.close()
        data = [dict(row) for row in rows]
        print(f"Returning {len(data)} rows")
        return data

    except Exception as e:
        print(f"Error in get_myntra_data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/take_user_image")
async def take_user_image(file: UploadFile = File(...)):
    global UPLOADED_PERSON_IMAGE_NAME
    try:
        # Save the uploaded file
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        UPLOADED_PERSON_IMAGE_NAME = file.filename
        print(f"Saved user image: {file.filename}")
        
        return {"success": True, "filename": file.filename}
    except Exception as e:
        print(f"Error saving user image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/single_item_tryon")
async def single_item_tryon(data: dict):
    global UPLOADED_PERSON_IMAGE_NAME
    
    if not UPLOADED_PERSON_IMAGE_NAME:
        raise HTTPException(status_code=400, detail="No user image uploaded")
    
    try:
        main_category = data.get("main_category")
        extract_images = data.get("extract_images")
        
        print(f"Try-on request - Category: {main_category}, Image: {extract_images}")
        print(f"User image: {UPLOADED_PERSON_IMAGE_NAME}")
        
        # Import the VITON model
        try:
            from rag import viton_model
        except ImportError:
            print("VITON model not available, using mock result")
            return {
                "success": False,
                "error": "VITON AI model dependencies not installed. Install required packages to enable real virtual try-on."
            }
        
        # Map category to VITON format
        if main_category in ["Top Wear"]:
            viton_category = "Upper body"
        elif main_category in ["Bottom Wear"]:
            viton_category = "Lower body" 
        elif main_category in ["Western Wear"]:
            viton_category = "Dress"
        else:
            viton_category = "Upper body"  # Default
            
        print(f"Using VITON category: {viton_category}")
        
        # Call the actual VITON model
        cloth_path = os.path.join("fitted_images", extract_images)
        person_path = os.path.join(UPLOAD_DIR, UPLOADED_PERSON_IMAGE_NAME)
        
        print(f"Cloth path: {cloth_path}")
        print(f"Person path: {person_path}")
        
        # Call VITON AI model
        result_path = await viton_model(
            cloth_image_path=cloth_path,
            cloth_category=viton_category,
            person_image_path=person_path
        )
        
        print(f"VITON result: {result_path}")
        
        if result_path and not isinstance(result_path, dict):
            return {
                "success": True,
                "fitted_image": result_path,
                "message": "Virtual try-on completed successfully!"
            }
        else:
            return {
                "success": False,
                "error": "VITON processing failed",
                "details": result_path if isinstance(result_path, dict) else "Unknown error"
            }
        
    except Exception as e:
        print(f"Error in single_item_tryon: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/check_user_image")
def check_user_image():
    global UPLOADED_PERSON_IMAGE_NAME
    if UPLOADED_PERSON_IMAGE_NAME:
        return {"has_image": True, "filename": UPLOADED_PERSON_IMAGE_NAME}
    return {"has_image": False}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)