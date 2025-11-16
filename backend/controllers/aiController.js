const { GoogleGenerativeAI } = require('@google/generative-ai');
const { questionAnswerPrompt, practiceFeedbackPrompt, followUpQuestionPrompt } = require("../utils/prompts");

// Configure the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// @desc    Generate interview questions and answers using Gemini
// @route   POST /api/ai/generate-questions
// @access  Private
const generateInterviewQuestions = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, numberOfQuestions } = req.body;
    
    if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = questionAnswerPrompt(
      role,
      experience,
      topicsToFocus,
      numberOfQuestions
    );

    // Try multiple models with retry logic for 503 errors
    const modelConfigs = [
        { name: "models/gemini-flash-latest", config: { responseMimeType: "application/json" } },
        { name: "models/gemini-2.5-flash", config: { responseMimeType: "application/json" } },
        { name: "models/gemini-2.0-flash", config: { responseMimeType: "application/json" } },
        { name: "models/gemini-pro-latest", config: { responseMimeType: "application/json" } },
        { name: "models/gemini-flash-latest", config: {} },
        { name: "models/gemini-2.5-flash", config: {} },
    ];

    let result = null;
    let lastError = null;

    for (const { name, config } of modelConfigs) {
        try {
            console.log(`Trying question generation model: ${name} with config:`, config);
            const model = genAI.getGenerativeModel({
                model: name,
                generationConfig: config,
            });

            console.log("Calling Gemini API for question generation...");
            result = await model.generateContent(prompt);
            console.log(`✅ Question generation success with model: ${name}`);
            break;
        } catch (error) {
            lastError = error;
            console.log(`❌ Question generation model ${name} failed:`, error.message);
            
            // If it's a 503 (overloaded), try next model immediately
            if (error.status === 503) {
                console.log("Question generation model overloaded, trying next model...");
                continue;
            }
            
            // For other errors, also try next model
            continue;
        }
    }

    if (!result) {
        throw lastError || new Error("All question generation models failed");
    }

    const response = await result.response;

    // Parse JSON with robust error handling
    const rawText = response.text();
    console.log("Raw AI response:", rawText);
    
    let data;
    try {
      // Handle potential markdown code blocks
      const jsonMatch = rawText.match(/```(?:json)?\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : rawText;
      
      // Clean up any potential issues
      const cleanedJson = jsonString.trim();
      data = JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error("JSON parsing failed:", parseError);
      console.error("Raw text:", rawText);
      throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
    }

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
        const userTranscript = "Uh, findOne returns, like, just the first document it sees. But find... it returns a cursor, so you can loop through all of them. I think that's right.";

        if (!question || !idealAnswer || !userTranscript) {
            return res.status(400).json({ message: "Missing required fields for feedback." });
        }

        // --- Step 2: Get Structured Feedback from Gemini with Retry Logic ---
        const modelConfigs = [
            { name: "models/gemini-flash-latest", config: { responseMimeType: "application/json" } },
            { name: "models/gemini-2.5-flash", config: { responseMimeType: "application/json" } },
            { name: "models/gemini-2.0-flash", config: { responseMimeType: "application/json" } },
            { name: "models/gemini-pro-latest", config: { responseMimeType: "application/json" } },
            { name: "models/gemini-flash-latest", config: {} },
            { name: "models/gemini-2.5-flash", config: {} },
        ];

        const prompt = practiceFeedbackPrompt(question, idealAnswer, userTranscript);
        console.log("Generated feedback prompt:", prompt);

        let result = null;
        let lastError = null;

        for (const { name, config } of modelConfigs) {
            try {
                console.log(`Trying feedback model: ${name} with config:`, config);
                const model = genAI.getGenerativeModel({
                    model: name,
                    generationConfig: config,
                });

                console.log("Calling Gemini API for feedback...");
                result = await model.generateContent(prompt);
                console.log(`✅ Feedback success with model: ${name}`);
                break;
            } catch (error) {
                lastError = error;
                console.log(`❌ Feedback model ${name} failed:`, error.message);
                
                // If it's a 503 (overloaded), try next model immediately
                if (error.status === 503) {
                    console.log("Feedback model overloaded, trying next model...");
                    continue;
                }
                
                // For other errors, also try next model
                continue;
            }
        }

        if (!result) {
            throw lastError || new Error("All feedback models failed");
        }

        const response = await result.response;
        const rawText = response.text();
        console.log("Raw feedback response:", rawText);
        
        let feedbackData;
        try {
          // Handle potential markdown code blocks
          const jsonMatch = rawText.match(/```(?:json)?\n([\s\S]*?)\n```/);
          const jsonString = jsonMatch ? jsonMatch[1] : rawText;
          
          // Clean up any potential issues
          const cleanedJson = jsonString.trim();
          feedbackData = JSON.parse(cleanedJson);
        } catch (parseError) {
          console.error("JSON parsing failed:", parseError);
          console.error("Raw text:", rawText);
          throw new Error(`Failed to parse feedback response as JSON: ${parseError.message}`);
        }

        res.status(200).json({ success: true, feedback: feedbackData });

    } catch (error) {
        console.error("AI Feedback Generation Error:", error);
        res.status(500).json({
            message: "Failed to generate feedback from AI model.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Handle follow-up questions
// @route   POST /api/ai/follow-up
// @access  Private
const generateFollowUpQuestion = async (req, res) => {
    try {
        console.log("=== Follow-up Question Generation Started ===");
        const { originalQuestion, originalAnswer } = req.body;
        console.log("Request body:", { originalQuestion, originalAnswer });
        
        if (!originalQuestion || !originalAnswer) {
            return res.status(400).json({ message: "Original question and answer are required." });
        }

        // Try multiple models with retry logic for 503 errors
        const modelConfigs = [
            { name: "models/gemini-flash-latest", config: { responseMimeType: "application/json" } },
            { name: "models/gemini-2.5-flash", config: { responseMimeType: "application/json" } },
            { name: "models/gemini-2.0-flash", config: { responseMimeType: "application/json" } },
            { name: "models/gemini-pro-latest", config: { responseMimeType: "application/json" } },
            { name: "models/gemini-flash-latest", config: {} },
            { name: "models/gemini-2.5-flash", config: {} },
        ];

        const prompt = followUpQuestionPrompt(originalQuestion, originalAnswer);
        console.log("Generated prompt:", prompt);

        let result = null;
        let lastError = null;

        for (const { name, config } of modelConfigs) {
            try {
                console.log(`Trying model: ${name} with config:`, config);
                const model = genAI.getGenerativeModel({
                    model: name,
                    generationConfig: config,
                });

                console.log("Calling Gemini API...");
                result = await model.generateContent(prompt);
                console.log(`✅ Success with model: ${name}`);
                break;
            } catch (error) {
                lastError = error;
                console.log(`❌ Model ${name} failed:`, error.message);
                
                // If it's a 503 (overloaded), try next model immediately
                if (error.status === 503) {
                    console.log("Model overloaded, trying next model...");
                    continue;
                }
                
                // For other errors, also try next model
                continue;
            }
        }

        if (!result) {
            throw lastError || new Error("All models failed");
        }

        console.log("Got result from Gemini");
        const response = await result.response;
        console.log("Got response from result");
        
        const responseText = response.text();
        console.log("Raw response text:", responseText);
        
        // Try to parse JSON, with fallback handling
        let followUpData;
        try {
            // Handle potential markdown code blocks
            const jsonMatch = responseText.match(/```(?:json)?\n([\s\S]*?)\n```/);
            const jsonString = jsonMatch ? jsonMatch[1] : responseText;
            followUpData = JSON.parse(jsonString);
        } catch (parseError) {
            console.log("Failed to parse as JSON, trying to extract manually");
            // If JSON parsing fails, try to extract question and answer manually
            const questionMatch = responseText.match(/"question":\s*"([^"]+)"/);
            const answerMatch = responseText.match(/"answer":\s*"([^"]+)"/);
            
            if (questionMatch && answerMatch) {
                followUpData = {
                    question: questionMatch[1],
                    answer: answerMatch[1]
                };
            } else {
                throw new Error(`Could not parse response: ${responseText}`);
            }
        }
        
        console.log("Parsed follow-up data:", followUpData);

        res.status(200).json({ success: true, followUp: followUpData });
    } catch (error) {
        console.error("AI Follow-up Generation Error:", error);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        res.status(500).json({ 
            message: "Failed to generate follow-up question.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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

        // Try multiple models with retry logic for 503 errors
        const modelConfigs = [
            { name: "models/gemini-flash-latest", config: { responseMimeType: "application/json" } },
            { name: "models/gemini-2.5-flash", config: { responseMimeType: "application/json" } },
            { name: "models/gemini-2.0-flash", config: { responseMimeType: "application/json" } },
            { name: "models/gemini-pro-latest", config: { responseMimeType: "application/json" } },
            { name: "models/gemini-flash-latest", config: {} },
            { name: "models/gemini-2.5-flash", config: {} },
        ];

        const prompt = `You are an AI trained to generate company-specific interview questions.
        
        Task:
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

        let result = null;
        let lastError = null;

        for (const { name, config } of modelConfigs) {
            try {
                console.log(`Trying company questions model: ${name} with config:`, config);
                const model = genAI.getGenerativeModel({
                    model: name,
                    generationConfig: config,
                });

                console.log("Calling Gemini API for company questions...");
                result = await model.generateContent(prompt);
                console.log(`✅ Company questions success with model: ${name}`);
                break;
            } catch (error) {
                lastError = error;
                console.log(`❌ Company questions model ${name} failed:`, error.message);
                
                // If it's a 503 (overloaded), try next model immediately
                if (error.status === 503) {
                    console.log("Company questions model overloaded, trying next model...");
                    continue;
                }
                
                // For other errors, also try next model
                continue;
            }
        }

        if (!result) {
            throw lastError || new Error("All company questions models failed");
        }

        const response = await result.response;
        const rawText = response.text();
        console.log("Raw company questions response:", rawText);
        
        let data;
        try {
          // Handle potential markdown code blocks
          const jsonMatch = rawText.match(/```(?:json)?\n([\s\S]*?)\n```/);
          const jsonString = jsonMatch ? jsonMatch[1] : rawText;
          
          // Clean up any potential issues
          const cleanedJson = jsonString.trim();
          data = JSON.parse(cleanedJson);
        } catch (parseError) {
          console.error("JSON parsing failed:", parseError);
          console.error("Raw text:", rawText);
          throw new Error(`Failed to parse company questions response as JSON: ${parseError.message}`);
        }

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