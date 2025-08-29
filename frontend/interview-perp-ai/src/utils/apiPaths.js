export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

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
    COLLABORATIVE: {
        STUDY_GROUPS: {
            BASE: "/api/collaborative/study-groups",
            GET_ALL: "/api/collaborative/study-groups",
            GET_ONE: (id) => `/api/collaborative/study-groups/${id}`,
            CREATE: "/api/collaborative/study-groups",
            UPDATE: (id) => `/api/collaborative/study-groups/${id}`,
            DELETE: (id) => `/api/collaborative/study-groups/${id}`,
            JOIN: (id) => `/api/collaborative/study-groups/${id}/join`,
            LEAVE: (id) => `/api/collaborative/study-groups/${id}/leave`,
            REQUEST_JOIN: (id) => `/api/collaborative/study-groups/${id}/request`,
            RESPOND_REQUEST: (id, requestId) => `/api/collaborative/study-groups/${id}/respond-request/${requestId}`,
            ADD_RESOURCE: (id) => `/api/collaborative/study-groups/${id}/resources`,
            REMOVE_RESOURCE: (id, resourceId) => `/api/collaborative/study-groups/${id}/resources/${resourceId}`,
            ADD_MESSAGE: (id) => `/api/collaborative/study-groups/${id}/messages`,
            GET_MESSAGES: (id) => `/api/collaborative/study-groups/${id}/messages`,
            INVITE_USER: (id) => `/api/collaborative/study-groups/${id}/invite`,
            RESPOND_INVITATION: (invitationId) => `/api/collaborative/study-groups/invitations/${invitationId}/respond`,
            USER_CREATED: "/api/collaborative/study-groups/user/created",
            USER_JOINED: "/api/collaborative/study-groups/user/joined",
            USER_INVITATIONS: "/api/collaborative/study-groups/user/invitations"
        },
        FORUMS: {
            BASE: "/api/collaborative/forums",
            GET_ALL: "/api/collaborative/forums",
            GET_ONE: (id) => `/api/collaborative/forums/${id}`,
            CREATE: "/api/collaborative/forums",
            UPDATE: (id) => `/api/collaborative/forums/${id}`,
            DELETE: (id) => `/api/collaborative/forums/${id}`,
            CREATE_POST: (id) => `/api/collaborative/forums/${id}/posts`,
            CREATE_REPLY: (forumId, postId) => `/api/collaborative/forums/${forumId}/posts/${postId}/replies`,
            UPDATE_POST: (forumId, postId) => `/api/collaborative/forums/${forumId}/posts/${postId}`,
            DELETE_POST: (forumId, postId) => `/api/collaborative/forums/${forumId}/posts/${postId}`,
            UPVOTE_POST: (forumId, postId) => `/api/collaborative/forums/${forumId}/posts/${postId}/upvote`,
            GET_CATEGORIES: "/api/collaborative/forums/categories",
            GET_POPULAR_TAGS: "/api/collaborative/forums/tags/popular",
            USER_ACTIVITY: "/api/collaborative/forums/user/activity"
        },
        MENTORSHIPS: {
            BASE: "/api/collaborative/mentorships",
            GET_ALL: "/api/collaborative/mentorships",
            GET_ONE: (id) => `/api/collaborative/mentorships/${id}`,
            REQUEST: "/api/collaborative/mentorships/request",
            RESPOND: (id) => `/api/collaborative/mentorships/${id}/respond`,
            ADD_NOTE: (id) => `/api/collaborative/mentorships/${id}/notes`,
            SCHEDULE_MEETING: (id) => `/api/collaborative/mentorships/${id}/meetings`,
            UPDATE_MEETING: (id) => `/api/collaborative/mentorships/${id}/meetings`,
            UPDATE_PROGRESS: (id) => `/api/collaborative/mentorships/${id}/progress`,
            END: (id) => `/api/collaborative/mentorships/${id}/end`,
            GET_AVAILABLE_MENTORS: "/api/collaborative/mentorships/mentors/available"
        },
        PEER_REVIEWS: {
            BASE: "/api/collaborative/peer-reviews",
            CREATE_REQUEST: "/api/collaborative/peer-reviews/requests",
            GET_ALL_REQUESTS: "/api/collaborative/peer-reviews/requests/all",
            GET_USER_REQUESTS: "/api/collaborative/peer-reviews/requests/user",
            GET_ASSIGNED_REQUESTS: "/api/collaborative/peer-reviews/requests/assigned",
            ASSIGN_REQUEST: "/api/collaborative/peer-reviews/requests/assign",
            SUBMIT_REVIEW: (requestId) => `/api/collaborative/peer-reviews/requests/${requestId}/submit`,
            GET_REVIEW: (id) => `/api/collaborative/peer-reviews/${id}`,
            GET_RECEIVED_REVIEWS: "/api/collaborative/peer-reviews/user/received",
            GET_SUBMITTED_REVIEWS: "/api/collaborative/peer-reviews/user/submitted",
            CANCEL_REQUEST: (id) => `/api/collaborative/peer-reviews/requests/${id}/cancel`,
            GET_USER_STATS: "/api/collaborative/peer-reviews/user/stats"
        }
    }
};
