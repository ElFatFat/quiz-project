const express = require('express');
const router = express.Router();
const Question = require('../models/Question');


//Add a question
router.post('/add', async (req, res) => {
  try {
    const { title, possibleAnswers, correctAnswerIndex } = req.body;
    const newQuestion = new Question({ title, possibleAnswers, correctAnswerIndex });
    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//Give the title and the possibleAnswers for a given question
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).select('possibleAnswers title');


    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(200).json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;