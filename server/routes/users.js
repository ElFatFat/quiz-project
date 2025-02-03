let express = require('express');
let router = express.Router();
let User = require('../models/User');
const authenticateToken = require('../middlewares/auth');

/* GET users listing. */
router.get('/', authenticateToken, function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', async function(req, res, next) {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
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

module.exports = router;
