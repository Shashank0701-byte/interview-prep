const AIInterview = require('../models/AIInterview');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const multer = require('multer');

// AI-powered contextual follow-up question generator
const generateContextualFollowUp = async ({
    userResponse,
    originalQuestion,
    interviewType,
    difficulty,
    responseQuality,
    performanceMetrics,
    aiPersona
}) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Analyze response quality and determine follow-up strategy
        const followUpStrategy = determineFollowUpStrategy(responseQuality, performanceMetrics);
        
        const prompt = `
You are ${aiPersona.name}, a ${aiPersona.role} conducting a ${interviewType} interview. 
Your personality is ${aiPersona.personality}.

ORIGINAL QUESTION: "${originalQuestion.question}"
CANDIDATE'S RESPONSE: "${userResponse}"

RESPONSE ANALYSIS:
- Quality Score: ${responseQuality.overall}/100
- Completeness: ${responseQuality.completeness}/100
- Technical Accuracy: ${responseQuality.technical}/100
- Communication: ${responseQuality.communication}/100

PERFORMANCE METRICS:
- Confidence Level: ${performanceMetrics.confidence}%
- Speaking Pace: ${performanceMetrics.pace} WPM
- Eye Contact: ${performanceMetrics.eyeContact}%

FOLLOW-UP STRATEGY: ${followUpStrategy.type}
TARGET: ${followUpStrategy.goal}

Generate a contextual follow-up question that:
1. ${followUpStrategy.instructions}
2. Maintains the ${aiPersona.personality} interviewer personality
3. Is appropriate for ${difficulty} level candidate
4. Builds naturally on their response

FOLLOW-UP TYPES TO CONSIDER:
- Clarification: "Can you elaborate on..."
- Deep Dive: "Tell me more about the technical details..."
- Scenario Extension: "How would you handle if..."
- Alternative Approach: "What other ways could you..."
- Real-world Application: "In a production environment..."
- Problem Solving: "What if you encountered..."

Return ONLY a JSON object with:
{
    "question": "The follow-up question",
    "context": "Why this question was chosen",
    "difficulty": "easy|medium|hard",
    "expectedResponse": "What a good answer should include",
    "type": "clarification|deep-dive|scenario|alternative|real-world|problem-solving"
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Parse the JSON response
        const followUpData = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
        
        return followUpData;

    } catch (error) {
        console.error('Error generating contextual follow-up:', error);
        
        // Fallback to predefined follow-ups
        return generateFallbackFollowUp(originalQuestion, interviewType, responseQuality);
    }
};

// Determine follow-up strategy based on response quality
const determineFollowUpStrategy = (responseQuality, performanceMetrics) => {
    const overall = responseQuality.overall;
    const completeness = responseQuality.completeness;
    const technical = responseQuality.technical;
    
    if (overall >= 80) {
        return {
            type: "CHALLENGE",
            goal: "Test deeper knowledge",
            instructions: "Ask a more challenging question that builds on their strong response"
        };
    } else if (overall >= 60) {
        return {
            type: "CLARIFY",
            goal: "Get more specific details",
            instructions: "Ask for clarification or more specific examples"
        };
    } else if (completeness < 50) {
        return {
            type: "GUIDE",
            goal: "Help them provide a complete answer",
            instructions: "Guide them to provide missing information with a leading question"
        };
    } else if (technical < 50) {
        return {
            type: "SIMPLIFY",
            goal: "Break down the technical aspects",
            instructions: "Ask a simpler technical question to build confidence"
        };
    } else {
        return {
            type: "ENCOURAGE",
            goal: "Build confidence",
            instructions: "Ask an encouraging follow-up that lets them showcase their strengths"
        };
    }
};

// Fallback follow-up generator for when AI fails
const generateFallbackFollowUp = (originalQuestion, interviewType, responseQuality) => {
    const fallbackQuestions = {
        'technical': [
            "Can you walk me through your thought process on that?",
            "How would you optimize this solution?",
            "What edge cases would you consider?",
            "How would you test this implementation?"
        ],
        'behavioral': [
            "What did you learn from that experience?",
            "How did others react to your approach?",
            "What would you do differently next time?",
            "Can you give me a specific example?"
        ],
        'system-design': [
            "How would this scale with millions of users?",
            "What are the potential bottlenecks?",
            "How would you handle failures in this system?",
            "What monitoring would you implement?"
        ]
    };
    
    const questions = fallbackQuestions[interviewType] || fallbackQuestions['technical'];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    return {
        question: randomQuestion,
        context: "Fallback follow-up question",
        difficulty: "medium",
        expectedResponse: "A thoughtful response that demonstrates understanding",
        type: "clarification"
    };
};

const path = require('path');
const fs = require('fs').promises;
const whisperService = require('../utils/whisperService');

// Check if Gemini AI is properly initialized
if (!process.env.GOOGLE_AI_API_KEY) {
    console.warn('⚠️ GOOGLE_AI_API_KEY not found - AI Interview features will be disabled');
} else {
    console.log('✅ Gemini AI initialized for Interview Coach');
}

// Configure multer for audio uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/interviews/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `interview-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio and video files are allowed'));
        }
    }
});

