const History = require('../models/historyModel');

/**
 * @desc    Get the generation history for the logged-in user
 * @route   GET /api/history
 * @access  Private
 */
const getHistory = async (req, res) => {
  try {
    // Correctly find history documents using the user's MongoDB '_id'.
    // req.user is attached by the authentication middleware.
    const history = await History.find({ user: req.user._id }).sort({ createdAt: -1 });

    if (history) {
      res.status(200).json(history);
    } else {
      // This case is unlikely but handled for completeness.
      res.status(404).json({ message: 'No history found for this user.' });
    }
  } catch (error) {
    console.error('Get History Error:', error);
    res.status(500).json({ message: 'Server error while fetching history.' });
  }
};

module.exports = { getHistory };
