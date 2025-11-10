const SalaryNegotiation = require('../models/SalaryNegotiation');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Market data by role, level, and location - Indian market in INR (Lakhs per annum)
const marketData = {
    'Software Engineer': {
        entry: {
            'Bangalore': { p10: 300000, p25: 450000, p50: 600000, p75: 750000, p90: 900000 },
            'Hyderabad': { p10: 280000, p25: 420000, p50: 550000, p75: 700000, p90: 850000 },
            'Pune': { p10: 270000, p25: 400000, p50: 530000, p75: 680000, p90: 820000 },
            'NCR (Delhi/Gurgaon/Noida)': { p10: 290000, p25: 440000, p50: 580000, p75: 730000, p90: 880000 },
            'Mumbai': { p10: 310000, p25: 470000, p50: 620000, p75: 780000, p90: 940000 },
            'Chennai': { p10: 260000, p25: 390000, p50: 520000, p75: 660000, p90: 800000 },
            'Remote': { p10: 250000, p25: 380000, p50: 500000, p75: 640000, p90: 780000 }
        },
        mid: {
            'Bangalore': { p10: 800000, p25: 1100000, p50: 1400000, p75: 1800000, p90: 2200000 },
            'Hyderabad': { p10: 750000, p25: 1000000, p50: 1300000, p75: 1650000, p90: 2000000 },
            'Pune': { p10: 720000, p25: 950000, p50: 1250000, p75: 1600000, p90: 1950000 },
            'NCR (Delhi/Gurgaon/Noida)': { p10: 780000, p25: 1050000, p50: 1350000, p75: 1700000, p90: 2100000 },
            'Mumbai': { p10: 820000, p25: 1150000, p50: 1450000, p75: 1850000, p90: 2300000 },
            'Chennai': { p10: 700000, p25: 920000, p50: 1200000, p75: 1550000, p90: 1900000 },
            'Remote': { p10: 680000, p25: 900000, p50: 1150000, p75: 1500000, p90: 1850000 }
        },
        senior: {
            'Bangalore': { p10: 2000000, p25: 2800000, p50: 3500000, p75: 4200000, p90: 5000000 },
            'Hyderabad': { p10: 1900000, p25: 2600000, p50: 3300000, p75: 4000000, p90: 4700000 },
            'Pune': { p10: 1850000, p25: 2500000, p50: 3200000, p75: 3900000, p90: 4600000 },
            'NCR (Delhi/Gurgaon/Noida)': { p10: 1950000, p25: 2700000, p50: 3400000, p75: 4100000, p90: 4900000 },
            'Mumbai': { p10: 2100000, p25: 2900000, p50: 3600000, p75: 4400000, p90: 5200000 },
            'Chennai': { p10: 1800000, p25: 2400000, p50: 3100000, p75: 3800000, p90: 4500000 },
            'Remote': { p10: 1750000, p25: 2350000, p50: 3000000, p75: 3700000, p90: 4400000 }
        },
        staff: {
            'Bangalore': { p10: 4500000, p25: 5500000, p50: 6500000, p75: 7500000, p90: 8500000 },
            'Hyderabad': { p10: 4200000, p25: 5200000, p50: 6200000, p75: 7200000, p90: 8200000 },
            'Pune': { p10: 4000000, p25: 5000000, p50: 6000000, p75: 7000000, p90: 8000000 },
            'NCR (Delhi/Gurgaon/Noida)': { p10: 4300000, p25: 5300000, p50: 6300000, p75: 7300000, p90: 8300000 },
            'Mumbai': { p10: 4700000, p25: 5700000, p50: 6700000, p75: 7700000, p90: 8700000 },
            'Chennai': { p10: 3900000, p25: 4900000, p50: 5900000, p75: 6900000, p90: 7900000 },
            'Remote': { p10: 3800000, p25: 4800000, p50: 5800000, p75: 6800000, p90: 7800000 }
        },
        principal: {
            'Bangalore': { p10: 8000000, p25: 10000000, p50: 12000000, p75: 14000000, p90: 16000000 },
            'Hyderabad': { p10: 7500000, p25: 9500000, p50: 11500000, p75: 13500000, p90: 15500000 },
            'Pune': { p10: 7200000, p25: 9200000, p50: 11200000, p75: 13200000, p90: 15200000 },
            'NCR (Delhi/Gurgaon/Noida)': { p10: 7800000, p25: 9800000, p50: 11800000, p75: 13800000, p90: 15800000 },
            'Mumbai': { p10: 8500000, p25: 10500000, p50: 12500000, p75: 14500000, p90: 16500000 },
            'Chennai': { p10: 7000000, p25: 9000000, p50: 11000000, p75: 13000000, p90: 15000000 },
            'Remote': { p10: 6800000, p25: 8800000, p50: 10800000, p75: 12800000, p90: 14800000 }
        }
    }
};

