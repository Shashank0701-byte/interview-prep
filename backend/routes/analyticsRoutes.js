// File: backend/routes/analyticsRoutes.js

const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { 
    getPerformanceOverTime, 
    getPerformanceByTopic,
    getDailyActivity,
    getMasteryRatio,
    getProgressStats,
    getStreakData,
    getAIInterviewInsights,
    getCommunicationAnalysis,
    getSkillGapAnalysis,
} = require('../controllers/analyticsController');

const router = express.Router();

// --- ANALYTICS ROUTES ---

router.get('/performance-over-time', protect, getPerformanceOverTime);
router.get('/performance-by-topic', protect, getPerformanceByTopic);
router.get('/daily-activity', protect, getDailyActivity);
router.get('/mastery-ratio', protect, getMasteryRatio);
router.get('/progress-stats', protect, getProgressStats);
router.get('/streak-data', protect, getStreakData);

// --- AI INTERVIEW ANALYTICS ROUTES ---
router.get('/ai-interview-insights', protect, getAIInterviewInsights);
router.get('/communication-analysis', protect, getCommunicationAnalysis);
router.get('/skill-gap-analysis', protect, getSkillGapAnalysis);

module.exports = router;
