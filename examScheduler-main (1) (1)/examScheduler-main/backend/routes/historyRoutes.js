const express = require('express');
const { getHistory } = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/history
// @desc    Get all generation history for the logged-in user
// @access  Private
router.get('/', protect, getHistory);

module.exports = router;