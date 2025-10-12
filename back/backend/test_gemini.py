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
    # Initialize the Gemini model
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")
    
    # Test a simple query
    test_query = "Extract search terms from this query: 'I want a red dress'"
    response = llm.invoke(test_query)
    
    print("✅ Gemini API connection successful!")
    print(f"Response: {response.content}")
    
except Exception as e:
    print(f"❌ Gemini API connection failed: {e}")
    import traceback
    traceback.print_exc()