"""
IntriVue NLP Utilities v2
Upgraded: sentence-transformers semantic scoring, 5-dimension evaluation,
          structured question templates, skill gap detection
"""
import re
from typing import List, Dict, Tuple

# ── Domain Skills ───────────────────────────────────────────────────────────
DOMAIN_SKILLS: Dict[str, List[str]] = {
    "Computer Science": [
        "python","java","javascript","typescript","c++","go","rust","kotlin",
        "react","angular","vue","nextjs","nodejs","express","django","flask","fastapi","spring",
        "sql","mysql","postgresql","mongodb","redis","elasticsearch","dynamodb",
        "docker","kubernetes","aws","gcp","azure","ci/cd","git","linux","terraform",
        "machine learning","deep learning","tensorflow","pytorch","nlp","computer vision",
        "rest api","graphql","microservices","system design","data structures","algorithms",
        "agile","scrum","devops","kafka","oauth","jwt","unit testing","tdd","solid principles"
    ],
    "Finance": [
        "financial modeling","excel","bloomberg","python","r","sql","vba","power bi","tableau",
        "valuation","dcf","equity research","portfolio management","risk analysis",
        "derivatives","fixed income","investment banking","corporate finance","m&a",
        "accounting","ifrs","gaap","cfa","frm","quantitative analysis","trading",
        "hedge fund","private equity","asset management","credit analysis","budgeting"
    ],
    "Data Science": [
        "python","r","sql","machine learning","deep learning","statistics",
        "pandas","numpy","scikit-learn","tensorflow","pytorch","keras","xgboost",
        "nlp","computer vision","tableau","power bi","matplotlib","seaborn",
        "spark","airflow","mlflow","feature engineering","model deployment",
        "hypothesis testing","regression","classification","clustering","time series","a/b testing"
    ],
    "Business": [
        "strategy","business development","market analysis","competitive analysis",
        "sales","crm","salesforce","marketing","product management","operations",
        "supply chain","project management","pmp","six sigma","lean","stakeholder management",
        "excel","tableau","powerpoint","business intelligence","p&l","budgeting","forecasting","okr"
    ],
    "Arts": [
        "adobe creative suite","photoshop","illustrator","indesign","after effects","premiere pro",
        "figma","sketch","ui design","ux design","typography","color theory","branding",
        "motion graphics","video editing","photography","3d modeling","blender",
        "content creation","storytelling","copywriting","art direction","design systems","wireframing"
    ],
    "Marketing": [
        "digital marketing","seo","sem","google ads","facebook ads","social media marketing",
        "content marketing","email marketing","marketing automation","hubspot","mailchimp",
        "google analytics","a/b testing","conversion rate optimization","brand strategy",
        "market research","customer segmentation","product marketing","copywriting","growth hacking","pr"
    ]
}

GENERIC_SKILLS = [
    "communication","teamwork","leadership","problem solving","critical thinking",
    "time management","project management","presentation","analytical skills",
    "research","documentation","collaboration","mentoring","strategic planning"
]

QUESTION_TEMPLATES = {
    "resume": [
        "Walk me through your experience with {skill}. Describe a specific project where you applied it and what the measurable outcome was.",
        "You've listed {skill} on your resume. What's the most technically challenging problem you solved using it, and how did you approach it?",
        "How would you rate your proficiency in {skill} on a scale of 1–10? Back it up with a real-world example.",
        "Tell me about a high-pressure situation where you relied on {skill} to deliver results. What was your process?",
    ],
    "job": [
        "This role requires strong {skill} expertise. Walk me through exactly how your background prepares you for that specific requirement.",
        "Describe how you would leverage {skill} to create impact in the first 90 days here.",
        "The team uses {skill} daily in production. Walk me through your deepest hands-on experience with it.",
        "How do you stay current with developments in {skill}? What's the latest advancement you've actively explored?",
    ],
    "skill_gap": [
        "{skill} is a core requirement for this role but isn't prominent on your resume. How would you approach ramping up, and can you show any early steps you've taken?",
        "We need strong {skill} from day one. What adjacent experience do you have, and what's your concrete 30-day learning plan?",
        "Tell me about the fastest you've learned a new technical skill. Now apply that story to how you'd close the gap in {skill}.",
        "Can you describe transferable experience that would help you apply {skill} even without direct experience in it?",
    ]
}

