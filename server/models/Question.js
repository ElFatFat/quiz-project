const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  possibleAnswers: { type: [String], required: true },
  correctAnswerIndex: { type: Number, required: true }
});

module.exports = mongoose.model('Questions', questionSchema);