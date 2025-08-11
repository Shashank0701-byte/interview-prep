const { GoogleGenerativeAI } = require('@google/generative-ai');
const { conceptExplainPrompt, questionAnswerPrompt } = require("../utils/prompts");

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

// @desc    Generate explanation for a concept
// @route   POST /api/ai/generate-explanation
// @access  Private
const generateConceptExplanation = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Question is required." });
    }

    // ✅ FIX: Get the model WITHOUT forcing a JSON response, but with a higher token limit
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-latest",
        generationConfig: {
            maxOutputTokens: 8192,
        }
    });

    const prompt = conceptExplainPrompt(question);
    const result = await model.generateContent(prompt);
    const response = await result.response;

    // Get the plain text directly from the response
    const explanationText = response.text();

    // Send the text back to the frontend (no JSON.parse needed here)
    res.status(200).json({ explanation: explanationText });

  } catch (error) {
    console.error("AI Explanation Error:", error);
    res.status(500).json({
      message: "Failed to generate explanation",
      error: error.message,
    });
  }
};

module.exports = { generateInterviewQuestions, generateConceptExplanation };