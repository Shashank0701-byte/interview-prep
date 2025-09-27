// Use environment variable or fallback to localhost for development
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// For production without backend, you can use a mock API or disable features
export const IS_PRODUCTION = import.meta.env.PROD;
export const HAS_BACKEND = import.meta.env.VITE_API_BASE_URL !== undefined;

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
        COMPANY_QUESTIONS: "/api/ai/company-questions",
        GENERATE_FOLLOW_UP: "/api/ai/follow-up",
    },
    // ✅ FIX: Renamed to SESSIONS for consistency
    SESSIONS: { 
        CREATE: "/api/sessions/create",
        GET_MY_SESSIONS: "/api/sessions/my-sessions", // ✅ FIX: Renamed for clarity
        GET_ONE: (id) => `/api/sessions/${id}`,
        DELETE: (id) => `/api/sessions/${id}`,
        GET_REVIEW_QUEUE: "/api/sessions/review-queue",
        UPDATE_RATING: (id) => `/api/sessions/${id}/rating`,
        UPDATE_PROGRESS: (id) => `/api/sessions/${id}/progress`,
    },
    QUESTION: {
        ADD_TO_SESSION: "/api/questions/add",
        PIN: (id) => `/api/questions/${id}/pin`,
        UPDATE_NOTE: (id) => `/api/questions/${id}/note`, // ✅ FIX: Using one consistent name
        TOGGLE_MASTERED: (id) => `/api/questions/${id}/master`,
        GET_QUESTIONS_BY_COMPANY: "/api/questions/by-company",
        REVIEW: (id) => `/api/questions/${id}/review`, // ✅ FIX: Added the missing REVIEW path
        UPDATE_JUSTIFICATION: (id) => `/api/questions/${id}/justification`,
        UPDATE_RATING: (id) => `/api/questions/${id}/rating`,
        FILTER: "/api/questions/filter",
    },
    ANALYTICS: {
        GET_PERFORMANCE_OVER_TIME: "/api/analytics/performance-over-time",
        GET_PERFORMANCE_BY_TOPIC: "/api/analytics/performance-by-topic",
        GET_FILLER_WORDS: "/api/analytics/filler-words",
        GET_DAILY_ACTIVITY: "/api/analytics/daily-activity",
        GET_MASTERY_RATIO: "/api/analytics/mastery-ratio",
        GET_PROGRESS_STATS: "/api/analytics/progress-stats",
        GET_STREAK_DATA: "/api/analytics/streak-data",
    },
    FEEDBACK: {
        GENERATE: 'api/feedback', // Add this new path
    },
    COMPANIES: {
        GET_ALL: "/api/companies",
        GET_ONE: (id) => `/api/companies/${id}`,
        SEARCH: "/api/companies/search",
        GET_QUESTIONS: (id) => `/api/companies/${id}/questions`,
        ADD_QUESTION: (id) => `/api/companies/${id}/questions`,
        GET_STATS: (id) => `/api/companies/${id}/stats`,
    },
    AI_INTERVIEW: {
        START: "/api/ai-interview/start",
        SUBMIT_ANSWER: (sessionId) => `/api/ai-interview/${sessionId}/answer`,
        COMPLETE: (sessionId) => `/api/ai-interview/${sessionId}/complete`,
        GET_SESSION: (sessionId) => `/api/ai-interview/${sessionId}`,
    },
    RECRUITER: {
        DASHBOARD: "/api/recruiter/dashboard",
        CANDIDATES: "/api/recruiter/candidates",
        CANDIDATE_PROFILE: (candidateId) => `/api/recruiter/candidates/${candidateId}`,
        ANALYTICS: "/api/recruiter/analytics",
    },
    LEARNING_PATH: {
        CREATE: "/api/learning-path/create",
        GET: "/api/learning-path",
        UPDATE_SKILL: (skillName) => `/api/learning-path/skill/${skillName}`,
        RECOMMENDATIONS: "/api/learning-path/recommendations",
        COMPLETE_ITEM: "/api/learning-path/complete-item",
    },
    ROADMAP: {
        GET_ROLES: "/api/roadmap/roles",
        GET_PROGRESS: "/api/roadmap/progress",
        GENERATE: (role) => `/api/roadmap/${encodeURIComponent(role)}`,
    },
    ROADMAP_SESSIONS: {
        CREATE: "/api/roadmap-sessions/create",
        GET_PHASE_SESSIONS: (role, phaseId) => `/api/roadmap-sessions/phase/${encodeURIComponent(role)}/${phaseId}`,
        GET_MY_SESSIONS: "/api/roadmap-sessions/my-sessions",
        GET_ONE: (id) => `/api/roadmap-sessions/${id}`,
        DELETE: (id) => `/api/roadmap-sessions/${id}`,
        UPDATE_RATING: (id) => `/api/roadmap-sessions/${id}/rating`,
        UPDATE_PROGRESS: (id) => `/api/roadmap-sessions/${id}/progress`,
    },
   
};
