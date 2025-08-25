const express = require('express');
const router = express.Router();
const mentorshipController = require('../../controllers/collaborative/mentorshipController');
const { protect } = require('../../middlewares/authMiddleware');

// Get available mentors - This specific route must come before routes with path parameters
router.get('/mentors/available', protect, mentorshipController.getAvailableMentors);

// Request a mentorship
router.post('/request', protect, mentorshipController.requestMentorship);

// Get all mentorships for a user (as either mentor or mentee)
router.get('/', protect, mentorshipController.getUserMentorships);

// Respond to a mentorship request (accept or reject)
router.post('/:id/respond', protect, mentorshipController.respondToMentorshipRequest);

// Get a specific mentorship by ID
router.get('/:id', protect, mentorshipController.getMentorshipById);

// Add a note to a mentorship
router.post('/:id/notes', protect, mentorshipController.addMentorshipNote);

// Schedule a meeting for a mentorship
router.post('/:id/meetings', protect, mentorshipController.scheduleMeeting);

// Update meeting status (confirm, cancel, complete)
router.put('/:id/meetings', protect, mentorshipController.updateMeetingStatus);

// Update mentorship progress
router.put('/:id/progress', protect, mentorshipController.updateProgress);

// End a mentorship (can be done by either mentor or mentee)
router.post('/:id/end', protect, mentorshipController.endMentorship);

module.exports = router;