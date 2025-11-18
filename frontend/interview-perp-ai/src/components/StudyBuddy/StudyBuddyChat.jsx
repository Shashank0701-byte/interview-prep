import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Bot, User, X, Minimize2 } from 'lucide-react';
import './StudyBuddyChat.css';

const StudyBuddyChat = ({ userId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: "buddy",
            message: "Hi there! 👋 I'm your Study Buddy! I'm here to help you with your interview prep journey. How are you feeling about your progress today?",
            timestamp: new Date().toISOString(),
        },
    ]);
    const [inputMessage, setInputMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Check AI service health on mount
    useEffect(() => {
        checkAIServiceHealth().then((healthy) => {
            console.log(healthy ? "✅ AI Service Ready" : "⚠️ AI Offline (fallback enabled)");
        });
    }, []);

    // ----------- AI Response (Fixed, Uses Relative API Path) -----------
    const generateResponse = async (userMessage) => {
        try {
            setIsTyping(true);

            const response = await fetch(`/api/ai/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: userMessage,
                    userId: userId || "anonymous",
                    sessionId: Date.now().toString(),
                }),
            });

            const data = await response.json();

            if (data.success) {
                console.log("AI Response:", data);
                return data.message;
            }
            return "Hmm... something went wrong, try again!";
        } catch (err) {
            console.error("Chat API error:", err);
            return "AI is temporarily unavailable — please try again soon! 💛";
        } finally {
            setIsTyping(false);
        }
    };

    // ----------- Health Check (Fixed URL) -----------
    const checkAIServiceHealth = async () => {
        try {
            const response = await fetch(`/api/ai/health`);
            const health = await response.json();
            return health.success && health.pipelineReady;
        } catch (e) {
            console.error("Health check failed", e);
            return false;
        }
    };

    // ----------- Send Message Handler -----------
    const sendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = {
            id: Date.now(),
            sender: "user",
            message: inputMessage,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);

        const messageToSend = inputMessage;
        setInputMessage("");

        const aiReply = await generateResponse(messageToSend);

        const buddyMessage = {
            id: Date.now() + 1,
            sender: "buddy",
            message: aiReply,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, buddyMessage]);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Floating Toggle Button */}
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
                                    {msg.sender === "buddy" ? <Bot size={16} /> : <User size={16} />}
                                </div>
                                <div className="message-content">
                                    <div className="message-text">
                                        {msg.message.split("\n").map((line, idx) => (
                                            <div key={idx}>{line}</div>
                                        ))}
                                    </div>
                                    <div className="message-time">
                                        {new Date(msg.timestamp).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
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
