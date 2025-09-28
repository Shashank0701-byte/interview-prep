const express = require('express');
const multer = require('multer');
const { 
    getPracticeFeedback, 
    generateFollowUpQuestion, 
    generateCompanyQuestions,
    generateInterviewQuestions
} = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Configure multer for in-memory file storage
const upload = multer({ storage: multer.memoryStorage() });

// Generate interview questions
router.post('/generate-questions', protect, generateInterviewQuestions);

// Get practice feedback from audio
router.post('/practice-feedback', protect, upload.single('audio'), getPracticeFeedback);

// Generate follow-up questions
router.post('/follow-up', protect, generateFollowUpQuestion);

// Generate company-specific questions
router.post('/company-questions', protect, generateCompanyQuestions);

module.exports = router;