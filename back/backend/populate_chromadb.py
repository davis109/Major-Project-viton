import sqlite3
import chromadb
import chromadb.utils.embedding_functions as embedding_functions
import os
from dotenv import load_dotenv
import pandas as pd

# Load environment variables
load_dotenv("../../.env")
load_dotenv()

# Get paths from environment
CHROMADB_PATH = os.getenv("CHROMADB_PATH")
SQLITE_DB_PATH = os.getenv("SQLITE_DB_PATH")

print(f"ChromaDB Path: {CHROMADB_PATH}")
print(f"SQLite DB Path: {SQLITE_DB_PATH}")

def populate_chromadb():
    """
    Populate ChromaDB with product data from SQLite database
    """
    try:
        # Connect to SQLite database
        conn = sqlite3.connect(SQLITE_DB_PATH)
        df = pd.read_sql_query("SELECT * FROM products WHERE extract_images IS NOT NULL", conn)
        conn.close()
        
        print(f"Loaded {len(df)} products from SQLite database")
        
        # Initialize ChromaDB
        chromadb_client = chromadb.PersistentClient(path=CHROMADB_PATH)
        embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="thenlper/gte-base")
        
        # Delete existing collection if it exists
        try:
            chromadb_client.delete_collection(name="myntra_data")
            print("Deleted existing collection")
        except Exception as e:
            print(f"No existing collection to delete: {e}")
        
        # Create new collection
        collection = chromadb_client.create_collection(
            name="myntra_data", 
            embedding_function=embedding_function
        )
        
        # Prepare data for ChromaDB
        documents = []
        metadatas = []
        ids = []
        
        for idx, row in df.iterrows():
            # Create searchable document text
            doc_text = f"{row['name']} {row['subcategory']} {row['main_category']} {row['seller']} color style fashion clothing"
            documents.append(doc_text)
            
            # Create metadata
            metadata = {
                "product_id": int(row["product_id"]),
                "name": str(row["name"]),
                "img": str(row["img"]),
                "extract_images": str(row["extract_images"]),
                "main_category": str(row["main_category"]),
                "subcategory": str(row["subcategory"]),
                "seller": str(row["seller"]),
                "price": float(row["price"]),
                "discount": float(row["discount"])
            }
            metadatas.append(metadata)
            
            # Create unique ID
            ids.append(f"product_{row['product_id']}")
        
        # Add to ChromaDB in batches
        batch_size = 100
        for i in range(0, len(documents), batch_size):
            end_idx = min(i + batch_size, len(documents))
            batch_docs = documents[i:end_idx]
            batch_metadatas = metadatas[i:end_idx]
            batch_ids = ids[i:end_idx]
            
            collection.add(
                documents=batch_docs,
                metadatas=batch_metadatas,
                ids=batch_ids
            )
            print(f"Added batch {i//batch_size + 1}/{(len(documents) + batch_size - 1)//batch_size}")
        
        print(f"Successfully populated ChromaDB with {len(documents)} products!")
        
        # Test the collection
        test_query = "red dress"
        results = collection.query(query_texts=[test_query], n_results=5)
        print(f"Test query '{test_query}' returned {len(results['documents'][0])} results")
        
        return True
        
    except Exception as e:
        print(f"Error populating ChromaDB: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = populate_chromadb()
    if success:
        print("ChromaDB population completed successfully!")
    else:
        print("ChromaDB population failed!")