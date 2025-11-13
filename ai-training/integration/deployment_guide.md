# Smart Study Buddy - Deployment Guide

This guide walks you through deploying the Smart Study Buddy AI system to your interview preparation application.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Navigate to AI training directory
cd ai-training

# Install Python dependencies
pip install -r requirements.txt

# Install additional dependencies for your database
pip install pymongo  # For MongoDB
# OR
pip install psycopg2-binary  # For PostgreSQL
```

### 2. Configure Database Connection

Create a configuration file for your database:

```python
# config/database_config.py
DATABASE_CONFIG = {
    "type": "mongodb",  # or "postgresql"
    "connection_string": "mongodb://localhost:27017/",
    "database": "interview_prep"
}

# For PostgreSQL:
# DATABASE_CONFIG = {
#     "type": "postgresql",
#     "host": "localhost",
#     "port": 5432,
#     "database": "interview_prep",
#     "user": "your_username",
#     "password": "your_password"
# }
```

### 3. Train Initial Models (Optional)

```bash
# Generate training data and train models
cd study-buddy/training
python train_behavior_model.py

# This will create trained models in study-buddy/models/trained/
```

### 4. Basic Integration Example

```python
# example_integration.py
import asyncio
from integration.study_buddy_api import StudyBuddyAPI
from integration.backend_connector import create_backend_connector
from integration.chatbot_interface import create_study_buddy_chatbot

# Database configuration
db_config = {
    "type": "mongodb",
    "connection_string": "mongodb://localhost:27017/",
    "database": "interview_prep"
}

async def main():
    # Initialize components
    api = StudyBuddyAPI(api_base_url="http://localhost:8000/api")
    backend = create_backend_connector(db_config)
    chatbot = create_study_buddy_chatbot(api, backend)
    
    # Example: Process a user message
    user_id = "user123"
    message = "Hi! How am I doing with my studies?"
    
    response = await chatbot.process_message(user_id, message)
    print(f"Study Buddy: {response['message']}")

if __name__ == "__main__":
    asyncio.run(main())
```

## 🔧 Backend Integration

### Express.js/Node.js Integration

Add these endpoints to your Express server:

```javascript
// routes/studyBuddy.js
const express = require('express');
const { spawn } = require('child_process');
const router = express.Router();

