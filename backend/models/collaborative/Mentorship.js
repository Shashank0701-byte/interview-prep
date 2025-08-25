const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
    scheduledDate: { type: Date, required: true },
    duration: { type: Number, required: true }, // in minutes
    topic: { type: String, required: true },
    meetingLink: { type: String },
    status: { 
        type: String, 
        enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'], 
        default: 'scheduled' 
    },
    notes: { type: String }
}, { timestamps: true });

const noteSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    isPrivate: { type: Boolean, default: false } // If true, only visible to the author
}, { timestamps: true });

const mentorshipSchema = new mongoose.Schema({
    mentor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    mentee: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'active', 'completed', 'rejected'], 
        default: 'pending' 
    },
    focusAreas: [{ type: String }],
    goals: [{
        description: { type: String, required: true },
        isCompleted: { type: Boolean, default: false },
        completedAt: { type: Date }
    }],
    meetings: [meetingSchema],
    notes: [noteSchema],
    startDate: { type: Date },
    endDate: { type: Date },
    requestMessage: { type: String },
    responseMessage: { type: String },
    progress: { 
        type: Number, 
        min: 0, 
        max: 100, 
        default: 0 
    } // Progress percentage
}, { timestamps: true });

module.exports = mongoose.model('Mentorship', mentorshipSchema);