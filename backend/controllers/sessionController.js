const Session = require("../models/Session");
const Question = require("../models/Question");

// Define all your controller functions as constants
const createSession = async (req, res) => {
    try {
        const { role, experience, topicsToFocus, description, questions, numberOfQuestions } = req.body;
        const userId = req.user._id;

        const session = await Session.create({
            user: userId,
            role,
            experience,
            topicsToFocus,
            description,
        });

        let questionDocs = [];
        
        // Handle numberOfQuestions parameter
        if (numberOfQuestions && parseInt(numberOfQuestions) > 0) {
            const numQuestions = parseInt(numberOfQuestions);
            const topicsArray = topicsToFocus ? topicsToFocus.split(',').map(topic => topic.trim()).filter(topic => topic) : [];
            
            // Generate placeholder questions based on topics and role
            for (let i = 0; i < numQuestions; i++) {
                const question = await Question.create({
                    session: session._id,
                    question: generateQuestion(role, experience, topicsArray, i),
                    answer: generateAnswer(role, experience, topicsArray, i),
                    difficulty: getDifficultyLevel(experience),
                    category: topicsArray.length > 0 ? topicsArray[i % topicsArray.length] : 'General'
                });
                questionDocs.push(question._id);
            }
        }
        // Fallback to original questions array if provided
        else if (questions && questions.length > 0) {
            questionDocs = await Promise.all(
                questions.map(async (q) => {
                    const question = await Question.create({
                        session: session._id,
                        question: q.question,
                        answer: q.answer,
                    });
                    return question._id;
                })
            );
        }

        session.questions = questionDocs;
        await session.save();

        res.status(201).json({ success: true, session });
    } catch (error) {
        console.error("ERROR IN createSession:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Helper function to generate questions based on role and topics
const generateQuestion = (role, experience, topics, index) => {
    const questionTemplates = {
        'Software Engineer': [
            `Explain the concept of ${topics[index % topics.length] || 'data structures'} and provide a real-world example.`,
            `How would you optimize a solution involving ${topics[index % topics.length] || 'algorithms'}?`,
            `What are the trade-offs when implementing ${topics[index % topics.length] || 'system design'}?`
        ],
        'Frontend Developer': [
            `How would you implement ${topics[index % topics.length] || 'React components'} for optimal performance?`,
            `Explain the best practices for ${topics[index % topics.length] || 'CSS styling'} in modern web applications.`,
            `What are the challenges with ${topics[index % topics.length] || 'state management'} and how do you solve them?`
        ],
        'Backend Developer': [
            `How would you design a database schema for ${topics[index % topics.length] || 'user management'}?`,
            `Explain the security considerations for ${topics[index % topics.length] || 'API development'}.`,
            `What scaling strategies would you use for ${topics[index % topics.length] || 'backend services'}?`
        ],
        'Full Stack Developer': [
            `How would you architect a full-stack application for ${topics[index % topics.length] || 'e-commerce'}?`,
            `Explain the integration between frontend and backend for ${topics[index % topics.length] || 'data handling'}.`,
            `What are the best practices for ${topics[index % topics.length] || 'full-stack development'}?`
        ],
        'DevOps Engineer': [
            `How would you set up CI/CD pipeline for ${topics[index % topics.length] || 'deployment automation'}?`,
            `Explain the monitoring strategy for ${topics[index % topics.length] || 'infrastructure'}.`,
            `What are the security best practices for ${topics[index % topics.length] || 'DevOps processes'}?`
        ]
    };
    
    const templates = questionTemplates[role] || questionTemplates['Software Engineer'];
    return templates[index % templates.length];
};

// Helper function to generate answers
const generateAnswer = (role, experience, topics, index) => {
    return `This is a comprehensive answer related to ${topics[index % topics.length] || 'the topic'} for a ${role} with ${experience} years of experience. The answer would include detailed explanations, code examples, and best practices specific to the role and experience level.`;
};

// Helper function to determine difficulty level
const getDifficultyLevel = (experience) => {
    const exp = parseInt(experience);
    if (exp <= 2) return 'Easy';
    if (exp <= 4) return 'Medium';
    return 'Hard';
};

const getMySessions = async (req, res) => {
    try {
        const sessions = await Session.find({ user: req.user._id }) // Using ._id for consistency
            .sort({ createdAt: -1 })
            .populate("questions");
        
        // ✅ FIX: Send the data back in an object with a 'sessions' key, as the frontend expects.
        res.status(200).json({ success: true, sessions: sessions });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getSessionById = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id)
            .populate({
                path: "questions",
                options: { sort: { isPinned: -1, createdAt: 1 } },
            })
            .exec();

        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }

        res.status(200).json({ success: true, session });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const deleteSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        if (session.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to delete this session" });
        }

        await Question.deleteMany({ session: session._id });
        await session.deleteOne();

        res.status(200).json({ success: true, message: "Session deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const getReviewQueue = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();

        const userSessions = await Session.find({ user: userId }).select('_id');
        const sessionIds = userSessions.map(s => s._id);

        const reviewQueue = await Question.find({
            session: { $in: sessionIds },
            dueDate: { $lte: now }
        }).sort({ dueDate: 1 });

        res.status(200).json({ reviewQueue });
    } catch (error) {
        console.error("Error fetching review queue:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Update session rating
// @route   PUT /api/sessions/:id/rating
// @access  Private
const updateSessionRating = async (req, res) => {
    try {
        const { id } = req.params;
        const { overall, difficulty, usefulness } = req.body;
        const userId = req.user._id;

        // Validate rating values
        const ratings = { overall, difficulty, usefulness };
        for (const [key, value] of Object.entries(ratings)) {
            if (value !== undefined && (value < 1 || value > 5)) {
                return res.status(400).json({ message: `${key} rating must be between 1 and 5` });
            }
        }

        const session = await Session.findById(id);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        // Verify the session belongs to the user
        if (session.user.toString() !== userId.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        // Update ratings
        if (overall !== undefined) session.userRating.overall = overall;
        if (difficulty !== undefined) session.userRating.difficulty = difficulty;
        if (usefulness !== undefined) session.userRating.usefulness = usefulness;

        await session.save();
        res.status(200).json({ message: "Rating updated successfully", session });

    } catch (error) {
        console.error("Error updating session rating:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Update session progress
// @route   PUT /api/sessions/:id/progress
// @access  Private
const updateSessionProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const session = await Session.findById(id).populate('questions');
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        if (session.user.toString() !== userId.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        // Calculate progress based on mastered questions
        const totalQuestions = session.questions.length;
        const masteredQuestions = session.questions.filter(q => q.isMastered).length;
        const completionPercentage = totalQuestions > 0 ? Math.round((masteredQuestions / totalQuestions) * 100) : 0;

        session.masteredQuestions = masteredQuestions;
        session.completionPercentage = completionPercentage;

        // Auto-update status based on progress
        if (completionPercentage === 100) {
            session.status = 'Completed';
        } else if (completionPercentage > 0) {
            session.status = 'Active';
        }

        await session.save();
        res.status(200).json({ message: "Progress updated successfully", session });

    } catch (error) {
        console.error("Error updating session progress:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    createSession,
    getMySessions,
    getSessionById,
    deleteSession,
    getReviewQueue,
    updateSessionRating,
    updateSessionProgress,
};
