const mongoose = require('mongoose');

const AIInterviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    interviewType: {
        type: String,
        enum: ['technical', 'behavioral', 'system-design', 'coding'],
        required: true
    },
    industryFocus: {
        type: String,
        enum: ['faang', 'startup', 'enterprise', 'fintech', 'healthcare'],
        required: true
    },
    role: {
        type: String,
        enum: ['software-engineer', 'frontend-developer', 'backend-developer', 'fullstack-developer', 'devops-engineer'],
        required: true
    },
    difficulty: {
        type: String,
        enum: ['junior', 'mid-level', 'senior', 'principal'],
        default: 'mid-level'
    },
    duration: {
        type: Number, // in minutes
        default: 30
    },
    status: {
        type: String,
        enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    
    // Interview Content
    questions: [{
        id: String,
        question: String,
        category: String,
        expectedDuration: Number, // in seconds
        askedAt: Date,
        userResponse: {
            text: String,
            audioUrl: String,
            duration: Number,
            confidence: Number
        },
        aiFollowUp: [{
            question: String,
            askedAt: Date,
            response: String
        }]
    }],
    
    // Real-time Analysis Data
    analysisData: {
        // Facial Analysis
        facialExpressions: [{
            timestamp: Number,
            emotions: {
                confidence: Number,
                nervousness: Number,
                engagement: Number,
                stress: Number,
                happiness: Number,
                surprise: Number,
                neutral: Number
            },
            eyeContact: {
                lookingAtCamera: Boolean,
                gazeDirection: String, // 'center', 'left', 'right', 'up', 'down'
                blinkRate: Number
            },
            posture: {
                headPosition: String, // 'straight', 'tilted-left', 'tilted-right'
                shoulderAlignment: String,
                distanceFromCamera: String // 'too-close', 'optimal', 'too-far'
            }
        }],
        
        // Voice Analysis
        voiceMetrics: [{
            timestamp: Number,
            volume: Number,
            pitch: Number,
            pace: Number, // words per minute
            clarity: Number,
            fillerWords: Number, // um, uh, like count
            pauseLength: Number,
            backgroundNoise: {
                level: Number,
                type: String, // 'traffic', 'music', 'voices', 'mechanical', 'none'
                distracting: Boolean
            }
        }],
        
        // Environment Analysis
        environmentFlags: [{
            timestamp: Number,
            lighting: {
                quality: String, // 'poor', 'adequate', 'good', 'excellent'
                shadows: Boolean,
                backlit: Boolean
            },
            background: {
                professional: Boolean,
                distracting: Boolean,
                movement: Boolean,
                type: String // 'plain-wall', 'office', 'home', 'outdoor', 'virtual'
            },
            interruptions: [{
                type: String, // 'phone', 'doorbell', 'people', 'pets', 'notification'
                severity: String, // 'minor', 'moderate', 'major'
                duration: Number
            }]
        }],
        
        // Behavioral Flags
        behavioralFlags: [{
            timestamp: Number,
            flag: String,
            severity: String, // 'info', 'warning', 'critical'
            description: String,
            suggestions: [String]
        }]
    },
    
    // Performance Scores
    scores: {
        overall: { type: Number, min: 0, max: 100 },
        technical: { type: Number, min: 0, max: 100 },
        communication: { type: Number, min: 0, max: 100 },
        confidence: { type: Number, min: 0, max: 100 },
        professionalism: { type: Number, min: 0, max: 100 },
        
        // Detailed Metrics
        eyeContact: { type: Number, min: 0, max: 100 },
        voiceClarity: { type: Number, min: 0, max: 100 },
        responseRelevance: { type: Number, min: 0, max: 100 },
        environmentSetup: { type: Number, min: 0, max: 100 },
        bodyLanguage: { type: Number, min: 0, max: 100 }
    },
    
    // AI Interviewer Persona
    aiPersona: {
        name: String,
        company: String,
        role: String,
        personality: String, // 'friendly', 'formal', 'challenging', 'supportive'
        avatar: String,
        voice: String // voice ID for TTS
    },
    
    // Session Metadata
    startedAt: Date,
    completedAt: Date,
    totalDuration: Number, // actual duration in minutes
    
    // Final Report
    report: {
        strengths: [String],
        improvements: [String],
        detailedFeedback: [{
            category: String,
            score: Number,
            feedback: String,
            suggestions: [String]
        }],
        nextSteps: [String],
        practiceRecommendations: [String]
    }
}, {
    timestamps: true
});

// Indexes for performance
AIInterviewSchema.index({ user: 1, createdAt: -1 });
AIInterviewSchema.index({ sessionId: 1 });
AIInterviewSchema.index({ status: 1 });

module.exports = mongoose.model('AIInterview', AIInterviewSchema);
