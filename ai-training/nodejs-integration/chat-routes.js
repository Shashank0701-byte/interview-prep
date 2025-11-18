/**
 * Week 3: Node.js Chat Routes (Updated for Render)
 */

const express = require("express");
const AIService = require("./ai-service");

const router = express.Router();

// FIX: Read Python AI Bot URL from env
const aiService = new AIService({
    baseURL: process.env.AI_BOT_URL
});

/**
 * POST /api/chat
 */
router.post("/api/ai/chat", async (req, res) => {
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
            console.error("AI error:", err.message);

            return res.json({
                success: true,
                message: aiService.getFallbackResponse(),
                timestamp: new Date().toISOString(),
                contextDocs: 0,
                modelUsed: "fallback",
                source: "fallback"
            });
        }
    } catch (e) {
        console.error("Chat route error:", e);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

/**
 * GET /api/chat/health
 */
router.get("/api/ai/health", async (req, res) => {
    const health = await aiService.healthCheck();
    res.json(health);
});

/**
 * POST /api/chat/reminder
 */
router.post("/api/ai/reminder", async (req, res) => {
    try {
        const { userId } = req.body;

        const context = {
            userId: userId || "anonymous",
            timestamp: new Date().toISOString()
        };

        const reminder = await aiService.sendReminder(context);

        res.json(reminder);
    } catch (e) {
        console.error("Reminder error:", e);
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * POST /api/chat/celebrate
 */
router.post("/api/ai/celebrate", async (req, res) => {
    try {
        const { userId, achievement } = req.body;

        if (!achievement) {
            return res.status(400).json({ success: false, error: "Achievement required" });
        }

        const context = {
            userId: userId || "anonymous",
            timestamp: new Date().toISOString()
        };

        const celebration = await aiService.celebrate(achievement, context);

        res.json(celebration);
    } catch (e) {
        console.error("Celebration error:", e);
        res.status(500).json({ success: false, error: e.message });
    }
});

module.exports = router;
