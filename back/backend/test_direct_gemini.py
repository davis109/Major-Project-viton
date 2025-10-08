import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("Testing Gemini API with direct Google AI SDK...")
print(f"API key loaded: {'Yes' if os.environ.get('GEMINI_API_KEY') else 'No'}")

try:
    import google.generativeai as genai
    
    # Configure the API key
    genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))
    
    # List available models
    print("Available models:")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"  - {m.name}")
    
    # Try to use a model
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content("Hello, can you help me extract search terms?")
    
    print("✅ Direct Google AI SDK works!")
    print(f"Response: {response.text}")
    
except ImportError:
    print("❌ Google AI SDK not installed. Installing...")
    import subprocess
    subprocess.check_call(["pip", "install", "google-generativeai"])
    print("✅ Installed! Please run the test again.")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()