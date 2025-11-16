// AI Author Personas with different communication styles and response patterns
export const AUTHOR_PERSONAS = {
    'Junior Developer': {
        name: 'Alex Chen',
        experience: '6 months',
        avatar: '👨‍💻',
        personality: 'eager-to-learn',
        communicationStyle: 'defensive-but-receptive',
        responsePatterns: {
            security: {
                defensive: "I thought about security, but isn't this overkill for our use case? The data isn't that sensitive.",
                questioning: "That's a good point about security. Could you help me understand why this specific approach is better?",
                pushback: "I see the security concern, but implementing this will take a lot more time. Is it really necessary for the MVP?"
            },
            performance: {
                defensive: "I wrote it this way because it's much more readable. This function isn't called very often anyway.",
                questioning: "Interesting point about performance. How much of a difference would this optimization actually make?",
                pushback: "The performance gain seems minimal, but the code becomes much harder to understand. Is the trade-off worth it?"
            },
            validation: {
                defensive: "I added basic validation. Do we really need to validate every single input? The frontend already handles most of this.",
                questioning: "You're right about validation. What's the best practice for handling edge cases like this?",
                pushback: "Adding all this validation makes the code really verbose. Can't we trust the frontend validation?"
            },
            bug: {
                defensive: "I tested this locally and it worked fine. Are you sure this is actually a bug?",
                questioning: "Oh no, I didn't catch that! Could you walk me through how this could fail?",
                pushback: "I see the potential issue, but it seems like a really rare edge case. Should we prioritize fixing this now?"
            }
        }
    },
    'Frontend Intern': {
        name: 'Sarah Kim',
        experience: '2 months',
        avatar: '👩‍💻',
        personality: 'nervous-but-willing',
        communicationStyle: 'apologetic-and-eager',
        responsePatterns: {
            accessibility: {
                defensive: "I'm still learning about accessibility. I thought the basic HTML was enough?",
                questioning: "Thank you for catching that! Could you show me the right way to implement this?",
                pushback: "I understand accessibility is important, but we're running behind schedule. Can this be a follow-up task?"
            },
            performance: {
                defensive: "I'm sorry, I'm still learning React best practices. I thought this approach was correct.",
                questioning: "That makes sense! I didn't know about that optimization. Could you explain how it works?",
                pushback: "I see your point, but I'm worried about making the code too complex. What if I break something?"
            },
            bug: {
                defensive: "Oh no, I'm so sorry! I thought I tested everything. How did I miss this?",
                questioning: "Thank you for finding this! I'm still learning - could you help me understand why this happens?",
                pushback: "I understand the issue, but I'm not sure how to fix it without breaking other things. Could we pair on this?"
            }
        }
    },
    'Mid-level Developer': {
        name: 'Jordan Martinez',
        experience: '3 years',
        avatar: '🧑‍💻',
        personality: 'confident-but-collaborative',
        communicationStyle: 'professional-and-reasoned',
        responsePatterns: {
            architecture: {
                defensive: "I considered that approach, but I went with this pattern because it's more consistent with our existing codebase.",
                questioning: "That's an interesting perspective. How do you think this would impact our current architecture?",
                pushback: "I see the benefits of your suggestion, but changing this would require refactoring several other components. Is it worth the effort?"
            },
            performance: {
                defensive: "The performance impact here is negligible given our current user base. I prioritized code clarity over micro-optimizations.",
                questioning: "Good catch on the performance aspect. Do you have data on how significant this impact would be?",
                pushback: "While I agree this could be optimized, premature optimization might not be the best use of our time right now."
            },
            security: {
                defensive: "I implemented the security measures that were in our guidelines. Are you suggesting we go beyond the current standards?",
                questioning: "You raise a valid security concern. What would be the best way to address this without over-engineering?",
                pushback: "I understand the security implications, but this adds significant complexity. Could we implement a simpler solution first?"
            }
        }
    },
    'Senior Developer': {
        name: 'Dr. Emily Watson',
        experience: '8 years',
        avatar: '👩‍🔬',
        personality: 'analytical-and-thorough',
        communicationStyle: 'technical-and-precise',
        responsePatterns: {
            architecture: {
                defensive: "This design follows the established patterns in our system. The alternative you're suggesting would break consistency.",
                questioning: "I appreciate the architectural feedback. Could you elaborate on how your approach would handle the scalability concerns?",
                pushback: "While your suggestion has merit, it introduces coupling that could cause issues down the line. Have you considered the long-term implications?"
            },
            performance: {
                defensive: "The performance characteristics here are acceptable given our SLA requirements. The readability benefits outweigh the minimal performance cost.",
                questioning: "Interesting optimization suggestion. Do you have benchmarks showing the performance improvement?",
                pushback: "The optimization you're suggesting would improve performance but at the cost of maintainability. Given our team's expertise, is this the right trade-off?"
            },
            concurrency: {
                defensive: "I've analyzed the concurrency patterns here. The current approach handles our expected load without the complexity of additional synchronization.",
                questioning: "You've identified a potential race condition. What would be your recommended approach to handle this safely?",
                pushback: "While the race condition is theoretically possible, our usage patterns make it extremely unlikely. Would the added complexity be justified?"
            }
        }
    }
};

