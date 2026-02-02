const express = require('express');
const { signupUser, loginUser } = require('../controllers/authController');

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', signupUser);

// @route   POST /api/auth/login
// @desc    Authenticate a user and get a token
// @access  Public
router.post('/login', loginUser);

module.exports = router;

