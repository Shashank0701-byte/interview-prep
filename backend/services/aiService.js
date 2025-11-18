/**
 * AI Service Integration (FINAL CLEAN VERSION)
 */
const axios = require("axios");

class AIService {
    constructor(options = {}) {
        this.baseURL =
            options.baseURL ||
            process.env.AI_BOT_URL ||    // Render/Python service
            process.env.AI_SERVICE_URL || 
            "http://localhost:8001";

        if (!this.baseURL) {
            throw new Error("❌ AI_BOT_URL missing in environment variables.");
        }

        this.timeout = 30000;
        this.retries = 3;

        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: this.timeout,
            headers: { "Content-Type": "application/json" }
        });

        console.log(`🔗 AI Service initialized → ${this.baseURL}`);
    }

    /** HEALTH CHECK */
    async healthCheck() {
        try {
            const res = await this.client.get("/health");
            return {
                success: true,
                status: res.data.status,
                pipelineReady: res.data.pipeline_ready ?? true,
                components: res.data.components ?? {}
            };
        } catch (err) {
            console.error("❌ AI Health Error:", err.message);
            return {
                success: false,
                status: "unhealthy",
                error: err.message
            };
        }
    }

    /** CHAT */
    async chat(message, userContext = {}) {
        if (!message) throw new Error("Message required");

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
                console.log(`❌ Chat attempt ${attempt} failed: ${err.message}`);

                // retry with exponential backoff
                if (attempt < this.retries) {
                    await new Promise(res => setTimeout(res, attempt * 1000));
                }
            }
        }

        throw new Error(`AI failed after retries: ${lastError.message}`);
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

    /** FALLBACK RESPONSES */
    getFallbackResponse() {
        const msgs = [
            "My AI brain is restarting — try again soon!",
            "I'm temporarily offline — give me a moment!",
            "Knowledge engine warming up — try again!",
            "Small delay! Ask again in a few seconds 😊"
        ];
        return msgs[Math.floor(Math.random() * msgs.length)];
    }
}

module.exports = AIService;
