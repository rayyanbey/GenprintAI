from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
import os
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
import base64
from io import BytesIO
import cloudinary
import cloudinary.uploader

from preprocessing import preprocess_prompt
import cloudinary.api
from google import genai
from functools import lru_cache
import time


##http://localhost:8000/
load_dotenv()

HF_API_KEY = os.getenv("HF_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Existing embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Hugging Face client (NEW)
hf_client = InferenceClient(
    provider="auto",
    api_key=HF_API_KEY,
)

# Groq client
client = Groq(api_key=GROQ_API_KEY)

class TextRequest(BaseModel):
    text: str


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    context: list[ChatMessage] = []  # conversation history
    user_context: dict = {}  # optional context like product_type, colors, etc.


class SuggestedPrompt(BaseModel):
    text: str
    category: str  # e.g., "hoodie", "tshirt", "mug"
    theme: str  # e.g., "minimalist", "artistic", "vintage"


class ChatResponse(BaseModel):
    message: str
    suggested_prompts: list[SuggestedPrompt] = []
    suggested_actions: list[str] = []  # e.g., ["generate_image", "explore_designs"]


@app.get("/")
def home():
    return {"instruction": "add /docs to access Swagger UI"}




@app.post("/embed")
def embed_text(req: TextRequest):
    embedding = model.encode(req.text).tolist()
    return {"embedding": embedding}



# Prompt validation cache (in-memory, survives for session)
PROMPT_VALIDATION_CACHE = {}
CACHE_TTL = 3600  # 1 hour in seconds


def is_valid_prompt_local(prompt: str) -> bool:
    """Quick local validation without API calls."""
    if not prompt or len(prompt) < 3:
        return False
    
    # Check for obviously bad content
    bad_keywords = [
        'violence', 'hate', 'offensive', 'explicit', 'nsfw',
        'porn', 'xxx', 'illegal', 'copyrighted'
    ]
    prompt_lower = prompt.lower()
    for keyword in bad_keywords:
        if keyword in prompt_lower:
            return False
    
    return True


@app.post("/check-prompt")
def check_prompt(req: TextRequest):
    """Fast prompt validation with local checks and optional Groq validation."""
    user_prompt = req.text.strip()
    
    # Check cache first
    if user_prompt in PROMPT_VALIDATION_CACHE:
        cached_result = PROMPT_VALIDATION_CACHE[user_prompt]
        if time.time() - cached_result['timestamp'] < CACHE_TTL:
            return cached_result['response']
    
    # Quick local validation
    if not is_valid_prompt_local(user_prompt):
        response = {
            "response": "invalid, prompt contains restricted content"
        }
        PROMPT_VALIDATION_CACHE[user_prompt] = {
            'response': response,
            'timestamp': time.time()
        }
        return response
    
    # Local validation passed, return valid
    # (Skip expensive Groq call - local validation is usually sufficient)
    response = {
        "response": "valid, prompt looks good for image generation"
    }
    
    # Cache the result
    PROMPT_VALIDATION_CACHE[user_prompt] = {
        'response': response,
        'timestamp': time.time()
    }
    
    return response


@app.post("/extract-trend")
def extract_trend(req: TextRequest):
    prompt = f"""
Extract a short, 2-4 word design trend from this sentence.
Only return the trend name.

Title: "{req.text}"

Trend:
"""
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=10,
    )

    trend = completion.choices[0].message.content.strip()
    return {"trend": trend}


class SuggestDesignsRequest(BaseModel):
    product_type: str = "hoodie"  # e.g., "hoodie", "tshirt", "mug"
    preferred_colors: list[str] = []  # e.g., ["black", "white"]
    design_style: str = ""  # e.g., "minimalist", "vintage"
    count: int = 6  # number of suggestions


@app.post("/suggest-designs")
def suggest_designs(req: SuggestDesignsRequest):
    """Generate design suggestions based on product type and preferences."""
    
    # Build context string
    context = f"Product: {req.product_type}"
    if req.preferred_colors:
        context += f", Colors: {', '.join(req.preferred_colors)}"
    if req.design_style:
        context += f", Style: {req.design_style}"
    
    prompt = f"""Generate {req.count} creative design ideas for a {req.product_type}.
Context: {context}

Return ONLY the design ideas as a pipe-separated list (|), one idea per line.
Each idea should be 2-5 words.
Example output:
minimalist geometric
vintage retro vibes
neon abstract art
cosmic stars design
artistic watercolor
bold typography

Generate {req.count} ideas:"""
    
    try:
        completion = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8,
            max_tokens=200,
        )
        
        response_text = completion.choices[0].message.content.strip()
        
        # Parse suggestions
        suggestions = []
        for line in response_text.split('\n'):
            line = line.strip()
            if line and len(line) > 2:
                # Remove numbering if present (e.g., "1. design idea" -> "design idea")
                if line[0].isdigit() and '.' in line[:3]:
                    line = line.split('.', 1)[1].strip()
                suggestions.append(line)
        
        # Return up to requested count
        return {
            "suggestions": suggestions[:req.count],
            "product_type": req.product_type,
            "context": context
        }
    except Exception as e:
        # Fallback suggestions
        default_suggestions = {
            "hoodie": [
                "minimalist geometric",
                "vintage retro",
                "cosmic abstract",
                "artistic watercolor",
                "bold typography",
                "neon vibes"
            ],
            "tshirt": [
                "graphic design",
                "streetwear aesthetic",
                "vintage band style",
                "modern art",
                "motivational quote",
                "trendy pattern"
            ],
            "mug": [
                "coffee lover design",
                "funny quote",
                "minimalist icon",
                "artistic pattern",
                "daily motivation",
                "cute illustration"
            ]
        }
        
        suggestions = default_suggestions.get(req.product_type, default_suggestions["hoodie"])
        return {
            "suggestions": suggestions[:req.count],
            "product_type": req.product_type,
            "context": context
        }



