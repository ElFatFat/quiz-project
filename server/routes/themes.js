const express = require('express');
const router = express.Router();
const Theme = require('../models/theme');

router.post('/add', async (req, res) => {
  try {
    const { title, questions } = req.body;
    const newTheme = new Theme({ title, questions });
    await newTheme.save();
    res.status(201).json(newTheme);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//Get all questions from a theme
router.get('/:id', async (req, res) => {
    try {
      const theme = await Theme.findById(req.params.id).populate('questions');
      if (!theme) {
        return res.status(404).json({ message: 'Theme not found' });
      }
      res.status(200).json(theme);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

//Get all themes
router.get('/', async (req, res) => {
    try {
      const themes = await Theme.find();
      res.status(200).json(themes);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

//Get 10 random questions from a theme
router.get('/random/:id', async (req, res) => {
    try {
        const theme = await Theme.findById(req.params.id).select('questions');
      if (!theme) {
        return res.status(404).json({ message: 'Theme not found' });
      }
      const questions = theme.questions.sort(() => 0.5 - Math.random()).slice(0, 10);
      res.status(200).json(questions);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });



module.exports = router;