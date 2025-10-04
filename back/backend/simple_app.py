from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import sqlite3
import os
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import uvicorn

app = FastAPI()

image_directory = Path(__file__).parent / "fitted_images"
app.mount("/fitted_images", StaticFiles(directory=image_directory), name="fitted_images")

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
print(f"Database path: {SQLITE_DB_PATH}")
print(f"Fitted images directory: {image_directory}")

@app.get("/get_myntra_data")
def get_myntra_data(category: Optional[str] = None):
    try:
        print(f"Attempting to connect to database at: {SQLITE_DB_PATH}")
        conn = sqlite3.connect(SQLITE_DB_PATH)
        print("Database connection successful")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # If category is specified, filter by it
        if category:
            cursor.execute("SELECT * FROM products WHERE extract_images IS NOT NULL AND LOWER(subcategory) = LOWER(?)", (category,))
            print(f"Query executed successfully with category filter: {category}")
        else:
            cursor.execute("SELECT * FROM products WHERE extract_images IS NOT NULL")
            print("Query executed successfully")
            
        rows = cursor.fetchall()
        conn.close()

        # Convert rows to list of dicts  
        data = [dict(row) for row in rows]
        print(f"Returning {len(data)} rows")
        return data

    except Exception as e:
        print(f"Error in get_myntra_data: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)