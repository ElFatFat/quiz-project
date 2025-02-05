let express = require('express');
let router = express.Router();
let User = require('../models/User');
const bcrypt = require('bcrypt');

const { authenticateToken, isTokenAdmin } = require('../middlewares/auth');


/* GET users listing. */
router.get('/', authenticateToken, function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', async function(req, res, next) {
  try {
    const newUser = new User(req.body);
    await newUser.save();

    const token = newUser.generateToken();
    res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async function(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }
    const token = user.generateToken();
    res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
});

//Check if a token is valid
router.get('/checkToken', authenticateToken, function(req, res, next) {
  res.status(200).json(req.user);
});


//Refresh a token if the time left is less than 15 minutes.
router.post('/refreshToken', authenticateToken, (req, res) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = decoded.exp - now;

    // Refresh the token if it has less than 15 minutes left
    if (timeLeft < 15 * 60) {
      const newToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: JWT_EXPIRATION_TIME });
      return res.status(200).json({ token: newToken });
    }

    res.status(200).json({ message: 'Token is still valid' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
});

//Returns true if the user is an admin
router.get('/isAdmin', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.status(200).json({ isAdmin: user.isAdmin });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//return basic user information
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('email username');
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

router.put('/', authenticateToken, async (req, res) => {
  const updates = req.body;
  const userId = req.user.userId;

  try {
  // If password is provided, hash it before updating
  if (updates.password) {
    const salt = await bcrypt.genSalt(10);
    let saltedPassword = await bcrypt.hash(updates.password, salt);

    const user = await User.findByIdAndUpdate(userId, { password: saltedPassword }, { new: true });
  }

  if(updates.email){
    const user = await User.findByIdAndUpdate(userId, { email: updates.email }, { new: true, runValidators: true });
  }

  if(updates.username){
    const user = await User.findByIdAndUpdate(userId, { username: updates.username }, { new: true, runValidators: true });
  }

    res.status(200).json({ message: 'User updated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