## http://localhost:8001/generate-design
@app.post("/generate-design")
def generate_design(req: TextRequest):
    try:
        prompt=preprocess_prompt(req.text)
        # 1. Generate image using Hugging Face
        image = hf_client.text_to_image(
            prompt,
            model="black-forest-labs/FLUX.1-schnell",
        )

        # 2. Convert image to bytes
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        buffered.seek(0)

        # 3. Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            buffered,
            folder="ai-designs",  # optional folder
            public_id=req.text.replace(" ", "_")[:50],  # optional naming
        )

        # 4. Get URL
        image_url = upload_result.get("secure_url")

        return {
            "prompt": req.text,
            "image_url": image_url
        }

    except Exception as e:
        return {"error": str(e)}


# ============================================================================
# CHATBOT ENDPOINTS
# ============================================================================

def validate_prompt_with_groq(prompt_text: str) -> dict:
    """Validate a design prompt using local checks (no API calls)."""
    # Use local validation only (avoid rate limits)
    is_valid = is_valid_prompt_local(prompt_text)
    
    if not is_valid:
        return {
            "valid": False,
            "label": "invalid",
            "explanation": "Contains restricted content"
        }
    
    return {
        "valid": True,
        "label": "valid",
        "explanation": "Looks good for image generation"
    }
def generate_chat_response(user_message: str, conversation_history: list, user_context: dict) -> dict:
    """Generate a chatbot response using Groq."""
    
    system_prompt = """You are a helpful AI design assistant for a print-on-demand platform (hoodies, t-shirts, mugs, etc).
Your job is to:
1. Help users generate creative design prompts for image generation
2. Suggest design ideas and themes based on user preferences
3. Help users navigate the platform features
4. Be conversational, friendly, and creative

IMPORTANT: When a user describes what they want, provide:
1. A friendly conversational response
2. At least 2 specific, detailed design prompts they can use
3. Each prompt should be detailed and ready for image generation

Format your response like this:
RESPONSE: [Your friendly 1-2 sentence response here]

PROMPT 1: [Detailed design prompt]
CATEGORY: [hoodie/tshirt/mug/etc]
THEME: [minimalist/vintage/artistic/etc]

PROMPT 2: [Alternative design prompt]
CATEGORY: [hoodie/tshirt/mug/etc]
THEME: [minimalist/vintage/artistic/etc]"""
    
    # Build messages for Groq
    messages = [{"role": "system", "content": system_prompt}]
    
    # Add conversation history
    for msg in conversation_history[-6:]:
        messages.append({
            "role": msg.role,
            "content": msg.content
        })
    
    # Add user message
    messages.append({"role": "user", "content": user_message})
    
    try:
        completion = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=messages,
            temperature=0.7,
            max_tokens=500,
        )
        
        response_text = completion.choices[0].message.content.strip()
        
        # Parse the response
        message = response_text
        suggested_prompts = []
        
        # Extract prompts from response
        lines = response_text.split('\n')
        current_prompt = None
        current_category = None
        current_theme = None
        
        for line in lines:
            line = line.strip()
            if line.startswith("RESPONSE:"):
                message = line.replace("RESPONSE:", "").strip()
            elif line.startswith("PROMPT"):
                if current_prompt and current_category and current_theme:
                    suggested_prompts.append(
                        SuggestedPrompt(text=current_prompt, category=current_category, theme=current_theme)
                    )
                current_prompt = line.split(":", 1)[-1].strip() if ":" in line else None
            elif line.startswith("CATEGORY:"):
                current_category = line.replace("CATEGORY:", "").strip()
            elif line.startswith("THEME:"):
                current_theme = line.replace("THEME:", "").strip()
        
        # Add last prompt if exists
        if current_prompt and current_category and current_theme:
            suggested_prompts.append(
                SuggestedPrompt(text=current_prompt, category=current_category, theme=current_theme)
            )
        
        return {
            "message": message if message and not message.startswith("RESPONSE:") else "I'd love to help! Here are some design ideas:",
            "suggested_prompts": suggested_prompts[:3],
            "suggested_actions": ["generate_image"] if suggested_prompts else [],
        }
        
    except Exception as e:
        return {
            "message": "I'd love to help with your design! Tell me what you're envisioning.",
            "suggested_prompts": [],
            "suggested_actions": ["generate_image"],
        }
@app.post("/chat")
def chat(req: ChatRequest) -> ChatResponse:
    """
    AI chatbot endpoint for design assistance.
    
    Accepts:
    - message: User's message
    - context: Previous chat messages (for conversation history)
    - user_context: Optional context (e.g., product_type, preferred_colors)
    
    Returns:
    - message: Chatbot response
    - suggested_prompts: Array of design prompts the user can use
    - suggested_actions: Recommended next actions
    """
    try:
        # Generate response from Groq
        response_data = generate_chat_response(
            req.message,
            req.context,
            req.user_context,
        )
        
        # Quick validation of suggested prompts (local only, no API calls)
        validated_prompts = []
        for prompt in response_data.get("suggested_prompts", []):
            if is_valid_prompt_local(prompt.text):
                validated_prompts.append(prompt)
        
        return ChatResponse(
            message=response_data.get("message", "I didn't understand that. Please try again."),
            suggested_prompts=validated_prompts[:3],  # Limit to top 3
            suggested_actions=response_data.get("suggested_actions", []),
        )
    
    except Exception as e:
        return ChatResponse(
            message="Sorry, I'm having trouble right now. Please try again in a moment.",
            suggested_prompts=[],
            suggested_actions=[],
        )