BEHAVIORAL_QUESTIONS = {
    "Computer Science": [
        "Walk me through designing a globally distributed system for 10M DAU — cover data layer, API design, caching, and failure modes.",
        "How do you approach code reviews? What specific things do you look for, and how has your process evolved?",
        "Describe the most difficult production incident you debugged. What was your systematic root-cause process?",
        "How do you balance shipping velocity against technical debt? Give me a real trade-off you navigated.",
    ],
    "Finance": [
        "Walk me through building a DCF for a cyclical-industry company. What are the critical assumptions and how do you sensitivity-test them?",
        "Describe the most complex financial analysis you've owned. How did you validate assumptions and communicate to non-finance stakeholders?",
        "How do you stress-test a portfolio against a macro shock? Walk me through your framework.",
        "Tell me about a time you had to make a consequential recommendation under material uncertainty.",
    ],
    "Data Science": [
        "Describe your end-to-end ML workflow from raw data to a monitored production model. Tools, pitfalls, decisions.",
        "Walk me through designing a rigorous A/B test — experiment design, sample size calculation, and common pitfalls.",
        "How do you simultaneously handle class imbalance, feature leakage, and overfitting in a classification problem?",
        "Tell me about the most business-impactful data science project you've built. How did you quantify the outcome?",
    ],
    "Business": [
        "Walk me through how you'd evaluate entering a new market — what framework, what data, what go/no-go criteria?",
        "Describe a time you influenced a major business decision without formal authority.",
        "How do you manage stakeholders with directly competing priorities? Give a specific example.",
        "Tell me about a strategic initiative you owned end-to-end. How did you define success and handle setbacks?",
    ],
    "Arts": [
        "Walk me through your creative process from brief to final delivery on a complex, ambiguous project.",
        "Describe a time you had to defend a creative direction to a skeptical client. What was your approach and outcome?",
        "How do you balance your creative vision with hard client constraints and brand guidelines?",
        "Tell me about the most technically and creatively demanding brief you've executed.",
    ],
    "Marketing": [
        "Walk me through building a GTM strategy for a new B2B SaaS product from zero.",
        "Describe a campaign that underperformed. What was your diagnosis, and how did you pivot?",
        "How do you prioritise channels and allocate budget when resources are constrained? Walk me through your framework.",
        "Tell me about your highest-ROI marketing initiative. How did you measure and communicate impact to leadership?",
    ]
}

# ── Lazy-loaded Sentence Transformer ────────────────────────────────────────
_model = None

def _get_model():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer("all-MiniLM-L6-v2")
            print("✅ Sentence transformer loaded")
        except Exception as e:
            print(f"⚠️  ST not available: {e} — using Jaccard fallback")
            _model = "fallback"
    return _model

def semantic_sim(t1: str, t2: str) -> float:
    if not t1 or not t2: return 0.0
    m = _get_model()
    if m == "fallback": return _jaccard(t1, t2)
    try:
        import numpy as np
        emb = m.encode([t1, t2], normalize_embeddings=True)
        return float(np.dot(emb[0], emb[1]))
    except: return _jaccard(t1, t2)

def _jaccard(a: str, b: str) -> float:
    w1 = set(re.findall(r'\b\w{3,}\b', a.lower()))
    w2 = set(re.findall(r'\b\w{3,}\b', b.lower()))
    if not w1 or not w2: return 0.0
    return len(w1 & w2) / len(w1 | w2)

# ── Skill Extraction ─────────────────────────────────────────────────────────
def extract_skills(text: str, domain: str = "Computer Science") -> List[str]:
    lo = text.lower()
    found = set()
    for s in DOMAIN_SKILLS.get(domain, []):
        if re.search(r'\b' + re.escape(s) + r'\b', lo): found.add(s)
    for s in GENERIC_SKILLS:
        if re.search(r'\b' + re.escape(s) + r'\b', lo): found.add(s)
    return sorted(found)

def find_skill_gaps(resume_skills: List[str], job_skills: List[str]) -> List[str]:
    lo = {s.lower() for s in resume_skills}
    return [s for s in job_skills if s.lower() not in lo][:8]

# ── Question Generation (6-7 questions) ─────────────────────────────────────
def generate_questions(resume_skills, job_skills, skill_gaps, domain, resume_text, job_description) -> List[dict]:
    questions = []
    used: set = set()

    # 2 resume-based
    for i, s in enumerate(resume_skills[:2]):
        t = QUESTION_TEMPLATES["resume"][i % 4]
        questions.append({"question": t.format(skill=s.title()), "type": "resume"})
        used.add(s)

    # 2 job-requirement
    cnt = 0
    for s in job_skills:
        if cnt >= 2: break
        if s not in used:
            questions.append({"question": QUESTION_TEMPLATES["job"][cnt % 4].format(skill=s.title()), "type": "job"})
            used.add(s); cnt += 1

    # 2 skill-gap (most targeted)
    for i, g in enumerate(skill_gaps[:2]):
        questions.append({"question": QUESTION_TEMPLATES["skill_gap"][i % 4].format(skill=g.title()), "type": "skill_gap"})

    # 1 behavioral to reach 7
    bq = BEHAVIORAL_QUESTIONS.get(domain, BEHAVIORAL_QUESTIONS["Computer Science"])
    for q in bq[:max(0, 7 - len(questions))]:
        questions.append({"question": q, "type": "job"})

    return questions[:7]

