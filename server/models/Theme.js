const mongoose = require('mongoose');
const Question = require('./Question'); // Import the Question model

const themeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Questions' }] // Reference to Question model
});

module.exports = mongoose.model('Themes', themeSchema);