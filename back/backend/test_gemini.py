import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables
load_dotenv()

print("Testing Gemini API connection...")
print(f"API key loaded: {'Yes' if os.environ.get('GEMINI_API_KEY') else 'No'}")

if os.environ.get('GEMINI_API_KEY'):
    print(f"API key starts with: {os.environ.get('GEMINI_API_KEY')[:10]}...")

# Set the API key for Google
os.environ["GOOGLE_API_KEY"] = os.environ["GEMINI_API_KEY"]

try:
    print("Trying model: gemini-pro")
    llm = ChatGoogleGenerativeAI(model="gemini-pro")
    
    # Test a simple query
    test_query = "Hello, are you working?"
    print("Sending test query...")
    response = llm.invoke(test_query)
    
    print("✅ Gemini API connection successful!")
    print(f"Response: {response.content}")
    
except Exception as e:
    print(f"❌ Gemini API connection failed: {e}")
    print("Full error details:")
    import traceback
    traceback.print_exc()