// ./routes/aiRoutes.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const {
  getPracticeFeedback,
  generateFollowUpQuestion,
  generateCompanyQuestions,
  generateInterviewQuestions,
} = require("../controllers/aiController");
const { protect } = require("../middlewares/authMiddleware");

const AIService = require("../services/aiService");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/* -------------------------
   MEMORY STORE (Mongo + file fallback)
-------------------------- */

const MEMORY_FILE = path.join(__dirname, "../data/ai_memory.json");
const DATA_DIR = path.join(__dirname, "../data");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(MEMORY_FILE)) fs.writeFileSync(MEMORY_FILE, JSON.stringify({}), "utf8");

let mongooseAvailable = false;
let MemoryModel = null;

try {
  if (process.env.MONGODB_URI) {
    const mongoose = require("mongoose");
    mongooseAvailable = true;

    const memSchema = new mongoose.Schema(
      {
        userId: { type: String, required: true, index: true },
        entries: { type: Array, default: [] },
        updatedAt: { type: Date, default: Date.now },
      },
      { collection: "ai_memory", timestamps: true }
    );

    MemoryModel =
      mongoose.models.AIMemory || mongoose.model("AIMemory", memSchema);
  }
} catch {
  mongooseAvailable = false;
  MemoryModel = null;
}

// Simple file-based store
const fileStore = {
  async _read() {
    const raw = fs.readFileSync(MEMORY_FILE, "utf8");
    try {
      return JSON.parse(raw || "{}");
    } catch {
      return {};
    }
  },
  async _write(obj) {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(obj, null, 2), "utf8");
  },
  async get(userId) {
    const all = await this._read();
    return all[userId] ?? [];
  },
  async set(userId, entries) {
    const all = await this._read();
    all[userId] = entries;
    await this._write(all);
    return entries;
  },
  async clear(userId) {
    const all = await this._read();
    delete all[userId];
    await this._write(all);
  },
};

// Unified memory API
const MemoryStore = {
  async get(userId) {
    if (!userId) return [];
    if (mongooseAvailable && MemoryModel) {
      const doc = await MemoryModel.findOne({ userId }).lean().exec();
      return doc ? doc.entries : [];
    }
    return fileStore.get(userId);
  },

  async append(userId, item, maxEntries = 50) {
    if (!userId) return;

    const stamped = { ...item, ts: new Date().toISOString() };

    if (mongooseAvailable && MemoryModel) {
      const doc = await MemoryModel.findOne({ userId }).exec();
      if (doc) {
        doc.entries = doc.entries || [];
        doc.entries.push(stamped);
        if (doc.entries.length > maxEntries) {
          doc.entries = doc.entries.slice(-maxEntries);
        }
        doc.updatedAt = new Date();
        await doc.save();
        return doc.entries;
      }

      const created = await MemoryModel.create({
        userId,
        entries: [stamped],
      });
      return created.entries;
    }

    const cur = await fileStore.get(userId);
    cur.push(stamped);
    const trimmed = cur.slice(-maxEntries);
    await fileStore.set(userId, trimmed);
    return trimmed;
  },

  async set(userId, items = []) {
    if (!userId) return;
    if (mongooseAvailable && MemoryModel) {
      const doc = await MemoryModel.findOneAndUpdate(
        { userId },
        { entries: items, updatedAt: new Date() },
        { upsert: true, new: true }
      ).exec();
      return doc.entries;
    }
    await fileStore.set(userId, items);
    return items;
  },

  async clear(userId) {
    if (!userId) return;
    if (mongooseAvailable && MemoryModel) {
      await MemoryModel.deleteOne({ userId }).exec();
      return true;
    }
    await fileStore.clear(userId);
    return true;
  },
};

/* -------------------------
   AI SERVICE
-------------------------- */

const aiService = new AIService({
  baseURL: process.env.AI_BOT_URL || process.env.AI_SERVICE_URL,
  timeout: Number(process.env.AI_SERVICE_TIMEOUT) || undefined,
  retries: Number(process.env.AI_SERVICE_RETRIES) || undefined,
});

/* -------------------------
   RAG CHAT ROUTES
-------------------------- */

/**
 * POST /api/ai/chat
 */
router.post("/chat", async (req, res) => {
  try {
    const {
      message,
      userId = "anonymous",
      sessionId = null,
      persona,
    } = req.body;

    if (!message || typeof message !== "string") {
      return res
        .status(400)
        .json({ success: false, error: "Message required" });
    }

    const memory = await MemoryStore.get(userId);

    const userContext = {
      userId,
      sessionId,
      memory: memory.slice(-20),
      persona:
        persona ||
        process.env.STUDY_BUDDY_PERSONA ||
        "friendly_study_buddy_v1",
      frontend: {
        origin: req.get("origin") || req.ip,
      },
    };

    try {
      const reply = await aiService.chat(message, userContext);

      await MemoryStore.append(userId, { role: "user", text: message });
      await MemoryStore.append(userId, {
        role: "assistant",
        text: reply.response,
      });

      return res.json({
        success: true,
        message: reply.response,
        timestamp: reply.timestamp,
        contextDocs: reply.contextDocs,
        modelUsed: reply.modelUsed,
        source: "ai_rag",
      });
    } catch (aiErr) {
      console.error("Upstream AI error:", aiErr.message);
      return res.json({
        success: true,
        message: aiService.getFallbackResponse(),
        modelUsed: "fallback",
        source: "fallback",
      });
    }
  } catch (err) {
    console.error("Chat route error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/ai/health
 */
router.get("/health", async (_req, res) => {
  try {
    const h = await aiService.healthCheck();
    return res.json(h);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/ai/reminder
 */
router.post("/reminder", async (req, res) => {
  try {
    const userId = req.body.userId || "anonymous";
    const userContext = { userId, timestamp: new Date().toISOString() };
    const out = await aiService.sendReminder(userContext);
    return res.json({ success: true, ...out });
  } catch (err) {
    console.error("Reminder error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/ai/celebrate
 */
router.post("/celebrate", async (req, res) => {
  try {
    const { achievement, userId = "anonymous" } = req.body;
    if (!achievement) {
      return res
        .status(400)
        .json({ success: false, error: "Achievement required" });
    }

    const out = await aiService.celebrate(achievement, {
      userId,
      timestamp: new Date().toISOString(),
    });

    return res.json({ success: true, ...out });
  } catch (err) {
    console.error("Celebrate error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* -------------------------
   MEMORY MANAGEMENT ROUTES
-------------------------- */

router.get("/memory/:userId", async (req, res) => {
  try {
    const mem = await MemoryStore.get(req.params.userId);
    return res.json({ success: true, memory: mem });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/memory/:userId", async (req, res) => {
  try {
    const entries = Array.isArray(req.body.entries) ? req.body.entries : [];
    const saved = await MemoryStore.set(req.params.userId, entries);
    return res.json({ success: true, memory: saved });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/memory/:userId", async (req, res) => {
  try {
    await MemoryStore.clear(req.params.userId);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* -------------------------
   EXISTING INTERVIEW AI ROUTES
-------------------------- */

router.post("/generate-questions", protect, generateInterviewQuestions);
router.post(
  "/practice-feedback",
  protect,
  upload.single("audio"),
  getPracticeFeedback
);
router.post("/follow-up", protect, generateFollowUpQuestion);
router.post("/company-questions", protect, generateCompanyQuestions);

module.exports = router;
