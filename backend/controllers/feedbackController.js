const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

// Use the correct environment variable name
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// @desc    Generate feedback for a user's answer
// @route   POST /api/feedback
// @access  Private
const generateFeedback = async (req, res) => {
    const { question, userAnswer } = req.body;

    if (!question || !userAnswer) {
        return res.status(400).json({ message: "Question and user answer are required." });
    }

    try {
        // Define Safety Settings
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

        // Try multiple models with retry logic for 503 and 400 errors
        const modelConfigs = [
            { name: "models/gemini-flash-latest", safetySettings },
            { name: "models/gemini-2.5-flash", safetySettings },
            { name: "models/gemini-2.0-flash", safetySettings },
            { name: "gemini-1.5-flash", safetySettings },
            { name: "models/gemini-pro-latest", safetySettings },
        ];

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

        let result = null;
        let lastError = null;

        for (const { name, safetySettings: settings } of modelConfigs) {
            try {
                console.log(`Trying feedback model: ${name}`);
                const model = genAI.getGenerativeModel({ 
                    model: name,
                    safetySettings: settings,
                });

                console.log("Calling Gemini API for feedback...");
                result = await model.generateContent(prompt);
                console.log(`✅ Feedback success with model: ${name}`);
                break;
            } catch (error) {
                lastError = error;
                console.log(`❌ Feedback model ${name} failed:`, error.message);
                
                // If it's a 503 (overloaded) or 400 (invalid key), try next model
                if (error.status === 503 || error.status === 400) {
                    console.log("Feedback model failed, trying next model...");
                    continue;
                }
                
                // For other errors, also try next model
                continue;
            }
        }

        if (!result) {
            throw lastError || new Error("All feedback models failed");
        }

        const response = result.response;

        // Check if the response was blocked by safety settings
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