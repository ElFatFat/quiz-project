const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
  theme: { type: mongoose.Schema.Types.ObjectId, ref: 'Themes', required: true }, // Reference to Theme model
  score: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now } // Automatically set the creation date
});

module.exports = mongoose.model('Scores', scoreSchema);