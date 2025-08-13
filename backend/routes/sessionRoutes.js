const express = require('express');
const { 
    createSession, 
    getSessionById, 
    getMySessions, 
    deleteSession, 
    getReviewQueue 
} = require('../controllers/sessionController');
const { protect } = require('../middlewares/authMiddleware');

// Initialize the router
const router = express.Router();

// --- SESSION ROUTES ---

// POST /api/sessions/create
// Creates a new interview session.
router.post('/create', protect, createSession);

// GET /api/sessions/my-sessions
// Gets all sessions for the logged-in user.
router.get('/my-sessions', protect, getMySessions);

// GET /api/sessions/review-queue
// Gets all questions that are due for review for the logged-in user.
router.get('/review-queue', protect, getReviewQueue);

// GET /api/sessions/:id
// Gets a single session by its unique ID.
router.get('/:id', protect, getSessionById);

// DELETE /api/sessions/:id
// Deletes a single session by its unique ID.
router.delete('/:id', protect, deleteSession);

// Export the router to be used in the main server file
module.exports = router;
