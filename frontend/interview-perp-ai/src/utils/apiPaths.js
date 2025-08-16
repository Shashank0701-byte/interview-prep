export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
    AUTH: {
        REGISTER: "/api/auth/register",
        LOGIN: "/api/auth/login",
        GET_PROFILE: "/api/auth/profile",
    },
    IMAGE: {
        UPLOAD_IMAGE: "/api/auth/upload-image",
    },
    AI: {
        GENERATE_QUESTIONS: "/api/ai/generate-questions",
        GENERATE_EXPLANATION: "/api/ai/generate-explanation",
        PRACTICE_FEEDBACK: "/api/ai/practice-feedback", 
        COMPANY_TAGS: "/api/ai/company-tags",
    },
    // ✅ FIX: Renamed to SESSIONS for consistency
    SESSIONS: { 
        CREATE: "/api/sessions/create",
        GET_MY_SESSIONS: "/api/sessions/my-sessions", // ✅ FIX: Renamed for clarity
        GET_ONE: (id) => `/api/sessions/${id}`,
        DELETE: (id) => `/api/sessions/${id}`,
        GET_REVIEW_QUEUE: "/api/sessions/review-queue",
    },
    QUESTION: {
        ADD_TO_SESSION: "/api/questions/add",
        PIN: (id) => `/api/questions/${id}/pin`,
        UPDATE_NOTE: (id) => `/api/questions/${id}/note`, // ✅ FIX: Using one consistent name
        TOGGLE_MASTERED: (id) => `/api/questions/${id}/master`,
        GET_QUESTIONS_BY_COMPANY: "/api/questions/by-company",
        REVIEW: (id) => `/api/questions/${id}/review`, // ✅ FIX: Added the missing REVIEW path
    },
    ANALYTICS: {
        GET_PERFORMANCE_OVER_TIME: "/api/analytics/performance-over-time",
        GET_PERFORMANCE_BY_TOPIC: "/api/analytics/performance-by-topic",
        GET_FILLER_WORDS: "/api/analytics/filler-words",
        GET_DAILY_ACTIVITY: "/api/analytics/daily-activity",
        GET_MASTERY_RATIO: "/api/analytics/mastery-ratio",
    },
    FEEDBACK: {
        GENERATE: 'api/feedback', // Add this new path
    },
};
