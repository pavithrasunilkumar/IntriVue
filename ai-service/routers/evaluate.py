"""
/evaluate-answer — Score a single interview answer
/generate-report — Build PDF summary
"""
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
import io

router = APIRouter()

class EvaluateRequest(BaseModel):
    question: str
    answer: str
    domain: str
    job_skills: List[str] = []
    resume_skills: List[str] = []

class ReportRequest(BaseModel):
    candidate_name: str
    domain: str
    overall_score: int
    confidence_score: int
    technical_score: int
    communication_score: int
    accuracy_score: int
    strengths: List[str] = []
    weaknesses: List[str] = []
    skill_gaps: List[str] = []
    questions: List[dict] = []

@router.post("/evaluate-answer")
async def evaluate_answer(req: EvaluateRequest):
    from utils.nlp_utils import score_answer
    scores = score_answer(req.question, req.answer, req.domain, req.job_skills, req.resume_skills)
    return {"scores": scores}

@router.post("/generate-report")
async def generate_report(req: ReportRequest):
    """Generate a PDF scorecard using ReportLab."""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        from reportlab.lib.enums import TA_CENTER, TA_LEFT

        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=A4,
            leftMargin=2*cm, rightMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)

        styles = getSampleStyleSheet()
        gold = colors.HexColor("#c9a84c")
        dark = colors.HexColor("#0d0d14")
        muted = colors.HexColor("#6b7280")

        title_style = ParagraphStyle("title", fontSize=26, textColor=dark,
            spaceAfter=4, fontName="Helvetica-Bold", alignment=TA_CENTER)
        sub_style   = ParagraphStyle("sub",   fontSize=12, textColor=muted,
            spaceAfter=16, alignment=TA_CENTER)
        h2_style    = ParagraphStyle("h2",    fontSize=14, textColor=dark,
            spaceBefore=16, spaceAfter=8, fontName="Helvetica-Bold")
        body_style  = ParagraphStyle("body",  fontSize=10, textColor=muted, leading=14)

        story = [
            Paragraph("IntriVue Interview Report", title_style),
            Paragraph(f"{req.candidate_name}  ·  {req.domain}", sub_style),
            HRFlowable(width="100%", thickness=1, color=gold, spaceAfter=16),

            Paragraph("Score Summary", h2_style),
        ]

        score_data = [
            ["Metric", "Score", "Grade"],
            ["Overall", f"{req.overall_score}/100", _grade(req.overall_score)],
            ["Accuracy", f"{req.accuracy_score}/100", _grade(req.accuracy_score)],
            ["Technical", f"{req.technical_score}/100", _grade(req.technical_score)],
            ["Communication", f"{req.communication_score}/100", _grade(req.communication_score)],
            ["Confidence", f"{req.confidence_score}/100", _grade(req.confidence_score)],
        ]
        tbl = Table(score_data, colWidths=[8*cm, 4*cm, 4*cm])
        tbl.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,0), dark),
            ("TEXTCOLOR",  (0,0), (-1,0), colors.white),
            ("FONTNAME",   (0,0), (-1,0), "Helvetica-Bold"),
            ("FONTSIZE",   (0,0), (-1,-1), 10),
            ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.HexColor("#f9f7f4"), colors.white]),
            ("ALIGN", (1,0), (-1,-1), "CENTER"),
            ("GRID", (0,0), (-1,-1), 0.5, colors.HexColor("#e5e1d8")),
            ("TOPPADDING", (0,0), (-1,-1), 6),
            ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ]))
        story += [tbl, Spacer(1, 16)]

        if req.strengths:
            story.append(Paragraph("Strengths", h2_style))
            for s in req.strengths:
                story.append(Paragraph(f"✓  {s}", body_style))
            story.append(Spacer(1, 8))

        if req.weaknesses:
            story.append(Paragraph("Areas for Improvement", h2_style))
            for w in req.weaknesses:
                story.append(Paragraph(f"△  {w}", body_style))
            story.append(Spacer(1, 8))

        if req.skill_gaps:
            story.append(Paragraph("Skill Gaps", h2_style))
            story.append(Paragraph(", ".join(g.title() for g in req.skill_gaps), body_style))
            story.append(Spacer(1, 8))

        if req.questions:
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e5e1d8"), spaceBefore=8, spaceAfter=8))
            story.append(Paragraph("Per-Question Review", h2_style))
            for i, q in enumerate(req.questions):
                if not q.get("answer"): continue
                story.append(Paragraph(f"Q{i+1}: {q['question']}", ParagraphStyle("qhead", fontSize=10, fontName="Helvetica-Bold", textColor=dark, spaceBefore=8)))
                story.append(Paragraph(q["answer"][:400], body_style))
                sc = q.get("scores", {})
                story.append(Paragraph(
                    f"Accuracy: {sc.get('accuracy','-')}  |  Technical: {sc.get('technical','-')}  |  Communication: {sc.get('communication','-')}  |  Confidence: {sc.get('confidence','-')}",
                    ParagraphStyle("scores", fontSize=9, textColor=gold, spaceAfter=4)
                ))

        doc.build(story)
        buf.seek(0)
        return StreamingResponse(buf, media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="intrivue-report-{req.candidate_name.replace(" ","_")}.pdf"'})
    except Exception as e:
        print(f"PDF generation error: {e}")
        return {"error": str(e)}

def _grade(score: int) -> str:
    if score >= 85: return "Excellent"
    if score >= 70: return "Good"
    if score >= 55: return "Fair"
    return "Needs Work"

class SWRequest(BaseModel):
    resume_skills: List[str] = []
    skill_gaps: List[str] = []
    avg_scores: dict = {}

@router.post("/strengths-weaknesses")
async def strengths_weaknesses(req: SWRequest):
    from utils.nlp_utils import generate_strengths_weaknesses
    strengths, weaknesses = generate_strengths_weaknesses(
        req.resume_skills, req.skill_gaps, req.avg_scores
    )
    return {"strengths": strengths, "weaknesses": weaknesses}
