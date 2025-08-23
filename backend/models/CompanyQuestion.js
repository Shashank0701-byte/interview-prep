const mongoose = require("mongoose");

const companyQuestionSchema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, required: true }, // e.g., 'Algorithms', 'System Design', 'Behavioral'
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    role: { type: String, required: true }, // e.g., 'Frontend Developer', 'Data Scientist'
    experience: { type: String, required: true }, // e.g., 'Entry', 'Mid', 'Senior'
    source: { type: String, enum: ['Verified', 'Community', 'AI Generated'], default: 'Community' },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    verifiedAt: { type: Date, default: null },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    tags: [String],
    metadata: {
        interviewRound: { type: String, default: null },
        yearAsked: { type: Number, default: null },
        successRate: { type: Number, default: null } // Percentage of candidates who answered correctly
    }
}, { timestamps: true });

module.exports = mongoose.model("CompanyQuestion", companyQuestionSchema);
