const mongoose = require("mongoose");

const interviewSessionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
    role: { type: String, required: true },
    experience: { type: String, required: true },
    interviewType: { 
        type: String, 
        enum: ['Technical', 'Behavioral', 'Mixed', 'System Design'], 
        required: true 
    },
    difficulty: { 
        type: String, 
        enum: ['Easy', 'Medium', 'Hard', 'Extreme'], 
        default: 'Medium' 
    },
    status: { 
        type: String, 
        enum: ['In Progress', 'Completed', 'Paused'], 
        default: 'In Progress' 
    },
    questions: [{
        question: { type: String, required: true },
        category: { type: String, required: true },
        difficulty: { type: String, required: true },
        userAnswer: { type: String, default: null },
        audioUrl: { type: String, default: null },
        transcription: { type: String, default: null },
        feedback: {
            content: { type: String, default: null },
            tone: { type: String, default: null },
            confidence: { type: Number, default: 0 }, // 0-100
            clarity: { type: Number, default: 0 }, // 0-100
            technicalAccuracy: { type: Number, default: 0 }, // 0-100
            fillerWords: { type: Number, default: 0 },
            suggestions: [String]
        },
        score: { type: Number, default: 0 }, // 0-100
        timeSpent: { type: Number, default: 0 } // in seconds
    }],
    overallScore: { type: Number, default: 0 }, // 0-100
    totalTime: { type: Number, default: 0 }, // in seconds
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date, default: null },
    aiInterviewer: {
        personality: { type: String, default: 'Professional' },
        style: { type: String, default: 'Supportive' },
        feedbackStyle: { type: String, default: 'Constructive' }
    },
    analytics: {
        confidenceTrend: [Number], // Array of confidence scores over time
        fillerWordTrend: [Number], // Array of filler word counts over time
        responseTimeTrend: [Number], // Array of response times over time
        improvementAreas: [String],
        strengths: [String]
    }
}, { timestamps: true });

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);
