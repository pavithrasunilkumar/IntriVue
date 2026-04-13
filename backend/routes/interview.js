const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const fetch    = require('node-fetch');
const FormData = require('form-data');
const auth     = require('../middleware/auth');
const Interview = require('../models/Interview');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/interviews');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 10*1024*1024 },
  fileFilter: (req, file, cb) => file.mimetype === 'application/pdf'
    ? cb(null, true) : cb(new Error('PDF only')) });

// POST /api/interview/setup
router.post('/setup', auth, upload.single('resume'), async (req, res) => {
  try {
    const { domain, jobDescription } = req.body;
    if (!req.file)         return res.status(400).json({ error: 'Resume PDF required' });
    if (!domain || !jobDescription) return res.status(400).json({ error: 'Domain and job description required' });

    const form = new FormData();
    form.append('resume', fs.createReadStream(req.file.path), { filename: req.file.filename, contentType: 'application/pdf' });
    form.append('job_description', jobDescription);
    form.append('domain', domain);

    const aiRes = await fetch(`${process.env.AI_SERVICE_URL}/analyze`, {
      method: 'POST', body: form, headers: form.getHeaders()
    });
    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error('AI error:', t);
      return res.status(500).json({ error: 'AI service failed. Is it running on port 8000?' });
    }
    const ai = await aiRes.json();

    const interview = new Interview({
      userId: req.user.id, domain, jobDescription,
      resumeText:   ai.resume_text   || '',
      resumeSkills: ai.resume_skills || [],
      jobSkills:    ai.job_skills    || [],
      skillGaps:    ai.skill_gaps    || [],
      questions: (ai.questions || []).map(q => ({ question: q.question, type: q.type })),
      status: 'in_progress'
    });
    await interview.save();
    fs.unlink(req.file.path, () => {});

    res.json({
      interviewId:  interview._id,
      questions:    interview.questions,
      resumeSkills: interview.resumeSkills,
      jobSkills:    interview.jobSkills,
      skillGaps:    interview.skillGaps
    });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

// POST /api/interview/:id/answer
router.post('/:id/answer', auth, async (req, res) => {
  try {
    const { questionIndex, answerText } = req.body;
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user.id });
    if (!interview) return res.status(404).json({ error: 'Not found' });

    const aiRes = await fetch(`${process.env.AI_SERVICE_URL}/evaluate-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question:      interview.questions[questionIndex]?.question || '',
        answer:        answerText,
        domain:        interview.domain,
        job_skills:    interview.jobSkills,
        resume_skills: interview.resumeSkills
      })
    });
    let scores = { accuracy: 50, technical: 50, communication: 50, confidence: 50, overall: 50 };
    if (aiRes.ok) { const d = await aiRes.json(); scores = d.scores || scores; }

    if (interview.questions[questionIndex]) {
      interview.questions[questionIndex].answer = answerText;
      interview.questions[questionIndex].scores = scores;
    }
    interview.markModified('questions');
    await interview.save();
    res.json({ scores });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Evaluation failed' }); }
});

// POST /api/interview/:id/complete
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user.id });
    if (!interview) return res.status(404).json({ error: 'Not found' });

    const answered = interview.questions.filter(q => q.answer);
    const avg = key => answered.length
      ? Math.round(answered.reduce((s,q) => s + (q.scores?.[key] || 0), 0) / answered.length) : 0;

    interview.accuracyScore      = avg('accuracy');
    interview.technicalScore     = avg('technical');
    interview.communicationScore = avg('communication');
    interview.confidenceScore    = avg('confidence');
    interview.overallScore       = avg('overall');

    // Strengths / weaknesses via AI service
    try {
      const swRes = await fetch(`${process.env.AI_SERVICE_URL}/strengths-weaknesses`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_skills: interview.resumeSkills,
          skill_gaps:    interview.skillGaps,
          avg_scores: {
            accuracy:      interview.accuracyScore,
            technical:     interview.technicalScore,
            communication: interview.communicationScore,
            confidence:    interview.confidenceScore
          }
        })
      });
      if (swRes.ok) { const d = await swRes.json(); interview.strengths = d.strengths; interview.weaknesses = d.weaknesses; }
    } catch(e) {
      // Fallback
      interview.strengths  = interview.resumeSkills.slice(0,3).map(s => `Experience with ${s}`);
      interview.weaknesses = interview.skillGaps.slice(0,3).map(g => `Skill gap: ${g}`);
    }

    interview.status      = 'completed';
    interview.completedAt = new Date();
    await interview.save();
    res.json({ message: 'Completed', interviewId: interview._id });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Completion failed' }); }
});

// GET /api/interview/history
router.get('/history', auth, async (req, res) => {
  try {
    const list = await Interview.find({ userId: req.user.id })
      .select('domain overallScore status createdAt skillGaps domain')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch(err) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/interview/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user.id });
    if (!interview) return res.status(404).json({ error: 'Not found' });
    res.json(interview);
  } catch(err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
