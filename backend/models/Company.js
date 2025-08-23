const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    logo: { type: String, default: null },
    industry: { type: String, required: true },
    size: { type: String, enum: ['Startup', 'Mid-size', 'Enterprise'], required: true },
    location: { type: String, required: true },
    culture: {
        values: [String],
        interviewStyle: { type: String, enum: ['Formal', 'Casual', 'Technical', 'Behavioral'], required: true },
        difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Extreme'], required: true }
    },
    techStack: [String],
    interviewProcess: {
        rounds: { type: Number, required: true },
        duration: { type: String, required: true },
        focus: [String] // e.g., ['Algorithms', 'System Design', 'Behavioral']
    },
    questionCategories: [{
        category: { type: String, required: true },
        weight: { type: Number, default: 1 } // How important this category is for this company
    }],
    verifiedQuestions: { type: Number, default: 0 },
    communityQuestions: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Company", companySchema);
