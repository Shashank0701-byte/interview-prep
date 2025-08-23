const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
    startInterviewSession,
    submitAnswer,
    completeInterviewSession,
    getInterviewSession
} = require('../controllers/aiInterviewController');

const router = express.Router();

// All routes are protected
router.use(protect);

// Start a new AI interview session
router.post('/start', startInterviewSession);

// Submit answer for a question
router.post('/:sessionId/answer', submitAnswer);

// Complete interview session
router.post('/:sessionId/complete', completeInterviewSession);

// Get interview session details
router.get('/:sessionId', getInterviewSession);

module.exports = router;
