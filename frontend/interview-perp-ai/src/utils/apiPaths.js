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
    // New collaborative features
    STUDY_GROUPS: {
        CREATE: "/api/study-groups",
        GET_ALL: "/api/study-groups",
        GET_ONE: (id) => `/api/study-groups/${id}`,
        JOIN: (id) => `/api/study-groups/${id}/join`,
        LEAVE: (id) => `/api/study-groups/${id}/leave`,
        HANDLE_REQUEST: (id) => `/api/study-groups/${id}/handle-request`,
        ADD_RESOURCE: (id) => `/api/study-groups/${id}/resources`,
        DELETE: (id) => `/api/study-groups/${id}`,
        GET_USER_GROUPS: "/api/study-groups/user/groups",
        INVITE_USER: (id) => `/api/study-groups/${id}/invite`,
        INVITE_BY_EMAIL: (id) => `/api/study-groups/${id}/invite-by-email`,
        SEARCH_USERS: "/api/study-groups/search-users",
    },
    PEER_REVIEWS: {
        CREATE: "/api/peer-reviews",
        GET_RECEIVED: "/api/peer-reviews/received",
        GET_GIVEN: "/api/peer-reviews/given",
        GET_ONE: (id) => `/api/peer-reviews/${id}`,
        UPDATE: (id) => `/api/peer-reviews/${id}`,
        DELETE: (id) => `/api/peer-reviews/${id}`,
        REQUEST: "/api/peer-reviews/request",
        GET_OPEN_REQUESTS: "/api/peer-reviews/requests/open",
        ACCEPT_REQUEST: (id) => `/api/peer-reviews/requests/${id}/accept`,
    },
    MENTORSHIPS: {
        REQUEST: "/api/mentorships/request",
        RESPOND: (id) => `/api/mentorships/${id}/respond`,
        GET_ALL: "/api/mentorships",
        GET_ONE: (id) => `/api/mentorships/${id}`,
        ADD_NOTE: (id) => `/api/mentorships/${id}/notes`,
        SCHEDULE_MEETING: (id) => `/api/mentorships/${id}/meetings`,
        UPDATE_MEETING: (id) => `/api/mentorships/${id}/meetings`,
        UPDATE_PROGRESS: (id) => `/api/mentorships/${id}/progress`,
        END: (id) => `/api/mentorships/${id}/end`,
        GET_AVAILABLE_MENTORS: "/api/mentorships/mentors/available",
    },
    FORUMS: {
        CREATE: "/api/forums",
        GET_ALL: "/api/forums",
        GET_ONE: (id) => `/api/forums/${id}`,
        UPDATE: (id) => `/api/forums/${id}`,
        DELETE: (id) => `/api/forums/${id}`,
        CREATE_POST: (id) => `/api/forums/${id}/posts`,
        GET_POST: (postId) => `/api/forums/posts/${postId}`,
        ADD_COMMENT: (postId) => `/api/forums/posts/${postId}/comments`,
        UPVOTE_POST: (postId) => `/api/forums/posts/${postId}/upvote`,
        UPDATE_POST: (postId) => `/api/forums/posts/${postId}`,
        DELETE_POST: (postId) => `/api/forums/posts/${postId}`,
        GET_USER_POSTS: "/api/forums/user/posts",
    },
};
