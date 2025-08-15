// File: backend/routes/analyticsRoutes.js

const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { 
    getPerformanceOverTime, 
    getPerformanceByTopic,
    getDailyActivity,
    getMasteryRatio,
} = require('../controllers/analyticsController');

const router = express.Router();

// --- ANALYTICS ROUTES ---

router.get('/performance-over-time', protect, getPerformanceOverTime);
router.get('/performance-by-topic', protect, getPerformanceByTopic);
router.get('/daily-activity', protect, getDailyActivity);
router.get('/mastery-ratio', protect, getMasteryRatio);

module.exports = router;
