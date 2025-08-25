const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['link', 'document', 'video', 'other'], required: true },
    url: { type: String, required: true },
    description: { type: String },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
    content: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attachments: [{
        type: { type: String, enum: ['image', 'document', 'link'] },
        url: { type: String },
        name: { type: String }
    }]
}, { timestamps: true });

const studyGroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    topic: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    invitations: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        email: { type: String },
        status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
        invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        invitedAt: { type: Date, default: Date.now }
    }],
    resources: [resourceSchema],
    messages: [messageSchema],
    isPrivate: { type: Boolean, default: false },
    maxMembers: { type: Number, default: 10 },
    meetingSchedule: [{
        date: { type: Date },
        duration: { type: Number }, // in minutes
        topic: { type: String },
        meetingLink: { type: String }
    }],
    tags: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('StudyGroup', studyGroupSchema);