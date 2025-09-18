const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    role: {type: String, required: true},
    experience : {type: String, required: true},
    topicsToFocus: {type: String, required: true},
    description: String,
    questions: [{type: mongoose.Schema.Types.ObjectId, ref: "Question"}],
    
    // User rating for the session
    userRating: {
        overall: { type: Number, min: 1, max: 5, default: 3 },
        difficulty: { type: Number, min: 1, max: 5, default: 3 },
        usefulness: { type: Number, min: 1, max: 5, default: 3 }
    },
    
    // Session metadata for filtering
    category: { type: String, default: 'General' },
    tags: [{ type: String }],
    status: { type: String, enum: ['Active', 'Completed', 'Paused'], default: 'Active' },
    
    // Progress tracking
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
    masteredQuestions: { type: Number, default: 0 },

}, {timestamps: true });

module.exports = mongoose.model("Session", sessionSchema);