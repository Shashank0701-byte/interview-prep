const { GoogleGenerativeAI } = require('@google/generative-ai');
const { questionAnswerPrompt, practiceFeedbackPrompt, followUpQuestionPrompt } = require("../utils/prompts");

// ✅ FIX: Correctly initialize the client with the API key as a string
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Generate interview questions and answers using Gemini
// @route   POST /api/ai/generate-questions
// @access  Private
const generateInterviewQuestions = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, numberOfQuestions } = req.body;
    if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ FIX: Configure the model to guarantee a valid JSON response and prevent cut-offs.
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      generationConfig: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    const prompt = questionAnswerPrompt(
      role,
      experience,
      topicsToFocus,
      numberOfQuestions
    );

    const result = await model.generateContent(prompt);
    const response = await result.response;

    // We can now directly parse the text because the AI guarantees it's valid JSON.
    const rawText = response.text();
    const data = JSON.parse(rawText);

    res.status(200).json(data);

  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({
      message: "Failed to generate questions. Please check the server logs.",
      error: error.message,
    });
  }
};


// @desc    Analyzes a user's spoken answer and provides feedback
// @route   POST /api/ai/practice-feedback
// @access  Private
const getPracticeFeedback = async (req, res) => {
    try {
        const { question, idealAnswer } = req.body;
        
        // --- Step 1: Speech-to-Text (Placeholder) ---
        // In a real application, you would send the audio file (req.file)
        // to a service like Google Cloud Speech-to-Text or OpenAI's Whisper.
        // For this example, we'll use a placeholder transcript.
        // const userTranscript = await transcribeAudio(req.file);
        const userTranscript = "Uh, findOne returns, like, just the first document it sees. But find... it returns a cursor, so you can loop through all of them. I think that's right.";

        if (!question || !idealAnswer || !userTranscript) {
            return res.status(400).json({ message: "Missing required fields for feedback." });
        }

        // --- Step 2: Get Structured Feedback from Gemini ---
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest",
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const prompt = practiceFeedbackPrompt(question, idealAnswer, userTranscript);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const feedbackData = JSON.parse(response.text());

        res.status(200).json({ success: true, feedback: feedbackData });

    } catch (error) {
        console.error("AI Feedback Generation Error:", error);
        res.status(500).json({
            message: "Failed to generate feedback.",
            error: error.message,
        });
    }
};

// @desc    Handle follow-up questions
// @route   POST /api/ai/follow-up
// @access  Private
const generateFollowUpQuestion = async (req, res) => {
    try {
        const { originalQuestion, originalAnswer } = req.body;
        if (!originalQuestion || !originalAnswer) {
            return res.status(400).json({ message: "Original question and answer are required." });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest",
            generationConfig: { responseMimeType: "application/json" },
        });
        const prompt = followUpQuestionPrompt(originalQuestion, originalAnswer);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const followUpData = JSON.parse(response.text());

        res.status(200).json({ success: true, followUp: followUpData });
    } catch (error) {
        console.error("AI Follow-up Generation Error:", error);
        res.status(500).json({ message: "Failed to generate follow-up question." });
    }
};

// @desc    Generate company-specific interview questions
// @route   POST /api/ai/company-questions
// @access  Private
const generateCompanyQuestions = async (req, res) => {
    try {
        const { companyName, role, experience, topicsToFocus, numberOfQuestions } = req.body;
        
        if (!companyName || !role || !experience || !topicsToFocus || !numberOfQuestions) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest",
            generationConfig: {
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
            },
        });

        const prompt = `You are an AI trained to generate company-specific interview questions.

        Task:
        - Company: ${companyName}
        - Role: ${role}
        - Candidate Experience: ${experience} years
        - Focus Topics: ${topicsToFocus}
        - Write ${numberOfQuestions} interview questions that are specifically asked at ${companyName}
        
        Requirements:
        1. Questions should reflect ${companyName}'s interview style and culture
        2. Focus on topics that ${companyName} specifically emphasizes
        3. Include both technical and behavioral questions
        4. Make questions realistic and current (2024-2025)
        5. For each question, provide a detailed, beginner-friendly answer
        
        Return a pure JSON array like:
        [
            {
                "question": "Question here?",
                "answer": "Detailed answer here.",
                "category": "Technical/Behavioral/System Design",
                "difficulty": "Easy/Medium/Hard"
            }
        ]
        
        Important: Do NOT add any extra text. Only return valid JSON.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const data = JSON.parse(response.text());

        res.status(200).json(data);

    } catch (error) {
        console.error("AI Company Questions Generation Error:", error);
        res.status(500).json({
            message: "Failed to generate company-specific questions.",
            error: error.message,
        });
    }
};

module.exports = { 
    generateInterviewQuestions, 
    generateFollowUpQuestion, 
    getPracticeFeedback,
    generateCompanyQuestions
};