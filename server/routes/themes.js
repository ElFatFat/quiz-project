const express = require('express');
const router = express.Router();
const Theme = require('../models/theme');
const { authenticateToken, isTokenAdmin } = require('../middlewares/auth');


router.post('/', isTokenAdmin, async (req, res) => {
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

//update a theme
router.put('/:id', isTokenAdmin, async (req, res) => {
  try {
    const { title, questions } = req.body;
    const theme = await Theme.findByIdAndUpdate(req.params.id, { title, questions }, { new: true });
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    res.status(200).json(theme);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//delete a theme
router.delete('/:id', isTokenAdmin, async (req, res) => {
  try {
    const theme = await Theme.findByIdAndDelete(req.params.id);
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    res.status(200).json(theme);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id/addQuestion',isTokenAdmin, async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id);
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }

    const { questionId } = req.body;
    theme.questions.push(questionId);
    await theme.save();

    res.status(200).json(theme);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});



module.exports = router;