const express = require('express');
const multer = require('multer');
const { 
    getPracticeFeedback, 
    generateFollowUpQuestion, 
    generateCompanyQuestions,
    generateInterviewQuestions
} = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');
const AIService = require('../services/aiService');

const router = express.Router();

// Initialize AI service
const aiService = new AIService({
    baseURL: 'http://localhost:8001',
    timeout: 30000,
    retries: 3
});

// Configure multer for in-memory file storage
const upload = multer({ storage: multer.memoryStorage() });

// ===== NEW RAG CHAT ROUTES =====

/**
 * POST /api/ai/chat
 * Main chat endpoint that uses RAG system for intelligent responses
 */
router.post('/chat', async (req, res) => {
    try {
        const { message, userId, sessionId } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }
        
        // Prepare user context for personalization
        const userContext = {
            userId: userId || 'anonymous',
            sessionId: sessionId || null,
            timestamp: new Date().toISOString()
        };
        
        // Try to get AI response
        try {
            const aiResponse = await aiService.chat(message, userContext);
            
            return res.json({
                success: true,
                message: aiResponse.response,
                timestamp: aiResponse.timestamp,
                contextDocs: aiResponse.contextDocs,
                modelUsed: aiResponse.modelUsed,
                source: 'ai_rag'
            });
            
        } catch (aiError) {
            console.error('AI Service error:', aiError.message);
            
            // Fallback to simple response
            const fallbackResponse = aiService.getFallbackResponse(message);
            
            return res.json({
                success: true,
                message: fallbackResponse,
                timestamp: new Date().toISOString(),
                contextDocs: 0,
                modelUsed: 'fallback',
                source: 'fallback'
            });
        }
        
    } catch (error) {
        console.error('Chat route error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/ai/health
 * Check if AI service is available
 */
router.get('/health', async (req, res) => {
    try {
        const health = await aiService.healthCheck();
        res.json(health);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/ai/reminder
 * Send study reminder
 */
router.post('/reminder', async (req, res) => {
    try {
        const { userId } = req.body;
        
        const userContext = {
            userId: userId || 'anonymous',
            timestamp: new Date().toISOString()
        };
        
        const reminder = await aiService.sendReminder(userContext);
        res.json(reminder);
        
    } catch (error) {
        console.error('Reminder error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/ai/celebrate
 * Celebrate user achievement
 */
router.post('/celebrate', async (req, res) => {
    try {
        const { achievement, userId } = req.body;
        
        if (!achievement) {
            return res.status(400).json({
                success: false,
                error: 'Achievement is required'
            });
        }
        
        const userContext = {
            userId: userId || 'anonymous',
            timestamp: new Date().toISOString()
        };
        
        const celebration = await aiService.celebrate(achievement, userContext);
        res.json(celebration);
        
    } catch (error) {
        console.error('Celebration error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ===== EXISTING ROUTES =====

// Generate interview questions
router.post('/generate-questions', protect, generateInterviewQuestions);

// Get practice feedback from audio
router.post('/practice-feedback', protect, upload.single('audio'), getPracticeFeedback);

// Generate follow-up questions
router.post('/follow-up', protect, generateFollowUpQuestion);

// Generate company-specific questions
router.post('/company-questions', protect, generateCompanyQuestions);

module.exports = router;