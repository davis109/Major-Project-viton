import sqlite3
import pandas as pd
import os
from dotenv import load_dotenv
load_dotenv()

# Define the path to your CSV file
csv_file_path = 'products_final_data.csv'
EXTRACTED_CLOTH_IMAGES = os.getenv("EXTRACTED_CLOTH_IMAGES_FOLDER")

# Read the CSV file into a pandas DataFrame
df = pd.read_csv(csv_file_path)

# Drop the unnamed columns
df.drop(df.columns[[0]], axis=1, inplace=True)

df.dropna(inplace=True)

# Update the 'extract_images' column
df['extract_images'] = df['extract_images'].apply(lambda x: x)


# Define the SQLite database path
sqlite_db_path = 'myntra.db'

# Get the directory path
sqlite_db_dir = os.path.dirname(sqlite_db_path)

# Check if the directory exists
if sqlite_db_dir and not os.path.exists(sqlite_db_dir):
    # Create the required directories
    os.makedirs(sqlite_db_dir)

# Connect to the SQLite database (it will be created if it doesn't exist)
conn = sqlite3.connect(sqlite_db_path)

# Define the table name
table_name = 'products'

# Store the DataFrame in the SQLite database
df.to_sql(table_name, conn, if_exists='replace', index=False)

# Close the database connection
conn.close()

print(f"Data from {csv_file_path} has been successfully stored in {sqlite_db_path} in the table '{table_name}'")
