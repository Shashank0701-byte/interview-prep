import axiosInstance from '../utils/axiosInstance';

// Generate questions using backend API (which calls Gemini)
export const generateQuestionsWithGemini = async (topic, count = 10) => {
  try {
    console.log('🚀 Calling backend API for topic:', topic);
    
    const response = await axiosInstance.post('/api/questions/generate', {
      topic: topic,
      count: count
    });
    
    if (response.data.success) {
      console.log('✅ Successfully received', response.data.questions.length, 'questions from backend');
      console.log('First question preview:', response.data.questions[0]);
      return response.data.questions;
    } else {
      throw new Error('Backend API returned unsuccessful response');
    }

  } catch (error) {
    console.error('❌ Error calling backend API:', error.message);
    console.error('Full error:', error);
    
    // Fallback to basic questions if API fails
    console.log('🔄 Falling back to basic questions...');
    return generateFallbackQuestions(topic, count);
  }
};

// Fallback questions if Gemini API fails
const generateFallbackQuestions = (topic, count) => {
  const fallbackQuestions = [];
  
  for (let i = 1; i <= count; i++) {
    fallbackQuestions.push({
      id: `${topic.toLowerCase()}-fallback-${i}`,
      type: i % 2 === 0 ? 'code-review' : 'coding',
      title: `${topic} Challenge ${i}`,
      description: `Practice ${topic} concepts with this interview question.`,
      difficulty: i <= 3 ? 'Easy' : i <= 7 ? 'Medium' : 'Hard',
      starterCode: `// ${topic} starter code\n// Implement your solution here`,
      solution: `// ${topic} solution\n// Solution implementation`,
      issues: []
    });
  }
  
  return fallbackQuestions;
};

// Cache for generated questions to avoid repeated API calls
const questionCache = new Map();

export const getCachedQuestions = async (topic, count = 10) => {
  const cacheKey = `${topic.toLowerCase()}-${count}`;
  
  console.log('🔍 Checking cache for:', cacheKey);
  
  if (questionCache.has(cacheKey)) {
    const cachedQuestions = questionCache.get(cacheKey);
    console.log('✅ Found cached questions for:', topic, '- First question:', cachedQuestions[0]?.title);
    return cachedQuestions;
  }
  
  console.log('❌ No cached questions, generating new ones for:', topic);
  const questions = await generateQuestionsWithGemini(topic, count);
  questionCache.set(cacheKey, questions);
  
  console.log('💾 Cached', questions.length, 'questions for:', topic, '- First question:', questions[0]?.title);
  
  // Cache for 1 hour
  setTimeout(() => {
    questionCache.delete(cacheKey);
  }, 60 * 60 * 1000);
  
  return questions;
};

// Clear cache function for debugging
export const clearQuestionCache = () => {
  questionCache.clear();
  console.log('🗑️ Question cache cleared');
};

// Test function to check if backend API is working
export const testGeminiAPI = async () => {
  try {
    console.log('🧪 Testing backend API...');
    
    const response = await axiosInstance.post('/api/questions/generate', {
      topic: 'test',
      count: 1
    });
    
    if (response.data.success) {
      console.log('✅ Backend API test successful');
      return true;
    } else {
      console.error('❌ Backend API returned unsuccessful response');
      return false;
    }
  } catch (error) {
    console.error('❌ Backend API test failed:', error);
    return false;
  }
};
