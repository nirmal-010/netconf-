const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const UserProgress = require('../models/UserProgress');

// @route   GET api/progress
// @desc    Get user's saved progress
// @access  Private
router.get('/', auth, async (req, res) => {
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
  try {
    const { state } = req.body;
    
    let progress = await UserProgress.findOne({ user: req.user.id });
    
    if (progress) {
      // Update
      progress.state = state;
      await progress.save();
      return res.json(progress);
    }

    // Create
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
