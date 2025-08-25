const express = require('express');
const router = express.Router();
const peerReviewController = require('../../controllers/collaborative/peerReviewController');
const { protect } = require('../../middlewares/authMiddleware');

// Create a new peer review request
router.post('/requests', protect, peerReviewController.createPeerReviewRequest);

// Get all peer review requests (for admin or matching system)
router.get('/requests/all', protect, peerReviewController.getAllPeerReviewRequests);

// Get peer review requests created by the current user
router.get('/requests/user', protect, peerReviewController.getUserPeerReviewRequests);

// Get peer review requests assigned to the current user
router.get('/requests/assigned', protect, peerReviewController.getAssignedPeerReviewRequests);

// Assign a peer review request to a reviewer
router.post('/requests/assign', protect, peerReviewController.assignPeerReviewRequest);

// Submit a peer review
router.post('/requests/:requestId/submit', protect, peerReviewController.submitPeerReview);

// Get a specific peer review by ID
router.get('/:id', protect, peerReviewController.getPeerReviewById);

// Get all peer reviews for the current user (as reviewee)
router.get('/user/received', protect, peerReviewController.getUserReceivedPeerReviews);

// Get all peer reviews submitted by the current user (as reviewer)
router.get('/user/submitted', protect, peerReviewController.getUserSubmittedPeerReviews);

// Cancel a peer review request
router.post('/requests/:id/cancel', protect, peerReviewController.cancelPeerReviewRequest);

// Get peer review statistics for the current user
router.get('/user/stats', protect, peerReviewController.getUserPeerReviewStats);

module.exports = router;