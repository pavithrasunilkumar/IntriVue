# IntriVue — AI-Powered Adaptive Interview Intelligence Platform

🌐 Live Deployment - [Visit IntriVue](https://in-hire.vercel.app/login)

![Status](https://img.shields.io/badge/Status-Active-success)
![Version](https://img.shields.io/badge/Version-v3.0-blue)
![Frontend](https://img.shields.io/badge/Frontend-React.js-61DAFB?style=for-the-badge&logo=react)
![Backend](https://img.shields.io/badge/Backend-Node.js-3C873A?style=for-the-badge&logo=node.js)
![AI Service](https://img.shields.io/badge/AI%20Service-FastAPI-009688?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Backend-Python-3776AB?style=for-the-badge&logo=python)
![LLM](https://img.shields.io/badge/LLM-Groq-orange)
![RAG](https://img.shields.io/badge/AI-RAG%20%2B%20Reranking-purple)
![Voice AI](https://img.shields.io/badge/AI-Live%20Voice%20Interview-red)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![DynamoDB](https://img.shields.io/badge/Database-DynamoDB-4053D6)
![AWS S3](https://img.shields.io/badge/Storage-AWS%20S3-orange)
![Vercel](https://img.shields.io/badge/Deployment-Vercel-black?style=for-the-badge&logo=vercel)
![License](https://img.shields.io/badge/License-Non--Commercial-red)

---

## What is IntriVue?

IntriVue turns your **resume** and a **job description** into a personalized interviewer — one that knows your experience, understands what the company is looking for, adapts to your answers in real time (by voice or text), identifies your weaknesses, and tells you exactly what to improve.

> **Don't prepare for "interviews." Prepare for *your* interview.**

Think of it as having a senior engineer, a behavioral coach, and an NLP evaluation system in one room — interviewing you live, scoring you across multiple dimensions, and telling you precisely where you fell short and how to fix it.

---

## The Problem We're Solving

Traditional interview-prep platforms are static and generic:

```
Candidate → Select "Python" → Get generic Python questions
```

But a real interviewer never works like that. A real interviewer looks at your **resume + the job description + your projects + your previous answers**, and asks questions based on the *combination* — then follows up based on how well you answered.

**Example — generic platform:**
> "What is a REST API?"

**IntriVue:**
> "You used Node.js and Express to build a project called IntriVue. Walk me through how you designed your REST API and how JWT authentication fits into your request lifecycle."

And if the answer is weak:
> "You mentioned JWT, but didn't explain token validation. What happens when a protected request reaches your server?"

That gap — between a static question bank and a real, adaptive interviewer — is exactly what IntriVue closes.

---

## The Core Idea: A Closed Personalization Loop

```
   RESUME + JD
        ↓
  UNDERSTAND USER
        ↓
  RETRIEVE CONTEXT (RAG)
        ↓
   ASK QUESTION (voice or text)
        ↓
    GET ANSWER
        ↓
    EVALUATE
        ↓
 FIND WEAKNESSES
        ↓
 ADAPT INTERVIEW
        ↓
RECOMMEND PRACTICE
        ↓
  INTERVIEW AGAIN
        ↓
   MEASURE GROWTH
```

This loop — not "it uses an LLM," not "it uses RAG" — is what makes IntriVue a *personalized AI interview assessment system* rather than another ChatGPT wrapper.

---

## Features

### 🧠 Resume & JD Intelligence
- Resume parsing with section detection (Experience, Projects, Skills, Education, etc.)
- Job description parsing (skills, responsibilities, qualifications, technologies)
- Structured candidate skill profile — not just keyword matching, but evidence-backed skill levels (Strong / Moderate / Weak / Missing)
- Resume-vs-JD match scoring, skill by skill

### 🔍 RAG-Grounded Question Generation
- Multi-stage retrieval: embed → vector search (top 10) → cross-encoder rerank (top 3–5) → context builder → LLM
- Every question is grounded in *actual evidence* from your resume and the JD — the model is explicitly instructed never to invent candidate experience
- LLM Gateway abstraction so the underlying provider (Groq today) can be swapped without touching the interview engine

### 🎯 Adaptive Interview Engine
- Difficulty adjusts dynamically based on answer quality (e.g. 3 → 4 → 5 on strong answers, back down on weak ones)
- Follow-up engine detects incomplete or shallow answers and asks a clarifying question instead of moving on — just like a real interviewer would
- Session memory: every question, answer, and evaluation in the *current* interview is fed back into future question generation, so later questions can reference earlier answers directly

### 🎙️ Live Voice Interview Mode *(new)*
- Real, spoken back-and-forth interview instead of typing — candidate talks, IntriVue listens, responds, and asks the next question out loud
- Streaming speech-to-text converts your spoken answer into text as you talk
- The AI's next question is generated using both the RAG context (resume/JD) **and** the full conversation so far — so it can call back to something you said three questions ago
- Text-to-speech reads the interviewer's questions aloud for a natural, conversational feel
- Speech-pattern analysis (pace, filler-word frequency, pauses) feeds into your Communication score alongside the text-based evaluation
- Built entirely on free-tier services (see [Tech Stack](#complete-technology-stack)) so live voice practice costs nothing to run at prototype scale

### 📊 Multi-Dimension Answer Evaluation
Every answer is scored, not just marked right/wrong:

| Dimension | Example Score |
|---|---|
| Technical Accuracy | 82 |
| Relevance | 91 |
| Completeness | 67 |
| Communication | 78 |
| Depth | 70 |

### 💬 Feedback Engine
Instead of "Good answer," IntriVue gives:
- **Strengths** — what you got right, specifically
- **Missing** — concepts you skipped (e.g. token expiration, middleware validation)
- **Suggested improvement** — a concrete, actionable rewrite direction

### 📈 Skill-Gap Engine & Progress Analytics
- Skill profile updates after every interview (React: Strong, System Design: Weak, etc.)
- Personalized practice recommendations targeting your weakest areas
- Score trends tracked across interviews so improvement is visible over time

### 🔐 Secure Authentication
- OTP-based login via email (Brevo) + DynamoDB (with TTL-based expiry) + JWT sessions
- Rate limiting, max verification attempts, resend cooldowns, hashed OTPs, refresh-token rotation

### 🛡️ AI Security
- Prompt-injection defenses — retrieved resume/JD content is always treated as **untrusted data**, never as instructions
- API keys (Groq, etc.) never exposed to the frontend — all LLM calls are proxied through the backend/AI service
- Token limits, timeouts, retries, and structured error handling on every AI request

### ⚙️ Background Processing & Observability
- Resume/JD ingestion (parsing → chunking → embedding) runs asynchronously so uploads never block the UI
- Tracked metrics: API latency/error rate, LLM latency/failures, retrieval relevance, reranker scores, interview completion rate, hallucination rate

---

## 📸 Screenshots

### Login Page

![Login](./screenshots/login.png)

### Interview Interface

![Interview](./screenshots/liveinterview.png)

### Results Dashboard

![Dashboard](./screenshots/dashboard.png)

###  resume and jd selection

![Report](./screenshots/resume.png)

---


## Architecture

### High-Level Design (HLD)

```
┌───────────────────────────────────────────────────────────────────────┐
│                              INTRIVUE                                  │
└───────────────────────────────────────────────────────────────────────┘

                         CLIENT LAYER
┌───────────────────────────────────────────────────────────────────────┐
│                    React + Vite + Tailwind                            │
│  Dashboard | Resume | JD | Live Voice Interview | Results | Analytics │
└────────────────────────────────┬────────────────────────────────────┘
                                 │  HTTPS
                                 ▼
                         API / BACKEND LAYER
┌───────────────────────────────────────────────────────────────────────┐
│                        Node.js + Express                              │
│   Auth │ Users │ Resume │ JD │ Interview │ Answers │ Analytics        │
└───────────────┬───────────────────┬────────────────────────────────┘
                │                   │
        ┌───────▼───────┐    ┌──────▼─────────┐
        │ Authentication│    │ Application DB │
        │ DynamoDB      │    │ MongoDB        │
        │ Brevo + JWT   │    │                │
        └───────────────┘    └────────────────┘
                │
                │ AI Requests
                ▼
                         AI SERVICE LAYER
┌───────────────────────────────────────────────────────────────────────┐
│                           FastAPI                                      │
│ Document Processing │ RAG │ Voice Pipeline │ Evaluation │ Recommend.  │
└───────────────┬───────────────────────────────┬───────────────────────┘
                │                               │
                ▼                               ▼
       DOCUMENT PIPELINE                  LIVE VOICE PIPELINE
┌──────────────────────┐        ┌─────────────────────────────────┐
│ PDF/Text Extraction  │        │ Streaming STT (candidate speaks) │
│ Chunking             │        │ Session Memory Update            │
│ Cleaning             │        │ Adaptive Question Generation     │
│ Metadata Extraction  │        │ Streaming TTS (question spoken)  │
└──────────┬───────────┘        │ Speech-pattern analysis          │
           │                    └────────────────┬──────────────────┘
           ▼                                     │
     Embeddings                                  │
           │                                     │
           ▼                                     ▼
    Vector Database                     Interview Engine
                                                  ▲
                         RAG PIPELINE             │
              ┌─────────────────────────┐        │
              │ Query Embedding         │        │
              │ Vector Search (Top 10)  │────────┘
              │ Metadata Filtering      │
              │ Cross-Encoder Rerank    │
              │ Top 3–5 → Context       │
              └────────────┬────────────┘
                           ▼
                       Groq API
                           │
                           ▼
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       Question Gen   Follow-up    Evaluation
              │            │            │
              └────────────┼────────────┘
                           ▼
                    Skill Analysis
                           │
                           ▼
              Personalized Practice + Analytics
                           │
                           ▼
                        MongoDB

                         STORAGE LAYER
┌───────────────────────────────────────────────────────────────────────┐
│ MongoDB       DynamoDB          AWS S3          Vector Database        │
│ App Data      OTP/Auth          Resume PDFs     Embeddings/Chunks     │
│ Interviews    Temp State        Documents                              │
│ Scores                                                                 │
└───────────────────────────────────────────────────────────────────────┘

                         INFRASTRUCTURE
┌───────────────────────────────────────────────────────────────────────┐
│ Docker │ GitHub Actions │ Vercel │ Monitoring │ Logging              │
└───────────────────────────────────────────────────────────────────────┘
```

### The Live Voice Interview Loop (new)

```
Candidate speaks
      ↓
Streaming Speech-to-Text
      ↓
Final transcript → Answer Evaluation + Session Memory Update
      ↓
Next Question Generation
   (RAG context: Resume + JD  +  Session Memory: prior Q&A in this interview)
      ↓
Text-to-Speech → question spoken back to candidate
      ↓
(loop continues, difficulty adapts, follow-ups triggered as needed)
```

The key difference from the text-based mode: every new question is grounded not only in the resume/JD retrieval, but in the **running memory of the current session**, so the interviewer can reference something said several turns earlier — the same way a human interviewer would.

---

## Complete Technology Stack

### Frontend
React · Vite · Tailwind CSS · React Router · Framer Motion · Recharts · Lucide React

### Backend
Node.js · Express.js · Mongoose · JWT · Multer

### AI / ML Service
Python · FastAPI · Sentence Transformers · Cross-Encoder Reranker · scikit-learn · NumPy

### RAG Pipeline
Document parsing → Chunking → Embeddings → Vector Database → Metadata Filtering → Multi-stage Retrieval → Cross-Encoder Reranking → Context Construction

### LLM
**Groq API** — used for question generation, follow-ups, answer evaluation, feedback, and skill-gap reasoning, accessed through an internal LLM Gateway for provider flexibility

### Live Voice Pipeline *(free-tier stack)*
| Component | Tool | Notes |
|---|---|---|
| Speech-to-Text | Deepgram (free credit) / AssemblyAI (free monthly minutes) | Real-time streaming, required for natural back-and-forth |
| Text-to-Speech | Cartesia (free plan) | Low-latency, built for conversational agents |
| Speech feature analysis | librosa / openSMILE (open-source, free) | Pace, filler words, pauses → feeds Communication score |
| Fallback / offline option | Self-hosted Whisper (open-source) | Free, but batch-only — used only as an STT fallback, not for live streaming |

### Databases
- **MongoDB** — core application data (users, interviews, scores, evaluations)
- **DynamoDB** — OTP and temporary auth state (TTL-based expiry)

### Storage
**AWS S3** — resume and document storage (only metadata + S3 key stored in MongoDB)

### Authentication
Brevo (OTP email) + DynamoDB + JWT (access/refresh tokens, rotation, rate limiting)

### Infrastructure
Docker · GitHub Actions (CI/CD) · Vercel

---

## Core AI Concepts Used

| Concept | Description |
|---|---|
| **Multi-Stage RAG** | Retrieval → reranking → context construction, so questions are grounded in real evidence instead of hallucinated |
| **Adaptive Interview Simulation** | Difficulty and follow-ups adjust dynamically based on candidate responses |
| **Live Voice Conversation** | Streaming STT/TTS with session memory enables a spoken, context-aware interview |
| **Multi-Dimension Evaluation** | Technical accuracy, relevance, completeness, communication, and depth scored independently |
| **Skill-Gap Detection** | Structured, evidence-based skill profiling (Strong/Moderate/Weak/Missing) updated after every session |
| **Prompt-Injection Defense** | Retrieved documents are always treated as data, never as instructions |
| **Personalized Practice Loop** | Weak areas automatically drive targeted follow-up practice recommendations |

---

## Project Structure

```
IntriVue/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   └── services/
│
├── backend/
│   ├── api/
│   ├── models/
│   ├── auth/
│   └── interview_system/
│
├── ai-service/
│   ├── document_pipeline/
│   ├── rag/
│   ├── voice_pipeline/
│   ├── evaluation/
│   └── recommendation_engine/
│
└── README.md
```

---

## Quick Start

```bash
# Backend
cd backend
npm install
npm run dev

# AI Service
cd ai-service
venv\Scripts\activate
pip install -r requirements.txt
python main.py

# Frontend
cd frontend
npm install
npm run dev
```

---

## Roadmap / Future Scope

- [x] Resume & JD RAG-grounded questioning
- [x] Adaptive difficulty & follow-up engine
- [ ] Live voice interview mode (in progress)
- [ ] Coding round with live code execution
- [ ] System design whiteboard mode
- [ ] Multiple interviewer personas (friendly HR / strict staff engineer / behavioral coach)
- [ ] Shareable/exportable PDF interview reports
- [ ] Company-specific interview mode (FAANG, startups, product companies)
- [ ] Peer comparison analytics
- [ ] Chrome extension for live interview assistance

---

## Author

**Pavithra Sunilkumar**
- LinkedIn: [linkedin.com/in/pavithra-sunilkumar68](https://linkedin.com/in/pavithra-sunilkumar68)
- GitHub: [github.com/pavithrasunilkumar](https://github.com/pavithrasunilkumar)
- Portfolio: [vermillion-panda-a08876.netlify.app](https://vermillion-panda-a08876.netlify.app/)

---

## Support

If you found this project useful, consider giving it a ⭐ on GitHub.

---

## License

This project is for **educational and personal use only**. Commercial usage is strictly prohibited.
