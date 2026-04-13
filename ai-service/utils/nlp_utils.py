"""
IntriVue NLP Utilities — Upgraded with semantic scoring
Uses sentence-transformers for real semantic similarity + structured scoring
"""

import re
import math
from typing import List, Dict, Tuple

# ─── Domain Skill Dictionaries ────────────────────────────────────────────────
DOMAIN_SKILLS: Dict[str, List[str]] = {
    "Computer Science": [
        "python","java","javascript","typescript","c++","c#","go","rust","kotlin","swift",
        "react","angular","vue","nextjs","nodejs","express","django","flask","fastapi","spring",
        "sql","mysql","postgresql","mongodb","redis","elasticsearch","dynamodb","cassandra",
        "docker","kubernetes","aws","gcp","azure","ci/cd","git","linux","terraform","ansible",
        "machine learning","deep learning","tensorflow","pytorch","nlp","computer vision",
        "rest api","graphql","microservices","system design","data structures","algorithms",
        "agile","scrum","devops","kafka","rabbitmq","grpc","websockets","oauth","jwt",
        "unit testing","tdd","clean code","solid principles","design patterns"
    ],
    "Finance": [
        "financial modeling","excel","bloomberg","python","r","sql","vba","power bi","tableau",
        "valuation","dcf","equity research","portfolio management","risk analysis","risk management",
        "derivatives","fixed income","investment banking","corporate finance","m&a",
        "accounting","ifrs","gaap","cfa","frm","quantitative analysis","trading",
        "hedge fund","private equity","venture capital","ipo","bonds","options","futures",
        "asset management","credit analysis","financial statements","ratio analysis","budgeting"
    ],
    "Data Science": [
        "python","r","sql","machine learning","deep learning","statistics","mathematics",
        "pandas","numpy","scikit-learn","tensorflow","pytorch","keras","xgboost","lightgbm",
        "nlp","computer vision","data visualization","tableau","power bi","matplotlib","seaborn",
        "spark","hadoop","airflow","mlflow","dbt","feature engineering","model deployment",
        "hypothesis testing","regression","classification","clustering","neural networks",
        "time series","a/b testing","jupyter","plotly","databricks","data pipeline","etl"
    ],
    "Business": [
        "strategy","business development","market analysis","competitive analysis","go-to-market",
        "sales","crm","salesforce","hubspot","marketing","brand management","product management",
        "operations","supply chain","logistics","project management","pmp","six sigma","lean",
        "stakeholder management","excel","tableau","powerpoint","business intelligence",
        "p&l management","budgeting","forecasting","kpi","okr","agile","customer success"
    ],
    "Arts": [
        "adobe creative suite","photoshop","illustrator","indesign","after effects","premiere pro",
        "figma","sketch","ui design","ux design","typography","color theory","branding",
        "motion graphics","video editing","photography","3d modeling","blender","cinema 4d",
        "content creation","storytelling","copywriting","art direction","visual communication",
        "print design","web design","user research","prototyping","wireframing","design systems"
    ],
    "Marketing": [
        "digital marketing","seo","sem","google ads","facebook ads","social media marketing",
        "content marketing","email marketing","marketing automation","hubspot","mailchimp",
        "google analytics","data analytics","a/b testing","conversion rate optimization","cro",
        "brand strategy","market research","customer segmentation","product marketing",
        "copywriting","campaign management","influencer marketing","affiliate marketing",
        "growth hacking","pr","event marketing","video marketing","podcast","community management"
    ]
}

GENERIC_SKILLS = [
    "communication","teamwork","leadership","problem solving","critical thinking",
    "time management","project management","presentation","analytical skills",
    "research","documentation","collaboration","mentoring","strategic planning",
    "stakeholder management","negotiation","conflict resolution","adaptability"
]