// Recruiter personality templates
const recruiterPersonalities = {
    friendly: {
        tone: 'warm and collaborative',
        openness: 0.8,
        pushback: 0.3,
        examples: [
            "I really want to make this work for you!",
            "Let me see what I can do on my end.",
            "I appreciate your transparency. Here's where we're at..."
        ]
    },
    aggressive: {
        tone: 'firm and business-focused',
        openness: 0.3,
        pushback: 0.8,
        examples: [
            "This is our best and final offer.",
            "We have other candidates who are excited about this number.",
            "I need to know if you're serious about this role."
        ]
    },
    neutral: {
        tone: 'professional and balanced',
        openness: 0.6,
        pushback: 0.5,
        examples: [
            "Let me review this with the team.",
            "I understand your position. Here's what we can offer.",
            "We're working within our approved budget range."
        ]
    },
    experienced: {
        tone: 'strategic and insightful',
        openness: 0.7,
        pushback: 0.4,
        examples: [
            "I've been doing this for 15 years. Here's what I've learned...",
            "Let's think about the total compensation package.",
            "Have you considered the long-term growth potential here?"
        ]
    }
};

// Start a new negotiation session
exports.startNegotiation = async (req, res) => {
    try {
        const { scenario, role, level, location, recruiterPersonality } = req.body;
        
        // Get market data for the role
        const market = marketData[role]?.[level]?.[location] || marketData['Software Engineer']['mid']['Remote'];
        
        // Generate initial offer (typically between p25 and p50)
        const baseOffer = Math.round(market.p25 + (market.p50 - market.p25) * 0.3);
        const equity = scenario === 'startup' ? Math.round(baseOffer * 0.15) : Math.round(baseOffer * 0.05);
        const signingBonus = scenario === 'faang' ? Math.round(baseOffer * 0.15) : Math.round(baseOffer * 0.05);
        
        const negotiation = new SalaryNegotiation({
            user: req.user._id,
            scenario,
            role,
            level,
            location,
            recruiterPersonality: recruiterPersonality || 'neutral',
            initialOffer: {
                baseSalary: baseOffer,
                equity,
                signingBonus,
                relocation: scenario === 'faang' ? 10000 : 0,
                benefits: 'Standard benefits package including health, dental, vision, 401k'
            },
            marketData: market
        });
        
        // Generate opening message from recruiter
        const personality = recruiterPersonalities[negotiation.recruiterPersonality];
        const openingMessage = await generateRecruiterMessage(
            'opening',
            negotiation,
            personality,
            null
        );
        
        negotiation.conversationHistory.push({
            sender: 'recruiter',
            message: openingMessage,
            offer: negotiation.initialOffer
        });
        
        await negotiation.save();
        
        res.status(201).json({
            success: true,
            negotiation: {
                id: negotiation._id,
                scenario: negotiation.scenario,
                role: negotiation.role,
                level: negotiation.level,
                location: negotiation.location,
                recruiterPersonality: negotiation.recruiterPersonality,
                initialOffer: negotiation.initialOffer,
                marketData: negotiation.marketData,
                conversationHistory: negotiation.conversationHistory
            }
        });
    } catch (error) {
        console.error('Error starting negotiation:', error);
        res.status(500).json({ success: false, message: 'Failed to start negotiation' });
    }
};