// Interview Scenarios Database
const INTERVIEW_SCENARIOS = {
    faang: {
        technical: [
            {
                id: 'faang-tech-1',
                question: "Design a system like Twitter. Walk me through your approach for handling millions of tweets per day.",
                category: 'system-design',
                expectedDuration: 900, // 15 minutes
                followUps: [
                    "How would you handle the read-heavy nature of social media?",
                    "What about handling celebrity tweets that get millions of interactions?",
                    "How would you implement the timeline generation?"
                ]
            },
            {
                id: 'faang-tech-2',
                question: "Implement a function to find the longest palindromic substring. Optimize for both time and space complexity.",
                category: 'coding',
                expectedDuration: 600, // 10 minutes
                followUps: [
                    "Can you optimize this further?",
                    "What's the time complexity of your solution?",
                    "How would you handle edge cases?"
                ]
            }
        ],
        behavioral: [
            {
                id: 'faang-behavioral-1',
                question: "Tell me about a time when you had to work with a difficult team member. How did you handle the situation?",
                category: 'leadership',
                expectedDuration: 300, // 5 minutes
                followUps: [
                    "What would you do differently next time?",
                    "How did this experience change your approach to teamwork?"
                ]
            }
        ]
    },
    startup: {
        technical: [
            {
                id: 'startup-tech-1',
                question: "We need to build an MVP quickly. How would you architect a scalable backend that can grow with us?",
                category: 'architecture',
                expectedDuration: 600,
                followUps: [
                    "What technologies would you choose and why?",
                    "How would you handle technical debt in a fast-moving environment?"
                ]
            }
        ],
        behavioral: [
            {
                id: 'startup-behavioral-1',
                question: "Describe a time when you had to learn a new technology quickly to meet a deadline.",
                category: 'adaptability',
                expectedDuration: 300,
                followUps: [
                    "How do you stay updated with new technologies?",
                    "What's your approach to learning under pressure?"
                ]
            }
        ]
    },
    enterprise: {
        technical: [
            {
                id: 'enterprise-tech-1',
                question: "How would you migrate a legacy monolithic application to microservices while maintaining zero downtime?",
                category: 'architecture',
                expectedDuration: 900,
                followUps: [
                    "What are the risks involved in this migration?",
                    "How would you handle data consistency across services?"
                ]
            }
        ],
        behavioral: [
            {
                id: 'enterprise-behavioral-1',
                question: "Tell me about a time when you had to convince stakeholders to adopt a new technology or process.",
                category: 'influence',
                expectedDuration: 300,
                followUps: [
                    "How do you handle resistance to change?",
                    "What metrics did you use to measure success?"
                ]
            }
        ]
    }
};

// AI Interviewer Personas
const AI_PERSONAS = {
    faang: {
        name: "Sarah Chen",
        company: "Meta",
        role: "Senior Engineering Manager",
        personality: "challenging",
        avatar: "/avatars/sarah-chen.png",
        voice: "en-US-AriaNeural",
        style: "Direct and technical, focuses on scalability and system design. Asks probing follow-up questions."
    },
    startup: {
        name: "Alex Rodriguez",
        company: "TechFlow",
        role: "CTO",
        personality: "friendly",
        avatar: "/avatars/alex-rodriguez.png",
        voice: "en-US-GuyNeural",
        style: "Casual but thorough, interested in practical solutions and cultural fit."
    },
    enterprise: {
        name: "Dr. Michael Thompson",
        company: "GlobalTech Corp",
        role: "Principal Architect",
        personality: "formal",
        avatar: "/avatars/michael-thompson.png",
        voice: "en-US-DavisNeural",
        style: "Formal and methodical, focuses on enterprise concerns like security and compliance."
    }
};

