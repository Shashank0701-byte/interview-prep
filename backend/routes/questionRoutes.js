const express = require('express');
const { 
    togglePinQuestion, 
    updateQuestionNote, 
    addQuestionsToSession, 
    toggleMasteredStatus, 
    reviewQuestion,
    updateQuestionRating,
    updateQuestionJustification,
    getFilteredQuestions,
    generateQuestionsWithGemini,
    testGeminiAPI
} = require('../controllers/questionController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/add', protect, addQuestionsToSession);

// Using PUT for all update operations for consistency
router.put('/:id/pin', protect, togglePinQuestion);
router.put('/:id/note', protect, updateQuestionNote);  
router.put('/:id/master', protect, toggleMasteredStatus);
router.put('/:id/review', protect, reviewQuestion);
router.put('/:id/rating', protect, updateQuestionRating);

// New routes for justifications and filtering
router.put('/:id/justification', protect, updateQuestionJustification);
router.get('/filter', protect, getFilteredQuestions);

// Gemini AI question generation
router.post('/generate', protect, generateQuestionsWithGemini);

// Test Gemini API
router.get('/test-gemini', protect, testGeminiAPI);

module.exports = router;
