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

  // Create new questions
  const createdQuestions = await Question.insertMany(
    questions.map((q) => ({
      session: sessionId,
      question: q.question, // Assuming q is an object with a 'question' property
      answer: q.answer, // Assuming q is an object with an 'answer' property
    }))
  );
  
  // A response would typically be sent here, e.g.:
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

        // Toggle the boolean value
        question.isMastered = !question.isMastered;
        await question.save();

        res.status(200).json({ message: "Status updated successfully", question });
    } catch (error) {
        console.error("Error toggling mastered status:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const addNoteToQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body;
        const userId = req.user._id;

        const question = await Question.findById(id);

        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }
        
        // Find the parent session to verify ownership
        const session = await Session.findById(question.session);
        if (session.user.toString() !== userId.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        question.userNote = note;
        await question.save();

        res.status(200).json({ message: "Note updated successfully", question });
    } catch (error) {
        console.error("Error adding note:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports ={
    addQuestionsToSession,
    togglePinQuestion,
    updateQuestionNote,
    addNoteToQuestion,
    toggleMasteredStatus,
};