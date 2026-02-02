const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
require('dotenv').config();

/**
 * Middleware to protect routes by verifying the user's JWT.
 * If the token is valid, it attaches the user's information to the request object.
 */
const protect = async (req, res, next) => {
  let token;

  // Check if the token is present in the 'Authorization' header and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the header (Bearer TOKEN_STRING)
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user in the database using the ID from the decoded token.
      // We exclude the password field from the result for security.
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };

