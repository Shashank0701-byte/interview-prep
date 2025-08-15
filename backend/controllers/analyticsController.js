// File: backend/controllers/analyticsController.js

// --- MOCK MODELS ---
// In a real application, you would import your actual Mongoose models like this:
// const Session = require('../models/sessionModel');
// const Review = require('../models/reviewModel');
// For this example, we'll assume these models exist and have the necessary fields.

// A helper function to handle async controller logic and errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/**
 * @desc    Get user's performance accuracy over time, grouped by week.
 * @route   GET /api/analytics/performance-over-time
 * @access  Private
 */
const getPerformanceOverTime = asyncHandler(async (req, res) => {
    // This pipeline would calculate the accuracy from your 'practice sessions' or similar model.
    // FIX: Ensured all data points have the 'week' and 'accuracy' properties.
    const mockPerformanceData = [
        { week: '2025-32', accuracy: 35 },
        { week: '2025-33', accuracy: 42 },
        { week: '2025-34', accuracy: 55 },
    ];

    res.status(200).json({
        success: true,
        data: mockPerformanceData,
    });
});

/**
 * @desc    Get user's performance, grouped by topic.
 * @route   GET /api/analytics/performance-by-topic
 * @access  Private
 */
const getPerformanceByTopic = asyncHandler(async (req, res) => {
    // This pipeline would look at all user's sessions, group them by topic/role,
    // and calculate the average performance for each.
    // FIX: Ensured all data points have the 'topic' and 'performance' properties.
    const mockTopicData = [
        { topic: 'UI/UX', performance: 38 },
        { topic: 'Data Analyst', performance: 48 },
        { topic: 'Frontend Developer', performance: 72 },
    ];

    res.status(200).json({
        success: true,
        data: mockTopicData,
    });
});

/**
 * @desc    Get the number of cards reviewed each day for the last 30 days.
 * @route   GET /api/analytics/daily-activity
 * @access  Private
 */
const getDailyActivity = asyncHandler(async (req, res) => {
    // This pipeline would query a 'reviews' collection, filter by the last 30 days,
    // and group by date to count the number of reviews per day.
    // FIX: Ensured all data points have the '_id' (date) and 'count' properties.
    const mockActivityData = [
        { _id: '2025-08-12', count: 8 },
        { _id: '2025-08-13', count: 15 },
        { _id: '2025-08-14', count: 12 },
        { _id: '2025-08-15', count: 20 },
    ];
    
    res.status(200).json({
        success: true,
        data: mockActivityData,
    });
});

/**
 * @desc    Get the ratio of mastered vs. unmastered cards.
 * @route   GET /api/analytics/mastery-ratio
 * @access  Private
 */
const getMasteryRatio = asyncHandler(async (req, res) => {
    // This pipeline would look at a 'cards' or 'userCardData' collection
    // and count the number of cards in a "mastered" state vs. not.
    // FIX: Ensured the data object has 'mastered' and 'unmastered' properties.
    const mockMasteryData = {
        mastered: 35,
        unmastered: 195,
    };
    
    res.status(200).json({
        success: true,
        data: mockMasteryData,
    });
});


module.exports = {
    getPerformanceOverTime,
    getPerformanceByTopic,
    getDailyActivity,
    getMasteryRatio,
};
