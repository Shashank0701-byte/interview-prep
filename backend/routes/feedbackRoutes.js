const express = require('express');
const { generateFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// @route   POST /api/feedback
// @desc    Generate feedback for a user's answer
// @access  Private
router.post('/', protect, generateFeedback);

module.exports = router;