from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
import io

router = APIRouter()

class EvalReq(BaseModel):
    question: str
    answer: str
    domain: str
    job_skills: List[str] = []
    resume_skills: List[str] = []

class SWReq(BaseModel):
    resume_skills: List[str] = []
    skill_gaps: List[str] = []
    avg_scores: dict = {}

class ReportReq(BaseModel):
    candidate_name: str
    domain: str
    overall_score: int
    accuracy_score: int
    confidence_score: int
    technical_score: int
    communication_score: int
    strengths: List[str] = []
    weaknesses: List[str] = []
    skill_gaps: List[str] = []
    questions: List[dict] = []

@router.post("/evaluate-answer")
async def evaluate(req: EvalReq):
    from utils.nlp_utils import score_answer
    return {"scores": score_answer(req.question, req.answer, req.domain, req.job_skills, req.resume_skills)}

@router.post("/strengths-weaknesses")
async def sw(req: SWReq):
    from utils.nlp_utils import generate_strengths_weaknesses
    s, w = generate_strengths_weaknesses(req.resume_skills, req.skill_gaps, req.avg_scores)
    return {"strengths": s, "weaknesses": w}

@router.post("/generate-report")
async def report(req: ReportReq):
    """Generate PDF scorecard — fixed CORS + Content-Disposition headers for browser download."""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.styles import ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                        Table, TableStyle, HRFlowable)
        from reportlab.lib.enums import TA_CENTER

        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=A4,
            leftMargin=2*cm, rightMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)

        gold = colors.HexColor("#f5a623")
        dark = colors.HexColor("#0d0d14")
        grey = colors.HexColor("#6b7280")
        ink  = colors.HexColor("#1a1a2e")

        def S(name, **kw): return ParagraphStyle(name, **kw)
        h1  = S("h1",  fontSize=28, textColor=dark,  spaceAfter=4,  fontName="Helvetica-Bold", alignment=TA_CENTER)
        sub = S("sub", fontSize=12, textColor=grey,  spaceAfter=16, alignment=TA_CENTER)
        h2  = S("h2",  fontSize=13, textColor=dark,  spaceBefore=16, spaceAfter=8, fontName="Helvetica-Bold")
        bd  = S("bd",  fontSize=10, textColor=grey,  leading=15)
        sc_s= S("sc",  fontSize=9,  textColor=gold,  spaceAfter=4)
        qh  = S("qh",  fontSize=10, textColor=dark,  spaceBefore=10, fontName="Helvetica-Bold")

        def grade(s):
            return "Excellent" if s >= 85 else "Good" if s >= 70 else "Fair" if s >= 55 else "Needs Work"

        story = [
            Paragraph("IntriVue — Interview Report", h1),
            Paragraph(f"{req.candidate_name}  ·  {req.domain}", sub),
            HRFlowable(width="100%", thickness=1.5, color=gold, spaceAfter=16),
            Paragraph("Score Summary", h2),
        ]

        rows = [
            ["Metric", "Score", "Grade"],
            ["Overall",       f"{req.overall_score}/100",       grade(req.overall_score)],
            ["Accuracy",      f"{req.accuracy_score}/100",      grade(req.accuracy_score)],
            ["Technical",     f"{req.technical_score}/100",     grade(req.technical_score)],
            ["Communication", f"{req.communication_score}/100", grade(req.communication_score)],
            ["Confidence",    f"{req.confidence_score}/100",    grade(req.confidence_score)],
        ]
        tbl = Table(rows, colWidths=[8*cm, 4*cm, 4*cm])
        tbl.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, 0), dark),
            ("TEXTCOLOR",     (0, 0), (-1, 0), colors.white),
            ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE",      (0, 0), (-1, -1), 10),
            ("ROWBACKGROUNDS",(0, 1), (-1, -1), [colors.HexColor("#f5f5f5"), colors.white]),
            ("ALIGN",         (1, 0), (-1, -1), "CENTER"),
            ("GRID",          (0, 0), (-1, -1), 0.5, colors.HexColor("#e0e0e0")),
            ("TOPPADDING",    (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ]))
        story += [tbl, Spacer(1, 14)]

        if req.strengths:
            story.append(Paragraph("Strengths", h2))
            for s in req.strengths:
                story.append(Paragraph(f"✓  {s}", bd))
            story.append(Spacer(1, 8))

        if req.weaknesses:
            story.append(Paragraph("Areas for Improvement", h2))
            for w in req.weaknesses:
                story.append(Paragraph(f"△  {w}", bd))
            story.append(Spacer(1, 8))

        if req.skill_gaps:
            story.append(Paragraph("Skill Gap Analysis", h2))
            story.append(Paragraph(", ".join(g.title() for g in req.skill_gaps), bd))
            story.append(Spacer(1, 8))

        if req.questions:
            story.append(HRFlowable(width="100%", thickness=0.5,
                color=colors.HexColor("#dddddd"), spaceBefore=10, spaceAfter=8))
            story.append(Paragraph("Per-Question Answer Review", h2))
            for i, q in enumerate(req.questions):
                if not q.get("answer"):
                    continue
                story.append(Paragraph(f"Q{i+1}: {q['question']}", qh))
                story.append(Paragraph(q["answer"][:500], bd))
                sc = q.get("scores", {})
                story.append(Paragraph(
                    f"Accuracy: {sc.get('accuracy','—')}  |  Technical: {sc.get('technical','—')}  "
                    f"|  Communication: {sc.get('communication','—')}  |  Confidence: {sc.get('confidence','—')}",
                    sc_s
                ))

        doc.build(story)
        buf.seek(0)

        safe_name = req.candidate_name.replace(" ", "_").replace("/", "-")
        filename  = f"IntriVue_Report_{safe_name}.pdf"

        return StreamingResponse(
            buf,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition",
                "Cache-Control": "no-cache",
            }
        )
    except Exception as e:
        print(f"PDF error: {e}")
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=500, content={"error": str(e)})