// Send user response and get recruiter reply
exports.sendMessage = async (req, res) => {
    try {
        const { negotiationId } = req.params;
        const { message, counterOffer } = req.body;
        
        const negotiation = await SalaryNegotiation.findOne({
            _id: negotiationId,
            user: req.user._id
        });
        
        if (!negotiation) {
            return res.status(404).json({ success: false, message: 'Negotiation not found' });
        }
        
        // Add user message to history
        negotiation.conversationHistory.push({
            sender: 'user',
            message,
            offer: counterOffer
        });
        
        negotiation.negotiationRounds += 1;
        
        // Analyze user's message for tactics and mistakes
        const analysis = analyzeUserMessage(message, counterOffer, negotiation);
        
        // Generate recruiter response using AI
        const personality = recruiterPersonalities[negotiation.recruiterPersonality];
        const recruiterResponse = await generateRecruiterMessage(
            'response',
            negotiation,
            personality,
            { userMessage: message, counterOffer, analysis }
        );
        
        // Determine if recruiter makes a counter-offer
        const newOffer = generateCounterOffer(negotiation, counterOffer, analysis, personality);
        
        negotiation.conversationHistory.push({
            sender: 'recruiter',
            message: recruiterResponse,
            offer: newOffer
        });
        
        // Update performance metrics
        if (!negotiation.performance) {
            negotiation.performance = {
                tacticsUsed: [],
                mistakesMade: [],
                strengthsShown: []
            };
        }
        
        negotiation.performance.tacticsUsed.push(...analysis.tacticsUsed);
        negotiation.performance.mistakesMade.push(...analysis.mistakes);
        negotiation.performance.strengthsShown.push(...analysis.strengths);
        
        await negotiation.save();
        
        res.json({
            success: true,
            recruiterMessage: recruiterResponse,
            newOffer,
            analysis: {
                tacticsDetected: analysis.tacticsUsed,
                suggestions: analysis.suggestions
            }
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
};

// Accept or reject offer
exports.finalizeNegotiation = async (req, res) => {
    try {
        const { negotiationId } = req.params;
        const { action, finalOffer } = req.body; // action: 'accept', 'reject', 'walk-away'
        
        const negotiation = await SalaryNegotiation.findOne({
            _id: negotiationId,
            user: req.user._id
        });
        
        if (!negotiation) {
            return res.status(404).json({ success: false, message: 'Negotiation not found' });
        }
        
        negotiation.status = action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'walked-away';
        negotiation.finalOffer = finalOffer;
        negotiation.completedAt = new Date();
        negotiation.duration = Math.round((negotiation.completedAt - negotiation.startedAt) / 1000);
        
        // Calculate final performance
        const improvement = negotiation.calculateImprovement();
        negotiation.performance.improvementGained = improvement;
        negotiation.performance.confidenceScore = calculateConfidenceScore(negotiation);
        negotiation.performance.finalResult = getFinalResult(negotiation, improvement);
        
        await negotiation.save();
        
        // Generate detailed feedback
        const feedback = generateFeedback(negotiation);
        
        res.json({
            success: true,
            summary: negotiation.getSummary(),
            feedback
        });
    } catch (error) {
        console.error('Error finalizing negotiation:', error);
        res.status(500).json({ success: false, message: 'Failed to finalize negotiation' });
    }
};

// Get user's negotiation history
exports.getNegotiationHistory = async (req, res) => {
    try {
        const negotiations = await SalaryNegotiation.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        
        const summary = negotiations.map(n => n.getSummary());
        
        res.json({
            success: true,
            negotiations: summary,
            stats: {
                totalNegotiations: negotiations.length,
                averageImprovement: negotiations.reduce((sum, n) => sum + parseFloat(n.calculateImprovement()), 0) / negotiations.length,
                acceptedOffers: negotiations.filter(n => n.status === 'accepted').length
            }
        });
    } catch (error) {
        console.error('Error fetching negotiation history:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch history' });
    }
};

// Helper: Generate recruiter message using AI
async function generateRecruiterMessage(type, negotiation, personality, context) {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    let prompt = '';
    
    if (type === 'opening') {
        prompt = `You are a ${personality.tone} recruiter for a ${negotiation.scenario} company in India. 
Generate an opening message for a salary negotiation with a ${negotiation.level} ${negotiation.role} in ${negotiation.location}.

The initial offer is:
- Base Salary (Fixed): ₹${(negotiation.initialOffer.baseSalary / 100000).toFixed(2)} LPA
- ESOPs/Variable: ₹${(negotiation.initialOffer.equity / 100000).toFixed(2)} LPA
- Joining Bonus: ₹${(negotiation.initialOffer.signingBonus / 100000).toFixed(2)} LPA
- Benefits: ${negotiation.initialOffer.benefits}

Be ${personality.tone}. Use Indian salary terminology (CTC, LPA, fixed vs variable). Keep it under 100 words. Make it realistic and professional.`;
    } else {
        const lastOffer = negotiation.conversationHistory[negotiation.conversationHistory.length - 1].offer;
        prompt = `You are a ${personality.tone} recruiter for an Indian company. The candidate just said: "${context.userMessage}"

${context.counterOffer ? `They're asking for:
- Base (Fixed): ₹${context.counterOffer.baseSalary ? (context.counterOffer.baseSalary / 100000).toFixed(2) + ' LPA' : 'not specified'}
- Variable/ESOPs: ₹${context.counterOffer.equity ? (context.counterOffer.equity / 100000).toFixed(2) + ' LPA' : 'not specified'}
- Joining Bonus: ₹${context.counterOffer.signingBonus ? (context.counterOffer.signingBonus / 100000).toFixed(2) + ' LPA' : 'not specified'}` : ''}

Your current offer is:
- Base (Fixed): ₹${(lastOffer.baseSalary / 100000).toFixed(2)} LPA
- Variable/ESOPs: ₹${(lastOffer.equity / 100000).toFixed(2)} LPA
- Joining Bonus: ₹${(lastOffer.signingBonus / 100000).toFixed(2)} LPA

Respond as a ${personality.tone} recruiter in Indian context. ${personality.openness > 0.6 ? 'Be open to negotiation.' : 'Be firm but fair.'}
Use Indian salary terminology (CTC, LPA, fixed vs variable). Keep it under 80 words. Be realistic.`;
    }
    
    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('AI generation error:', error);
        // Fallback responses
        if (type === 'opening') {
            return `Hi! I'm excited to extend an offer for the ${negotiation.role} position. We're offering ₹${(negotiation.initialOffer.baseSalary / 100000).toFixed(2)} LPA fixed, ₹${(negotiation.initialOffer.equity / 100000).toFixed(2)} LPA in ESOPs/variable, and a ₹${(negotiation.initialOffer.signingBonus / 100000).toFixed(2)} LPA joining bonus. Total CTC comes to ₹${((negotiation.initialOffer.baseSalary + negotiation.initialOffer.equity + negotiation.initialOffer.signingBonus) / 100000).toFixed(2)} LPA. I'm here to discuss and make sure this works for you!`;
        }
        return "I appreciate your perspective. Let me review this with the team and get back to you with our best offer.";
    }
}

// Helper: Analyze user's negotiation tactics
function analyzeUserMessage(message, counterOffer, negotiation) {
    const tactics = [];
    const mistakes = [];
    const strengths = [];
    const suggestions = [];
    
    const lowerMessage = message.toLowerCase();
    
    // Check for good tactics
    if (lowerMessage.includes('market rate') || lowerMessage.includes('industry standard')) {
        tactics.push('market-data');
        strengths.push('Referenced market data');
    }
    if (lowerMessage.includes('other offer') || lowerMessage.includes('competing offer')) {
        tactics.push('competing-offers');
        strengths.push('Mentioned competing offers');
    }
    if (lowerMessage.includes('excited') || lowerMessage.includes('enthusiastic')) {
        tactics.push('enthusiasm');
        strengths.push('Showed enthusiasm for the role');
    }
    if (lowerMessage.includes('total compensation') || lowerMessage.includes('overall package')) {
        tactics.push('total-comp');
        strengths.push('Focused on total compensation');
    }
    
    // Check for mistakes
    if (lowerMessage.includes('current salary') || lowerMessage.includes('currently making')) {
        mistakes.push('Revealed current salary (never do this!)');
        suggestions.push('Avoid revealing your current salary. Focus on market value instead.');
    }
    if (lowerMessage.includes('need') || lowerMessage.includes('must have')) {
        mistakes.push('Used desperate language');
        suggestions.push('Avoid "need" language. Use "would like" or "expect" instead.');
    }
    if (counterOffer && counterOffer.baseSalary < negotiation.initialOffer.baseSalary) {
        mistakes.push('Counter-offered below initial offer');
        suggestions.push('Never counter below the initial offer. Always negotiate upward.');
    }
    if (message.length < 30) {
        mistakes.push('Response too brief');
        suggestions.push('Provide more context and reasoning for your position.');
    }
    
    // Check if counter is reasonable
    if (counterOffer && counterOffer.baseSalary) {
        const increase = ((counterOffer.baseSalary - negotiation.initialOffer.baseSalary) / negotiation.initialOffer.baseSalary) * 100;
        if (increase > 30) {
            mistakes.push('Counter-offer too aggressive (>30% increase)');
            suggestions.push('Keep counter-offers within 15-25% of initial offer for best results.');
        } else if (increase < 5) {
            mistakes.push('Counter-offer too conservative (<5% increase)');
            suggestions.push('Aim for 10-20% increase to show you value yourself appropriately.');
        }
    }
    
    return { tacticsUsed: tactics, mistakes, strengths, suggestions };
}

// Helper: Generate counter-offer from recruiter
function generateCounterOffer(negotiation, userCounterOffer, analysis, personality) {
    const lastOffer = negotiation.conversationHistory[negotiation.conversationHistory.length - 2].offer;
    
    if (!userCounterOffer) return lastOffer; // No counter from user, keep same offer
    
    // Calculate how much to move based on personality and user's tactics
    const movementFactor = personality.openness * (1 - (analysis.mistakes.length * 0.1));
    const maxMovement = (negotiation.marketData.p75 - lastOffer.baseSalary) * movementFactor;
    
    const requestedIncrease = userCounterOffer.baseSalary - lastOffer.baseSalary;
    const actualIncrease = Math.min(requestedIncrease * movementFactor, maxMovement);
    
    return {
        baseSalary: Math.round(lastOffer.baseSalary + actualIncrease),
        equity: userCounterOffer.equity || lastOffer.equity,
        signingBonus: Math.round(lastOffer.signingBonus + (actualIncrease * 0.1)),
        relocation: lastOffer.relocation,
        benefits: lastOffer.benefits
    };
}

// Helper: Calculate confidence score
function calculateConfidenceScore(negotiation) {
    let score = 50; // Base score
    
    // Positive factors
    score += negotiation.performance.strengthsShown.length * 5;
    score += Math.min(negotiation.negotiationRounds * 3, 15); // More rounds = more confident
    
    // Negative factors
    score -= negotiation.performance.mistakesMade.length * 8;
    
    return Math.max(0, Math.min(100, score));
}

// Helper: Get final result description
function getFinalResult(negotiation, improvement) {
    if (negotiation.status === 'walked-away') {
        return 'You walked away from the negotiation. Sometimes this is the right move!';
    }
    if (negotiation.status === 'rejected') {
        return 'You rejected the offer. Make sure you had good reasons!';
    }
    
    if (improvement > 20) return 'Excellent negotiation! You gained significant value.';
    if (improvement > 10) return 'Good negotiation! You improved the offer meaningfully.';
    if (improvement > 5) return 'Decent negotiation. You got some improvement.';
    return 'You accepted the initial offer. Consider negotiating more next time.';
}

// Helper: Generate detailed feedback
function generateFeedback(negotiation) {
    const improvement = parseFloat(negotiation.calculateImprovement());
    const marketPosition = calculateMarketPosition(negotiation);
    
    return {
        overall: negotiation.performance.finalResult,
        improvement: `${improvement}%`,
        confidenceScore: negotiation.performance.confidenceScore,
        marketPosition,
        strengths: negotiation.performance.strengthsShown,
        areasForImprovement: negotiation.performance.mistakesMade,
        tacticsUsed: negotiation.performance.tacticsUsed,
        recommendations: generateRecommendations(negotiation, improvement, marketPosition)
    };
}

// Helper: Calculate market position
function calculateMarketPosition(negotiation) {
    const finalSalary = negotiation.finalOffer.baseSalary;
    const market = negotiation.marketData;
    
    if (finalSalary >= market.p90) return { percentile: 90, description: 'Excellent - Top 10%' };
    if (finalSalary >= market.p75) return { percentile: 75, description: 'Great - Top 25%' };
    if (finalSalary >= market.p50) return { percentile: 50, description: 'Good - Above median' };
    if (finalSalary >= market.p25) return { percentile: 25, description: 'Fair - Below median' };
    return { percentile: 10, description: 'Low - Bottom 25%' };
}

// Helper: Generate recommendations
function generateRecommendations(negotiation, improvement, marketPosition) {
    const recommendations = [];
    
    if (improvement < 10) {
        recommendations.push('Practice being more assertive. You left money on the table.');
    }
    if (marketPosition.percentile < 50) {
        recommendations.push('Research market rates before negotiating. You settled below median.');
    }
    if (negotiation.negotiationRounds < 2) {
        recommendations.push('Don\'t accept the first offer. Always negotiate at least once.');
    }
    if (negotiation.performance.mistakesMade.length > 3) {
        recommendations.push('Review common negotiation mistakes. You made several tactical errors.');
    }
    if (!negotiation.performance.tacticsUsed.includes('market-data')) {
        recommendations.push('Always reference market data to support your position.');
    }
    
    return recommendations;
}

// Get user's negotiation history with analytics
exports.getNegotiationHistory = async (req, res) => {
    try {
        const negotiations = await SalaryNegotiation.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .select('-conversationHistory'); // Exclude full conversation for performance
        
        // Calculate analytics
        const totalNegotiations = negotiations.length;
        const completedNegotiations = negotiations.filter(n => n.status !== 'in-progress').length;
        
        // Calculate average improvement
        const improvementSum = negotiations
            .filter(n => n.status !== 'in-progress')
            .reduce((sum, n) => {
                const initial = n.initialOffer.baseSalary + n.initialOffer.equity + n.initialOffer.signingBonus;
                const final = n.finalOffer.baseSalary + n.finalOffer.equity + n.finalOffer.signingBonus;
                const improvement = ((final - initial) / initial) * 100;
                return sum + improvement;
            }, 0);
        const avgImprovement = completedNegotiations > 0 ? improvementSum / completedNegotiations : 0;
        
        // Calculate average confidence score
        const confidenceSum = negotiations
            .filter(n => n.performance.confidenceScore)
            .reduce((sum, n) => sum + n.performance.confidenceScore, 0);
        const avgConfidence = negotiations.length > 0 ? confidenceSum / negotiations.length : 0;
        
        // Get most used tactics
        const tacticsCount = {};
        negotiations.forEach(n => {
            if (n.performance && n.performance.tacticsUsed && Array.isArray(n.performance.tacticsUsed)) {
                n.performance.tacticsUsed.forEach(tactic => {
                    tacticsCount[tactic] = (tacticsCount[tactic] || 0) + 1;
                });
            }
        });
        const topTactics = Object.entries(tacticsCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([tactic, count]) => ({ tactic, count }));
        
        // Get scenario breakdown
        const scenarioStats = {};
        negotiations.forEach(n => {
            if (!scenarioStats[n.scenario]) {
                scenarioStats[n.scenario] = { count: 0, avgImprovement: 0, totalImprovement: 0 };
            }
            scenarioStats[n.scenario].count++;
            if (n.status !== 'in-progress') {
                const initial = n.initialOffer.baseSalary + n.initialOffer.equity + n.initialOffer.signingBonus;
                const final = n.finalOffer.baseSalary + n.finalOffer.equity + n.finalOffer.signingBonus;
                const improvement = ((final - initial) / initial) * 100;
                scenarioStats[n.scenario].totalImprovement += improvement;
            }
        });
        
        Object.keys(scenarioStats).forEach(scenario => {
            const completed = negotiations.filter(n => n.scenario === scenario && n.status !== 'in-progress').length;
            scenarioStats[scenario].avgImprovement = completed > 0 
                ? scenarioStats[scenario].totalImprovement / completed 
                : 0;
        });
        
        // Calculate streak (consecutive days with negotiations)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let streak = 0;
        let checkDate = new Date(today);
        
        while (true) {
            const dayStart = new Date(checkDate);
            const dayEnd = new Date(checkDate);
            dayEnd.setHours(23, 59, 59, 999);
            
            const hasNegotiation = negotiations.some(n => {
                const nDate = new Date(n.createdAt);
                return nDate >= dayStart && nDate <= dayEnd;
            });
            
            if (hasNegotiation) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        // Get recent achievements
        const achievements = [];
        if (totalNegotiations >= 1) achievements.push({ name: 'First Negotiation', icon: '🎯', date: negotiations[negotiations.length - 1].createdAt });
        if (totalNegotiations >= 5) achievements.push({ name: '5 Negotiations', icon: '🔥', unlocked: true });
        if (totalNegotiations >= 10) achievements.push({ name: '10 Negotiations', icon: '💪', unlocked: true });
        if (avgImprovement >= 15) achievements.push({ name: '15% Avg Improvement', icon: '📈', unlocked: true });
        if (avgImprovement >= 25) achievements.push({ name: '25% Avg Improvement', icon: '🚀', unlocked: true });
        if (avgConfidence >= 70) achievements.push({ name: 'Confident Negotiator', icon: '⭐', unlocked: true });
        if (streak >= 3) achievements.push({ name: '3-Day Streak', icon: '🔥', unlocked: true });
        if (streak >= 7) achievements.push({ name: '7-Day Streak', icon: '💎', unlocked: true });
        
        res.json({
            negotiations,
            analytics: {
                totalNegotiations,
                completedNegotiations,
                avgImprovement: Math.round(avgImprovement * 10) / 10,
                avgConfidence: Math.round(avgConfidence),
                topTactics,
                scenarioStats,
                streak,
                achievements
            }
        });
    } catch (error) {
        console.error('Error fetching negotiation history:', error);
        res.status(500).json({ message: 'Error fetching negotiation history' });
    }
};

module.exports = exports;
