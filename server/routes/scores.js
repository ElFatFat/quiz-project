const express = require('express');
const router = express.Router();
const Score = require('../models/score');
const { authenticateToken, isTokenAdmin } = require('../middlewares/auth');


router.post('/', async (req, res) => {
  try {
    const { user, theme, score } = req.body;
    const newScore = new Score({ user, theme, score });
    await newScore.save();
    res.status(201).json(newScore);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Get the user ID from the decoded token
    const scores = await Score.find({ user: userId })
      .populate('theme', 'title') // Populate the theme field and include only the title
      .sort({ createdAt: -1 }); // Sort by date in descending order

    res.status(200).json(scores);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;