const mongoose = require("mongoose");

const recruiterProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    role: { type: String, required: true }, // e.g., 'Senior Recruiter', 'HR Manager', 'Talent Acquisition'
    permissions: {
        viewCandidates: { type: Boolean, default: true },
        viewAnalytics: { type: Boolean, default: true },
        exportData: { type: Boolean, default: false },
        manageTeam: { type: Boolean, default: false }
    },
    preferences: {
        notificationEmail: { type: String, default: null },
        dashboardLayout: { type: String, default: 'default' },
        focusAreas: [String], // e.g., ['Engineering', 'Product', 'Design']
        experienceLevels: [String] // e.g., ['Entry', 'Mid', 'Senior']
    },
    stats: {
        totalCandidatesViewed: { type: Number, default: 0 },
        lastActive: { type: Date, default: Date.now },
        favoriteCandidates: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
    }
}, { timestamps: true });

module.exports = mongoose.model("RecruiterProfile", recruiterProfileSchema);
