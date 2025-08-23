const { GoogleGenerativeAI } = require('@google/generative-ai');
const InterviewSession = require('../models/InterviewSession');
const Company = require('../models/Company');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Start a new AI interview session
// @route   POST /api/ai-interview/start
// @access  Private
const startInterviewSession = async (req, res) => {
    try {
        const { role, experience, interviewType, difficulty, companyId } = req.body;
        const userId = req.user._id;

        // Generate interview questions based on parameters
        const questions = await generateInterviewQuestions(role, experience, interviewType, difficulty, companyId);

        // Create interview session
        const interviewSession = await InterviewSession.create({
            user: userId,
            company: companyId || null,
            role,
            experience,
            interviewType,
            difficulty,
            questions: questions.map(q => ({
                question: q.question,
                category: q.category,
                difficulty: q.difficulty
            }))
        });

        res.status(201).json({
            success: true,
            data: {
                sessionId: interviewSession._id,
                questions: interviewSession.questions,
                totalQuestions: questions.length
            }
        });

    } catch (error) {
        console.error('AI Interview Start Error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to start interview session",
            error: error.message
        });
    }
};

// @desc    Submit answer for a question and get AI feedback
// @route   POST /api/ai-interview/:sessionId/answer
// @access  Private
const submitAnswer = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { questionIndex, audioUrl, transcription, timeSpent } = req.body;
        const userId = req.user._id;

        // Verify session belongs to user
        const session = await InterviewSession.findOne({ _id: sessionId, user: userId });
        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Interview session not found"
            });
        }

        if (questionIndex >= session.questions.length) {
            return res.status(400).json({
                success: false,
                message: "Invalid question index"
            });
        }

        // Get AI feedback on the answer
        const feedback = await generateAnswerFeedback(
            session.questions[questionIndex].question,
            transcription,
            session.role,
            session.interviewType
        );

        // Update the question with answer and feedback
        session.questions[questionIndex].userAnswer = transcription;
        session.questions[questionIndex].audioUrl = audioUrl;
        session.questions[questionIndex].transcription = transcription;
        session.questions[questionIndex].timeSpent = timeSpent;
        session.questions[questionIndex].feedback = feedback;
        session.questions[questionIndex].score = calculateQuestionScore(feedback);

        // Update analytics
        session.analytics.confidenceTrend.push(feedback.confidence);
        session.analytics.fillerWordTrend.push(feedback.fillerWords);
        session.analytics.responseTimeTrend.push(timeSpent);

        await session.save();

        res.status(200).json({
            success: true,
            data: {
                feedback,
                score: session.questions[questionIndex].score,
                nextQuestion: questionIndex + 1 < session.questions.length ? session.questions[questionIndex + 1] : null
            }
        });

    } catch (error) {
        console.error('AI Interview Answer Error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to process answer",
            error: error.message
        });
    }
};

// @desc    Complete interview session and get overall feedback
// @route   POST /api/ai-interview/:sessionId/complete
// @access  Private
const completeInterviewSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;

        const session = await InterviewSession.findOne({ _id: sessionId, user: userId });
        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Interview session not found"
            });
        }

        // Calculate overall score
        const totalScore = session.questions.reduce((sum, q) => sum + q.score, 0);
        const overallScore = Math.round(totalScore / session.questions.length);

        // Generate overall feedback
        const overallFeedback = await generateOverallFeedback(session);

        // Update session
        session.status = 'Completed';
        session.overallScore = overallScore;
        session.endTime = new Date();
        session.totalTime = Math.round((session.endTime - session.startTime) / 1000);

        await session.save();

        res.status(200).json({
            success: true,
            data: {
                overallScore,
                overallFeedback,
                totalTime: session.totalTime,
                questionBreakdown: session.questions.map(q => ({
                    question: q.question,
                    score: q.score,
                    feedback: q.feedback
                }))
            }
        });

    } catch (error) {
        console.error('AI Interview Complete Error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to complete interview session",
            error: error.message
        });
    }
};

