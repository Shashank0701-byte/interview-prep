/**
 * AI Service Integration
 * 
 * This module handles communication between Node.js backend and Python FastAPI RAG service.
 */

const axios = require('axios');

class AIService {
    constructor(options = {}) {
        this.baseURL = options.baseURL || process.env.AI_SERVICE_URL || 'http://localhost:8001';
        this.timeout = options.timeout || 30000; // 30 seconds
        this.retries = options.retries || 3;
        
        // Create axios instance
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`🔗 AI Service initialized: ${this.baseURL}`);
    }
    
    /**
     * Check if the Python RAG service is healthy and ready
     */
    async healthCheck() {
        try {
            const response = await this.client.get('/api/ai/health');
            return {
                success: true,
                status: response.data.status,
                pipelineReady: response.data.pipeline_ready,
                components: response.data.components
            };
        } catch (error) {
            console.error('❌ AI Service health check failed:', error.message);
            return {
                success: false,
                error: error.message,
                status: 'unhealthy'
            };
        }
    }
    
    /**
     * Send a chat message to the RAG system and get an intelligent response
     */
    async chat(message, userContext = {}) {
        if (!message || typeof message !== 'string') {
            throw new Error('Message is required and must be a string');
        }
        
        const payload = {
            message: message.trim(),
            user_context: userContext
        };
        
        let lastError;
        
        // Retry logic for reliability
        for (let attempt = 1; attempt <= this.retries; attempt++) {
            try {
                console.log(`🤖 Sending to AI Service (attempt ${attempt}): "${message.substring(0, 50)}..."`);
                
                const response = await this.client.post('/api/ai/chat', payload);
                
                console.log(`✅ AI Service response received: ${response.data.context_docs} docs, ${response.data.model_used}`);
                
                return {
                    success: true,
                    response: response.data.response,
                    timestamp: response.data.timestamp,
                    contextDocs: response.data.context_docs,
                    modelUsed: response.data.model_used,
                    userContext: response.data.user_context
                };
                
            } catch (error) {
                lastError = error;
                console.error(`❌ AI Service attempt ${attempt} failed:`, error.message);
                
                // If it's the last attempt, don't wait
                if (attempt < this.retries) {
                    // Exponential backoff: 1s, 2s, 4s
                    const delay = Math.pow(2, attempt - 1) * 1000;
                    console.log(`⏳ Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        // All retries failed
        throw new Error(`AI Service failed after ${this.retries} attempts: ${lastError.message}`);
    }
    
    /**
     * Send a study reminder request
     */
    async sendReminder(userContext = {}) {
        try {
            const response = await this.client.post('/api/ai/reminder', {
                user_context: userContext
            });
            
            return {
                success: true,
                ...response.data
            };
            
        } catch (error) {
            console.error('❌ AI Service reminder failed:', error.message);
            throw error;
        }
    }
    
    /**
     * Send a celebration request for user achievements
     */
    async celebrate(achievement, userContext = {}) {
        try {
            const response = await this.client.post('/api/ai/celebrate', {
                achievement,
                user_context: userContext
            });
            
            return {
                success: true,
                ...response.data
            };
            
        } catch (error) {
            console.error('❌ AI Service celebration failed:', error.message);
            throw error;
        }
    }
    
    /**
     * Get fallback response when AI service is unavailable
     */
    getFallbackResponse(message) {
        const fallbacks = [
            "I'm having trouble accessing my knowledge base right now, but I'm here to help! Could you try asking your question again in a moment?",
            "My AI brain is taking a quick break! 🧠 While I get back online, feel free to browse your study sessions or check your progress.",
            "Oops! I'm experiencing some technical difficulties. Don't worry though - your learning journey continues! Try refreshing or ask me again in a moment.",
            "I'm temporarily offline, but your dedication to learning is always online! 💪 Please try your question again shortly."
        ];
        
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
}

module.exports = AIService;