// @desc    Create new AI interview session
// @route   POST /api/ai-interview-coach/create
// @access  Private
const createInterviewSession = async (req, res) => {
    try {
        const { interviewType, industryFocus, role, difficulty, duration } = req.body;
        const userId = req.user._id;

        // Generate unique session ID
        const sessionId = `ai-interview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Select appropriate AI persona
        const aiPersona = AI_PERSONAS[industryFocus] || AI_PERSONAS.startup;

        // Generate interview questions based on type and industry
        const questions = await generateInterviewQuestions(interviewType, industryFocus, role, difficulty);

        const interview = new AIInterview({
            user: userId,
            sessionId,
            interviewType,
            industryFocus,
            role,
            difficulty,
            duration,
            questions,
            aiPersona,
            analysisData: {
                facialExpressions: [],
                voiceMetrics: [],
                environmentFlags: [],
                behavioralFlags: []
            },
            scores: {
                overall: 0,
                technical: 0,
                communication: 0,
                confidence: 0,
                professionalism: 0,
                eyeContact: 0,
                voiceClarity: 0,
                responseRelevance: 0,
                environmentSetup: 0,
                bodyLanguage: 0
            }
        });

        await interview.save();

        res.status(201).json({
            success: true,
            interview: {
                sessionId: interview.sessionId,
                aiPersona: interview.aiPersona,
                firstQuestion: questions[0],
                estimatedDuration: duration
            }
        });

    } catch (error) {
        console.error('Error creating AI interview session:', error);
        res.status(500).json({ message: 'Failed to create interview session' });
    }
};

// @desc    Start interview session
// @route   POST /api/ai-interview-coach/:sessionId/start
// @access  Private
const startInterview = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;

        const interview = await AIInterview.findOne({ sessionId, user: userId });
        if (!interview) {
            return res.status(404).json({ message: 'Interview session not found' });
        }

        interview.status = 'in-progress';
        interview.startedAt = new Date();
        
        // Initialize analysisData structure if not exists
        if (!interview.analysisData) {
            interview.analysisData = {
                facialExpressions: [],
                voiceMetrics: [],
                environmentFlags: [],
                behavioralFlags: []
            };
        }
        
        await interview.save();

        res.json({
            success: true,
            message: 'Interview started',
            aiPersona: interview.aiPersona,
            firstQuestion: interview.questions[0]
        });

    } catch (error) {
        console.error('Error starting interview:', error);
        res.status(500).json({ message: 'Failed to start interview' });
    }
};

// @desc    Submit analysis data (real-time)
// @route   POST /api/ai-interview-coach/:sessionId/analysis
// @access  Private
const submitAnalysisData = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { type, data } = req.body; // type: 'facial', 'voice', 'environment', 'behavioral'
        const userId = req.user._id;

        const interview = await AIInterview.findOne({ sessionId, user: userId });
        if (!interview) {
            return res.status(404).json({ message: 'Interview session not found' });
        }

        // Add timestamp to data
        const timestampedData = {
            ...data,
            timestamp: Date.now()
        };

        // Store analysis data based on type
        switch (type) {
            case 'facial':
                interview.analysisData.facialExpressions.push(timestampedData);
                break;
            case 'voice':
                interview.analysisData.voiceMetrics.push(timestampedData);
                break;
            case 'environment':
                interview.analysisData.environmentFlags.push(timestampedData);
                break;
            case 'behavioral':
                interview.analysisData.behavioralFlags.push(timestampedData);
                break;
        }

        await interview.save();

        // Generate real-time feedback flags
        const flags = await generateRealTimeFeedback(interview, type, timestampedData);

        res.json({
            success: true,
            flags: flags
        });

    } catch (error) {
        console.error('Error submitting analysis data:', error);
        res.status(500).json({ message: 'Failed to submit analysis data' });
    }
};

// @desc    Generate dynamic follow-up question based on response
// @route   POST /api/ai-interview-coach/:sessionId/generate-followup
// @access  Private
const generateFollowUpQuestion = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { userResponse, currentQuestionId, responseQuality, performanceMetrics } = req.body;
        
        const interview = await AIInterview.findOne({ 
            sessionId, 
            user: req.user._id 
        });
        
        if (!interview) {
            return res.status(404).json({ message: 'Interview session not found' });
        }

        const currentQuestion = interview.questions.find(q => q.id === currentQuestionId);
        if (!currentQuestion) {
            return res.status(404).json({ message: 'Current question not found' });
        }

        // Analyze user response and generate contextual follow-up
        const followUpQuestion = await generateContextualFollowUp({
            userResponse,
            originalQuestion: currentQuestion,
            interviewType: interview.interviewType,
            difficulty: interview.difficulty,
            responseQuality,
            performanceMetrics,
            aiPersona: interview.aiPersona
        });

        // Add follow-up to the current question
        if (!currentQuestion.aiFollowUp) {
            currentQuestion.aiFollowUp = [];
        }
        
        currentQuestion.aiFollowUp.push({
            question: followUpQuestion.question,
            askedAt: new Date(),
            context: followUpQuestion.context,
            difficulty: followUpQuestion.difficulty,
            expectedResponse: followUpQuestion.expectedResponse
        });

        await interview.save();

        res.json({
            success: true,
            followUpQuestion: followUpQuestion,
            questionId: currentQuestion.id
        });

    } catch (error) {
        console.error('Error generating follow-up question:', error);
        res.status(500).json({ message: 'Failed to generate follow-up question' });
    }
};

// @desc    Process voice response with Whisper API
// @route   POST /api/ai-interview-coach/:sessionId/voice-response
// @access  Private
const processVoiceResponse = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { questionId } = req.body;
        const userId = req.user._id;

        const interview = await AIInterview.findOne({ sessionId, user: userId });
        if (!interview) {
            return res.status(404).json({ message: 'Interview session not found' });
        }

        // Check if audio file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No audio file provided' });
        }

        const audioFilePath = req.file.path;
        
        try {
            // Validate audio file
            const validation = whisperService.validateAudioFile(audioFilePath);
            if (!validation.valid) {
                return res.status(400).json({ 
                    message: 'Invalid audio file', 
                    errors: validation.errors 
                });
            }

            // Transcribe audio using Whisper API
            const transcriptionResult = await whisperService.transcribeAudio(audioFilePath, {
                language: 'en', // Default to English, could be made configurable
                prompt: 'This is an interview response. Please transcribe accurately including any technical terms.',
                temperature: 0.2 // Lower temperature for more consistent results
            });

            // Analyze speech patterns
            const speechAnalysis = whisperService.analyzeSpeechPatterns(transcriptionResult);

            // Save audio file with a permanent name
            const permanentFileName = `interview-${sessionId}-${questionId}-${Date.now()}.${req.file.originalname.split('.').pop()}`;
            const permanentPath = path.join('uploads/interviews', permanentFileName);
            await fs.rename(audioFilePath, permanentPath);

            // Find the question and update response
            const questionIndex = interview.questions.findIndex(q => q.id === questionId);
            if (questionIndex !== -1) {
                interview.questions[questionIndex].userResponse = {
                    text: transcriptionResult.text,
                    audioUrl: `/uploads/interviews/${permanentFileName}`,
                    duration: transcriptionResult.duration,
                    confidence: transcriptionResult.confidence,
                    speechAnalysis: speechAnalysis
                };

                // Update question timestamp
                interview.questions[questionIndex].askedAt = new Date();
            }

            // Generate AI follow-up question based on the response
            const followUp = await generateSimpleFollowUp(interview, questionId, transcriptionResult.text);

            // Add follow-up to the question
            if (questionIndex !== -1 && followUp) {
                interview.questions[questionIndex].aiFollowUp.push({
                    question: followUp,
                    askedAt: new Date(),
                    response: null
                });
            }

            await interview.save();

            res.json({
                success: true,
                transcription: {
                    text: transcriptionResult.text,
                    confidence: transcriptionResult.confidence,
                    duration: transcriptionResult.duration,
                    language: transcriptionResult.language
                },
                speechAnalysis: speechAnalysis,
                followUp: followUp,
                audioUrl: `/uploads/interviews/${permanentFileName}`
            });

        } catch (transcriptionError) {
            console.error('Transcription error:', transcriptionError);
            
            // Clean up uploaded file on error
            try {
                await fs.unlink(audioFilePath);
            } catch (unlinkError) {
                console.error('Error cleaning up file:', unlinkError);
            }

            res.status(500).json({ 
                message: 'Failed to transcribe audio', 
                error: transcriptionError.message 
            });
        }

    } catch (error) {
        console.error('Error processing voice response:', error);
        res.status(500).json({ message: 'Failed to process voice response' });
    }
};

// @desc    Complete interview and generate report
// @route   POST /api/ai-interview-coach/:sessionId/complete
// @access  Private
const completeInterview = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;

        const interview = await AIInterview.findOne({ sessionId, user: userId });
        if (!interview) {
            return res.status(404).json({ message: 'Interview session not found' });
        }

        interview.status = 'completed';
        interview.completedAt = new Date();
        
        // Handle case where startedAt might be null
        if (interview.startedAt) {
            interview.totalDuration = Math.round((interview.completedAt - interview.startedAt) / 60000); // minutes
        } else {
            interview.totalDuration = 0;
        }

        // Calculate comprehensive scores
        const scores = await calculateInterviewScores(interview);
        interview.scores = scores;

        // Generate detailed report (pass scores directly)
        const report = await generateInterviewReport(interview, scores);
        interview.report = report;

        await interview.save();

        res.json({
            success: true,
            scores: scores,
            report: report,
            sessionSummary: {
                duration: interview.totalDuration,
                questionsAnswered: interview.questions.filter(q => q.userResponse?.text).length,
                totalQuestions: interview.questions.length
            }
        });

    } catch (error) {
        console.error('Error completing interview:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            message: 'Failed to complete interview',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Get interview history
// @route   GET /api/ai-interview-coach/history
// @access  Private
const getInterviewHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10 } = req.query;

        const interviews = await AIInterview.find({ user: userId })
            .select('sessionId interviewType industryFocus role difficulty status scores createdAt completedAt totalDuration')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await AIInterview.countDocuments({ user: userId });

        res.json({
            success: true,
            interviews,
            pagination: {
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        console.error('Error fetching interview history:', error);
        res.status(500).json({ message: 'Failed to fetch interview history' });
    }
};

// Helper Functions

async function generateInterviewQuestions(interviewType, industryFocus, role, difficulty) {
    const scenarios = INTERVIEW_SCENARIOS[industryFocus] || INTERVIEW_SCENARIOS.startup;
    const questions = scenarios[interviewType] || scenarios.technical;
    
    // Add unique IDs and customize based on role/difficulty
    return questions.map((q, index) => ({
        ...q,
        id: `${q.id}-${index}`,
        askedAt: null,
        userResponse: null,
        aiFollowUp: []
    }));
}

async function generateRealTimeFeedback(interview, type, data) {
    const flags = [];
    
    switch (type) {
        case 'facial':
            if (data.eyeContact && !data.eyeContact.lookingAtCamera) {
                flags.push({
                    type: 'eye-contact',
                    severity: 'warning',
                    message: 'Try to maintain eye contact with the camera',
                    suggestion: 'Look directly at the camera lens, not the screen'
                });
            }
            
            if (data.emotions && data.emotions.nervousness > 0.7) {
                flags.push({
                    type: 'nervousness',
                    severity: 'info',
                    message: 'Take a deep breath and relax',
                    suggestion: 'Remember to breathe slowly and speak at a comfortable pace'
                });
            }
            break;
            
        case 'voice':
            if (data.backgroundNoise && data.backgroundNoise.distracting) {
                flags.push({
                    type: 'background-noise',
                    severity: 'warning',
                    message: `Background noise detected: ${data.backgroundNoise.type}`,
                    suggestion: 'Try to minimize background noise or move to a quieter location'
                });
            }
            
            if (data.pace && data.pace > 200) {
                flags.push({
                    type: 'speaking-pace',
                    severity: 'info',
                    message: 'Speaking a bit fast',
                    suggestion: 'Slow down your speech for better clarity'
                });
            }
            break;
    }
    
    return flags;
}

// Whisper transcription is now handled by whisperService

async function generateSimpleFollowUp(interview, questionId, userResponse) {
    if (!genAI) return null;
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `As an AI interviewer for a ${interview.industryFocus} company, generate a relevant follow-up question based on this response: "${userResponse}". Keep it conversational and probing. Return only the question.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        return response.text().trim();
    } catch (error) {
        console.error('Error generating follow-up question:', error);
        return null;
    }
}

