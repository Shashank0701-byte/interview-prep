const axios = require("axios");

class AIService {
  constructor(options = {}) {
    this.baseURL = options.baseURL || process.env.AI_BOT_URL;

    if (!this.baseURL) {
      throw new Error("AI_BOT_URL missing in env!");
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: { "Content-Type": "application/json" }
    });

    console.log("🔗 AI Service:", this.baseURL);
  }

  async healthCheck() {
    try {
      const res = await this.client.get("/health");
      return {
        success: true,
        status: res.data.status,
        pipelineReady: res.data.pipeline_ready ?? true,
        components: res.data.components ?? []
      };
    } catch (err) {
      return { success: false, error: err.message, status: "unhealthy" };
    }
  }

  async chat(message, userContext = {}) {
    const payload = { message, user_context: userContext };

    const res = await this.client.post("/chat", payload);
    return {
      response: res.data.response,
      timestamp: res.data.timestamp,
      contextDocs: res.data.context_docs,
      modelUsed: res.data.model_used,
      userContext: res.data.user_context
    };
  }

  getFallbackResponse() {
    const msgs = [
      "AI service is restarting — try again soon!",
      "Temporary AI outage — retry in a moment!",
      "My AI brain is rebooting 🚀 Give me a sec!",
      "AI is warming up — try again shortly."
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }
}

module.exports = AIService;