QUESTION_TEMPLATES = {
    "resume": [
        "Walk me through your experience with {skill}. Can you describe a specific project where you applied it and what the outcome was?",
        "You've listed {skill} on your resume. What's the most technically complex problem you solved using it?",
        "How would you rate your proficiency in {skill} on a scale of 1–10, and can you back that up with a concrete example?",
        "Tell me about a time you used {skill} to overcome a significant challenge. What was your approach and what did you learn?",
    ],
    "job": [
        "This role requires strong {skill} expertise. Walk me through how your background specifically prepares you for that requirement.",
        "Describe how you would leverage {skill} to make an immediate impact in the first 90 days of this role.",
        "The team relies heavily on {skill} daily. Walk me through your most hands-on, production-level experience with it.",
        "How do you stay current with developments in {skill}, and what's the latest advancement you've explored?",
    ],
    "skill_gap": [
        "Your resume doesn't strongly highlight {skill}, which is a core requirement here. How would you approach getting up to speed, and have you started?",
        "We need strong {skill} expertise for this position. While it's not prominent in your profile, what adjacent experience do you have and what's your concrete learning plan?",
        "This role requires {skill} from day one. Since it appears to be a growth area for you, how would you bridge that gap, and can you give an example of how quickly you've learned a new skill before?",
        "Can you describe any experience that's transferable to {skill}, and how you'd apply it to ramp up quickly in this role?",
    ]
}

DOMAIN_BEHAVIORAL = {
    "Computer Science": [
        "Walk me through how you'd architect a globally distributed, highly available system handling 10M daily active users. Cover data layer, API design, and failure modes.",
        "Describe your code review philosophy. What do you look for, how do you give feedback, and how has your approach evolved?",
        "Tell me about the most challenging production bug you've debugged. What was your systematic approach to root-cause analysis?",
        "How do you balance shipping features quickly against accumulating technical debt? Give me a real example.",
    ],
    "Finance": [
        "Walk me through building a DCF model for a company in a cyclical industry. What are the key assumptions and sensitivities you'd focus on?",
        "Describe a time you had to make a significant financial recommendation under uncertainty. How did you validate your assumptions?",
        "How do you construct and stress-test a portfolio against macro shocks? Walk me through your framework.",
        "Tell me about the most complex financial analysis you've done. What were the challenges and how did you communicate results to non-finance stakeholders?",
    ],
    "Data Science": [
        "Describe your end-to-end ML workflow from messy raw data to a monitored model in production. What tools, what pitfalls?",
        "Walk me through how you'd design a rigorous A/B test for a new product feature. Cover experiment design, sample size, and pitfalls.",
        "How do you handle class imbalance, feature leakage, and overfitting simultaneously in a classification problem?",
        "Tell me about the most impactful data science project you've worked on. What was the business outcome and how did you measure it?",
    ],
    "Business": [
        "Walk me through how you'd evaluate entering a new market. What framework do you use and what data would you need?",
        "Describe a time you had to influence a major business decision without formal authority. What was your approach?",
        "How do you build and manage relationships with key stakeholders who have competing priorities?",
        "Tell me about a strategic initiative you led. How did you define success, handle obstacles, and measure outcomes?",
    ],
    "Arts": [
        "Walk me through your creative process from brief to final delivery on a complex project. How do you handle creative blocks?",
        "Describe a time you had to defend a creative decision to a skeptical client or stakeholder. What was your approach?",
        "How do you balance your creative vision with client requirements and brand guidelines?",
        "Tell me about the most challenging creative brief you've executed. What constraints did you face and how did you innovate within them?",
    ],
    "Marketing": [
        "Walk me through how you'd build a go-to-market strategy for a new B2B SaaS product from scratch.",
        "Describe a campaign you ran that underperformed. What did you learn, and how did you pivot?",
        "How do you prioritize channels and allocate budget when resources are constrained? Walk me through your framework.",
        "Tell me about the highest-impact marketing initiative you've owned. How did you measure ROI and present results to leadership?",
    ]
}

# ─── Semantic Scoring (with sentence-transformers) ────────────────────────────
_model = None

def get_model():
    """Lazy-load the sentence transformer model."""
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer("all-MiniLM-L6-v2")
            print("✅ Sentence transformer model loaded")
        except Exception as e:
            print(f"⚠️  Sentence transformer not available: {e}. Using fallback.")
            _model = "fallback"
    return _model


def semantic_similarity(text1: str, text2: str) -> float:
    """Compute cosine similarity between two texts using sentence-transformers."""
    model = get_model()
    if model == "fallback" or not text1 or not text2:
        return _jaccard_similarity(text1, text2)
    try:
        import numpy as np
        embeddings = model.encode([text1, text2], normalize_embeddings=True)
        return float(np.dot(embeddings[0], embeddings[1]))
    except Exception:
        return _jaccard_similarity(text1, text2)