async function calculateInterviewScores(interview) {
    // Implement comprehensive scoring algorithm
    const facialData = interview.analysisData?.facialExpressions || [];
    const voiceData = interview.analysisData?.voiceMetrics || [];
    const environmentData = interview.analysisData?.environmentFlags || [];
    
    // Calculate individual scores (simplified version)
    const eyeContact = calculateEyeContactScore(facialData);
    const voiceClarity = calculateVoiceClarityScore(voiceData);
    const confidence = calculateConfidenceScore(facialData, voiceData);
    const professionalism = calculateProfessionalismScore(environmentData);
    const communication = calculateCommunicationScore(interview.questions);
    
    const overall = Math.round((eyeContact + voiceClarity + confidence + professionalism + communication) / 5);
    
    return {
        overall,
        technical: 75, // This would be calculated based on answer quality
        communication,
        confidence,
        professionalism,
        eyeContact,
        voiceClarity,
        responseRelevance: 80, // Based on AI analysis of responses
        environmentSetup: professionalism,
        bodyLanguage: confidence
    };
}

function calculateEyeContactScore(facialData) {
    if (!facialData.length) return 50;
    
    const eyeContactFrames = facialData.filter(frame => 
        frame.eyeContact && frame.eyeContact.lookingAtCamera
    ).length;
    
    return Math.min(100, Math.round((eyeContactFrames / facialData.length) * 100));
}

