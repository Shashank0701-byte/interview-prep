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

// Initialize AI Service (now reads AI_BOT_URL correctly)
const aiService = new AIService({
    baseURL: process.env.AI_BOT_URL || process.env.AI_SERVICE_URL
});

// Multer for audio upload
const upload = multer({ storage: multer.memoryStorage() });

/* ==========================================================
   RAG CHAT ENDPOINTS (Corrected)
   These talk to your Python FastAPI RAG service
   ========================================================== */

/**
 * POST /api/ai/chat
 */
router.post('/chat', async (req, res) => {
    try {
        const { message, userId, sessionId } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, error: "Message is required" });
        }

        const userContext = {
            userId: userId || "anonymous",
            sessionId: sessionId || null,
            timestamp: new Date().toISOString()
        };

        try {
            const aiResponse = await aiService.chat(message, userContext);

            return res.json({
                success: true,
                message: aiResponse.response,
                timestamp: aiResponse.timestamp,
                contextDocs: aiResponse.contextDocs,
                modelUsed: aiResponse.modelUsed,
                source: "ai_rag"
            });
        } catch (err) {
            console.error("AI Chat Error:", err.message);
            return res.json({
                success: true,
                message: aiService.getFallbackResponse(),
                modelUsed: "fallback",
                source: "fallback"
            });
        }

    } catch (error) {
        console.error("Chat route error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});


/**
 * GET /api/ai/health
 */
router.get('/health', async (req, res) => {
    try {
        const health = await aiService.healthCheck();
        res.json(health);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


/**
 * POST /api/ai/reminder
 */
router.post('/reminder', async (req, res) => {
    try {
        const { userId } = req.body;

        const userContext = {
            userId: userId || "anonymous",
            timestamp: new Date().toISOString()
        };

        const reminder = await aiService.sendReminder(userContext);
        res.json(reminder);

    } catch (error) {
        console.error("Reminder error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});


/**
 * POST /api/ai/celebrate
 */
router.post('/celebrate', async (req, res) => {
    try {
        const { achievement, userId } = req.body;

        if (!achievement) {
            return res.status(400).json({ success: false, error: "Achievement is required" });
        }

        const userContext = {
            userId: userId || "anonymous",
            timestamp: new Date().toISOString()
        };

        const celebration = await aiService.celebrate(achievement, userContext);
        res.json(celebration);

    } catch (error) {
        console.error("Celebrate error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});


/* ==========================================================
   EXISTING INTERVIEW AI ROUTES (unchanged)
   ========================================================== */

router.post('/generate-questions', protect, generateInterviewQuestions);
router.post('/practice-feedback', protect, upload.single('audio'), getPracticeFeedback);
router.post('/follow-up', protect, generateFollowUpQuestion);
router.post('/company-questions', protect, generateCompanyQuestions);

module.exports = router;
