const mongoose = require("mongoose");

const mentorshipSchema = new mongoose.Schema({
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mentee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "active", "completed", "declined"], default: "pending" },
    startDate: { type: Date },
    endDate: { type: Date },
    topics: [{ type: String }],
    goals: [{ type: String }],
    notes: { type: String },
    meetings: [{
        date: { type: Date },
        duration: { type: Number }, // in minutes
        notes: { type: String },
        completed: { type: Boolean, default: false }
    }],
    progress: [{
        date: { type: Date, default: Date.now },
        note: { type: String },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }]
}, { timestamps: true });

module.exports = mongoose.model("Mentorship", mentorshipSchema);