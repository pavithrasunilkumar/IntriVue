require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

async function getMatchScore(userSkills, jobSkills) {
  try {
    const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.post(`${mlUrl}/recommend`, {
      user_skills: userSkills || [],
      job_skills: jobSkills || [],
    }, { timeout: 3000 });
    return response.data.match_score ?? 50;
  } catch {
    if (!userSkills?.length || !jobSkills?.length) return 40;
    const userSet = new Set(userSkills.map(s => s.toLowerCase()));
    const matches = jobSkills.filter(s => userSet.has(s.toLowerCase())).length;
    return Math.min(100, Math.round((matches / jobSkills.length) * 100));
  }
}

// POST /register
app.post('/register', async (req, res) => {
  try {
    const {
      username, email, password, role,
      fullName, jobTitle, phone, location, yearsExperience, aboutMe,
      skills, education, workExperience, certifications,
      companyName, industry,
      resumeBase64, resumeFileName, resumeMimeType
    } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'username, email, password and role are required' });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ message: 'Email or username already exists' });
    }

    const user = new User({
      username, email, password, role,
      fullName, jobTitle, phone, location, yearsExperience, aboutMe,
      skills: skills || [],
      education: education || {},
      workExperience: workExperience || [],
      certifications: certifications || [],
      companyName, industry,
      resumeBase64: resumeBase64 || '',
      resumeFileName: resumeFileName || '',
      resumeMimeType: resumeMimeType || '',
    });

    await user.save();
    res.status(201).json({ message: 'Account created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const user = await User.findOne({ $or: [{ username }, { email: username }] });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        jobTitle: user.jobTitle,
        phone: user.phone,
        location: user.location,
        yearsExperience: user.yearsExperience,
        aboutMe: user.aboutMe,
        skills: user.skills,
        education: user.education,
        workExperience: user.workExperience,
        certifications: user.certifications,
        companyName: user.companyName,
        industry: user.industry,
        resumeBase64: user.resumeBase64 || '',
        resumeFileName: user.resumeFileName || '',
        resumeMimeType: user.resumeMimeType || '',
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /save-profile
app.post('/save-profile', authenticate, async (req, res) => {
  try {
    const {
      fullName, jobTitle, phone, location, yearsExperience, aboutMe,
      skills, education, workExperience, certifications,
      companyName, industry,
      resumeBase64, resumeFileName, resumeMimeType
    } = req.body;

    const updateFields = {};
    if (fullName !== undefined) updateFields.fullName = fullName;
    if (jobTitle !== undefined) updateFields.jobTitle = jobTitle;
    if (phone !== undefined) updateFields.phone = phone;
    if (location !== undefined) updateFields.location = location;
    if (yearsExperience !== undefined) updateFields.yearsExperience = yearsExperience;
    if (aboutMe !== undefined) updateFields.aboutMe = aboutMe;
    if (skills !== undefined) updateFields.skills = skills;
    if (education !== undefined) updateFields.education = education;
    if (workExperience !== undefined) updateFields.workExperience = workExperience;
    if (certifications !== undefined) updateFields.certifications = certifications;
    if (companyName !== undefined) updateFields.companyName = companyName;
    if (industry !== undefined) updateFields.industry = industry;
    if (resumeBase64 !== undefined) updateFields.resumeBase64 = resumeBase64;
    if (resumeFileName !== undefined) updateFields.resumeFileName = resumeFileName;
    if (resumeMimeType !== undefined) updateFields.resumeMimeType = resumeMimeType;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, select: '-password' }
    );

    res.json({ message: 'Profile updated', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /get-profile
app.post('/get-profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /create-job
app.post('/create-job', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({ message: 'Only companies can create jobs' });
    }
    const { title, description, skills, location, salary, type, benefits } = req.body;
    if (!title || !description || !location) {
      return res.status(400).json({ message: 'title, description and location are required' });
    }
    const job = new Job({
      title, description,
      company: req.user.companyName || req.user.username,
      companyUserId: req.user._id,
      skills: skills || [],
      location,
      salary: salary || 'Competitive',
      type: type || 'Full-time',
      benefits: benefits || ['Health Insurance', 'Professional Development'],
      status: 'Active',
    });
    await job.save();
    res.status(201).json({ message: 'Job created', job });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /jobs
app.get('/jobs', authenticate, async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'Active' }).sort({ createdAt: -1 });
    const userSkills = req.user.skills || [];
    const jobsWithScores = await Promise.all(
      jobs.map(async (job) => {
        const matchScore = await getMatchScore(userSkills, job.skills);
        return {
          id: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          type: job.type || 'Full-time',
          description: job.description,
          requirements: job.skills.length > 0 ? job.skills : ['See job description'],
          benefits: job.benefits?.length > 0 ? job.benefits : ['Health Insurance', 'Professional Development'],
          matchPercentage: matchScore,
          skills: job.skills,
          createdAt: job.createdAt,
        };
      })
    );
    res.json({ jobs: jobsWithScores });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /company/jobs
app.get('/company/jobs', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'company') return res.status(403).json({ message: 'Forbidden' });
    const jobs = await Job.find({ companyUserId: req.user._id }).sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /apply
app.post('/apply', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({ message: 'Only job seekers can apply' });
    }
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'jobId required' });

    const existing = await Application.findOne({ jobId, userId: req.user._id });
    if (existing) return res.json({ message: 'Already applied' });

    // Fetch fresh user data to get latest resume
    const freshUser = await User.findById(req.user._id);

    const app_ = new Application({
      jobId,
      userId: req.user._id,
      applicantName: freshUser.fullName || freshUser.username,
      applicantEmail: freshUser.email,
      applicantPhone: freshUser.phone || '',
      applicantLocation: freshUser.location || '',
      applicantSkills: freshUser.skills || [],
      applicantExperience: freshUser.yearsExperience || '',
      applicantAbout: freshUser.aboutMe || '',
      applicantEducation: freshUser.education || {},
      applicantWorkExperience: freshUser.workExperience || [],
      resumeBase64: freshUser.resumeBase64 || '',
      resumeFileName: freshUser.resumeFileName || '',
      resumeMimeType: freshUser.resumeMimeType || 'application/pdf',
    });
    await app_.save();
    res.status(201).json({ message: 'Applied successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /applied-jobs
app.get('/applied-jobs', authenticate, async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .populate('jobId')
      .sort({ appliedAt: -1 });
    const userSkills = req.user.skills || [];
    const jobs = await Promise.all(
      applications.map(async (app_) => {
        if (!app_.jobId) return null;
        const job = app_.jobId;
        const matchScore = await getMatchScore(userSkills, job.skills);
        return {
          id: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          type: job.type || 'Full-time',
          description: job.description,
          requirements: job.skills?.length > 0 ? job.skills : ['See job description'],
          benefits: job.benefits?.length > 0 ? job.benefits : ['Health Insurance'],
          matchPercentage: matchScore,
          appliedAt: app_.appliedAt,
        };
      })
    );
    res.json({ jobs: jobs.filter(Boolean) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /company/applicants/:jobId
app.get('/company/applicants/:jobId', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'company') return res.status(403).json({ message: 'Forbidden' });
    const job = await Job.findOne({ _id: req.params.jobId, companyUserId: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('userId', 'username email fullName skills')
      .sort({ appliedAt: -1 });
    const applicants = applications.map(app_ => ({
      applicationId: app_._id,
      appliedAt: app_.appliedAt,
      name: app_.applicantName || app_.userId?.fullName || app_.userId?.username || 'Unknown',
      email: app_.applicantEmail || app_.userId?.email || '',
      phone: app_.applicantPhone || '',
      location: app_.applicantLocation || '',
      skills: app_.applicantSkills?.length ? app_.applicantSkills : (app_.userId?.skills || []),
      experience: app_.applicantExperience || '',
      about: app_.applicantAbout || '',
      education: app_.applicantEducation || {},
      workExperience: app_.applicantWorkExperience || [],
      resumeBase64: app_.resumeBase64 || '',
      resumeFileName: app_.resumeFileName || '',
      resumeMimeType: app_.resumeMimeType || 'application/pdf',
    }));
    res.json({ job: { title: job.title, location: job.location }, applicants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /company/jobs/:jobId/close
app.patch('/company/jobs/:jobId/close', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'company') return res.status(403).json({ message: 'Forbidden' });
    const job = await Job.findOneAndUpdate(
      { _id: req.params.jobId, companyUserId: req.user._id },
      { $set: { status: 'Closed' } },
      { new: true }
    );
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job closed', job });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));