// @desc    Get interview session details
// @route   GET /api/ai-interview/:sessionId
// @access  Private
const getInterviewSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;

        const session = await InterviewSession.findOne({ _id: sessionId, user: userId })
            .populate('company', 'name logo industry');

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Interview session not found"
            });
        }

        res.status(200).json({
            success: true,
            data: session
        });

    } catch (error) {
        console.error('Get Interview Session Error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to get interview session",
            error: error.message
        });
    }
};

// Helper Functions
const generateInterviewQuestions = async (role, experience, interviewType, difficulty, companyId) => {
    try {
        let companyContext = '';
        if (companyId) {
            const company = await Company.findById(companyId);
            if (company) {
                companyContext = `for ${company.name} (${company.culture.interviewStyle} style, ${company.culture.difficulty} difficulty)`;
            }
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest",
            generationConfig: {
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
            },
        });

        const prompt = `Generate 5 ${interviewType} interview questions ${companyContext} for a ${role} with ${experience} years of experience. Difficulty level: ${difficulty}.

        Return a JSON array like:
        [
            {
                "question": "Question text here?",
                "category": "Technical/Behavioral/System Design",
                "difficulty": "Easy/Medium/Hard"
            }
        ]

        Make questions realistic and current (2024-2025).`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text());

    } catch (error) {
        console.error('Question Generation Error:', error);
        // Fallback questions
        return [
            {
                question: "Tell me about a challenging project you worked on.",
                category: "Behavioral",
                difficulty: "Medium"
            },
            {
                question: "How would you approach debugging a production issue?",
                category: "Technical",
                difficulty: "Medium"
            }
        ];
    }
};

const generateAnswerFeedback = async (question, answer, role, interviewType) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest",
            generationConfig: {
                maxOutputTokens: 4096,
                responseMimeType: "application/json",
            },
        });

        const prompt = `Analyze this interview answer and provide detailed feedback:

        Question: ${question}
        Answer: ${answer}
        Role: ${role}
        Interview Type: ${interviewType}

        Return JSON with:
        {
            "content": "Feedback on answer content",
            "tone": "Professional/Confident/Nervous/etc",
            "confidence": 85,
            "clarity": 90,
            "technicalAccuracy": 88,
            "fillerWords": 3,
            "suggestions": ["Suggestion 1", "Suggestion 2"]
        }

        Confidence, clarity, and technical accuracy should be 0-100 scores.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text());

    } catch (error) {
        console.error('Feedback Generation Error:', error);
        return {
            content: "Good answer with room for improvement",
            tone: "Professional",
            confidence: 75,
            clarity: 80,
            technicalAccuracy: 75,
            fillerWords: 2,
            suggestions: ["Provide more specific examples", "Structure your response better"]
        };
    }
};

const generateOverallFeedback = async (session) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest",
            generationConfig: {
                maxOutputTokens: 2048,
                responseMimeType: "application/json",
            },
        });

        const prompt = `Provide overall feedback for this interview session:

        Role: ${session.role}
        Experience: ${session.experience}
        Overall Score: ${session.overallScore}/100
        Interview Type: ${session.interviewType}

        Return JSON with:
        {
            "summary": "Overall performance summary",
            "strengths": ["Strength 1", "Strength 2"],
            "improvementAreas": ["Area 1", "Area 2"],
            "recommendations": ["Recommendation 1", "Recommendation 2"]
        }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text());

    } catch (error) {
        console.error('Overall Feedback Error:', error);
        return {
            summary: "Good performance with areas for improvement",
            strengths: ["Technical knowledge", "Communication skills"],
            improvementAreas: ["Confidence", "Specific examples"],
            recommendations: ["Practice more behavioral questions", "Work on confidence"]
        };
    }
};

const calculateQuestionScore = (feedback) => {
    const weights = {
        confidence: 0.25,
        clarity: 0.25,
        technicalAccuracy: 0.3,
        fillerWords: 0.2
    };

    const fillerWordScore = Math.max(0, 100 - (feedback.fillerWords * 10));
    
    return Math.round(
        feedback.confidence * weights.confidence +
        feedback.clarity * weights.clarity +
        feedback.technicalAccuracy * weights.technicalAccuracy +
        fillerWordScore * weights.fillerWords
    );
};

module.exports = {
    startInterviewSession,
    submitAnswer,
    completeInterviewSession,
    getInterviewSession
};
