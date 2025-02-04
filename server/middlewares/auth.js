const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
let User = require('../models/User');


const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};


const isTokenAdmin = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (!user.isAdmin) return res.status(403).json({ message: 'Access denied. You are not an admin.' });
    req.user = decoded;
    next();
  } catch (ex) {
    console.log(ex);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = authenticateToken;
module.exports = isTokenAdmin;