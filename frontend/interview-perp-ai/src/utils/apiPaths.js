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
        REVIEW: (id) => `/api/questions/${id}/review`, // ✅ FIX: Added the missing REVIEW path
    },
};
