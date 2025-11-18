const axios = require("axios");

class AIService {
    constructor(options = {}) {
        this.baseURL =
            options.baseURL ||
            process.env.AI_BOT_URL ||
            process.env.AI_SERVICE_URL;

        if (!this.baseURL) {
            throw new Error("❌ AI_BOT_URL missing in environment variables.");
        }

        this.timeout = options.timeout || 30000;
        this.retries = options.retries || 3;

        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: this.timeout,
            headers: { "Content-Type": "application/json" }
        });

        console.log(`🔗 AI Service initialized at: ${this.baseURL}`);
    }

    /* ------------------------- HEALTH ------------------------- */
    async healthCheck() {
        try {
            const response = await this.client.get("/health");
            return {
                success: true,
                status: response.data.status || "ok",
                pipelineReady: response.data.pipeline_ready ?? true,
                components: response.data.components || {}
            };
        } catch (err) {
            return {
                success: false,
                status: "unhealthy",
                error: err.message
            };
        }
    }

    /* ------------------------- CHAT ------------------------- */
    async chat(message, userContext = {}) {
        if (!message) throw new Error("Message is required");

        const payload = { message, user_context: userContext };
        let lastError;

        for (let attempt = 1; attempt <= this.retries; attempt++) {
            try {
                const res = await this.client.post("/chat", payload);
                return {
                    success: true,
                    response: res.data.response,
                    timestamp: res.data.timestamp,
                    contextDocs: res.data.context_docs,
                    modelUsed: res.data.model_used
                };
            } catch (err) {
                lastError = err;
                if (attempt < this.retries)
                    await new Promise(r => setTimeout(r, attempt * 1000));
            }
        }

        throw new Error(lastError.message);
    }

    /* ------------------------- REMINDER ------------------------- */
    async sendReminder(ctx = {}) {
        const res = await this.client.post("/reminder", { user_context: ctx });
        return res.data;
    }

    /* ------------------------- CELEBRATE ------------------------- */
    async celebrate(achievement, ctx = {}) {
        const res = await this.client.post("/celebrate", {
            achievement,
            user_context: ctx
        });
        return res.data;
    }

    /* ------------------------- FALLBACK ------------------------- */
    getFallbackResponse() {
        const msgs = [
            "My AI engine is taking a short break — try again soon!",
            "I'm temporarily offline. Give me a moment! 💭",
            "Hang tight! I'm reconnecting to my knowledge base. ⚡"
        ];
        return msgs[Math.floor(Math.random() * msgs.length)];
    }
}

module.exports = AIService;
