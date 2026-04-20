"""IntriVue AI Service v2"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn, os
from dotenv import load_dotenv
load_dotenv()

from routers.analyze  import router as analyze_router
from routers.evaluate import router as evaluate_router

app = FastAPI(title="IntriVue AI Service", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.include_router(analyze_router)
app.include_router(evaluate_router)

@app.get("/")
def root(): return {"status": "ok", "service": "IntriVue AI v2"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
