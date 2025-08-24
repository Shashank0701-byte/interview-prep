const express = require('express');
const router = express.Router();
const peerReviewController = require('../controllers/peerReviewController');
const { protect } = require('../middlewares/authMiddleware');

// Create a new peer review
router.post('/', protect, peerReviewController.createPeerReview);

// Get all peer reviews for a specific user (as interviewee)
router.get('/received', protect, peerReviewController.getUserPeerReviews);

// Get all peer reviews given by a user (as reviewer)
router.get('/given', protect, peerReviewController.getReviewsGivenByUser);

// Get a specific peer review by ID
router.get('/:id', protect, peerReviewController.getPeerReviewById);

// Update a peer review (reviewer only)
router.put('/:id', protect, peerReviewController.updatePeerReview);

// Delete a peer review (reviewer only)
router.delete('/:id', protect, peerReviewController.deletePeerReview);

// Request a peer review for a specific question
router.post('/request', protect, peerReviewController.requestPeerReview);

// Get all open peer review requests (that need reviewers)
router.get('/requests/open', protect, peerReviewController.getOpenPeerReviewRequests);

// Accept a peer review request
router.post('/requests/:id/accept', protect, peerReviewController.acceptPeerReviewRequest);

module.exports = router;