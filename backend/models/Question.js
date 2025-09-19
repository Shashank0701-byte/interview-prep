// File: backend/models/Question.js

const mongoose = require("mongoose");

// --- NEW ---
// We've added a 'performanceHistory' array.
// Each time a user reviews a question, we'll add an object to this array
// with the date and their performance score.
const questionSchema = new mongoose.Schema({
    session: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    
    // --- PERFORMANCE TRACKING ADDED ---
    performanceHistory: [
        {
            reviewDate: { type: Date, default: Date.now },
            // A simple score: 0 = 'Forgot', 0.5 = 'Hard', 1 = 'Good'
            performanceScore: { type: Number, required: true },
        }
    ],

    // --- NEW FEATURES ---
    // Justification for why this question is relevant in real interviews
    justification: {
        probability: { type: String, enum: ['Very High', 'High', 'Medium', 'Low'], default: 'Medium' },
        reasoning: { type: String, default: '' },
        commonCompanies: [{ type: String }],
        interviewType: { type: String, enum: ['Technical', 'Behavioral', 'System Design', 'Coding', 'General'], default: 'Technical' }
    },
    
    // User rating system
    userRating: {
        difficulty: { type: Number, min: 1, max: 5, default: 3 },
        usefulness: { type: Number, min: 1, max: 5, default: 3 },
        clarity: { type: Number, min: 1, max: 5, default: 3 }
    },
    
    // Additional metadata for filtering
    tags: [{ type: String }],
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    category: { type: String, default: 'General' },

    // --- EXISTING SPACED REPETITION FIELDS ---
    dueDate: { type: Date, default: () => new Date() },
    isPinned: { type: Boolean, default: false },
    note: { type: String, default: "" },
    isMastered: { type: Boolean, default: false },
    userNote: { type: String, default: "" },

}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);
