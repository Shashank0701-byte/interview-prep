import React, { useState, useEffect } from "react";
import { Bot, Sparkles, PartyPopper, Sun, Coffee, Moon, X } from "lucide-react";
import "./GreetingPopup.css";

const NEW_USER_THRESHOLD_DAYS = 1; // Users with account < 1 day are "new"

const getVisitKey = (userId) => `interview_prep_last_visit_${userId || 'anonymous'}`;

const getTimeBasedEmoji = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { emoji: "🌅", label: "morning" };
  if (hour < 17) return { emoji: "☀️", label: "afternoon" };
  if (hour < 21) return { emoji: "🌆", label: "evening" };
  return { emoji: "🌙", label: "night" };
};

const getTimeBasedIcon = () => {
  const hour = new Date().getHours();
  if (hour < 12) return <Sun size={28} />;
  if (hour < 17) return <Sun size={28} />;
  if (hour < 21) return <Coffee size={28} />;
  return <Moon size={28} />;
};

/**
 * Generates a greeting object based on user data and visit history.
 * Priority: New user detection (by createdAt) ALWAYS takes precedence
 * over visit history to prevent stale localStorage keys from
 * showing returning-user greetings to brand-new accounts.
 */
const generateGreeting = (user, lastVisitISO) => {
  const name = user?.name || "there";
  const firstName = name.split(" ")[0];
  const timeEmoji = getTimeBasedEmoji();

  // ── PRIORITY 1: New user detection (account age < threshold) ──
  // Always check this first, regardless of visit history.
  // A stale visit key from a previous session should never override this.
  if (user?.createdAt) {
    const accountAge = Date.now() - new Date(user.createdAt).getTime();
    const accountAgeDays = accountAge / (1000 * 60 * 60 * 24);

    if (accountAgeDays < NEW_USER_THRESHOLD_DAYS) {
      return {
        title: `Welcome to Interview Prep, ${firstName}! 🎉`,
        message:
          "I'm your Study Buddy! Ready to create your first practice session and start your journey?",
        badge: "🌟 New Explorer",
        showChatPrompt: true,
      };
    }
  }

  // ── PRIORITY 2: First visit (no visit key in localStorage) ──
  if (!lastVisitISO) {
    return {
      title: `Welcome back, ${firstName}! ${timeEmoji.emoji}`,
      message:
        "Good to see you again! Your interview sessions are waiting. What would you like to work on today?",
      badge: "👋 Welcome Back",
      showChatPrompt: true,
    };
  }

  // ── PRIORITY 3: Returning user — time-based greetings ──
  const lastVisit = new Date(lastVisitISO);
  const now = new Date();
  const diffMs = now - lastVisit;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Same session / just refreshed (within 5 min)
  if (diffMinutes < 5) {
    const greetings = [
      `Hey ${firstName}! Right back at it? 🔥`,
      `Back so soon, ${firstName}? I like your energy! ⚡`,
      `${firstName}! Ready for round two? Let's go! 💪`,
    ];
    return {
      title: greetings[Math.floor(Math.random() * greetings.length)],
      message: "What's on your mind? Need to review a session or start something new?",
      badge: "⚡ Quick Return",
      showChatPrompt: false,
    };
  }

  // Same day (but more than 5 min apart)
  if (diffDays < 1) {
    const greetings = [
      `Back for more, ${firstName}? Love it! 📚`,
      `Hey ${firstName}, still grinding! Let's keep going! 💪`,
      `${firstName}! You're on a roll today! Keep it up! 🚀`,
    ];
    return {
      title: greetings[Math.floor(Math.random() * greetings.length)],
      message: "What's on your agenda? Want to pick up where you left off or try something new?",
      badge: "📚 Back Today",
      showChatPrompt: true,
    };
  }

  // A few days
  if (diffDays < 3) {
    return {
      title: `Welcome back, ${firstName}! 👋`,
      message: "Hope you had a good break! Your sessions are ready and waiting. Want to check your progress?",
      badge: "🔄 Return Visit",
      showChatPrompt: true,
    };
  }

  // A week or more
  if (diffDays < 7) {
    return {
      title: `Long time no see, ${firstName}! 😄`,
      message: "It's been a few days! Don't worry, I've kept your sessions safe. Ready to jump back in? 🌟",
      badge: "⏰ Been A While",
      showChatPrompt: true,
    };
  }

  // More than a week
  if (diffDays < 30) {
    return {
      title: `Wow, it's been a while, ${firstName}! 🌟`,
      message: "I missed you! Your progress is still here, and I've got fresh questions waiting. Let's get back on track! 🎯",
      badge: "⭐ Welcome Back!",
      showChatPrompt: true,
    };
  }

  // More than a month
  return {
    title: `${firstName}! So good to see you again! 🎉`,
    message: "It's been quite some time! But you're back, and that's what matters. Let me help you restart stronger than ever! 🚀",
    badge: "🎉 Great Return!",
    showChatPrompt: true,
  };
};

const GreetingPopup = ({ user, onClose, onStartChat }) => {
  const [greeting, setGreeting] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!user || greeting) return;

    const visitKey = getVisitKey(user?._id || user?.id);
    const lastVisit = localStorage.getItem(visitKey);
    const generated = generateGreeting(user, lastVisit);
    setGreeting(generated);

    // Update last visit timestamp (user-specific key)
    localStorage.setItem(visitKey, new Date().toISOString());
  }, [user, greeting]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleStartChat = () => {
    handleClose();
    if (onStartChat) {
      setTimeout(() => onStartChat(), 350);
    }
  };

  if (!greeting) return null;

  return (
    <div className={`greeting-popup-wrapper ${isClosing ? "closing" : ""}`}>
      <div className="greeting-popup-card">
        {/* Close button */}
        <button className="greeting-close" onClick={handleClose} aria-label="Close greeting">
          <X size={16} />
        </button>

        {/* Header */}
        <div className="greeting-header">
          <div className="greeting-avatar">{getTimeBasedIcon()}</div>
          <div className="greeting-badge">{greeting.badge}</div>
          <h2 className="greeting-title">{greeting.title}</h2>
        </div>

        {/* Body */}
        <div className="greeting-body">
          <p className="greeting-message">{greeting.message}</p>
        </div>

        {/* Actions */}
        <div className="greeting-actions">
          <button className="greeting-btn-primary" onClick={handleClose}>
            <PartyPopper size={16} />
            Let's Go! 🚀
          </button>

          {greeting.showChatPrompt && (
            <button className="greeting-btn-secondary" onClick={handleStartChat}>
              <Bot size={14} />
              Chat with Study Buddy
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GreetingPopup;

