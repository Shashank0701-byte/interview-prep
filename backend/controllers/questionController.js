// File: backend/controllers/questionController.js

const Question = require("../models/Question");
const Session = require("../models/Session");

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
        res.status(201).json(createdQuestions);

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Pin or unpin a question
// @route   POST /api/questions/:id/pin
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
// @route   POST /api/questions/:id/note
// @access  Private
const updateQuestionNote = async (req, res) => {
    try {
        const { note } = req.body;
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }

        // Ensure the user owns this question's session
        const session = await Session.findById(question.session);
        if (session.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        // Use the 'note' field to be consistent
        question.note = note || "";
        await question.save();

        res.status(200).json({ success: true, question });
    } catch (error) {
        console.error("Error updating note:", error);
        res.status(500).json({ message: "Server Error" });
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

        const session = await Session.findById(question.session);
        if (session.user.toString() !== userId.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        question.isMastered = !question.isMastered;
        await question.save();

        res.status(200).json({ message: "Status updated successfully", question });
    } catch (error) {
        console.error("Error toggling mastered status:", error);
        res.status(500).json({ message: "Server Error" });
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

module.exports = {
    addQuestionsToSession,
    togglePinQuestion,
    updateQuestionNote,
    toggleMasteredStatus,
    reviewQuestion,
    updateQuestionRating,
    updateQuestionJustification,
    getFilteredQuestions,
};
