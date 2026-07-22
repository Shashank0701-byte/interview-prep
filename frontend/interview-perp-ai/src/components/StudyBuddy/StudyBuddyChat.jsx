// ./src/components/StudyBuddyChat/StudyBuddyChat.jsx
import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Bot, User, X, Minimize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BASE_URL } from "../../utils/apiPaths";
import "./StudyBuddyChat.css";

const StudyBuddyChat = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "buddy",
      message:
        "Hi there! 👋 I'm your Study Buddy! I'm here to help you with your interview prep journey. How are you feeling about your progress today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const messagesEndRef = useRef(null);
  const lastMessageRef = useRef(null);

  // Smart scrolling logic
  useEffect(() => {
    if (messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];

    // If the last message is from the bot, scroll to its start so the user sees the beginning
    if (lastMsg.sender === "buddy" && lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // If it's from the user, scroll to the bottom to see the input area/response
    else if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Health check on mount
  useEffect(() => {
    checkAIHealth().then((healthy) => {
      console.log(
        healthy
          ? "✅ AI service ready"
          : "⚠️ AI offline → fallback enabled"
      );
    });
  }, []);

  // Load conversation history on mount
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (!userId || userId === "anonymous") {
        console.log("Skipping history load for anonymous user");
        return;
      }

      try {
        setIsLoadingHistory(true);
        const res = await fetch(`${BASE_URL}/api/ai/memory/${userId}`);
        const data = await res.json();

        if (data.success && data.memory && data.memory.length > 0) {
          console.log(`📚 Loaded ${data.memory.length} previous messages`);

          // Convert backend memory format to UI message format
          const historicalMessages = data.memory.map((entry, idx) => ({
            id: `history-${idx}-${Date.now()}`,
            sender: entry.role === "user" ? "user" : "buddy",
            message: entry.text,
            timestamp: entry.ts || new Date().toISOString(),
          }));

          // Replace messages with welcome + history
          setMessages([messages[0], ...historicalMessages]);
        } else {
          console.log("No previous conversation history found");
        }
      } catch (err) {
        console.error("Failed to load conversation history:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadConversationHistory();
  }, [userId]);

  const checkAIHealth = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/ai/health`);
      const data = await res.json();
      return data.success && data.pipelineReady;
    } catch (err) {
      console.error("Health error:", err);
      return false;
    }
  };

  const generateResponse = async (userMessage) => {
    try {
      setIsTyping(true);

      const res = await fetch(`${BASE_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          userId: userId || "anonymous",
          sessionId: Date.now().toString(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        return data.message;
      }

      return "Hmm... something went wrong — try again!";
    } catch (err) {
      console.error("Chat API error:", err);
      return "AI is temporarily unavailable — please try again soon! ⚠️";
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const text = inputMessage;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      message: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");

    const reply = await generateResponse(text);

    const botMsg = {
      id: Date.now() + 1,
      sender: "buddy",
      message: reply,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, botMsg]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <div
          className="study-buddy-toggle"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle size={24} />
          <span className="toggle-text">Study Buddy</span>
          <div className="notification-dot"></div>
        </div>
      )}

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
              <button
                className="header-btn"
                onClick={() => setIsOpen(false)}
              >
                <Minimize2 size={16} />
              </button>
              <button
                className="header-btn"
                onClick={() => setIsOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {isLoadingHistory && (
              <div className="message buddy">
                <div className="message-avatar">
                  <Bot size={16} />
                </div>
                <div className="message-content">
                  <div className="message-text">
                    Loading previous conversation...
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`message ${msg.sender}`}
                ref={index === messages.length - 1 ? lastMessageRef : null}
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
{msg.sender === "buddy" ? (
                      <div className="markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.message}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.message
                    )}
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
            ></textarea>

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
