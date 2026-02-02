const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');


router.post('/login', authController.login);


router.post('/signup', authController.signup);


router.get('/me', auth, authController.getMe);

module.exports = router;
