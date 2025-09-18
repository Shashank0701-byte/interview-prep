const express = require('express');
const { 
    createSession, 
    getSessionById, 
    getMySessions, 
    deleteSession, 
    getReviewQueue,
    updateSessionRating,
    updateSessionProgress
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

// PUT /api/sessions/:id/rating
// Updates the rating for a session.
router.put('/:id/rating', protect, updateSessionRating);

// PUT /api/sessions/:id/progress
// Updates the progress for a session.
router.put('/:id/progress', protect, updateSessionProgress);

// Export the router to be used in the main server file
module.exports = router;
