// const asyncHandler = require('express-async-handler');
// const Card = require('../models/cardModel');
// const User = require('../models/userModel');
const Review = require('../models/reviewModel'); // ✅ add this
const Question = require('../models/Question'); // ✅ add this for actual question data
const Session = require('../models/Session'); // ✅ add this for session data


// A helper function to handle async controller logic and errors
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/**
 * @desc    Get user's performance accuracy over time, grouped by week.
 * @route   GET /api/analytics/performance-over-time
 * @access  Private
 */
const getPerformanceOverTime = asyncHandler(async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.user._id;

    try {
        // Get all questions for the user's sessions
        const userSessions = await Session.find({ user: userId }).select('_id');
        const sessionIds = userSessions.map(s => s._id);

        // Calculate weekly performance from performance history
        const weeklyData = await Question.aggregate([
            { $match: { session: { $in: sessionIds } } },
            { $unwind: '$performanceHistory' },
            {
                $group: {
                    _id: {
                        year: { $year: '$performanceHistory.reviewDate' },
                        week: { $week: '$performanceHistory.reviewDate' },
                    },
                    avgAccuracy: { $avg: { $multiply: ['$performanceHistory.performanceScore', 100] } },
                    totalReviews: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.week': 1 } },
            { $limit: 8 }, // Last 8 weeks
        ]);

        // Format data for frontend
        const result = weeklyData.map(item => ({
            week: `${item._id.year}-${item._id.week.toString().padStart(2, '0')}`,
            accuracy: Math.round(item.avgAccuracy),
        }));

        // If no data, provide default structure
        if (result.length === 0) {
            const currentDate = new Date();
            const currentWeek = `${currentDate.getFullYear()}-${Math.ceil((currentDate.getDate() + currentDate.getDay()) / 7).toString().padStart(2, '0')}`;
            result.push({ week: currentWeek, accuracy: 0 });
        }

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Error in getPerformanceOverTime:", error);
        res.status(500).json({
            success: false,
            message: "Server Error fetching performance over time",
        });
    }
});

/**
 * @desc    Get user's performance, grouped by topic.
 * @route   GET /api/analytics/performance-by-topic
 * @access  Private
 */
const getPerformanceByTopic = asyncHandler(async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.user._id;

    try {
        // Get all questions for the user's sessions with their performance data
        const userSessions = await Session.find({ user: userId }).select('_id role');
        const sessionIds = userSessions.map(s => s._id);

        // Calculate average performance by role/topic
        const topicData = await Question.aggregate([
            { $match: { session: { $in: sessionIds } } },
            { $lookup: { from: 'sessions', localField: 'session', foreignField: '_id', as: 'sessionInfo' } },
            { $unwind: '$sessionInfo' },
            {
                $group: {
                    _id: '$sessionInfo.role',
                    totalQuestions: { $sum: 1 },
                    avgPerformance: { $avg: { $avg: '$performanceHistory.performanceScore' } },
                },
            },
            {
                $project: {
                    topic: '$_id',
                    performance: { $round: [{ $multiply: ['$avgPerformance', 100] }, 0] },
                },
            },
        ]);

        // If no data, provide default structure
        const result = topicData.length > 0 ? topicData : [
            { topic: 'No Data Yet', performance: 0 }
        ];

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Error in getPerformanceByTopic:", error);
        res.status(500).json({
            success: false,
            message: "Server Error fetching performance by topic",
        });
    }
});


/**
 * @desc    Get the number of cards reviewed each day for the last 30 days.
 * @route   GET /api/analytics/daily-activity
 * @access  Private
 */
const getDailyActivity = asyncHandler(async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.user._id;

    // Last 30 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    try {
        // Get all questions for the user's sessions
        const userSessions = await Session.find({ user: userId }).select('_id');
        const sessionIds = userSessions.map(s => s._id);

        console.log('User Sessions:', { userId, sessionIds });

        // Aggregate performance history from questions
        const activityData = await Question.aggregate([
            { $match: { session: { $in: sessionIds } } },
            { $unwind: "$performanceHistory" },
            { $match: { "performanceHistory.reviewDate": { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$performanceHistory.reviewDate" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // ✅ Map `_id` -> `date` for frontend
        const formattedData = activityData.map(item => ({
            date: item._id,
            count: item.count,
        }));

        console.log('Daily Activity Data:', { activityData, formattedData });

        res.status(200).json({
            success: true,
            data: formattedData,
        });
    } catch (error) {
        console.error("Error in getDailyActivity:", error);
        res.status(500).json({
            success: false,
            message: "Server Error fetching daily activity",
        });
    }
});

/**
 * @desc    Get the ratio of mastered vs. unmastered cards.
 * @route   GET /api/analytics/mastery-ratio
 * @access  Private
 */
const getMasteryRatio = asyncHandler(async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.user._id;

    try {
        // Get all questions for the user's sessions
        const userSessions = await Session.find({ user: userId }).select('_id');
        const sessionIds = userSessions.map(s => s._id);

        // Count mastered vs unmastered questions
        const masteryData = await Question.aggregate([
            { $match: { session: { $in: sessionIds } } },
            {
                $group: {
                    _id: null,
                    mastered: { $sum: { $cond: ["$isMastered", 1, 0] } },
                    unmastered: { $sum: { $cond: ["$isMastered", 0, 1] } },
                },
            },
        ]);

        const result = masteryData[0] || { mastered: 0, unmastered: 0 };
        
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Error in getMasteryRatio:", error);
        res.status(500).json({
            success: false,
            message: "Server Error fetching mastery ratio",
        });
    }
});


module.exports = {
    getPerformanceOverTime,
    getPerformanceByTopic,
    getDailyActivity,
    getMasteryRatio,
};
