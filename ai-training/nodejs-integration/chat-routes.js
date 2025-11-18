const express = require("express");
const AIService = require("./ai-service");

const router = express.Router();

// Use AI_BOT_URL from Render env
const aiService = new AIService({
  baseURL: process.env.AI_BOT_URL
});

/**
 * Main Chat Route
 * POST /api/ai/chat
 */
router.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, userId, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: "Message required" });
    }

    const context = {
      userId: userId || "anonymous",
      sessionId: sessionId || null,
      timestamp: new Date().toISOString()
    };

    try {
      const ai = await aiService.chat(message, context);

      return res.json({
        success: true,
        message: ai.response,
        timestamp: ai.timestamp,
        contextDocs: ai.contextDocs,
        modelUsed: ai.modelUsed,
        source: "ai"
      });

    } catch (err) {
      return res.json({
        success: true,
        message: aiService.getFallbackResponse(),
        timestamp: new Date().toISOString(),
        contextDocs: 0,
        modelUsed: "fallback",
        source: "fallback"
      });
    }

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/ai/health
 */
router.get("/api/ai/health", async (req, res) => {
  const health = await aiService.healthCheck();
  res.json(health);
});

/**
 * Compatibility route for frontend
 * GET /api/chat/health
 */
router.get("/api/chat/health", async (req, res) => {
  const health = await aiService.healthCheck();
  res.json(health);
});

module.exports = router;
