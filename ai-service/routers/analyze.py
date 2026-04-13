"""
/analyze — Resume + JD analysis and question generation
"""
from fastapi import APIRouter, File, UploadFile, Form
import io

router = APIRouter()

def extract_pdf_text(file_bytes: bytes) -> str:
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            return "\n".join(p.extract_text() or "" for p in pdf.pages).strip()
    except Exception as e:
        print(f"pdfplumber error: {e}")
    try:
        import fitz
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        return "\n".join(p.get_text() for p in doc).strip()
    except Exception as e2:
        print(f"PyMuPDF error: {e2}")
    return ""

@router.post("/analyze")
async def analyze(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    domain: str = Form(...)
):
    from utils.nlp_utils import extract_skills, find_skill_gaps, generate_questions

    file_bytes = await resume.read()
    resume_text = extract_pdf_text(file_bytes)

    resume_skills = extract_skills(resume_text, domain)
    job_skills    = extract_skills(job_description, domain)
    skill_gaps    = find_skill_gaps(resume_skills, job_skills)
    questions     = generate_questions(
        resume_skills, job_skills, skill_gaps, domain, resume_text, job_description
    )

    return {
        "resume_text": resume_text[:3000],
        "resume_skills": resume_skills,
        "job_skills": job_skills,
        "skill_gaps": skill_gaps,
        "questions": questions
    }
