const SalaryNegotiation = require('../models/SalaryNegotiation');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

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
        const { scenario, role, level, location, recruiterPersonality, communicationMode, companyName } = req.body;

        // Get market data for the role
        const market = marketData[role]?.[level]?.[location] || marketData['Software Engineer']['mid']['Remote'];

        // Generate initial offer (typically between p25 and p50)
        const baseOffer = Math.round(market.p25 + (market.p50 - market.p25) * 0.3);
        const equity = scenario === 'startup' ? Math.round(baseOffer * 0.15) : Math.round(baseOffer * 0.05);
        const signingBonus = scenario === 'faang' ? Math.round(baseOffer * 0.15) : Math.round(baseOffer * 0.05);

        // Notice period specific values (unique to Indian market)
        const noticePeriodDays = scenario === 'notice-period-buyout' ? 90 : 0;
        const buyoutAmount = scenario === 'notice-period-buyout' ? Math.round(baseOffer * 3 / 12) : 0; // 3 months salary

        // Generate recruiter details for email mode
        const recruiterNames = ['Priya Sharma', 'Rahul Verma', 'Anjali Patel', 'Vikram Singh', 'Neha Gupta'];
        const recruiterName = recruiterNames[Math.floor(Math.random() * recruiterNames.length)];
        const company = companyName || 'TechCorp India';
        const recruiterEmail = `${recruiterName.toLowerCase().replace(' ', '.')}@${company.toLowerCase().replace(' ', '')}.com`;

        const negotiation = new SalaryNegotiation({
            user: req.user._id,
            scenario,
            role,
            level,
            location,
            recruiterPersonality: recruiterPersonality || 'neutral',
            communicationMode: communicationMode || 'chat',
            recruiterName,
            recruiterEmail,
            companyName: company,
            initialOffer: {
                baseSalary: baseOffer,
                equity,
                signingBonus,
                relocation: scenario === 'faang' ? 10000 : 0,
                benefits: 'Standard benefits package including health, dental, vision, 401k',
                noticePeriodDays,
                buyoutAmount
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

        // Add email metadata if in email mode
        const messageData = {
            sender: 'recruiter',
            message: openingMessage,
            offer: negotiation.initialOffer
        };

        if (negotiation.communicationMode === 'email') {
            messageData.emailMetadata = {
                subject: `Offer for ${negotiation.role} position at ${negotiation.companyName}`,
                from: `${negotiation.recruiterName} <${negotiation.recruiterEmail}>`,
                to: `${req.user.name} <${req.user.email}>`,
                cc: []
            };
        }

        negotiation.conversationHistory.push(messageData);

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
                communicationMode: negotiation.communicationMode,
                recruiterName: negotiation.recruiterName,
                recruiterEmail: negotiation.recruiterEmail,
                companyName: negotiation.companyName,
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
        const userMessageData = {
            sender: 'user',
            message,
            offer: counterOffer
        };

        if (negotiation.communicationMode === 'email') {
            userMessageData.emailMetadata = {
                subject: `Re: Offer for ${negotiation.role} position at ${negotiation.companyName}`,
                from: `${req.user.name} <${req.user.email}>`,
                to: `${negotiation.recruiterName} <${negotiation.recruiterEmail}>`,
                cc: []
            };
        }

        negotiation.conversationHistory.push(userMessageData);

        negotiation.negotiationRounds += 1;

        // Analyze user's message for tactics and mistakes
        const analysis = analyzeUserMessage(message, counterOffer, negotiation);

        // Generate recruiter response using AI
        // Determine if recruiter makes a counter-offer FIRST so the AI knows what to say
        const personality = recruiterPersonalities[negotiation.recruiterPersonality];
        const newOffer = generateCounterOffer(negotiation, counterOffer, analysis, personality);

        // Generate recruiter response using AI with the NEW offer context
        const recruiterResponse = await generateRecruiterMessage(
            'response',
            negotiation,
            personality,
            { userMessage: message, counterOffer, analysis, newOffer }
        );

        const recruiterMessageData = {
            sender: 'recruiter',
            message: recruiterResponse,
            offer: newOffer
        };

        if (negotiation.communicationMode === 'email') {
            recruiterMessageData.emailMetadata = {
                subject: `Re: Offer for ${negotiation.role} position at ${negotiation.companyName}`,
                from: `${negotiation.recruiterName} <${negotiation.recruiterEmail}>`,
                to: `${req.user.name} <${req.user.email}>`,
                cc: []
            };
        }

        negotiation.conversationHistory.push(recruiterMessageData);

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
                averageImprovement: negotiations.reduce((sum, n) => sum + parseFloat(n.calculateImprovement() || 0), 0) / (negotiations.length || 1),
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
    // Reverting to gemini-pro as gemini-1.5-flash was not found
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    let prompt = '';

    try {
        if (type === 'opening') {
            const isNoticePeriod = negotiation.scenario === 'notice-period-buyout';
            const isEmail = negotiation.communicationMode === 'email';

            prompt = `You are ${negotiation.recruiterName}, a ${personality.tone} recruiter for ${negotiation.companyName} in India. 
Generate an opening ${isEmail ? 'email' : 'message'} for a ${isNoticePeriod ? 'notice period buyout' : 'salary'} negotiation with a ${negotiation.level} ${negotiation.role} in ${negotiation.location}.

${isEmail ? `Format as a professional email with:
- Greeting (use candidate's name if available, otherwise "Hi there")
- Brief introduction about yourself and the company
- The offer details
- Closing with your name and title

Keep it professional but ${personality.tone}. Use proper email etiquette.` : 'Format as a conversational message.'}

The initial offer is:
- Base Salary (Fixed): ₹${(negotiation.initialOffer.baseSalary / 100000).toFixed(2)} LPA
- ESOPs/Variable: ₹${(negotiation.initialOffer.equity / 100000).toFixed(2)} LPA
- Joining Bonus: ₹${(negotiation.initialOffer.signingBonus / 100000).toFixed(2)} LPA
- Benefits: ${negotiation.initialOffer.benefits}
${isNoticePeriod ? `- Current Notice Period: ${negotiation.initialOffer.noticePeriodDays} days
- Buyout Amount We Can Offer: ₹${(negotiation.initialOffer.buyoutAmount / 100000).toFixed(2)} LPA (to help you join earlier)` : ''}

${isNoticePeriod ? 'Mention that you need them to join quickly and are willing to discuss notice period buyout options.' : ''}
Be ${personality.tone}. Use Indian salary terminology (CTC, LPA, fixed vs variable). ${isEmail ? 'Keep it under 150 words.' : 'Keep it under 100 words.'} Make it realistic and professional.`;
        } else {
            const lastOffer = negotiation.conversationHistory[negotiation.conversationHistory.length - 1].offer;
            const isEmail = negotiation.communicationMode === 'email';
            const newOffer = context.newOffer; // This is the offer we MUST present

            // Calculate changes to explain them
            const baseChange = newOffer.baseSalary - lastOffer.baseSalary;
            const equityChange = newOffer.equity - lastOffer.equity;
            const bonusChange = newOffer.signingBonus - lastOffer.signingBonus;

            const improved = baseChange > 0 || equityChange > 0 || bonusChange > 0;

            // Check if user actually gave a number
            const userGaveNumber = context.counterOffer || /\d/.test(context.userMessage);

            prompt = `You are ${negotiation.recruiterName}, a ${personality.tone} recruiter for ${negotiation.companyName}. 
The candidate just said: "${context.userMessage}"

${context.counterOffer ? `They asked for:
- Base: ₹${context.counterOffer.baseSalary ? (context.counterOffer.baseSalary / 100000).toFixed(2) + ' LPA' : 'N/A'}
- Equity: ₹${context.counterOffer.equity ? (context.counterOffer.equity / 100000).toFixed(2) + ' LPA' : 'N/A'}
- Bonus: ₹${context.counterOffer.signingBonus ? (context.counterOffer.signingBonus / 100000).toFixed(2) + ' LPA' : 'N/A'}` : ''}

You have reviewed their request with the team.
HERE IS YOUR NEW OFFICIAL OFFER (You MUST stick to these numbers):
- Base (Fixed): ₹${(newOffer.baseSalary / 100000).toFixed(2)} LPA
- Variable/ESOPs: ₹${(newOffer.equity / 100000).toFixed(2)} LPA
- Joining Bonus: ₹${(newOffer.signingBonus / 100000).toFixed(2)} LPA

INSTRUCTIONS:
1. Acknowledge their points.
2. CRITICAL: If the user did NOT provide a specific number or expectation in their message, you MUST ask them: "What are you considering to be a good salary?" or "What number do you have in mind?".
3. If they DID provide a number (or if you are making a counter-offer):
   - State clearly whether you could match their request or not.
   - **PROVIDE DETAILED REASONING based on the company type:**
     * If this is a **Startup**: Talk about "runway", "equity upside", "future growth", or "we are all building this together". Explain that cash is tight but equity is the real value.
     * If this is a **Large Company/MNC**: Talk about "salary bands", "internal parity", "HR policies", or "standard grids". Explain that you cannot break the structure for one person.
   - If you improved the offer: Explain specifically what changed (e.g., "I spoke to the VP and got approval for...", "We moved some signing bonus budget to base...").
   - If you didn't move at all: Be firm but polite. Explain that the current offer is competitive based on market data and the company's specific compensation philosophy.
4. Present the new numbers clearly.

Tone: ${personality.tone}.
${personality.pushback > 0.7 ? 'Be tough. Emphasize that budget is tight.' : 'Be collaborative.'}
Use Indian salary terminology (CTC, LPA). ${isEmail ? 'Keep it under 200 words.' : 'Keep it under 150 words.'} Make the explanation feel real and educational for the candidate.`;
        }

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('AI generation error:', error);
        console.error('Prompt that failed:', prompt);
        // Fallback responses
        if (type === 'opening') {
            return `Hi! I'm excited to extend an offer for the ${negotiation.role} position. We're offering ₹${(negotiation.initialOffer.baseSalary / 100000).toFixed(2)} LPA fixed...`;
        }
        return "I've reviewed your request with the team. We can offer " + (context.newOffer.baseSalary / 100000).toFixed(2) + " LPA base.";
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
    if (lowerMessage.includes('market rate') || lowerMessage.includes('industry standard') || lowerMessage.includes('market research')) {
        tactics.push('market-data');
        strengths.push('Referenced market data');
    }
    if (lowerMessage.includes('other offer') || lowerMessage.includes('competing offer') || lowerMessage.includes('another company')) {
        tactics.push('competing-offers');
        strengths.push('Leveraged competing offers');
    }
    if (lowerMessage.includes('excited') || lowerMessage.includes('enthusiastic') || lowerMessage.includes('love the team')) {
        tactics.push('enthusiasm');
        strengths.push('Showed enthusiasm for the role');
    }
    if (lowerMessage.includes('value') || lowerMessage.includes('contribution') || lowerMessage.includes('impact')) {
        tactics.push('value-creation');
        strengths.push('Focused on value and impact');
    }

    // Check for mistakes
    if (lowerMessage.includes('current salary') || lowerMessage.includes('currently making') || lowerMessage.includes('my package is')) {
        mistakes.push('Revealed current salary');
        suggestions.push('Avoid revealing your current salary. Focus on the value you bring to this new role.');
    }
    if (lowerMessage.includes('need') || lowerMessage.includes('have to have') || lowerMessage.includes('bills')) {
        mistakes.push('Used personal need justification');
        suggestions.push('Justify your ask based on market data and skills, not personal financial needs.');
    }
    if (counterOffer && counterOffer.baseSalary < negotiation.initialOffer.baseSalary) {
        mistakes.push('Counter-offered below initial offer');
        suggestions.push('Never counter below the initial offer. Always negotiate upward.');
    }
    if (message.length < 30) {
        mistakes.push('Response too brief');
        suggestions.push('Provide more context and reasoning. Explain WHY you deserve more.');
    }

    // Check if counter is reasonable
    if (counterOffer && counterOffer.baseSalary) {
        const increase = ((counterOffer.baseSalary - negotiation.initialOffer.baseSalary) / negotiation.initialOffer.baseSalary) * 100;
        if (increase > 40) {
            mistakes.push('Counter-offer too aggressive (>40% increase)');
            suggestions.push('Your ask is significantly above the initial offer. Be prepared to justify it with strong data.');
        } else if (increase < 3) {
            mistakes.push('Counter-offer too small (<3% increase)');
            suggestions.push('Don\'t be afraid to ask for more. A 10-20% increase is standard for a first counter.');
        }
    }

    return { tacticsUsed: tactics, mistakes, strengths, suggestions };
}

// Helper: Generate counter-offer from recruiter
function generateCounterOffer(negotiation, userCounterOffer, analysis, personality, userMessage = '') {
    // Get the absolute latest offer from history
    let lastOffer = negotiation.initialOffer;
    for (let i = negotiation.conversationHistory.length - 1; i >= 0; i--) {
        if (negotiation.conversationHistory[i].sender === 'recruiter' && negotiation.conversationHistory[i].offer) {
            lastOffer = negotiation.conversationHistory[i].offer;
            break;
        }
    }

    let requestedBase = null;
    let requestedEquity = null;
    let requestedBonus = null;

    // 1. Try to get values from structured counter offer
    if (userCounterOffer) {
        requestedBase = userCounterOffer.baseSalary;
        requestedEquity = userCounterOffer.equity;
        requestedBonus = userCounterOffer.signingBonus;
    }
    // 2. If no structured offer, try to parse from text
    else if (userMessage) {
        // Look for patterns like "20 LPA", "20 lakhs", "20L"
        // We assume the first number mentioned with these units is the base salary request
        const baseMatch = userMessage.match(/(\d+(?:\.\d+)?)\s*(?:lpa|lakhs?|l)\b/i);
        if (baseMatch) {
            // Convert to absolute number (assuming input is in Lakhs)
            requestedBase = parseFloat(baseMatch[1]) * 100000;
        }
    }

    // If we still have no request, we can't negotiate effectively, so we hold the line
    if (!requestedBase && !requestedEquity && !requestedBonus) {
        return lastOffer;
    }

    // Use current values if request is missing specific components
    requestedBase = requestedBase || lastOffer.baseSalary;
    requestedEquity = requestedEquity || lastOffer.equity;
    requestedBonus = requestedBonus || lastOffer.signingBonus;

    // Calculate negotiation room (max budget is typically p75 or p90 depending on personality)
    const maxBudget = personality.openness > 0.7 ? negotiation.marketData.p90 : negotiation.marketData.p75;

    // How much are they willing to move? (0 to 1)
    // Openness affects willingness. Mistakes reduce willingness.
    let willingnessToMove = personality.openness;
    if (analysis.mistakes.length > 0) willingnessToMove *= 0.8;
    if (analysis.tacticsUsed.length > 0) willingnessToMove *= 1.2;

    // Cap willingness at 1.0
    willingnessToMove = Math.min(willingnessToMove, 1.0);

    // Calculate potential new base
    const currentBase = lastOffer.baseSalary;
    let newBase = currentBase;

    if (requestedBase > currentBase) {
        const gap = requestedBase - currentBase;
        const maxAllowedIncrease = maxBudget - currentBase;

        if (maxAllowedIncrease > 0) {
            // They will meet you part way, depending on willingness
            const increase = Math.min(gap, maxAllowedIncrease) * willingnessToMove * 0.6; // 0.6 is a damping factor so they don't fold immediately
            newBase = currentBase + increase;
        }
    }

    // Round to nearest 10,000
    newBase = Math.round(newBase / 10000) * 10000;

    // Handle Equity and Bonus
    let newEquity = lastOffer.equity;
    if (requestedEquity > lastOffer.equity) {
        // Equity is harder to move, usually fixed pools
        newEquity = lastOffer.equity + ((requestedEquity - lastOffer.equity) * 0.2 * willingnessToMove);
    }

    let newBonus = lastOffer.signingBonus;
    if (requestedBonus > lastOffer.signingBonus) {
        // Signing bonus is often used as a lever when base can't move
        const baseGap = requestedBase - newBase;
        if (baseGap > 0) {
            // Compensate for missing base with one-time bonus
            newBonus += baseGap * 0.5;
        }
        newBonus += (requestedBonus - lastOffer.signingBonus) * 0.3 * willingnessToMove;
    }

    return {
        baseSalary: Math.round(newBase),
        equity: Math.round(newEquity),
        signingBonus: Math.round(newBonus),
        relocation: lastOffer.relocation,
        benefits: lastOffer.benefits,
        noticePeriodDays: lastOffer.noticePeriodDays,
        buyoutAmount: lastOffer.buyoutAmount
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
