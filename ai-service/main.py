"""
IntriVue AI Service
FastAPI service for resume analysis, question generation, and answer evaluation
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import io
import os
from dotenv import load_dotenv

load_dotenv()

from routers.analyze import router as analyze_router
from routers.evaluate import router as evaluate_router

app = FastAPI(title="IntriVue AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router)
app.include_router(evaluate_router)

@app.get("/")
async def root():
    return {"status": "ok", "service": "IntriVue AI Service"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
