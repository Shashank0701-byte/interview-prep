const questionAnswerPrompt = (role, experience, topicsToFocus, numberOfQuestions) => (
  `You are an AI trained to generate technical interview questions and answers.

  Task:
  - Role: ${role}
  - Candidate Experience: ${experience} years
  - Focus Topics: ${topicsToFocus}
  - Write ${numberOfQuestions} interview questions.
  - For each question, generate a detailed but beginner-friendly answer.
  - If the answer needs a code example, add a small code block inside.
  
  - **For each question, add a 'companyTags' array containing 1 to 3 names of well-known tech companies where this question is likely to be asked.**
  
  - Keep formatting very clean.
  - Return a pure JSON array like:
  [
    {
      "question": "Question here?",
      "answer": "Answer here.",
      "companyTags": ["Google", "Meta"]
    },
    ...
  ]
  
  Important: Do NOT add any extra text. Only return valid JSON.`
)

const conceptExplainPrompt = (question) => (
  `You are an AI trained to generate explanations for a given interview question.

  Task:
  - Explain the following interview question and its concept in depth as if you're teaching a beginner developer.
  - Question: "${question}"
  - After the explanation, provide a short and clear title that summarizes the concept for the article or page header.
  - If the explanation includes a code example, provide a small code block.
  - Keep the formatting very clean and clear.
  - Return the result as a valid JSON object in the following format:
  {
      "explanation": "Explanation here.",
      "title": "Title here"
    }

  Important: Do NOT add any extra text outside the JSON format. Only return valid JSON.`
);

const practiceFeedbackPrompt = (question, idealAnswer, userTranscript) => {
    return `
        You are an expert interview coach providing feedback on a user's spoken answer.
        Your task is to analyze their answer and provide a structured critique in JSON format.

        **Interview Question:**
        "${question}"

        **Ideal Answer for Reference:**
        "${idealAnswer}"

        **User's Spoken Answer (Transcript):**
        "${userTranscript}"

        Please provide your feedback as a JSON object. The JSON object must contain the following keys: "contentAccuracy", "keywordAnalysis", "clarityConciseness", and "suggestedImprovement".

        - "contentAccuracy": An object with a "score" (an integer out of 10) and a "feedback" string.
        - "keywordAnalysis": An object with a "feedback" string analyzing the use of key terms.
        - "clarityConciseness": An object with a "score" (an integer out of 10) and a "feedback" string, mentioning any filler words if found.
        - "suggestedImprovement": A string with a concrete suggestion for how the user can improve their answer.

        Do not include any text, markdown, or formatting outside of the final JSON object.
    `;
};

    const followUpQuestionPrompt = (originalQuestion, originalAnswer) => (
  `You are an AI trained to generate a relevant follow-up interview question.

  Task:
  - Based on the original question and its ideal answer, generate one logical follow-up question.
  - The follow-up question should dig deeper into a concept mentioned in the original answer.
  - Provide a detailed, beginner-friendly answer for the new follow-up question.
  - Return a pure JSON object like:
  {
    "question": "Follow-up question here?",
    "answer": "Detailed answer to the follow-up here."
  }

  Original Question: "${originalQuestion}"
  Original Answer: "${originalAnswer}"

  Important: Do NOT add any extra text. Only return valid JSON.`
);

module.exports = { questionAnswerPrompt, conceptExplainPrompt, practiceFeedbackPrompt, followUpQuestionPrompt };