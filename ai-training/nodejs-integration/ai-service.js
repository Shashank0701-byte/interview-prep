/**
 * Week 3: AI Service Integration (Updated for Render)
 */

const axios = require("axios");

class AIService {
    constructor(options = {}) {
        // FIX: Always read from environment variable (Render)
        this.baseURL = options.baseURL || process.env.AI_BOT_URL;

        if (!this.baseURL) {
            throw new Error(
                "❌ AI_BOT_URL is not set! Please add it to Render ENV Vars."
            );
        }

        this.timeout = options.timeout || 30000;
        this.retries = options.retries || 3;

        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: this.timeout,
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log(`🔗 AI Service initialized @ ${this.baseURL}`);
    }

    async healthCheck() {
        try {
            const response = await this.client.get("/health");

            return {
                success: true,
                status: response.data.status,
                pipelineReady: response.data.pipeline_ready,
                components: response.data.components
            };
        } catch (err) {
            console.error("❌ AI Service health check failed:", err.message);

            return {
                success: false,
                status: "unhealthy",
                error: err.message
            };
        }
    }

    async chat(message, userContext = {}) {
        if (!message || typeof message !== "string") {
            throw new Error("Message must be a string");
        }

        const payload = {
            message: message.trim(),
            user_context: userContext
        };

        let lastError;

        for (let attempt = 1; attempt <= this.retries; attempt++) {
            try {
                const response = await this.client.post("/chat", payload);

                return {
                    success: true,
                    response: response.data.response,
                    timestamp: response.data.timestamp,
                    contextDocs: response.data.context_docs,
                    modelUsed: response.data.model_used,
                    userContext: response.data.user_context
                };
            } catch (err) {
                lastError = err;
                console.error(
                    `❌ Attempt ${attempt} failed: ${err.message}`
                );

                if (attempt < this.retries) {
                    await new Promise((r) =>
                        setTimeout(r, Math.pow(2, attempt - 1) * 1000)
                    );
                }
            }
        }

        throw new Error(
            `AI Service failed after ${this.retries} attempts: ${lastError.message}`
        );
    }

    async sendReminder(userContext = {}) {
        try {
            const res = await this.client.post("/reminder", {
                user_context: userContext
            });

            return {
                success: true,
                ...res.data
            };
        } catch (e) {
            console.error("❌ Reminder failed:", e.message);
            throw e;
        }
    }

    async celebrate(achievement, userContext = {}) {
        try {
            const res = await this.client.post("/celebrate", {
                achievement,
                user_context: userContext
            });

            return {
                success: true,
                ...res.data
            };
        } catch (e) {
            console.error("❌ Celebration failed:", e.message);
            throw e;
        }
    }

    getFallbackResponse() {
        const fallbacks = [
            "I'm having trouble accessing my AI brain right now. Try again in a moment! 😊",
            "The AI engine is restarting — hang tight! 🚀",
            "Oops! My knowledge system is offline. Try again shortly.",
            "Temporary glitch! Ask me your question again in a few seconds 🙏"
        ];

        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
}

module.exports = AIService;
