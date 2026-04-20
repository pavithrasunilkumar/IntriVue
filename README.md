# IntriVue v2 — AI Interview Intelligence Platform

> Full-stack AI mock interview platform: resume analysis · skill gap detection · semantic scoring · webcam recording · PDF report

---

## Quick Start (3 terminals)

```bash
# Terminal 1 — Backend :5000
cd backend && cp .env.example .env   # add MONGODB_URI + JWT_SECRET
npm install && npm run dev

# Terminal 2 — AI Service :8000
cd ai-service && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt && python main.py

# Terminal 3 — Frontend :3000
cd frontend && cp .env.example .env
npm install && npm run dev
```

Open **http://localhost:3000**

---

## Stack

| Layer      | Tech                                               |
|------------|----------------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend    | Node.js, Express, MongoDB Atlas, JWT, Multer       |
| AI Service | Python, FastAPI, Sentence Transformers, pdfplumber, ReportLab |

## Features
- Split-layout dark Login & Signup (branding left, form right)
- Phone + resume PDF at signup
- 6 domains: CS, Finance, Data Science, Business, Arts, Marketing
- 7 personalised questions (resume + JD + skill gap + behavioral)
- 60s per question, live webcam + audio recording, voice input
- 5-score semantic evaluation: Accuracy, Technical, Communication, Confidence, Overall
- Results dashboard: animated rings, radar chart, bar chart, strengths/weaknesses
- Fixed PDF report download (direct fetch from AI service)

## Zip the project
```bash
cd ..
zip -r intrivue.zip intrivue/ \
  --exclude "*/node_modules/*" --exclude "*/__pycache__/*" \
  --exclude "*/venv/*" --exclude "*/.git/*"
```
