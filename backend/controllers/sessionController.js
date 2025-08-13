const Session = require("../models/Session");
const Question = require("../models/Question");

// Define all your controller functions as constants
const createSession = async (req, res) => {
    try {
        const { role, experience, topicsToFocus, description, questions } = req.body;
        const userId = req.user._id;

        const session = await Session.create({
            user: userId,
            role,
            experience,
            topicsToFocus,
            description,
        });

        const questionDocs = await Promise.all(
            questions.map(async (q) => {
                const question = await Question.create({
                    session: session._id,
                    question: q.question,
                    answer: q.answer,
                });
                return question._id;
            })
        );

        session.questions = questionDocs;
        await session.save();

        res.status(201).json({ success: true, session });
    } catch (error) {
        console.error("ERROR IN createSession:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
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

module.exports = {
    createSession,
    getMySessions,
    getSessionById,
    deleteSession,
    getReviewQueue,
};
