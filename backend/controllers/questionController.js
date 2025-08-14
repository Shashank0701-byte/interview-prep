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
            return res
                .status(404)
                .json({ success: false, message: "Question not found" });
        }

        question.note = note || "";
        await question.save();

        res.status(200).json({ success: true, question });
    } catch (error) {
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

// @desc    Review a question and record performance
// @route   PUT /api/questions/:id/review
// @access  Private
const reviewQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { quality } = req.body; // e.g., 'forgot', 'hard', 'good'
        const userId = req.user._id;

        const question = await Question.findById(id);
        if (!question) return res.status(404).json({ message: "Question not found" });

        const session = await Session.findById(question.session);
        if (session.user.toString() !== userId.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        // --- ✅ 1. RECORD PERFORMANCE SCORE ---
        // We convert the quality rating into a number for the charts.
        let performanceScore = 0;
        if (quality === 'hard') {
            performanceScore = 0.5; // Remembered, but with difficulty
        } else if (quality === 'good') {
            performanceScore = 1.0; // Remembered well
        }
        // 'forgot' will have a score of 0

        // Add the new review to the question's history
        question.performanceHistory.push({
            reviewDate: new Date(),
            performanceScore: performanceScore,
        });


        // --- ✅ 2. UPDATE SPACED REPETITION (Existing Logic) ---
        let { reviewInterval = 1 } = question; // Default to 1 day if undefined
        
        if (quality === 'forgot') {
            reviewInterval = 1; // Reset to 1 day
        } else if (quality === 'hard') {
            reviewInterval = Math.ceil(reviewInterval * 1.2); // Increase slowly
        } else if (quality === 'good') {
            reviewInterval = Math.ceil(reviewInterval * 2.0); // Increase faster
        }

        question.reviewInterval = reviewInterval;
        question.dueDate = new Date(Date.now() + reviewInterval * 24 * 60 * 60 * 1000);

        await question.save();
        res.status(200).json({ message: "Review recorded", question });

    } catch (error) {
        console.error("Error reviewing question:", error);
        res.status(500).json({ message: "Server Error" });
    }
};


module.exports = {
    addQuestionsToSession,
    togglePinQuestion,
    updateQuestionNote,
    toggleMasteredStatus,
    reviewQuestion,
};
