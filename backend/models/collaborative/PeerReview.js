const mongoose = require('mongoose');

const feedbackItemSchema = new mongoose.Schema({
    category: { 
        type: String, 
        enum: ['technical', 'communication', 'problem-solving', 'other'], 
        required: true 
    },
    rating: { 
        type: Number, 
        min: 1, 
        max: 5, 
        required: true 
    },
    comment: { type: String, required: true }
});

const peerReviewRequestSchema = new mongoose.Schema({
    requester: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    questionContent: { type: String, required: true },
    answerContent: { type: String, required: true },
    additionalContext: { type: String },
    status: { 
        type: String, 
        enum: ['open', 'assigned', 'completed', 'cancelled'], 
        default: 'open' 
    },
    assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    assignedAt: { type: Date }
}, { timestamps: true });

const peerReviewSchema = new mongoose.Schema({
    reviewer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    reviewee: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    request: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'PeerReviewRequest' 
    },
    questionContent: { type: String, required: true },
    answerContent: { type: String, required: true },
    feedback: [feedbackItemSchema],
    overallRating: { 
        type: Number, 
        min: 1, 
        max: 5, 
        required: true 
    },
    overallComment: { type: String, required: true },
    suggestedImprovements: [{ type: String }],
    isAnonymous: { type: Boolean, default: false }
}, { timestamps: true });

const PeerReview = mongoose.model('PeerReview', peerReviewSchema);
const PeerReviewRequest = mongoose.model('PeerReviewRequest', peerReviewRequestSchema);

module.exports = { PeerReview, PeerReviewRequest };