/**
 * AI Service Integration (FINAL)
 */
const axios = require("axios");

class AIService {
    constructor(options = {}) {
        this.baseURL =
            options.baseURL ||
            process.env.AI_BOT_URL ||
            process.env.AI_SERVICE_URL;

        if (!this.baseURL) {
            throw new Error("❌ AI_BOT_URL missing in Render environment variables.");
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

    /** HEALTH CHECK */
    async healthCheck() {
        try {
            const response = await this.client.get("/health"); // FIXED
            return {
                success: true,
                status: response.data.status,
                pipelineReady: response.data.pipeline_ready ?? true,
                components: response.data.components ?? {}
            };
        } catch (err) {
            console.error("❌ AI Health Check Failed:", err.message);
            return {
                success: false,
                status: "unhealthy",
                error: err.message
            };
        }
    }

    /** CHAT */
    async chat(message, userContext = {}) {
        if (!message) throw new Error("Message is required");

        const payload = { message, user_context: userContext };

        let lastError;

        for (let attempt = 1; attempt <= this.retries; attempt++) {
            try {
                const response = await this.client.post("/chat", payload); // FIXED
                return {
                    success: true,
                    response: response.data.response,
                    timestamp: response.data.timestamp,
                    contextDocs: response.data.context_docs,
                    modelUsed: response.data.model_used
                };
            } catch (err) {
                lastError = err;
                console.log(`❌ Attempt ${attempt} failed: ${err.message}`);
                if (attempt < this.retries) {
                    await new Promise(r =>
                        setTimeout(r, Math.pow(2, attempt) * 500)
                    );
                }
            }
        }

        throw new Error(`AI failed after ${this.retries} attempts: ${lastError.message}`);
    }

    /** REMINDER */
    async sendReminder(userContext = {}) {
        const res = await this.client.post("/reminder", {
            user_context: userContext
        });
        return { success: true, ...res.data };
    }

    /** CELEBRATE */
    async celebrate(achievement, userContext = {}) {
        const res = await this.client.post("/celebrate", {
            achievement,
            user_context: userContext
        });
        return { success: true, ...res.data };
    }

    /** FALLBACK */
    getFallbackResponse() {
        const fallbacks = [
            "My AI brain is restarting — try again soon! ⚡",
            "I'm temporarily offline — give me a moment!",
            "The knowledge engine is warming up — try again!",
            "Small delay! Ask again in a few seconds 😊"
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
}

module.exports = AIService;
