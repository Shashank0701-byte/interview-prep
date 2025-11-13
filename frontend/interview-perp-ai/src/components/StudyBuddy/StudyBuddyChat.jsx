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

    // Simple rule-based responses (no backend needed for now)
    const generateResponse = (userMessage) => {
        const message = userMessage.toLowerCase();
        
        // Greeting responses
        if (message.includes('hi') || message.includes('hello') || message.includes('hey')) {
            return "Hello! 😊 Great to see you here! What would you like to work on today? I can help with study planning, motivation, or just chat about your progress!";
        }
        
        // Progress inquiries
        if (message.includes('progress') || message.includes('how am i doing')) {
            return "You're making excellent progress! 📈 I can see you've been consistent with your sessions. Keep up the momentum - every session brings you closer to your interview success! What topic would you like to focus on next?";
        }
        
        // Motivation requests
        if (message.includes('tired') || message.includes('frustrated') || message.includes('difficult') || message.includes('hard')) {
            return "I totally understand! 💪 Interview prep can be challenging, but remember - every expert was once a beginner. You're building skills that will serve you for life. Take a short break if needed, then come back stronger! What's the specific challenge you're facing?";
        }
        
        // Study planning
        if (message.includes('what should i study') || message.includes('recommend') || message.includes('next topic')) {
            return "Great question! 🎯 Based on common interview patterns, I'd suggest focusing on:\n\n• Arrays and Strings (fundamental building blocks)\n• Two Pointers technique\n• Hash Maps for optimization\n• Basic Tree traversals\n\nWhich of these sounds interesting to you?";
        }
        
        // Achievement sharing
        if (message.includes('completed') || message.includes('finished') || message.includes('solved')) {
            return "Fantastic work! 🎉 That's the spirit I love to see! Every problem you solve makes you stronger. You're building the confidence and skills needed for your interviews. What's your next challenge?";
        }
        
        // Help requests
        if (message.includes('help') || message.includes('stuck') || message.includes('confused')) {
            return "I'm here to help! 🤝 Don't worry about being stuck - it's part of the learning process. Can you tell me more about what's confusing you? I can break it down into smaller, manageable steps!";
        }
        
        // Time management
        if (message.includes('time') || message.includes('schedule') || message.includes('when')) {
            return "Time management is key! ⏰ I recommend:\n\n• 25-30 min focused sessions\n• Study during your peak energy hours\n• Take 5-10 min breaks between sessions\n• Consistency over intensity\n\nWhat time of day do you feel most focused?";
        }
        
        // Farewell
        if (message.includes('bye') || message.includes('goodbye') || message.includes('see you')) {
            return "Great session today! 🌟 Keep up the excellent work and I'll be here whenever you need support. Remember, you're closer to your goal than when you started. See you soon!";
        }
        
        // Default responses
        const defaultResponses = [
            "That's interesting! Tell me more about what you're thinking. I'm here to support your learning journey! 🚀",
            "I love your curiosity! How can I help you tackle your interview prep goals today? 💪",
            "Great question! What specific aspect would you like to explore? I'm here to guide you through it! 📚",
            "I'm here to help you succeed! What's on your mind regarding your interview preparation? 🎯"
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
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
        setInputMessage('');
        setIsTyping(true);

        // Simulate typing delay
        setTimeout(() => {
            const response = generateResponse(inputMessage);
            const buddyMessage = {
                id: Date.now() + 1,
                sender: 'buddy',
                message: response,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, buddyMessage]);
            setIsTyping(false);
        }, 1000 + Math.random() * 1000); // 1-2 second delay
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
