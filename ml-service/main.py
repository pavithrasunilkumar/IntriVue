from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import math
from collections import Counter

app = FastAPI(title="IntriVue ML Recommendation Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecommendRequest(BaseModel):
    user_skills: List[str] = []
    job_skills: List[str] = []


class RecommendResponse(BaseModel):
    match_score: int
    matched_skills: List[str]
    missing_skills: List[str]


def tokenize(skills: List[str]) -> List[str]:
    """Flatten skill list into individual tokens (lowercased)."""
    tokens = []
    for skill in skills:
        parts = skill.lower().replace(",", " ").replace("/", " ").split()
        tokens.extend(parts)
    return tokens


def build_tfidf_vector(tokens: List[str], vocab: List[str]) -> List[float]:
    """Build a simple TF-IDF-like vector for a skill token list."""
    tf = Counter(tokens)
    total = max(len(tokens), 1)
    vector = []
    for term in vocab:
        tf_score = tf.get(term, 0) / total
        # IDF approximation — rare terms in combined vocab weighted higher
        idf = 1.0 + math.log(1 + 1 / (1 + tf.get(term, 0)))
        vector.append(tf_score * idf)
    return vector


def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    if not vec_a or not vec_b:
        return 0.0
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    mag_a = math.sqrt(sum(a ** 2 for a in vec_a))
    mag_b = math.sqrt(sum(b ** 2 for b in vec_b))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)


def compute_match_score(user_skills: List[str], job_skills: List[str]) -> dict:
    # Exact match for matched/missing display
    user_lower = {s.lower().strip() for s in user_skills}
    job_lower_list = [s.lower().strip() for s in job_skills]
    matched = [s for s in job_skills if s.lower().strip() in user_lower]
    missing = [s for s in job_skills if s.lower().strip() not in user_lower]

    if not user_skills or not job_skills:
        score = 30 if not user_skills and not job_skills else 20
        return {"match_score": score, "matched_skills": matched, "missing_skills": missing}

    # TF-IDF cosine similarity
    user_tokens = tokenize(user_skills)
    job_tokens = tokenize(job_skills)
    vocab = list(set(user_tokens + job_tokens))

    user_vec = build_tfidf_vector(user_tokens, vocab)
    job_vec = build_tfidf_vector(job_tokens, vocab)

    similarity = cosine_similarity(user_vec, job_vec)

    # Scale: cosine 0..1 → score 0..100, with a slight boost for partial overlaps
    raw_score = similarity * 100

    # Bonus for exact skill matches
    if job_lower_list:
        exact_ratio = len(matched) / len(job_lower_list)
        bonus = exact_ratio * 20  # up to 20 point bonus
        raw_score = min(100, raw_score + bonus)

    # Ensure minimum 10 if any skills exist
    score = max(10, round(raw_score))

    return {
        "match_score": score,
        "matched_skills": matched,
        "missing_skills": missing,
    }


@app.post("/recommend", response_model=RecommendResponse)
async def recommend(request: RecommendRequest):
    result = compute_match_score(request.user_skills, request.job_skills)
    return RecommendResponse(**result)


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
