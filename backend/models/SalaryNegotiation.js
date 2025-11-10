const mongoose = require('mongoose');

const negotiationMessageSchema = new mongoose.Schema({
    sender: {
        type: String,
        enum: ['user', 'recruiter'],
        required: true
    },
    message: String,
    offer: {
        baseSalary: Number,
        equity: Number,
        signingBonus: Number,
        relocation: Number,
        benefits: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const salaryNegotiationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    scenario: {
        type: String,
        enum: ['product-company', 'service-company', 'mnc-india', 'indian-startup', 'multiple-offers'],
        required: true
    },
    role: {
        type: String,
        required: true
    },
    level: {
        type: String,
        enum: ['entry', 'mid', 'senior', 'staff', 'principal'],
        required: true
    },
    location: {
        type: String,
        required: true
    },
    recruiterPersonality: {
        type: String,
        enum: ['friendly', 'aggressive', 'neutral', 'experienced'],
        default: 'neutral'
    },
    initialOffer: {
        baseSalary: Number,
        equity: Number,
        signingBonus: Number,
        relocation: Number,
        benefits: String
    },
    finalOffer: {
        baseSalary: Number,
        equity: Number,
        signingBonus: Number,
        relocation: Number,
        benefits: String
    },
    marketData: {
        p10: Number,  // 10th percentile
        p25: Number,  // 25th percentile
        p50: Number,  // 50th percentile (median)
        p75: Number,  // 75th percentile
        p90: Number   // 90th percentile
    },
    conversationHistory: [negotiationMessageSchema],
    status: {
        type: String,
        enum: ['in-progress', 'accepted', 'rejected', 'walked-away'],
        default: 'in-progress'
    },
    negotiationRounds: {
        type: Number,
        default: 0
    },
    performance: {
        confidenceScore: Number,
        tacticsUsed: [String],
        mistakesMade: [String],
        strengthsShown: [String],
        finalResult: String,
        improvementGained: Number  // Percentage improvement from initial offer
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date,
    duration: Number  // in seconds
}, {
    timestamps: true
});

// Calculate improvement percentage
salaryNegotiationSchema.methods.calculateImprovement = function() {
    if (!this.finalOffer || !this.initialOffer) return 0;
    
    const initialTotal = this.initialOffer.baseSalary + 
                        (this.initialOffer.equity || 0) + 
                        (this.initialOffer.signingBonus || 0);
    const finalTotal = this.finalOffer.baseSalary + 
                      (this.finalOffer.equity || 0) + 
                      (this.finalOffer.signingBonus || 0);
    
    return ((finalTotal - initialTotal) / initialTotal * 100).toFixed(2);
};

// Get negotiation summary
salaryNegotiationSchema.methods.getSummary = function() {
    return {
        scenario: this.scenario,
        role: this.role,
        level: this.level,
        location: this.location,
        initialTotal: this.initialOffer.baseSalary + (this.initialOffer.equity || 0) + (this.initialOffer.signingBonus || 0),
        finalTotal: this.finalOffer ? this.finalOffer.baseSalary + (this.finalOffer.equity || 0) + (this.finalOffer.signingBonus || 0) : 0,
        improvement: this.calculateImprovement(),
        rounds: this.negotiationRounds,
        status: this.status,
        duration: this.duration
    };
};

module.exports = mongoose.model('SalaryNegotiation', salaryNegotiationSchema);
