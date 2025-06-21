const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const auth = require('../middleware/auth');
const User = require('../models/User');

router.post('/signup', signup);
router.post('/login', login);


// Add this:
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('name referralCode');
  res.json(user);
});

module.exports = router;