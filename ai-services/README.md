# Embedding Service

This folder contains a Python microservice that generates embeddings for text prompts using the `all-MiniLM-L6-v2` model from Sentence Transformers. The embeddings can be stored in a database for tasks like recommendations, similarity search, or clustering.

---

## Requirements

- Python 3.9+
- pip

## Installation

1. Navigate to the folder:

```bash
cd ai-services
```

2. Install services

```bash
pip install -r requirements.txt
```

3. Start the FASTAPI server

```bash
uvicorn app:app --reload --port 8001
```

The service will run at http://localhost:8001.