function calculateVoiceClarityScore(voiceData) {
    if (!voiceData.length) return 50;
    
    const avgClarity = voiceData.reduce((sum, frame) => sum + (frame.clarity || 0.7), 0) / voiceData.length;
    return Math.round(avgClarity * 100);
}

function calculateConfidenceScore(facialData, voiceData) {
    let score = 70; // baseline
    
    if (facialData.length) {
        const avgConfidence = facialData.reduce((sum, frame) => 
            sum + (frame.emotions?.confidence || 0.5), 0) / facialData.length;
        score = Math.round(avgConfidence * 100);
    }
    
    return Math.min(100, Math.max(0, score));
}

function calculateProfessionalismScore(environmentData) {
    let score = 80; // baseline
    
    environmentData.forEach(env => {
        if (env.background && !env.background.professional) score -= 10;
        if (env.background && env.background.distracting) score -= 15;
        if (env.lighting && env.lighting.quality === 'poor') score -= 10;
        if (env.interruptions && env.interruptions.length > 0) {
            score -= env.interruptions.length * 5;
        }
    });
    
    return Math.min(100, Math.max(0, score));
}

function calculateCommunicationScore(questions) {
    const answeredQuestions = questions.filter(q => q.userResponse?.text);
    if (!answeredQuestions.length) return 0;
    
    // This would use AI to analyze response quality
    // For now, returning a baseline score
    return 75;
}

