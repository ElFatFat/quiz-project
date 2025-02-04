const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Theme = require('../models/theme');
const isTokenAdmin = require('../middlewares/auth');



//Add a question
router.post('/', isTokenAdmin, async (req, res) => {
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

//Get all questions
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find();

    // Find themes for each question
    const questionsWithThemes = await Promise.all(
      questions.map(async (question) => {
        const theme = await Theme.findOne({ questions: question._id }).select('title');
        return { ...question.toObject(), theme };
      })
    );

    res.status(200).json(questionsWithThemes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//update a question
router.put('/:id', isTokenAdmin, async (req, res) => {
  try {
    const { title, possibleAnswers, correctAnswerIndex } = req.body;
    const question = await Question.findByIdAndUpdate(req.params.id, { title, possibleAnswers, correctAnswerIndex }, { new: true });
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(200).json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//delete a question
router.delete('/:id', isTokenAdmin, async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);


    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    await Theme.updateMany(
      { questions: req.params.id },
      { $pull: { questions: req.params.id } }
    );

    res.status(200).json(question);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;