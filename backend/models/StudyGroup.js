const mongoose = require("mongoose");

const studyGroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    topics: [{ type: String }],
    isPublic: { type: Boolean, default: true },
    maxMembers: { type: Number, default: 10 },
    joinRequests: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
        requestDate: { type: Date, default: Date.now }
    }],
    invitations: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
        invitationDate: { type: Date, default: Date.now }
    }],
    resources: [{
        title: { type: String },
        description: { type: String },
        url: { type: String },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        addedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model("StudyGroup", studyGroupSchema);