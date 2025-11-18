const express = require("express");
const multer = require("multer");

const {
    getPracticeFeedback,
    generateFollowUpQuestion,
    generateCompanyQuestions,
    generateInterviewQuestions
} = require("../controllers/aiController");

const { protect } = require("../middlewares/authMiddleware");
const AIService = require("../services/aiService");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// AI service init
const aiService = new AIService({
    baseURL: process.env.AI_BOT_URL || process.env.AI_SERVICE_URL
});

/* ===============================
   RAG CHAT
================================== */

/** POST /api/ai/chat */
router.post("/chat", async (req, res) => {
    try {
        const { message, userId, sessionId } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, error: "Message required" });
        }

        const userContext = {
            userId: userId || "anonymous",
            sessionId: sessionId || null,
            timestamp: new Date().toISOString()
        };

        try {
            const out = await aiService.chat(message, userContext);

            res.json({
                success: true,
                message: out.response,
                timestamp: out.timestamp,
                contextDocs: out.contextDocs,
                modelUsed: out.modelUsed,
                source: "ai_rag"
            });

        } catch (err) {
            console.error("AI Chat Error:", err.message);
            res.json({
                success: true,
                message: aiService.getFallbackResponse(),
                source: "fallback",
                modelUsed: "fallback"
            });
        }

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/** GET /api/ai/health */
router.get("/health", async (req, res) => {
    const health = await aiService.healthCheck();
    res.json(health);
});

/** POST /api/ai/reminder */
router.post("/reminder", async (req, res) => {
    try {
        const out = await aiService.sendReminder({
            userId: req.body.userId || "anonymous",
            timestamp: new Date().toISOString()
        });
        res.json(out);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/** POST /api/ai/celebrate */
router.post("/celebrate", async (req, res) => {
    try {
        if (!req.body.achievement) {
            return res.status(400).json({ success: false, error: "Achievement required" });
        }

        const out = await aiService.celebrate(req.body.achievement, {
            userId: req.body.userId || "anonymous",
            timestamp: new Date().toISOString()
        });

        res.json(out);

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/* ===============================
   OLD INTERVIEW AI ROUTES
================================== */
router.post("/generate-questions", protect, generateInterviewQuestions);
router.post("/practice-feedback", protect, upload.single("audio"), getPracticeFeedback);
router.post("/follow-up", protect, generateFollowUpQuestion);
router.post("/company-questions", protect, generateCompanyQuestions);

module.exports = router;
