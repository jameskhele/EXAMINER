const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Generates a JSON Web Token (JWT) for a given user ID.
 * @param {string} id The user's MongoDB document ID.
 * @returns {string} The generated JWT.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // The token will be valid for 30 days
  });
};

// --- Controller Functions ---

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signupUser = async (req, res) => {
  const { email, password, institution } = req.body;

  // Stronger validation to ensure all fields are present
  if (!email || !password || !institution) {
    return res.status(400).json({ message: 'Please provide email, password, and institution' });
  }

  try {
    // Check if the user already exists in the database
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user document in the database
    const user = await User.create({
      email,
      password, // The password will be automatically hashed by the pre-save hook in userModel.js
      institution,
    });

    if (user) {
      // If user creation is successful, send back user info and a token
      res.status(201).json({
        _id: user._id,
        email: user.email,
        institution: user.institution,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

/**
 * @desc    Authenticate a user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by their email address
    const user = await User.findOne({ email });

    // Check if the user exists and if the entered password matches the stored hash
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        email: user.email,
        institution: user.institution,
        token: generateToken(user._id),
      });
    } else {
      // Use a generic message to avoid revealing whether the email or password was wrong
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = { signupUser, loginUser };

