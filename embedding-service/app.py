from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from fastapi.middleware.cors import CORSMiddleware


app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model=SentenceTransformer("all-MiniLM-L6-v2")

class TextRequest(BaseModel):
    text:str

@app.post("/embed")
def embed_text(req: TextRequest):
    embedding=model.encode(req.text).tolist()
    return {"embedding": embedding}