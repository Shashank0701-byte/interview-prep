// File: backend/controllers/questionController.js

const Question = require("../models/Question");
const Session = require("../models/Session");
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI (with error handling)
let genAI;
try {
    if (process.env.GOOGLE_AI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
        console.log('✅ Gemini AI initialized successfully');
    } else {
        console.warn('⚠️ GOOGLE_AI_API_KEY not found - Gemini features will be disabled');
    }
} catch (error) {
    console.error('❌ Error initializing Gemini AI:', error);
}

// @desc    Add additional questions to an existing session
// @route   POST /api/questions/add
// @access  Private
const addQuestionsToSession = async (req, res) => {
    try {
        const { sessionId, questions } = req.body;

        if (!sessionId || !questions || !Array.isArray(questions)) {
            return res.status(400).json({ message: "Invalid input data" });
        }

        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        const createdQuestions = await Question.insertMany(
            questions.map((q) => ({
                session: sessionId,
                question: q.question,
                answer: q.answer,
            }))
        );
        
        session.questions.push(...createdQuestions.map((q) => q._id));
        await session.save();
        
        // Add a small delay to ensure database consistency
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Recalculate session progress after adding new questions
        const sessionWithQuestions = await Session.findById(sessionId).populate('questions');
        const totalQuestions = sessionWithQuestions.questions.length;
        const masteredQuestions = sessionWithQuestions.questions.filter(q => q.isMastered).length;
        const completionPercentage = totalQuestions > 0 ? Math.round((masteredQuestions / totalQuestions) * 100) : 0;

        console.log(`Session ${sessionId} progress update:`, {
            totalQuestions,
            masteredQuestions,
            completionPercentage,
            previousStatus: sessionWithQuestions.status
        });

        sessionWithQuestions.masteredQuestions = masteredQuestions;
        sessionWithQuestions.completionPercentage = completionPercentage;

        // Update status based on new progress
        if (completionPercentage === 100) {
            sessionWithQuestions.status = 'Completed';
        } else if (completionPercentage > 0) {
            sessionWithQuestions.status = 'Active';
        } else {
            sessionWithQuestions.status = 'Active'; // Default for sessions with questions
        }

        await sessionWithQuestions.save();
        
        console.log(`Session ${sessionId} updated:`, {
            newStatus: sessionWithQuestions.status,
            masteredQuestions: sessionWithQuestions.masteredQuestions,
            completionPercentage: sessionWithQuestions.completionPercentage
        });
        
        // Return both created questions and updated session info
        res.status(201).json({
            questions: createdQuestions,
            session: {
                id: sessionWithQuestions._id,
                masteredQuestions: sessionWithQuestions.masteredQuestions,
                completionPercentage: sessionWithQuestions.completionPercentage,
                status: sessionWithQuestions.status,
                totalQuestions: sessionWithQuestions.questions.length
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Pin or unpin a question
// @route   PUT /api/questions/:id/pin
// @access  Private
const togglePinQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res
                .status(404)
                .json({ success: false, message: "Question not found" });
        }

        question.isPinned = !question.isPinned;
        await question.save();

        res.status(200).json({ success: true, question });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Update a note for a question
// @route   PUT /api/questions/:id/note
// @access  Private
const updateQuestionNote = async (req, res) => {
    try {
        const { note } = req.body;
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }

        // Check both Session and RoadmapSession models
        let session = await Session.findById(question.session);
        if (!session) {
            const RoadmapSession = require('../models/RoadmapSession');
            session = await RoadmapSession.findById(question.session);
        }
        
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        
        if (session.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        // Use the 'note' field to be consistent
        question.note = note || "";
        await question.save();

        res.status(200).json({ success: true, question });
    } catch (error) {
        console.error("Error updating note:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const toggleMasteredStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const question = await Question.findById(id);

        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Check both Session and RoadmapSession models
        let session = await Session.findById(question.session);
        let isRoadmapSession = false;
        
        if (!session) {
            // Try RoadmapSession
            const RoadmapSession = require('../models/RoadmapSession');
            session = await RoadmapSession.findById(question.session);
            isRoadmapSession = true;
        }
        
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        
        if (session.user.toString() !== userId.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        question.isMastered = !question.isMastered;
        await question.save();

        // Auto-update session progress when mastery status changes
        const SessionModel = isRoadmapSession ? require('../models/RoadmapSession') : Session;
        const sessionWithQuestions = await SessionModel.findById(question.session).populate('questions');
        
        if (sessionWithQuestions) {
            const totalQuestions = sessionWithQuestions.questions.length;
            const masteredQuestions = sessionWithQuestions.questions.filter(q => q.isMastered).length;
            const completionPercentage = totalQuestions > 0 ? Math.round((masteredQuestions / totalQuestions) * 100) : 0;

            sessionWithQuestions.masteredQuestions = masteredQuestions;
            sessionWithQuestions.completionPercentage = completionPercentage;

            // Auto-update status based on progress
            if (completionPercentage === 100) {
                sessionWithQuestions.status = 'Completed';
            } else if (completionPercentage > 0) {
                sessionWithQuestions.status = 'Active';
            }

            await sessionWithQuestions.save();
        }

        res.status(200).json({ message: "Status updated successfully", question });
    } catch (error) {
        console.error("Error toggling mastered status:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Review a question and update its spaced repetition data
// @route   PUT /api/questions/:id/review
// @access  Private
const reviewQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { quality } = req.body; // Expects 'again', 'hard', 'good', or 'easy'
        const userId = req.user._id;

        // Validate the quality input
        if (!['again', 'hard', 'good', 'easy'].includes(quality)) {
            return res.status(400).json({ message: "Invalid quality value provided." });
        }

        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Verify the question belongs to the user
        const session = await Session.findById(question.session);
        if (session.user.toString() !== userId.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        // --- 1. RECORD PERFORMANCE SCORE ---
        let performanceScore = 0;
        if (quality === 'hard') {
            performanceScore = 0.5;
        } else if (quality === 'good' || quality === 'easy') {
            performanceScore = 1.0;
        }
        // For 'again', the performanceScore remains 0

        question.performanceHistory.push({
            reviewDate: new Date(),
            performanceScore: performanceScore,
        });

        // --- 2. UPDATE SPACED REPETITION INTERVAL ---
        let { reviewInterval = 1 } = question;
        
        if (quality === 'again') {
            reviewInterval = 1; // Reset progress, show again in 1 day
        } else if (quality === 'hard') {
            reviewInterval = Math.ceil(reviewInterval * 1.2); // Increase slowly
        } else if (quality === 'good') {
            reviewInterval = Math.ceil(reviewInterval * 2.0); // Standard increase
        } else if (quality === 'easy') {
            reviewInterval = Math.ceil(reviewInterval * 3.0); // Larger increase
        }

        question.reviewInterval = reviewInterval;
        question.dueDate = new Date(Date.now() + reviewInterval * 24 * 60 * 60 * 1000);

        await question.save();
        res.status(200).json({ message: "Review recorded successfully", question });

    } catch (error) {
        console.error("Error reviewing question:", error);
        res.status(500).json({ message: "Server Error" });
    }
};





// @desc    Update question rating
// @route   PUT /api/questions/:id/rating
// @access  Private
const updateQuestionRating = async (req, res) => {
    try {
        const { id } = req.params;
        const { userRating } = req.body;
        const userId = req.user._id;

        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Verify the question belongs to the user
        const session = await Session.findById(question.session);
        if (session.user.toString() !== userId.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        // Update the user rating
        question.userRating = {
            difficulty: userRating.difficulty || 3,
            usefulness: userRating.usefulness || 3,
            clarity: userRating.clarity || 3
        };

        await question.save();
        res.status(200).json({ message: "Rating updated successfully", question });

    } catch (error) {
        console.error("Error updating question rating:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Update question justification (admin only for now)
// @route   PUT /api/questions/:id/justification
// @access  Private
const updateQuestionJustification = async (req, res) => {
    try {
        const { id } = req.params;
        const { probability, reasoning, commonCompanies, interviewType } = req.body;

        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        // Update justification fields
        if (probability !== undefined) question.justification.probability = probability;
        if (reasoning !== undefined) question.justification.reasoning = reasoning;
        if (commonCompanies !== undefined) question.justification.commonCompanies = commonCompanies;
        if (interviewType !== undefined) question.justification.interviewType = interviewType;

        await question.save();
        res.status(200).json({ message: "Justification updated successfully", question });

    } catch (error) {
        console.error("Error updating question justification:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get questions with filtering options
// @route   GET /api/questions/filter
// @access  Private
const getFilteredQuestions = async (req, res) => {
    try {
        const userId = req.user._id;
        const { 
            difficulty, 
            category, 
            interviewType, 
            probability, 
            isPinned, 
            isMastered,
            minRating,
            tags 
        } = req.query;

        // Build filter object
        let filter = {};
        
        // Get user's sessions first
        const sessions = await Session.find({ user: userId });
        const sessionIds = sessions.map(session => session._id);
        filter.session = { $in: sessionIds };

        if (difficulty) filter.difficulty = difficulty;
        if (category) filter.category = category;
        if (interviewType) filter['justification.interviewType'] = interviewType;
        if (probability) filter['justification.probability'] = probability;
        if (isPinned !== undefined) filter.isPinned = isPinned === 'true';
        if (isMastered !== undefined) filter.isMastered = isMastered === 'true';
        if (tags) filter.tags = { $in: tags.split(',') };

        let questions = await Question.find(filter).populate('session');

        // Filter by minimum rating if specified
        if (minRating) {
            const minRatingNum = parseFloat(minRating);
            questions = questions.filter(q => {
                const avgRating = (q.userRating.difficulty + q.userRating.usefulness + q.userRating.clarity) / 3;
                return avgRating >= minRatingNum;
            });
        }

        res.status(200).json({ questions });

    } catch (error) {
        console.error("Error filtering questions:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Generate questions using Gemini AI
// @route   POST /api/questions/generate
// @access  Private
const generateQuestionsWithGemini = async (req, res) => {
    try {
        const { topic, count = 10 } = req.body;

        if (!topic) {
            return res.status(400).json({ message: "Topic is required" });
        }

        console.log('🚀 Generating questions for topic:', topic);
        
        // Check if Gemini AI is initialized
        if (!genAI) {
            console.error('❌ Gemini AI not initialized - check API key configuration');
            return res.status(500).json({ message: "AI service not available" });
        }
        
        console.log('✅ Gemini AI available, listing available models...');
        
        // First, let's see what models are available
        try {
            const models = await genAI.listModels();
            console.log('Available models:', models.map(m => m.name));
        } catch (listError) {
            console.log('Could not list models:', listError.message);
        }

        let model;
        try {
            // Use the same working model configurations from aiController.js
            const modelConfigs = [
                { name: "models/gemini-flash-latest", config: { responseMimeType: "application/json" } },
                { name: "models/gemini-2.5-flash", config: { responseMimeType: "application/json" } },
                { name: "models/gemini-2.0-flash", config: { responseMimeType: "application/json" } },
                { name: "models/gemini-pro-latest", config: { responseMimeType: "application/json" } },
                { name: "models/gemini-flash-latest", config: {} },
                { name: "models/gemini-2.5-flash", config: {} },
            ];
            
            let modelCreated = false;
            for (const { name, config } of modelConfigs) {
                try {
                    console.log(`Trying model: ${name} with config:`, config);
                    
                    model = genAI.getGenerativeModel({
                        model: name,
                        generationConfig: config,
                    });
                    console.log(`✅ Gemini model initialized successfully with: ${name}`);
                    modelCreated = true;
                    break;
                } catch (modelError) {
                    console.log(`❌ Model ${name} failed:`, modelError.message);
                    continue;
                }
            }
            
            if (!modelCreated) {
                throw new Error('No available Gemini models found');
            }
        } catch (modelError) {
            console.error('❌ Error initializing Gemini model:', modelError);
            return res.status(500).json({ message: "Failed to initialize AI model", error: modelError.message });
        }

        const prompt = `Generate ${count} interview preparation questions for the topic: "${topic}".

Please return the questions in this exact JSON format:
[
  {
    "id": "unique-id-1",
    "type": "coding",
    "title": "Question Title",
    "description": "Detailed question description",
    "difficulty": "Easy",
    "starterCode": "// Starter code here",
    "solution": "// Solution code here"
  },
  {
    "id": "unique-id-2", 
    "type": "code-review",
    "title": "Code Review Question",
    "description": "Review this code and identify issues",
    "difficulty": "Medium",
    "codeToReview": "// Code to review here",
    "issues": [
      {
        "line": 1,
        "type": "bug",
        "description": "Issue description"
      }
    ]
  }
]

Requirements:
1. Mix of coding challenges and code review questions
2. Use appropriate syntax for the topic (JavaScript, Python, Java, etc.)
3. Include realistic starter code and solutions
4. For code-review questions, include actual issues with line numbers
5. Make questions interview-relevant and practical
6. Vary difficulty levels (Easy: 30%, Medium: 50%, Hard: 20%)
7. Ensure all code examples are syntactically correct
8. Focus on ${topic}-specific concepts and best practices

Return ONLY the JSON array, no additional text.`;

        console.log('📤 Sending prompt to Gemini...');
        
        let result, response, text;
        try {
            result = await model.generateContent(prompt);
            response = await result.response;
            text = response.text();
            console.log('📥 Received response from Gemini:', text.substring(0, 200) + '...');
        } catch (apiError) {
            console.error('❌ Error calling Gemini API:', apiError);
            return res.status(500).json({ message: "Failed to call AI API", error: apiError.message });
        }

        // Parse the JSON response
        let questions;
        try {
            // First try to parse as direct JSON
            questions = JSON.parse(text);
            console.log('✅ Successfully parsed as direct JSON:', questions.length, 'questions');
        } catch (directParseError) {
            console.log('❌ Direct JSON parse failed, trying to extract JSON from text...');
            
            // Try to extract JSON array from text response
            const jsonMatch = text.match(/\[[\s\S]*?\]/);
            if (jsonMatch) {
                try {
                    questions = JSON.parse(jsonMatch[0]);
                    console.log('✅ Successfully extracted and parsed JSON:', questions.length, 'questions');
                } catch (extractParseError) {
                    console.error('❌ Failed to parse extracted JSON:', extractParseError);
                    console.error('Extracted text:', jsonMatch[0].substring(0, 200));
                    return res.status(500).json({ message: "Failed to parse AI response JSON" });
                }
            } else {
                console.error('❌ No JSON array found in response');
                console.error('Full response:', text.substring(0, 500));
                return res.status(500).json({ message: "No valid JSON found in AI response" });
            }
        }

        // Validate and sanitize questions
        const sanitizedQuestions = questions.map((q, index) => ({
            id: q.id || `${topic.toLowerCase()}-gemini-${index + 1}`,
            type: q.type || 'coding',
            title: q.title || `${topic} Question ${index + 1}`,
            description: q.description || 'No description provided',
            difficulty: q.difficulty || 'Medium',
            starterCode: q.starterCode || '',
            codeToReview: q.codeToReview || '',
            solution: q.solution || '',
            issues: q.issues || []
        }));

        res.status(200).json({ 
            success: true, 
            questions: sanitizedQuestions,
            topic: topic,
            count: sanitizedQuestions.length
        });

    } catch (error) {
        console.error('❌ Error generating questions:', error);
        res.status(500).json({ 
            message: "Failed to generate questions", 
            error: error.message 
        });
    }
};

// @desc    Test Gemini API and list available models
// @route   GET /api/questions/test-gemini
// @access  Private
const testGeminiAPI = async (req, res) => {
    try {
        if (!genAI) {
            return res.status(500).json({ message: "Gemini AI not initialized" });
        }

        console.log('Testing Gemini API...');

        // Test with the same models from aiController.js
        const testModels = [
            'models/gemini-flash-latest',
            'models/gemini-2.5-flash',
            'models/gemini-2.0-flash',
            'models/gemini-pro-latest'
        ];

        let workingModel = null;
        let testResult = null;

        for (const modelName of testModels) {
            try {
                console.log(`Testing model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Say hello');
                const response = await result.response;
                const text = response.text();
                
                console.log(`✅ Model ${modelName} works! Response:`, text.substring(0, 100));
                workingModel = modelName;
                testResult = text;
                break;
            } catch (error) {
                console.log(`❌ Model ${modelName} failed:`, error.message);
            }
        }

        if (workingModel) {
            res.status(200).json({
                success: true,
                workingModel: workingModel,
                response: testResult,
                message: "Gemini API is working"
            });
        } else {
            res.status(500).json({
                success: false,
                message: "No working Gemini models found",
                testedModels: testModels
            });
        }

    } catch (error) {
        console.error('Error testing Gemini API:', error);
        res.status(500).json({ 
            success: false,
            message: "Failed to test Gemini API", 
            error: error.message 
        });
    }
};

module.exports = {
    addQuestionsToSession,
    togglePinQuestion,
    updateQuestionNote,
    toggleMasteredStatus,
    reviewQuestion,
    updateQuestionRating,
    updateQuestionJustification,
    getFilteredQuestions,
    generateQuestionsWithGemini,
    testGeminiAPI,
};