def _jaccard_similarity(text1: str, text2: str) -> float:
    """Fallback: Jaccard similarity on 3+ char words."""
    w1 = set(re.findall(r'\b\w{3,}\b', text1.lower()))
    w2 = set(re.findall(r'\b\w{3,}\b', text2.lower()))
    if not w1 or not w2:
        return 0.0
    return len(w1 & w2) / len(w1 | w2)


# ─── Skill Extraction ─────────────────────────────────────────────────────────
def extract_skills(text: str, domain: str = "Computer Science") -> List[str]:
    """Extract domain-relevant and generic skills from text."""
    text_lower = text.lower()
    found = set()
    for skill in DOMAIN_SKILLS.get(domain, []):
        if re.search(r'\b' + re.escape(skill.lower()) + r'\b', text_lower):
            found.add(skill)
    for skill in GENERIC_SKILLS:
        if re.search(r'\b' + re.escape(skill.lower()) + r'\b', text_lower):
            found.add(skill)
    return sorted(list(found))


def find_skill_gaps(resume_skills: List[str], job_skills: List[str]) -> List[str]:
    """Skills required by JD but absent from resume."""
    resume_lower = {s.lower() for s in resume_skills}
    return [s for s in job_skills if s.lower() not in resume_lower][:8]


# ─── Question Generation ──────────────────────────────────────────────────────
def generate_questions(
    resume_skills: List[str], job_skills: List[str], skill_gaps: List[str],
    domain: str, resume_text: str, job_description: str
) -> List[dict]:
    """Generate 8 balanced, personalized interview questions."""
    questions = []
    used_skills: set = set()

    # 2 resume-based
    for i, skill in enumerate(resume_skills[:2]):
        if skill not in used_skills:
            tmpl = QUESTION_TEMPLATES["resume"][i % len(QUESTION_TEMPLATES["resume"])]
            questions.append({"question": tmpl.format(skill=skill.title()), "type": "resume"})
            used_skills.add(skill)

    # 2 job-requirement
    count = 0
    for skill in job_skills:
        if count >= 2: break
        if skill not in used_skills:
            tmpl = QUESTION_TEMPLATES["job"][count % len(QUESTION_TEMPLATES["job"])]
            questions.append({"question": tmpl.format(skill=skill.title()), "type": "job"})
            used_skills.add(skill); count += 1

    # 2 skill-gap (most valuable)
    for i, gap in enumerate(skill_gaps[:2]):
        tmpl = QUESTION_TEMPLATES["skill_gap"][i % len(QUESTION_TEMPLATES["skill_gap"])]
        questions.append({"question": tmpl.format(skill=gap.title()), "type": "skill_gap"})

    # 2 behavioral domain questions
    behavioral = DOMAIN_BEHAVIORAL.get(domain, DOMAIN_BEHAVIORAL["Computer Science"])
    for bq in behavioral[:max(0, 8 - len(questions))]:
        questions.append({"question": bq, "type": "job"})

    return questions[:8]


