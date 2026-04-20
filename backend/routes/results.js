const express   = require('express');
const router    = express.Router();
const auth      = require('../middleware/auth');
const Interview = require('../models/Interview');

router.get('/:id', auth, async (req, res) => {
  try {
    const i = await Interview.findOne({ _id: req.params.id, userId: req.user.id });
    if (!i) return res.status(404).json({ error: 'Not found' });
    res.json(i);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
