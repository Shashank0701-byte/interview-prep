const express = require('express');
const { 
    togglePinQuestion, 
    updateQuestionNote, 
    addQuestionsToSession, 
    toggleMasteredStatus, 
    reviewQuestion,
    updateQuestionRating,
    updateQuestionJustification,
    getFilteredQuestions
} = require('../controllers/questionController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/add', protect, addQuestionsToSession);
router.post('/:id/pin', protect, togglePinQuestion);

// Note: Using PUT for updating is more conventional than POST
router.put('/:id/note', protect, updateQuestionNote);  
router.put('/:id/master', protect, toggleMasteredStatus);
router.put('/:id/review', protect, reviewQuestion);
router.put('/:id/rating', protect, updateQuestionRating);

// New routes for justifications and filtering
router.put('/:id/justification', protect, updateQuestionJustification);
router.get('/filter', protect, getFilteredQuestions);

module.exports = router;
