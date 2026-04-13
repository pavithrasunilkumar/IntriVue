# IntriVue — AI Resume & Job-Based Interview Intelligence Platform

> A full-stack, hackathon-ready AI interview simulation platform that analyzes your resume against a job description, generates personalized questions, conducts a timed mock interview with webcam proctoring, and delivers a detailed performance scorecard.

---

## ✨ Features

- **JWT Authentication** — Signup/login with bcrypt password hashing
- **5 Interview Domains** — CS, Finance, Data Science, HR, Engineering
- **Resume + JD Analysis** — AI extracts skills, keywords, and gaps
- **Personalized Questions** — Resume-based, JD-based, and skill-gap questions
- **Live Interview Mode** — Timer (2 min/question), webcam feed, speech-to-text
- **AI Proctoring** — Webcam presence detection
- **Answer Scoring** — Confidence, technical depth, communication scored per answer
- **Results Dashboard** — Radar chart, bar chart, Q&A review, skill gap insights
- **Interview History** — Track progress over time

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express + MongoDB Atlas |
| AI Service | Python + FastAPI |
| Database | MongoDB Atlas (cloud) |
| Auth | JWT + bcrypt |
| Charts | Recharts |
| PDF Parsing | pdfplumber |

---

## 📁 Project Structure

```
intrivue/
├── frontend/              # React + Vite app
│   ├── src/
│   │   ├── components/   # Navbar, shared components
│   │   ├── context/      # AuthContext
│   │   ├── pages/        # Landing, Login, Signup, Dashboard, Interview, Results
│   │   └── utils/        # axios API client
│   ├── .env.example
│   └── package.json
├── backend/               # Node.js + Express API
│   ├── models/           # User, Interview (Mongoose)
│   ├── routes/           # auth, interview, results
│   ├── middleware/       # JWT auth guard
│   ├── uploads/          # Temporary resume storage
│   ├── .env.example
│   └── server.js
├── ai-service/            # Python FastAPI AI engine
│   ├── routers/
│   │   ├── analyze.py    # Resume + JD analysis endpoint
│   │   └── evaluate.py   # Answer scoring endpoint
│   ├── utils/
│   │   └── nlp_utils.py  # NLP: skill extraction, question gen, scoring
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js v18+
- Python 3.10+
- MongoDB Atlas account (free tier works)

---

### 1. Clone / Extract the project

```bash
cd intrivue
```

---

### 2. MongoDB Atlas Setup

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account
2. Create a new **free cluster** (M0)
3. Under **Database Access** → Add a database user with read/write permissions
4. Under **Network Access** → Add IP `0.0.0.0/0` (allow all, for development)
5. Click **Connect** → **Drivers** → Copy the connection string
6. Replace `<username>` and `<password>` in the string

---

### 3. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your values
npm install
npm run dev
```

**Backend `.env`:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/intrivue?retryWrites=true&w=majority
JWT_SECRET=your_very_secret_key_at_least_32_chars
AI_SERVICE_URL=http://localhost:8000
```

Backend runs at: **http://localhost:5000**

---

### 4. AI Service Setup

```bash
cd ai-service
cp .env.example .env
python -m venv venv

# Activate venv:
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

pip install -r requirements.txt

# Run the service:
python main.py
```

AI service runs at: **http://localhost:8000**

> **Note:** First run may take a moment to load pdfplumber. If pdfplumber has issues, PyMuPDF (fitz) is used as fallback.

---

### 5. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5000/api
```

Frontend runs at: **http://localhost:3000**

---

## ▶️ Running the Full Stack

Open **3 terminal windows**:

| Terminal | Command | Port |
|----------|---------|------|
| 1 — Backend | `cd backend && npm run dev` | 5000 |
| 2 — AI Service | `cd ai-service && python main.py` | 8000 |
| 3 — Frontend | `cd frontend && npm run dev` | 3000 |

Then open **http://localhost:3000** in your browser.

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Interview
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/interview/setup` | Upload resume + JD → get questions |
| POST | `/api/interview/:id/answer` | Submit answer for scoring |
| POST | `/api/interview/:id/complete` | Finalize interview |
| GET | `/api/interview/history` | User's interview list |
| GET | `/api/interview/:id` | Single interview data |

### Results
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/results/:id` | Full results for completed interview |

### AI Service
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/analyze` | Analyze resume PDF + JD |
| POST | `/evaluate-answer` | Score an interview answer |

---

## 🎨 UI Pages

| Route | Page |
|-------|------|
| `/` | Landing page |
| `/signup` | Create account |
| `/login` | Sign in |
| `/dashboard` | Interview history + stats |
| `/select-domain` | Choose interview domain |
| `/setup` | Upload resume + job description |
| `/interview/:id` | Live interview with webcam + timer |
| `/results/:id` | Score dashboard with charts |

---

## 📦 Zip the Project

```bash
# From the parent directory containing intrivue/
zip -r intrivue.zip intrivue/ \
  --exclude "*/node_modules/*" \
  --exclude "*/__pycache__/*" \
  --exclude "*/venv/*" \
  --exclude "*/.git/*" \
  --exclude "*/uploads/*"

echo "✅ intrivue.zip created"
```

---

## 🚀 Deployment Notes

- **Frontend**: Deploy to Vercel — set `VITE_API_URL` in Vercel env vars
- **Backend**: Deploy to Railway / Render — set all env vars
- **AI Service**: Deploy to Railway (Python) or Hugging Face Spaces
- **Database**: MongoDB Atlas already cloud-hosted

---

## 🛠️ Troubleshooting

| Issue | Fix |
|-------|-----|
| AI service fails to connect | Ensure `python main.py` is running on port 8000 |
| PDF extraction returns empty | Try a text-based PDF (not scanned image) |
| Webcam not showing | Allow browser camera permissions |
| MongoDB connection error | Check Atlas IP whitelist and connection string |
| Speech-to-text not working | Use Chrome (best Web Speech API support) |

---

Built with ❤️ for hackathons and ambitious candidates.

---

## 🆕 v2 Upgrade Notes

### Dark Theme
- Full glassmorphism UI: `.glass`, `.glass-bright` utility classes
- Dark palette: `bg-bg` (#0d0d14), accent (#6366f1), gold (#f5a623)
- Framer Motion animations on all page transitions and interactive elements
- Loading skeletons on Dashboard and Results

### User Flow Changes
- `/` → redirects to `/login` (login is default landing)
- Signup now collects: **Name, Email, Phone, Password, Resume PDF**
- Domains expanded: Computer Science, Finance, Data Science, **Business, Arts, Marketing**
- Interview: **8 questions**, **60s per question**, live timer ring + horizontal bar
- Per-answer score flash shown before advancing to next question

### AI Improvements
- `sentence-transformers` (`all-MiniLM-L6-v2`) for semantic similarity
- 5-score system: **Accuracy, Technical, Communication, Confidence, Overall**
- Structured question templates (4 per type × 3 types + behavioral per domain)
- `/generate-report` endpoint produces a styled PDF via ReportLab
- `/strengths-weaknesses` derives human-readable feedback from scores + skills

### New Dependencies
**AI Service:** `sentence-transformers`, `scikit-learn`, `reportlab`
**Frontend:** `framer-motion@11`

### New .env variable
Frontend: `VITE_AI_URL=http://localhost:8000`