// Chat endpoint
router.post('/chat', async (req, res) => {
    try {
        const { userId, message } = req.body;
        
        // Call Python AI service
        const python = spawn('python', [
            'ai-training/integration/chat_endpoint.py',
            userId,
            message
        ]);
        
        let response = '';
        python.stdout.on('data', (data) => {
            response += data.toString();
        });
        
        python.on('close', (code) => {
            if (code === 0) {
                res.json(JSON.parse(response));
            } else {
                res.status(500).json({ error: 'AI service error' });
            }
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Behavior analysis endpoint
router.get('/analysis/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const python = spawn('python', [
            'ai-training/integration/analysis_endpoint.py',
            userId
        ]);
        
        let analysis = '';
        python.stdout.on('data', (data) => {
            analysis += data.toString();
        });
        
        python.on('close', (code) => {
            if (code === 0) {
                res.json(JSON.parse(analysis));
            } else {
                res.status(500).json({ error: 'Analysis service error' });
            }
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
```

### Python Endpoint Scripts

Create these helper scripts for Node.js integration:

```python
# integration/chat_endpoint.py
import sys
import json
import asyncio
from study_buddy_api import StudyBuddyAPI
from chatbot_interface import create_study_buddy_chatbot

async def main():
    user_id = sys.argv[1]
    message = sys.argv[2]
    
    api = StudyBuddyAPI()
    chatbot = create_study_buddy_chatbot(api)
    
    response = await chatbot.process_message(user_id, message)
    print(json.dumps(response))

if __name__ == "__main__":
    asyncio.run(main())
```

```python
# integration/analysis_endpoint.py
import sys
import json
import asyncio
from study_buddy_api import analyze_user

async def main():
    user_id = sys.argv[1]
    token = sys.argv[2] if len(sys.argv) > 2 else "dummy_token"
    
    analysis = await analyze_user(user_id, token)
    print(json.dumps(analysis))

if __name__ == "__main__":
    asyncio.run(main())
```

## 🎯 Frontend Integration

### React Component Example

```jsx
// components/StudyBuddyChat.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudyBuddyChat = ({ userId }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = {
            sender: 'user',
            message: inputMessage,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await axios.post('/api/study-buddy/chat', {
                userId,
                message: inputMessage
            });

            const buddyMessage = {
                sender: 'buddy',
                message: response.data.message,
                timestamp: new Date().toISOString(),
                metadata: response.data.metadata
            };

            setMessages(prev => [...prev, buddyMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsLoading(false);
            setInputMessage('');
        }
    };

    return (
        <div className="study-buddy-chat">
            <div className="chat-header">
                <h3>🤖 Study Buddy</h3>
            </div>
            
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                        <div className="message-content">
                            {msg.message}
                        </div>
                        <div className="message-time">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="message buddy loading">
                        <div className="typing-indicator">
                            Study Buddy is thinking...
                        </div>
                    </div>
                )}
            </div>
            
            <div className="chat-input">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask Study Buddy anything..."
                />
                <button onClick={sendMessage} disabled={isLoading}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default StudyBuddyChat;
```

### CSS Styles

```css
/* styles/StudyBuddyChat.css */
.study-buddy-chat {
    display: flex;
    flex-direction: column;
    height: 400px;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chat-header {
    padding: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px 12px 0 0;
}

.chat-messages {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.message {
    max-width: 80%;
    padding: 12px 16px;
    border-radius: 18px;
    word-wrap: break-word;
}

.message.user {
    align-self: flex-end;
    background: #007bff;
    color: white;
}

.message.buddy {
    align-self: flex-start;
    background: #f8f9fa;
    color: #333;
    border: 1px solid #e9ecef;
}

.message-time {
    font-size: 0.75rem;
    opacity: 0.7;
    margin-top: 4px;
}

.chat-input {
    display: flex;
    padding: 16px;
    border-top: 1px solid #e0e0e0;
    gap: 8px;
}

.chat-input input {
    flex: 1;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 24px;
    outline: none;
}

.chat-input button {
    padding: 12px 24px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 24px;
    cursor: pointer;
}

.typing-indicator {
    font-style: italic;
    opacity: 0.7;
}
```

## 📊 Dashboard Integration

### Progress Analytics Component

```jsx
// components/StudyBuddyInsights.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudyBuddyInsights = ({ userId }) => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInsights();
    }, [userId]);

    const fetchInsights = async () => {
        try {
            const response = await axios.get(`/api/study-buddy/analysis/${userId}`);
            setInsights(response.data);
        } catch (error) {
            console.error('Error fetching insights:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading insights...</div>;
    if (!insights) return <div>No insights available</div>;

    const { behavior_analysis, motivation_tracking } = insights;

    return (
        <div className="study-buddy-insights">
            <h3>🧠 AI Insights</h3>
            
            {behavior_analysis.status === 'success' && (
                <div className="insights-grid">
                    <div className="insight-card">
                        <h4>⏰ Optimal Study Time</h4>
                        <p>{behavior_analysis.analysis.study_time_preference.description}</p>
                        <div className="confidence">
                            Confidence: {(behavior_analysis.analysis.study_time_preference.confidence * 100).toFixed(0)}%
                        </div>
                    </div>
                    
                    <div className="insight-card">
                        <h4>🚀 Learning Velocity</h4>
                        <p>Your learning pace is {behavior_analysis.analysis.learning_velocity.velocity}</p>
                        <div className="confidence">
                            Confidence: {(behavior_analysis.analysis.learning_velocity.confidence * 100).toFixed(0)}%
                        </div>
                    </div>
                    
                    <div className="insight-card">
                        <h4>💪 Motivation Level</h4>
                        <p>Current level: {motivation_tracking.current_level}</p>
                        <p>Trend: {motivation_tracking.trend}</p>
                    </div>
                </div>
            )}
            
            {behavior_analysis.recommendations && (
                <div className="recommendations">
                    <h4>📋 Recommendations</h4>
                    <ul>
                        {behavior_analysis.recommendations.map((rec, index) => (
                            <li key={index}>{rec.recommendation || rec}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default StudyBuddyInsights;
```

## 🔄 Automated Reminders

### Reminder Service

```python
# services/reminder_service.py
import asyncio
import schedule
import time
from datetime import datetime
from integration.study_buddy_api import StudyBuddyAPI
from integration.backend_connector import create_backend_connector

class ReminderService:
    def __init__(self, db_config):
        self.api = StudyBuddyAPI()
        self.backend = create_backend_connector(db_config)
    
    async def process_reminders(self):
        """Process and send pending reminders"""
        # Get all users with pending reminders
        # This would query your user database
        users = await self.get_active_users()
        
        for user_id in users:
            try:
                # Get pending reminders
                reminders = self.backend.get_pending_reminders(user_id)
                
                for reminder in reminders:
                    # Send reminder (email, push notification, etc.)
                    await self.send_reminder(user_id, reminder)
                    
                    # Mark as sent
                    self.backend.mark_reminder_sent(reminder['_id'])
                    
            except Exception as e:
                print(f"Error processing reminders for user {user_id}: {e}")
    
    async def send_reminder(self, user_id, reminder):
        """Send reminder to user"""
        # Implement your notification system here
        # Email, push notification, in-app notification, etc.
        print(f"Sending reminder to {user_id}: {reminder['message']}")

# Schedule reminder processing
def run_reminder_service():
    service = ReminderService(DATABASE_CONFIG)
    
    # Run every hour
    schedule.every().hour.do(lambda: asyncio.run(service.process_reminders()))
    
    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    run_reminder_service()
```

## 🚀 Production Deployment

### Docker Configuration

```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  study-buddy-ai:
    build: .
    ports:
      - "8001:8000"
    environment:
      - DATABASE_URL=mongodb://mongo:27017/interview_prep
    depends_on:
      - mongo
    volumes:
      - ./ai-training:/app/ai-training

  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### Environment Variables

```bash
# .env
DATABASE_TYPE=mongodb
DATABASE_URL=mongodb://localhost:27017/interview_prep
API_BASE_URL=http://localhost:8000/api
LOG_LEVEL=INFO
MODEL_PATH=./study-buddy/models/trained/
```

## 📈 Monitoring and Analytics

### Performance Monitoring

```python
# monitoring/performance_monitor.py
import time
import logging
from functools import wraps

def monitor_performance(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = await func(*args, **kwargs)
            execution_time = time.time() - start_time
            
            logging.info(f"{func.__name__} executed in {execution_time:.2f}s")
            return result
            
        except Exception as e:
            execution_time = time.time() - start_time
            logging.error(f"{func.__name__} failed after {execution_time:.2f}s: {e}")
            raise
    
    return wrapper
```

### Usage Analytics

```python
# analytics/usage_tracker.py
from datetime import datetime
import json

class UsageTracker:
    def __init__(self, backend_connector):
        self.backend = backend_connector
    
    def track_interaction(self, user_id, interaction_type, metadata=None):
        """Track user interactions for analytics"""
        event = {
            "user_id": user_id,
            "interaction_type": interaction_type,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        
        # Save to analytics collection/table
        self.backend.save_analytics_event(event)
    
    def get_usage_stats(self, start_date, end_date):
        """Get usage statistics for a date range"""
        return self.backend.get_analytics_data(start_date, end_date)
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check database credentials and connection string
   - Ensure database server is running
   - Verify network connectivity

2. **Model Loading Errors**
   - Run training script to generate models
   - Check file permissions on model directory
   - Verify Python dependencies are installed

3. **API Integration Issues**
   - Check API endpoint URLs
   - Verify authentication tokens
   - Test with curl or Postman first

4. **Performance Issues**
   - Enable caching for user data
   - Use connection pooling for database
   - Consider async processing for heavy operations

### Logging Configuration

```python
# config/logging_config.py
import logging
import sys

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('study_buddy.log'),
            logging.StreamHandler(sys.stdout)
        ]
    )
```

## 📚 Next Steps

1. **Customize Responses**: Modify response templates in the data files
2. **Add New Intents**: Extend the intent recognition in chatbot_interface.py
3. **Improve Models**: Collect real user data and retrain models
4. **Scale Infrastructure**: Add load balancing and caching
5. **Monitor Performance**: Set up comprehensive logging and monitoring

For more detailed information, refer to the individual module documentation in each Python file.
