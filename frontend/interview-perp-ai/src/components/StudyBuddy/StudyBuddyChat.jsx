import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Bot, User, X, Minimize2 } from 'lucide-react';
import './StudyBuddyChat.css';

const StudyBuddyChat = ({ userId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'buddy',
            message: "Hi there! 👋 I'm your Study Buddy! I'm here to help you with your interview prep journey. How are you feeling about your progress today?",
            timestamp: new Date().toISOString()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Check AI service health on component mount
    useEffect(() => {
        checkAIServiceHealth().then(isHealthy => {
            if (isHealthy) {
                console.log('✅ AI Service is ready!');
            } else {
                console.log('⚠️ AI Service is not ready, using fallback responses');
            }
        });
    }, []);

    // AI-powered responses using RAG system
    const generateResponse = async (userMessage) => {
        try {
            setIsTyping(true);
            
            // Call your Node.js backend which connects to Python RAG service
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    userId: userId || 'anonymous',
                    sessionId: Date.now().toString() // Simple session ID
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                // Log for debugging
                console.log('AI Response:', {
                    contextDocs: data.contextDocs,
                    modelUsed: data.modelUsed,
                    source: data.source
                });
                
                return data.message;
            } else {
                throw new Error(data.error || 'Unknown error');
            }
            
        } catch (error) {
            console.error('Chat API error:', error);
            
            // Fallback to local response if API fails
            return "I'm having trouble connecting to my knowledge base right now. Let me give you a quick response: " + 
                   "Keep up the great work with your interview prep! Every session brings you closer to success. 💪";
                   
        } finally {
            setIsTyping(false);
        }
    };

    // Check AI service health
    const checkAIServiceHealth = async () => {
        try {
            const response = await fetch('/api/ai/health');
            const health = await response.json();
            
            console.log('AI Service Health:', health);
            return health.success && health.pipelineReady;
            
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = {
            id: Date.now(),
            sender: 'user',
            message: inputMessage,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        const messageToSend = inputMessage;
        setInputMessage('');

        // Get AI response
        const response = await generateResponse(messageToSend);
        const buddyMessage = {
            id: Date.now() + 1,
            sender: 'buddy',
            message: response,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, buddyMessage]);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Chat Toggle Button */}
            {!isOpen && (
                <div className="study-buddy-toggle" onClick={() => setIsOpen(true)}>
                    <MessageCircle size={24} />
                    <span className="toggle-text">Study Buddy</span>
                    <div className="notification-dot"></div>
                </div>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="study-buddy-chat">
                    {/* Header */}
                    <div className="chat-header">
                        <div className="header-info">
                            <Bot size={20} />
                            <div>
                                <h3>Study Buddy</h3>
                                <span className="status">Online • Ready to help!</span>
                            </div>
                        </div>
                        <div className="header-actions">
                            <button onClick={() => setIsOpen(false)} className="header-btn">
                                <Minimize2 size={16} />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="header-btn">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="chat-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message ${msg.sender}`}>
                                <div className="message-avatar">
                                    {msg.sender === 'buddy' ? <Bot size={16} /> : <User size={16} />}
                                </div>
                                <div className="message-content">
                                    <div className="message-text">
                                        {msg.message.split('\n').map((line, index) => (
                                            <div key={index}>{line}</div>
                                        ))}
                                    </div>
                                    <div className="message-time">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {isTyping && (
                            <div className="message buddy">
                                <div className="message-avatar">
                                    <Bot size={16} />
                                </div>
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="chat-input">
                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask Study Buddy anything..."
                            rows={1}
                            className="input-field"
                        />
                        <button 
                            onClick={sendMessage} 
                            disabled={!inputMessage.trim() || isTyping}
                            className="send-button"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default StudyBuddyChat;
