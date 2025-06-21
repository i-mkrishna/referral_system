const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { purchase } = require('../controllers/purchaseController');

router.post('/', auth, purchase);


module.exports = router;