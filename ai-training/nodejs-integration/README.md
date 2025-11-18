# Week 3: Node.js Integration Guide

This guide connects your React frontend → Node.js backend → Python RAG system to unlock your comprehensive knowledge base.

## 🎯 Architecture Overview

```
React Frontend (port 3000)
    ↓ /api/chat
Node.js Backend (port 3000)  
    ↓ http://localhost:8001/chat
Python FastAPI RAG (port 8001)
    ↓ queries
Vector Database + Gemini AI + Knowledge Base
```

## 🚀 Quick Start

### Step 1: Start Python RAG Service

```bash
cd ai-training
python start_rag_service.py
```

This starts your RAG service at `http://localhost:8001` with:
- ✅ Comprehensive knowledge base (300+ items)
- ✅ Vector database with embeddings
- ✅ Gemini AI for intelligent responses
- ✅ FastAPI endpoints ready for integration

### Step 2: Install Node.js Dependencies

In your Node.js backend directory:

```bash
npm install axios express
```

### Step 3: Add AI Service to Your Node.js Backend

1. **Copy `ai-service.js`** to your Node.js project
2. **Copy `chat-routes.js`** to your routes directory
3. **Add routes to your main app:**

```javascript
// In your main Node.js app (app.js or server.js)
const chatRoutes = require('./routes/chat-routes'); // Adjust path

app.use('/api', chatRoutes);
```

### Step 4: Update Frontend Chat Component

Replace the hardcoded responses in `StudyBuddyChat.jsx`:

1. **Remove lines 27-80** (the generateResponse function with hardcoded responses)
2. **Replace with the code from `frontend-integration.js`**

## 🔧 Integration Details

### Node.js Backend Integration

```javascript
const AIService = require('./ai-service');
const aiService = new AIService();

// In your chat route
app.post('/api/chat', async (req, res) => {
    try {
        const aiResponse = await aiService.chat(req.body.message);
        res.json({
            success: true,
            message: aiResponse.response,
            contextDocs: aiResponse.contextDocs
        });
    } catch (error) {
        // Fallback response
        res.json({
            success: true,
            message: aiService.getFallbackResponse(req.body.message)
        });
    }
});
```

### Frontend Integration

```javascript
// Replace generateResponse in StudyBuddyChat.jsx
const generateResponse = async (userMessage) => {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
    });
    
    const data = await response.json();
    return data.message;
};
```

## 🧪 Testing the Integration

### 1. Test Python RAG Service

```bash
curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is Big O notation?"}'
```

Expected: Detailed response about Big O from your knowledge base.

### 2. Test Node.js Integration

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Explain binary search"}'
```

Expected: Intelligent response routed through your Node.js backend.

### 3. Test Frontend

Ask in your chat interface:
- "What is Big O notation?"
- "How do I prepare for Google interviews?"
- "Explain the two pointers pattern"

Expected: Detailed, intelligent responses from your knowledge base instead of generic replies.

## 🎯 What Changes

### Before Integration:
- **Frontend**: Hardcoded responses like "Great question! What specific aspect..."
- **Backend**: No AI integration
- **Knowledge**: Limited to basic pattern matching

### After Integration:
- **Frontend**: Calls Node.js backend API
- **Backend**: Routes requests to Python RAG service
- **Knowledge**: Full access to 300+ interview prep items with intelligent retrieval

## 🔍 Troubleshooting

### Python Service Won't Start
```bash
# Check if port 8001 is available
netstat -an | findstr 8001

# Check environment variables
python -c "from dotenv import load_dotenv; load_dotenv(); import os; print('GEMINI_API_KEY:', bool(os.getenv('GEMINI_API_KEY')))"
```

### Node.js Can't Connect to Python
- Ensure Python service is running on port 8001
- Check firewall settings
- Verify `http://localhost:8001/health` returns success

### Frontend Not Getting Smart Responses
- Check browser network tab for API calls
- Verify Node.js routes are properly configured
- Check console for JavaScript errors

## 🎉 Success Indicators

✅ **Python RAG Service**: Returns detailed responses about technical concepts  
✅ **Node.js Integration**: Successfully proxies requests to Python service  
✅ **Frontend Chat**: Shows intelligent responses instead of hardcoded ones  
✅ **Knowledge Base**: Users can ask about algorithms, interviews, companies, etc.  

## 🚀 Next Steps

After successful integration:
1. **Monitor performance** - Check response times and error rates
2. **Add user context** - Pass user ID and session data for personalization
3. **Implement caching** - Cache frequent responses for better performance
4. **Add analytics** - Track popular questions and user satisfaction

Your Smart Study Buddy is now powered by a comprehensive knowledge base! 🎯
