const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Interview = require('../models/Interview');

// GET /api/results/:id - Full results for a completed interview
router.get('/:id', auth, async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user.id });
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    if (interview.status !== 'completed') return res.status(400).json({ error: 'Interview not completed yet' });
    res.json(interview);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
