const express = require('express');
const router = express.Router();
const salaryNegotiationController = require('../controllers/salaryNegotiationController');
const { protect } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(protect);

// Start a new negotiation session
router.post('/start', salaryNegotiationController.startNegotiation);

// Send message and get recruiter response
router.post('/:negotiationId/message', salaryNegotiationController.sendMessage);

// Finalize negotiation (accept/reject/walk-away)
router.post('/:negotiationId/finalize', salaryNegotiationController.finalizeNegotiation);

// Get negotiation history
router.get('/history', salaryNegotiationController.getNegotiationHistory);

module.exports = router;
