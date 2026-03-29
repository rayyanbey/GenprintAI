from google import genai

def check_prompt(prompt: str) -> str:
    # Initialize the client with your API key
    client = genai.Client(api_key="OKYAAR")
    
    # Define the instruction for the model
    instruction = (
        f"This is '{prompt}' to generate an image. Label this prompt as valid or invalid "
        "with a brief explanation with comma separating the label and explanation "
        "e.g (valid/invalid, explanation). Only return the label and explanation."
    )
    
    # Use a valid model ID (e.g., gemini-2.0-flash or gemini-1.5-flash)
    response = client.models.generate_content(
       model="gemini-1.5-flash",
        contents=instruction,
    )
    
    print(response.text)
    return response.text

# Test the function
my_prompt = "a photo of a cat sitting on a windowsill during sunset"
result = check_prompt(my_prompt)
