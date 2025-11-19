<<<<<<< HEAD
import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Bot, User, X, Minimize2 } from "lucide-react";
import { BASE_URL } from "../../utils/apiPaths";
import "./StudyBuddyChat.css";
=======
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Bot, User, X, Minimize2 } from 'lucide-react';
import './StudyBuddyChat.css';
>>>>>>> 991354d8d4d6c6c0980bbacfa805324e6c2f712f

const StudyBuddyChat = ({ userId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: "buddy",
<<<<<<< HEAD
            message:
                "Hi there! 👋 I'm your Study Buddy! I'm here to help you with your interview prep journey. How are you feeling about your progress today?",
=======
            message: "Hi there! 👋 I'm your Study Buddy! I'm here to help you with your interview prep journey. How are you feeling about your progress today?",
>>>>>>> 991354d8d4d6c6c0980bbacfa805324e6c2f712f
            timestamp: new Date().toISOString(),
        },
    ]);
    const [inputMessage, setInputMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

<<<<<<< HEAD
    /* Scroll chat to bottom */
=======
>>>>>>> 991354d8d4d6c6c0980bbacfa805324e6c2f712f
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

<<<<<<< HEAD
    /* Health Check (fixed with BASE_URL) */
    useEffect(() => {
        checkAIServiceHealth().then((healthy) => {
            console.log(
                healthy
                    ? "✅ AI Service Ready"
                    : "⚠️ AI Offline (fallback enabled)"
            );
        });
    }, []);

    /* -------------------------------
       AI CHAT REQUEST (FIXED)
    --------------------------------*/
=======
    // Check AI service health on mount
    useEffect(() => {
        checkAIServiceHealth().then((healthy) => {
            console.log(healthy ? "✅ AI Service Ready" : "⚠️ AI Offline (fallback enabled)");
        });
    }, []);

    // ----------- AI Response (Fixed, Uses Relative API Path) -----------
>>>>>>> 991354d8d4d6c6c0980bbacfa805324e6c2f712f
    const generateResponse = async (userMessage) => {
        try {
            setIsTyping(true);

<<<<<<< HEAD
            const response = await fetch(`${BASE_URL}/api/ai/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
=======
            const response = await fetch(`/api/ai/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
>>>>>>> 991354d8d4d6c6c0980bbacfa805324e6c2f712f
                body: JSON.stringify({
                    message: userMessage,
                    userId: userId || "anonymous",
                    sessionId: Date.now().toString(),
                }),
            });

            const data = await response.json();

            if (data.success) {
<<<<<<< HEAD
                return data.message;
            }

            return "Hmm... something went wrong. Try again!";
        } catch (err) {
            console.error("Chat API error:", err);
            return "AI is temporarily unavailable — please try again soon! ⚠️";
=======
                console.log("AI Response:", data);
                return data.message;
            }
            return "Hmm... something went wrong, try again!";
        } catch (err) {
            console.error("Chat API error:", err);
            return "AI is temporarily unavailable — please try again soon! 💛";
>>>>>>> 991354d8d4d6c6c0980bbacfa805324e6c2f712f
        } finally {
            setIsTyping(false);
        }
    };

<<<<<<< HEAD
    /* -------------------------------
       HEALTH CHECK (FIXED)
    --------------------------------*/
    const checkAIServiceHealth = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/ai/health`);
            const health = await response.json();

            return health.success && health.pipelineReady;
        } catch (err) {
            console.error("Health check failed:", err);
=======
    // ----------- Health Check (Fixed URL) -----------
    const checkAIServiceHealth = async () => {
        try {
            const response = await fetch(`/api/ai/health`);
            const health = await response.json();
            return health.success && health.pipelineReady;
        } catch (e) {
            console.error("Health check failed", e);
>>>>>>> 991354d8d4d6c6c0980bbacfa805324e6c2f712f
            return false;
        }
    };

<<<<<<< HEAD
    /* -------------------------------
       Send Message Handler
    --------------------------------*/
=======
    // ----------- Send Message Handler -----------
>>>>>>> 991354d8d4d6c6c0980bbacfa805324e6c2f712f
    const sendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = {
            id: Date.now(),
            sender: "user",
            message: inputMessage,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
<<<<<<< HEAD
        const textToSend = inputMessage;
        setInputMessage("");

        const aiReply = await generateResponse(textToSend);
=======

        const messageToSend = inputMessage;
        setInputMessage("");

        const aiReply = await generateResponse(messageToSend);
>>>>>>> 991354d8d4d6c6c0980bbacfa805324e6c2f712f

        const buddyMessage = {
            id: Date.now() + 1,
            sender: "buddy",
            message: aiReply,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, buddyMessage]);
    };

<<<<<<< HEAD
    /* Press Enter to send */
=======
>>>>>>> 991354d8d4d6c6c0980bbacfa805324e6c2f712f
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
<<<<<<< HEAD
                <div
                    className="study-buddy-toggle"
                    onClick={() => setIsOpen(true)}
                >
=======
                <div className="study-buddy-toggle" onClick={() => setIsOpen(true)}>
>>>>>>> 991354d8d4d6c6c0980bbacfa805324e6c2f712f
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
<<<<<<< HEAD
                                <span className="status">
                                    Online • Ready to help!
                                </span>
                            </div>
                        </div>
                        <div className="header-actions">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="header-btn"
                            >
                                <Minimize2 size={16} />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="header-btn"
                            >
=======
                                <span className="status">Online • Ready to help!</span>
                            </div>
                        </div>
                        <div className="header-actions">
                            <button onClick={() => setIsOpen(false)} className="header-btn">
                                <Minimize2 size={16} />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="header-btn">
>>>>>>> 991354d8d4d6c6c0980bbacfa805324e6c2f712f
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="chat-messages">
                        {messages.map((msg) => (
<<<<<<< HEAD
                            <div
                                key={msg.id}
                                className={`message ${msg.sender}`}
                            >
                                <div className="message-avatar">
                                    {msg.sender === "buddy" ? (
                                        <Bot size={16} />
                                    ) : (
                                        <User size={16} />
                                    )}
                                </div>

                                <div className="message-content">
                                    <div className="message-text">
                                        {msg.message
                                            .split("\n")
                                            .map((line, i) => (
                                                <div key={i}>{line}</div>
                                            ))}
                                    </div>

                                    <div className="message-time">
                                        {new Date(
                                            msg.timestamp
                                        ).toLocaleTimeString([], {
=======
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
>>>>>>> 991354d8d4d6c6c0980bbacfa805324e6c2f712f
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}

<<<<<<< HEAD
                        {/* Typing indicator */}
=======
                        {/* Typing Indicator */}
>>>>>>> 991354d8d4d6c6c0980bbacfa805324e6c2f712f
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

<<<<<<< HEAD
                    {/* Input Section */}
                    <div className="chat-input">
                        <textarea
                            value={inputMessage}
                            onChange={(e) =>
                                setInputMessage(e.target.value)
                            }
                            onKeyPress={handleKeyPress}
                            placeholder="Ask Study Buddy anything..."
                            className="input-field"
                        ></textarea>

=======
                    {/* Input */}
                    <div className="chat-input">
                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask Study Buddy anything..."
                            className="input-field"
                        />
>>>>>>> 991354d8d4d6c6c0980bbacfa805324e6c2f712f
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
