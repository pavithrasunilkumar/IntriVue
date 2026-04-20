const express  = require('express');
const router   = express.Router();
const jwt      = require('jsonwebtoken');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const { body, validationResult } = require('express-validator');
const User     = require('../models/User');
const auth     = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    const d = path.join(__dirname, '../uploads/resumes');
    fs.mkdirSync(d, { recursive: true }); cb(null, d);
  },
  filename: (_, f, cb) => cb(null, `${Date.now()}-${f.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_, f, cb) => f.mimetype === 'application/pdf' ? cb(null, true) : cb(new Error('PDF only'))
});

const sign = u => jwt.sign({ id: u._id, email: u.email, name: u.name }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/signup
router.post('/signup', upload.single('resume'), [
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
  try {
    const { name, email, phone, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ error: 'Email already registered' });

    let resumeText = '', resumeUrl = '';
    if (req.file) {
      resumeUrl = `/uploads/resumes/${req.file.filename}`;
      try {
        const fetch    = require('node-fetch');
        const FormData = require('form-data');
        const form     = new FormData();
        form.append('resume', fs.createReadStream(req.file.path), { filename: req.file.filename, contentType: 'application/pdf' });
        form.append('job_description', 'general profile');
        form.append('domain', 'Computer Science');
        const r = await fetch(`${process.env.AI_SERVICE_URL}/analyze`, { method: 'POST', body: form, headers: form.getHeaders() });
        if (r.ok) { const d = await r.json(); resumeText = d.resume_text || ''; }
      } catch (e) { console.warn('Resume parse skipped:', e.message); }
    }

    const user = new User({ name, email, phone: phone || '', password, resumeUrl, resumeText });
    await user.save();
    const token = sign(user);
    res.status(201).json({ token, user: { id: user._id, name, email, phone: user.phone, resumeUrl } });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// POST /api/auth/login
router.post('/login', [body('email').isEmail(), body('password').exists()], async (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ token: sign(user), user: { id: user._id, name: user.name, email, phone: user.phone, resumeUrl: user.resumeUrl } });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try { res.json(await User.findById(req.user.id).select('-password')); }
  catch { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
