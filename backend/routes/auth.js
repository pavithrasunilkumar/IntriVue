const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { body, validationResult } = require('express-validator');
const User    = require('../models/User');
const auth    = require('../middleware/auth');

// Multer for profile resume upload at signup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/resumes');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 10*1024*1024 },
  fileFilter: (req, file, cb) => file.mimetype === 'application/pdf'
    ? cb(null, true) : cb(new Error('PDF only')) });

function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/signup  (multipart: name, email, phone, password, resume?)
router.post('/signup', upload.single('resume'), [
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { name, email, phone, password } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ error: 'Email already registered' });

    // Extract resume text if uploaded
    let resumeText = '';
    let resumeUrl  = '';
    if (req.file) {
      resumeUrl = `/uploads/resumes/${req.file.filename}`;
      try {
        const fetch = require('node-fetch');
        const FormData = require('form-data');
        const form = new FormData();
        form.append('resume', fs.createReadStream(req.file.path), { filename: req.file.filename, contentType: 'application/pdf' });
        form.append('job_description', 'general');
        form.append('domain', 'Computer Science');
        const aiRes = await fetch(`${process.env.AI_SERVICE_URL}/analyze`, { method: 'POST', body: form, headers: form.getHeaders() });
        if (aiRes.ok) { const d = await aiRes.json(); resumeText = d.resume_text || ''; }
      } catch(e) { console.warn('Resume parse skipped:', e.message); }
    }

    const user = new User({ name, email, phone: phone || '', password, resumeUrl, resumeText });
    await user.save();
    const token = signToken(user);
    res.status(201).json({ token, user: { id: user._id, name, email, phone: user.phone, resumeUrl } });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail(),
  body('password').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email, phone: user.phone, resumeUrl: user.resumeUrl } });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch(err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