# ─── Answer Scoring ───────────────────────────────────────────────────────────
def score_answer(
    question: str, answer: str, domain: str,
    job_skills: List[str], resume_skills: List[str]
) -> dict:
    """
    Score an answer on five dimensions using semantic + lexical analysis.
    Returns scores 0-100 each.
    """
    if not answer or len(answer.strip()) < 8:
        return {"accuracy": 15, "technical": 15, "communication": 15, "confidence": 15, "overall": 15}

    answer_lower = answer.lower()
    words = answer.split()
    word_count = len(words)
    sentences = [s.strip() for s in re.split(r'[.!?]+', answer) if len(s.strip()) > 5]
    avg_sent_len = word_count / max(len(sentences), 1)

    # ── 1. Accuracy Score (semantic relevance to question) ─────────────────
    sem_sim = semantic_similarity(question, answer)
    # Boost if answer contains question keywords
    q_words = set(re.findall(r'\b\w{4,}\b', question.lower()))
    a_words = set(re.findall(r'\b\w{4,}\b', answer_lower))
    keyword_overlap = len(q_words & a_words) / max(len(q_words), 1)
    accuracy = int(30 + sem_sim * 45 + keyword_overlap * 25)
    accuracy = _clamp(accuracy, 20, 97)

    # ── 2. Technical Score ─────────────────────────────────────────────────
    all_skills = list(set(job_skills + resume_skills + DOMAIN_SKILLS.get(domain, [])))
    tech_hits = sum(1 for s in all_skills
                    if re.search(r'\b' + re.escape(s.lower()) + r'\b', answer_lower))
    # Density: skills per 50 words
    density_ratio = tech_hits / max(word_count / 50, 1)
    # Semantic overlap with job skills combined
    job_skill_text = " ".join(job_skills)
    tech_sem = semantic_similarity(job_skill_text, answer) if job_skills else 0.5
    technical = int(30 + min(density_ratio, 1.5) * 30 + tech_sem * 35 + (5 if word_count > 100 else 0))
    technical = _clamp(technical, 20, 97)

    # ── 3. Communication Score ─────────────────────────────────────────────
    structure_phrases = [
        "first","second","third","firstly","secondly","additionally","furthermore",
        "however","therefore","as a result","for example","for instance","such as",
        "in conclusion","to summarize","specifically","in particular","on the other hand"
    ]
    structure_hits = sum(1 for p in structure_phrases if p in answer_lower)

    comm = 35
    if word_count >= 40:  comm += 10
    if word_count >= 80:  comm += 10
    if word_count >= 130: comm += 8
    if structure_hits >= 1: comm += 10
    if structure_hits >= 3: comm += 8
    if 8 <= avg_sent_len <= 30: comm += 10  # well-formed sentences
    if len(sentences) >= 3: comm += 6       # multi-sentence answer
    communication = _clamp(comm, 20, 96)

    # ── 4. Confidence Score ────────────────────────────────────────────────
    hedging = ["maybe","might be","possibly","not sure","i think maybe","i guess",
               "kind of","sort of","i'm not really sure","i don't know","i suppose"]
    assertive = ["i built","i led","i designed","i implemented","i achieved","i delivered",
                 "i created","i managed","i developed","i architected","definitely",
                 "certainly","successfully","i have proven","i am experienced",
                 "i have demonstrated","specifically","i know that","i can confidently"]
    example_markers = ["for example","for instance","specifically","in my previous",
                       "at my last","when i was at","in one project","during my time"]

    hedge_count = sum(answer_lower.count(h) for h in hedging)
    assert_count = sum(1 for a in assertive if a in answer_lower)
    example_count = sum(1 for e in example_markers if e in answer_lower)

    confidence = 45 + (assert_count * 8) + (example_count * 6) - (hedge_count * 7)
    if word_count > 100: confidence += 8
    if word_count > 160: confidence += 5
    confidence = _clamp(int(confidence), 20, 97)

    # ── 5. Overall (weighted) ──────────────────────────────────────────────
    overall = int(accuracy * 0.25 + technical * 0.30 + communication * 0.20 + confidence * 0.25)
    overall = _clamp(overall, 15, 97)

    return {
        "accuracy": accuracy,
        "technical": technical,
        "communication": communication,
        "confidence": confidence,
        "overall": overall
    }


def _clamp(val: int, lo: int, hi: int) -> int:
    return max(lo, min(hi, val))


def generate_strengths_weaknesses(
    resume_skills: List[str], skill_gaps: List[str], avg_scores: dict
) -> Tuple[List[str], List[str]]:
    """Derive human-readable strengths and weaknesses from scores + skills."""
    strengths, weaknesses = [], []

    # Score-based
    if avg_scores.get("confidence", 0) >= 70:
        strengths.append("Strong confident delivery — you sound assured in your answers")
    else:
        weaknesses.append("Confidence — try using more assertive language and concrete examples")

    if avg_scores.get("technical", 0) >= 70:
        strengths.append("Technical depth — you demonstrate relevant domain knowledge")
    else:
        weaknesses.append("Technical depth — weave in more domain-specific terminology and specifics")

    if avg_scores.get("communication", 0) >= 70:
        strengths.append("Clear communication — structured, well-paced answers")
    else:
        weaknesses.append("Answer structure — use signposting (first/then/finally) and concrete examples")

    if avg_scores.get("accuracy", 0) >= 70:
        strengths.append("Relevant responses — you consistently address what was asked")
    else:
        weaknesses.append("Relevance — focus more directly on the question being asked")

    # Skill-based
    for s in resume_skills[:2]:
        strengths.append(f"Demonstrated experience with {s.title()}")
    for g in skill_gaps[:2]:
        weaknesses.append(f"Skill gap: {g.title()} — prioritise closing this for this role")

    return strengths[:5], weaknesses[:5]
