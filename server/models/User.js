const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Hachage du mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.generateToken = function() {
    return jwt.sign({ userId: this._id }, JWT_SECRET, {
      expiresIn: '1h',
    });
  };


userSchema.methods.comparePassword = async function(candidatePassword) {

    return bcrypt.compare(candidatePassword, this.password);
  
  };

module.exports = mongoose.model('users', userSchema);