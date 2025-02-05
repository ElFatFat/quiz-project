let express = require('express');
let router = express.Router();
const { authenticateToken, isTokenAdmin } = require('../middlewares/auth');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/admin', isTokenAdmin, function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