export const generateAuthorResponse = (persona, issueType, commentText, responseStyle = 'questioning') => {
    const author = AUTHOR_PERSONAS[persona];
    if (!author) return null;

    // Analyze comment sentiment and technical depth
    const isAggressive = /\b(wrong|bad|terrible|awful|stupid)\b/i.test(commentText);
    const isTechnical = /\b(performance|security|algorithm|optimization|pattern)\b/i.test(commentText);
    const isDetailed = commentText.length > 100;

    // Select appropriate response style based on comment characteristics
    let selectedStyle = responseStyle;
    if (isAggressive && author.personality === 'nervous-but-willing') {
        selectedStyle = 'defensive';
    } else if (isTechnical && isDetailed) {
        selectedStyle = 'questioning';
    } else if (!isDetailed) {
        selectedStyle = 'pushback';
    }

    // Get response pattern for the issue type
    const responses = author.responsePatterns[issueType] || author.responsePatterns.bug;
    const response = responses[selectedStyle] || responses.questioning;

    return {
        author: author.name,
        avatar: author.avatar,
        experience: author.experience,
        personality: author.personality,
        response: response,
        timestamp: new Date(),
        style: selectedStyle
    };
};

export const getFollowUpPrompts = (issueType, authorPersonality) => {
    const prompts = {
        security: {
            'eager-to-learn': [
                "Explain why this security measure is critical",
                "Suggest a simpler security approach",
                "Provide resources for learning security best practices"
            ],
            'confident-but-collaborative': [
                "Discuss the security vs. complexity trade-off",
                "Propose a phased security implementation",
                "Compare different security approaches"
            ],
            'analytical-and-thorough': [
                "Present data supporting the security concern",
                "Discuss industry standards and compliance",
                "Analyze the risk assessment methodology"
            ]
        },
        performance: {
            'eager-to-learn': [
                "Explain the performance impact with examples",
                "Suggest learning resources for optimization",
                "Offer to pair program the optimization"
            ],
            'confident-but-collaborative': [
                "Discuss when optimization is worth the complexity",
                "Propose performance monitoring approach",
                "Compare different optimization strategies"
            ],
            'analytical-and-thorough': [
                "Present benchmarking data and analysis",
                "Discuss scalability implications",
                "Analyze the performance vs. maintainability trade-off"
            ]
        }
    };

    return prompts[issueType]?.[authorPersonality] || [
        "Provide more context for your suggestion",
        "Explain the trade-offs involved",
        "Suggest a compromise solution"
    ];
};

export const scoreRebuttalResponse = (userResponse, context) => {
    const scores = {
        empathy: 0,
        technical: 0,
        communication: 0,
        leadership: 0
    };

    // Empathy scoring
    const empathyKeywords = ['understand', 'appreciate', 'see your point', 'good question', 'valid concern'];
    const empathyCount = empathyKeywords.filter(keyword => 
        userResponse.toLowerCase().includes(keyword)
    ).length;
    scores.empathy = Math.min(empathyCount * 25, 100);

    // Technical scoring
    const technicalKeywords = ['because', 'data shows', 'benchmark', 'analysis', 'evidence', 'research'];
    const technicalCount = technicalKeywords.filter(keyword => 
        userResponse.toLowerCase().includes(keyword)
    ).length;
    scores.technical = Math.min(technicalCount * 20, 100);

    // Communication scoring
    const communicationKeywords = ['let me explain', 'here\'s why', 'consider this', 'alternative', 'compromise'];
    const communicationCount = communicationKeywords.filter(keyword => 
        userResponse.toLowerCase().includes(keyword)
    ).length;
    scores.communication = Math.min(communicationCount * 20, 100);

    // Leadership scoring
    const leadershipKeywords = ['recommend', 'suggest', 'propose', 'next steps', 'action plan'];
    const leadershipCount = leadershipKeywords.filter(keyword => 
        userResponse.toLowerCase().includes(keyword)
    ).length;
    scores.leadership = Math.min(leadershipCount * 25, 100);

    // Penalty for aggressive language
    const aggressiveKeywords = ['wrong', 'stupid', 'obviously', 'clearly you', 'just do'];
    const aggressiveCount = aggressiveKeywords.filter(keyword => 
        userResponse.toLowerCase().includes(keyword)
    ).length;
    
    if (aggressiveCount > 0) {
        Object.keys(scores).forEach(key => {
            scores[key] = Math.max(0, scores[key] - (aggressiveCount * 20));
        });
    }

    return {
        ...scores,
        overall: Math.round((scores.empathy + scores.technical + scores.communication + scores.leadership) / 4)
    };
};
