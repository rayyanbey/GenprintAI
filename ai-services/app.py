from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Existing embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

class TextRequest(BaseModel):
    text: str

@app.post("/embed")
def embed_text(req: TextRequest):
    embedding = model.encode(req.text).tolist()
    return {"embedding": embedding}

# === NEW: LLaMA trend extraction endpoint ===
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

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