# ── Answer Scoring ───────────────────────────────────────────────────────────
def score_answer(question: str, answer: str, domain: str, job_skills: List[str], resume_skills: List[str]) -> dict:
    """5-dimension semantic scoring. Returns 0-100 each."""
    if not answer or len(answer.strip()) < 8:
        return {"accuracy": 15, "technical": 15, "communication": 15, "confidence": 15, "overall": 15}

    lo      = answer.lower()
    words   = answer.split()
    wc      = len(words)
    sents   = [s.strip() for s in re.split(r'[.!?]+', answer) if len(s.strip()) > 5]
    avg_sl  = wc / max(len(sents), 1)

    # ── 1. Accuracy (semantic Q→A relevance) ───────────────────────────────
    sem = semantic_sim(question, answer)
    q_kw = set(re.findall(r'\b\w{4,}\b', question.lower()))
    a_kw = set(re.findall(r'\b\w{4,}\b', lo))
    kw_hit = len(q_kw & a_kw) / max(len(q_kw), 1)
    accuracy = int(28 + sem * 48 + kw_hit * 24)
    accuracy = _cl(accuracy, 18, 97)

    # ── 2. Technical (domain skill density + JD semantic overlap) ──────────
    all_sk = list(set(job_skills + resume_skills + DOMAIN_SKILLS.get(domain, [])))
    hits   = sum(1 for s in all_sk if re.search(r'\b' + re.escape(s.lower()) + r'\b', lo))
    density = hits / max(wc / 50, 1)
    jd_sem  = semantic_sim(" ".join(job_skills), answer) if job_skills else 0.45
    technical = int(28 + min(density, 1.8) * 32 + jd_sem * 33 + (5 if wc > 100 else 0))
    technical = _cl(technical, 18, 97)

    # ── 3. Communication (structure + length + sentence quality) ───────────
    structure = [
        "first","second","third","firstly","secondly","additionally","furthermore",
        "however","therefore","as a result","for example","for instance","such as",
        "in conclusion","to summarize","specifically","in particular","on the other hand",
        "consequently","this means","importantly","notably"
    ]
    s_hits = sum(1 for p in structure if p in lo)
    comm = 32
    if wc >= 40:  comm += 10
    if wc >= 80:  comm += 10
    if wc >= 130: comm += 8
    if wc >= 180: comm += 5
    if s_hits >= 1: comm += 10
    if s_hits >= 3: comm += 8
    if 7 <= avg_sl <= 32: comm += 10
    if len(sents) >= 4: comm += 7
    communication = _cl(comm, 18, 96)

    # ── 4. Confidence (assertive vs hedging language) ──────────────────────
    hedges   = ["maybe","might be","possibly","not sure","i think maybe","i guess",
                "kind of","sort of","i'm not sure","i don't really know","i suppose",
                "not really","i'm not confident","i'm not certain"]
    asserts  = ["i built","i led","i designed","i implemented","i achieved","i delivered",
                "i created","i managed","i developed","i architected","i established",
                "definitely","certainly","successfully","i have proven","specifically",
                "i know","i can confidently","my approach was","i solved","i increased",
                "i reduced","i improved","i drove","i launched"]
    examples = ["for example","for instance","in my previous","at my last","in one project",
                "during my time","when i was at","specifically when","one situation was"]

    h_cnt = sum(lo.count(h) for h in hedges)
    a_cnt = sum(1 for a in asserts  if a in lo)
    e_cnt = sum(1 for e in examples if e in lo)

    confidence = 44 + (a_cnt * 7) + (e_cnt * 6) - (h_cnt * 8)
    if wc > 100: confidence += 8
    if wc > 160: confidence += 5
    confidence = _cl(int(confidence), 18, 97)

    # ── 5. Overall (weighted) ──────────────────────────────────────────────
    overall = int(accuracy * 0.25 + technical * 0.30 + communication * 0.20 + confidence * 0.25)
    overall = _cl(overall, 15, 97)

    return {"accuracy": accuracy, "technical": technical,
            "communication": communication, "confidence": confidence, "overall": overall}

def _cl(v, lo, hi): return max(lo, min(hi, v))

def generate_strengths_weaknesses(resume_skills, skill_gaps, avg_scores) -> Tuple[List[str], List[str]]:
    strengths, weaknesses = [], []
    if avg_scores.get("confidence", 0) >= 68:
        strengths.append("Confident delivery — your answers sound assured and well-grounded")
    else:
        weaknesses.append("Confidence — use more assertive language and anchor answers in specific outcomes")

    if avg_scores.get("technical", 0) >= 68:
        strengths.append("Technical depth — you demonstrate relevant, domain-specific knowledge")
    else:
        weaknesses.append("Technical depth — weave in more domain terminology, tools, and specifics")

    if avg_scores.get("communication", 0) >= 68:
        strengths.append("Clear communication — structured, well-paced, and easy to follow")
    else:
        weaknesses.append("Answer structure — use signposting (first / then / finally) and concrete examples")

    if avg_scores.get("accuracy", 0) >= 68:
        strengths.append("Relevance — you consistently address what was actually asked")
    else:
        weaknesses.append("Relevance — focus more directly on the question; avoid going off-topic")

    for s in resume_skills[:2]: strengths.append(f"Proven experience with {s.title()}")
    for g in skill_gaps[:2]:    weaknesses.append(f"Skill gap: {g.title()} — prioritise closing this for the role")
    return strengths[:5], weaknesses[:5]
