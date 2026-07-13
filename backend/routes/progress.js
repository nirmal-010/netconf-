const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const UserProgress = require('../models/UserProgress');

// @route   GET api/progress
// @desc    Get user's saved progress
// @access  Private
router.get('/', auth, async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    const memProgress = global.inMemoryProgress.get(req.user.id);
    if (!memProgress) {
      return res.status(404).json({ msg: 'No progress found' });
    }
    return res.json(memProgress);
  }

  try {
    const progress = await UserProgress.findOne({ user: req.user.id });
    if (!progress) {
      return res.status(404).json({ msg: 'No progress found' });
    }
    res.json(progress.state);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
});

// @route   POST api/progress
// @desc    Save user progress
// @access  Private
router.post('/', auth, async (req, res) => {
  const { state } = req.body;

  if (mongoose.connection.readyState !== 1) {
    global.inMemoryProgress.set(req.user.id, state);
    return res.json({ user: req.user.id, state });
  }

  try {
    let progress = await UserProgress.findOne({ user: req.user.id });
    
    if (progress) {
      progress.state = state;
      await progress.save();
      return res.json(progress);
    }

    progress = new UserProgress({
      user: req.user.id,
      state
    });

    await progress.save();
    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
});

module.exports = router;
