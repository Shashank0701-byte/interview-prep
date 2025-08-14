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

    // --- EXISTING SPACED REPETITION FIELDS ---
    dueDate: { type: Date, default: () => new Date() },
    isPinned: { type: Boolean, default: false },
    note: { type: String, default: "" },
    isMastered: { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);