async function generateInterviewReport(interview, scores) {
    // Use passed scores parameter instead of interview.scores
    
    const strengths = [];
    const improvements = [];
    
    if (scores.eyeContact >= 80) strengths.push("Excellent eye contact throughout the interview");
    else if (scores.eyeContact < 60) improvements.push("Maintain better eye contact with the camera");
    
    if (scores.voiceClarity >= 80) strengths.push("Clear and articulate speech");
    else if (scores.voiceClarity < 60) improvements.push("Work on speaking more clearly and at an appropriate pace");
    
    if (scores.confidence >= 80) strengths.push("Demonstrated strong confidence");
    else if (scores.confidence < 60) improvements.push("Practice to build confidence in your responses");
    
    return {
        strengths,
        improvements,
        detailedFeedback: [
            {
                category: "Eye Contact & Body Language",
                score: scores.eyeContact,
                feedback: scores.eyeContact >= 70 ? "Good eye contact maintained" : "Need to improve eye contact",
                suggestions: ["Look directly at the camera", "Maintain good posture", "Use natural hand gestures"]
            },
            {
                category: "Voice & Communication",
                score: scores.voiceClarity,
                feedback: scores.voiceClarity >= 70 ? "Clear communication" : "Work on voice clarity",
                suggestions: ["Speak at moderate pace", "Minimize filler words", "Project confidence in your voice"]
            }
        ],
        nextSteps: [
            "Practice mock interviews regularly",
            "Record yourself to review body language",
            "Work on technical knowledge gaps identified"
        ],
        practiceRecommendations: [
            "Schedule follow-up interview in 1 week",
            "Focus on system design questions",
            "Practice behavioral responses using STAR method"
        ]
    };
}

module.exports = {
    createInterviewSession,
    startInterview,
    submitAnalysisData,
    generateFollowUpQuestion,
    processVoiceResponse,
    completeInterview,
    getInterviewHistory,
    upload
};
