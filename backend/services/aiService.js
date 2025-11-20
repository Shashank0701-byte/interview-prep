// ./services/aiService.js
const axios = require("axios");

class AIService {
  constructor(options = {}) {
    this.baseURL =
      options.baseURL ||
      process.env.AI_BOT_URL ||          // <- on Render: https://interview-prep-1-ferg.onrender.com
      process.env.AI_SERVICE_URL ||
      "http://localhost:8001";          // local dev fallback

    this.timeout = options.timeout || Number(process.env.AI_SERVICE_TIMEOUT) || 30000;
    this.retries =
      options.retries != null
        ? options.retries
        : Number(process.env.AI_SERVICE_RETRIES) || 3;

    this.persona = process.env.STUDY_BUDDY_PERSONA || "friendly_study_buddy_v1";

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: { "Content-Type": "application/json" },
    });

    console.log(`🔗 AI Service initialized at: ${this.baseURL}`);
  }

  async _requestWithRetries(method, path, data = {}) {
    let lastErr;

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const res =
          method === "get"
            ? await this.client.get(path)
            : await this.client.post(path, data);

        return res.data;
      } catch (err) {
        lastErr = err;
        console.warn(
          `AIService ${method.toUpperCase()} ${path} attempt ${attempt} failed: ${err.message}`
        );

        if (attempt < this.retries) {
          await new Promise((r) => setTimeout(r, attempt * 500));
        }
      }
    }

    throw lastErr || new Error("AIService request failed");
  }

  /* ------------------------- HEALTH ------------------------- */
  async healthCheck() {
    try {
      const data = await this._requestWithRetries("get", "/health");

      return {
        success: true,
        status: data.status ?? "ok",
        pipelineReady: data.pipeline_ready ?? true,
        components: data.components ?? {},
      };
    } catch (err) {
      return {
        success: false,
        status: "unhealthy",
        error: err.message,
      };
    }
  }

  /* ------------------------- CHAT ------------------------- */
  async chat(message, userContext = {}) {
    if (!message || typeof message !== "string") {
      throw new Error("Message must be a non-empty string");
    }

    // IMPORTANT: FastAPI expects { message, user_context }
    const payload = {
      message: message.trim(),
      user_context: {
        ...userContext,
        persona: userContext.persona || this.persona,
      },
    };

    const data = await this._requestWithRetries("post", "/chat", payload);

    return {
      success: true,
      response: data.response ?? data.text ?? "",
      timestamp: data.timestamp ?? new Date().toISOString(),
      contextDocs: data.context_docs ?? data.contextDocs ?? 0,
      modelUsed: data.model_used ?? data.model ?? "unknown",
      raw: data,
    };
  }

  /* ------------------------- REMINDER ------------------------- */
  async sendReminder(userContext = {}) {
    const payload = { user_context: userContext };
    const data = await this._requestWithRetries("post", "/reminder", payload);
    return { success: true, ...data };
  }

  /* ------------------------- CELEBRATE ------------------------- */
  async celebrate(achievement = {}, userContext = {}) {
    const payload = { achievement, user_context: userContext };
    const data = await this._requestWithRetries("post", "/celebrate", payload);
    return { success: true, ...data };
  }

  /* ------------------------- FALLBACK ------------------------- */
  getFallbackResponse() {
    const fallbacks = [
      "My AI brain is restarting — try again soon! ⚡",
      "I'm temporarily offline — give me a moment!",
      "The knowledge engine is warming up — try again!",
      "Small delay! Ask again in a few seconds 😊",
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

module.exports = AIService;
