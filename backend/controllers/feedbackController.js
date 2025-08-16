// This assumes you have a configured GoogleGenerativeAI client.
// You would typically initialize this in a separate config file.
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold  } = require("@google/generative-ai");

// Make sure to replace "YOUR_API_KEY" with your actual Google AI API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY");

// @desc    Generate feedback for a user's answer
// @route   POST /api/feedback
// @access  Private
const generateFeedback = async (req, res) => {
    const { question, userAnswer } = req.body;

    if (!question || !userAnswer) {
        return res.status(400).json({ message: "Question and user answer are required." });
    }

    try {
        // --- NEW: Define Safety Settings ---
        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
        ];

        // --- UPDATED: Use a newer model and pass in the safety settings ---
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            safetySettings,
        });

        const prompt = `
            You are an expert career coach and interview preparation assistant.
            A user was asked the following interview question:
            ---
            Question: "${question}"
            ---
            The user provided this answer:
            ---
            Answer: "${userAnswer}"
            ---
            Please provide constructive feedback on the user's answer. Analyze its structure, clarity, completeness, and relevance to the question.
            Provide specific suggestions for improvement.
            Structure your feedback in Markdown format with clear headings like "### Overall Impression", "### Strengths", and "### Areas for Improvement".
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;

        // --- NEW: Check if the response was blocked by safety settings ---
        if (response.promptFeedback?.blockReason) {
            return res.status(400).json({ 
                message: "The provided answer could not be processed due to safety concerns. Please rephrase your answer." 
            });
        }
        
        const feedback = response.text();
        res.status(200).json({ feedback });

    } catch (error) {
        console.error("Detailed AI Error:", error);
        res.status(500).json({ message: "Failed to generate feedback from AI model." });
    }
};

module.exports = {
    generateFeedback,
};