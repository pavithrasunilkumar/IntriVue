from fastapi import APIRouter, File, UploadFile, Form
import io

router = APIRouter()

def extract_pdf(b: bytes) -> str:
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(b)) as pdf:
            return "\n".join(p.extract_text() or "" for p in pdf.pages).strip()
    except: pass
    try:
        import fitz
        return "\n".join(p.get_text() for p in fitz.open(stream=b, filetype="pdf")).strip()
    except: return ""

@router.post("/analyze")
async def analyze(resume: UploadFile = File(...), job_description: str = Form(...), domain: str = Form(...)):
    from utils.nlp_utils import extract_skills, find_skill_gaps, generate_questions
    b  = await resume.read()
    rt = extract_pdf(b)
    rs = extract_skills(rt, domain)
    js = extract_skills(job_description, domain)
    sg = find_skill_gaps(rs, js)
    qs = generate_questions(rs, js, sg, domain, rt, job_description)
    return {"resume_text": rt[:3000], "resume_skills": rs, "job_skills": js, "skill_gaps": sg, "questions": qs}
