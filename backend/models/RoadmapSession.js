const mongoose = require("mongoose");

const roadmapSessionSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    role: {type: String, required: true},
    experience: {type: String, required: true},
    topicsToFocus: {type: String, required: true},
    description: String,
    questions: [{type: mongoose.Schema.Types.ObjectId, ref: "Question"}],
    
    // Roadmap-specific fields
    phaseId: {type: String, required: true}, // Phase identifier from roadmap
    phaseName: {type: String, required: true}, // Human-readable phase name
    phaseColor: {type: String, default: 'blue'}, // Phase color theme
    roadmapRole: {type: String, required: true}, // Role from roadmap (Software Engineer, etc.)
    
    // User rating for the session
    userRating: {
        overall: { type: Number, min: 1, max: 5, default: 3 },
        difficulty: { type: Number, min: 1, max: 5, default: 3 },
        usefulness: { type: Number, min: 1, max: 5, default: 3 }
    },
    
    // Session metadata for filtering
    category: { type: String, default: 'Roadmap' },
    tags: [{ type: String }],
    status: { type: String, enum: ['Active', 'Completed', 'Paused'], default: 'Active' },
    
    // Progress tracking
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
    masteredQuestions: { type: Number, default: 0 },
    
    // Roadmap session type indicator
    sessionType: { type: String, default: 'roadmap' }, // Always 'roadmap' to distinguish from regular sessions

}, {timestamps: true });

// Index for efficient querying by user and phase
roadmapSessionSchema.index({ user: 1, phaseId: 1, roadmapRole: 1 });

module.exports = mongoose.model("RoadmapSession", roadmapSessionSchema);
