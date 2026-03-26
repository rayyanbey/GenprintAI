from fastapi import FastAPI
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


##http://localhost:8000/
load_dotenv()

HF_API_KEY = os.getenv("HF_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
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

@app.get("/")
def home():
    return {"instruction": "add /docs to access Swagger UI"}


@app.post("/embed")
def embed_text(req: TextRequest):
    embedding = model.encode(req.text).tolist()
    return {"embedding": embedding}


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


## http://localhost:8001/generate-design
@app.post("/generate-design")
def generate_design(req: TextRequest):
    try:
        # 1. Generate image using Hugging Face
        image = hf_client.text_to_image(
            req.text,
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