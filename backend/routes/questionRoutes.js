const express = require('express');
const { 
    togglePinQuestion, 
    updateQuestionNote, 
    addQuestionsToSession, 
    toggleMasteredStatus, 
    reviewQuestion,
    getQuestionsByCompany
} = require('../controllers/questionController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/add', protect, addQuestionsToSession);
router.post('/:id/pin', protect, togglePinQuestion);

// Note: Using PUT for updating is more conventional than POST
router.put('/:id/note', protect, updateQuestionNote);  
router.put('/:id/master', protect, toggleMasteredStatus);
router.put('/:id/review', protect, reviewQuestion);
router.get('/by-company', protect, getQuestionsByCompany);

module.exports = router;
