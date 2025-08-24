const mongoose = require("mongoose");

const peerReviewSchema = new mongoose.Schema({
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    interviewee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: "InterviewSession", required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    feedback: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    isAnonymous: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "submitted", "accepted"], default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("PeerReview", peerReviewSchema);