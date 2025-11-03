const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    createInterviewSession,
    startInterview,
    submitAnalysisData,
    processVoiceResponse,
    completeInterview,
    getInterviewHistory,
    upload
} = require('../controllers/aiInterviewCoachController');

// @route   POST /api/ai-interview-coach/create
// @desc    Create new AI interview session
// @access  Private
router.post('/create', protect, createInterviewSession);

// @route   POST /api/ai-interview-coach/:sessionId/start
// @desc    Start interview session
// @access  Private
router.post('/:sessionId/start', protect, startInterview);

// @route   POST /api/ai-interview-coach/:sessionId/analysis
// @desc    Submit real-time analysis data
// @access  Private
router.post('/:sessionId/analysis', protect, submitAnalysisData);

// @route   POST /api/ai-interview-coach/:sessionId/voice-response
// @desc    Process voice response with Whisper API
// @access  Private
router.post('/:sessionId/voice-response', protect, upload.single('audio'), processVoiceResponse);

// @route   POST /api/ai-interview-coach/:sessionId/complete
// @desc    Complete interview and generate report
// @access  Private
router.post('/:sessionId/complete', protect, completeInterview);

// @route   GET /api/ai-interview-coach/history
// @desc    Get interview history
// @access  Private
router.get('/history', protect, getInterviewHistory);

// @route   GET /api/ai-interview-coach/:sessionId
// @desc    Get specific interview session details
// @access  Private
router.get('/:sessionId', protect, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;
        
        const interview = await require('../models/AIInterview').findOne({ 
            sessionId, 
            user: userId 
        });
        
        if (!interview) {
            return res.status(404).json({ message: 'Interview session not found' });
        }
        
        res.json({
            success: true,
            interview
        });
        
    } catch (error) {
        console.error('Error fetching interview session:', error);
        res.status(500).json({ message: 'Failed to fetch interview session' });
    }
});

module.exports = router;
