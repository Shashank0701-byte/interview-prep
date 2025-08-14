// File: backend/controllers/analyticsController.js

const mongoose = require("mongoose");
const Question = require("../models/Question");
const Session = require("../models/Session");

/**
 * @desc    Get user's performance over the last 12 weeks.
 * @route   GET /api/analytics/performance-over-time
 * @access  Private
 */
const getPerformanceOverTime = async (req, res) => {
    try {
        const userId = req.user._id;
        const userSessions = await Session.find({ user: userId }).select('_id');
        const sessionIds = userSessions.map(s => s._id);
        const questions = await Question.find({
            session: { $in: sessionIds },
            'performanceHistory.0': { $exists: true }
        }).populate('session', 'role');

        const weeklyPerformance = {};
        questions.forEach(q => {
            q.performanceHistory.forEach(review => {
                const week = `${review.reviewDate.getFullYear()}-${getWeekNumber(review.reviewDate)}`;
                if (!weeklyPerformance[week]) {
                    weeklyPerformance[week] = { totalScore: 0, count: 0 };
                }
                weeklyPerformance[week].totalScore += review.performanceScore;
                weeklyPerformance[week].count += 1;
            });
        });
        
        const chartData = Object.keys(weeklyPerformance).map(week => {
            const avgAccuracy = (weeklyPerformance[week].totalScore / weeklyPerformance[week].count) * 100;
            return { week, accuracy: Math.round(avgAccuracy) };
        }).sort((a, b) => a.week.localeCompare(b.week));

        res.status(200).json({ success: true, data: chartData });
    } catch (error) {
        console.error("Error in getPerformanceOverTime:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Get user's performance grouped by topic (session role).
 * @route   GET /api/analytics/performance-by-topic
 * @access  Private
 */
const getPerformanceByTopic = async (req, res) => {
    try {
        const userId = req.user._id;
        const userSessions = await Session.find({ user: userId }).select('_id');
        const sessionIds = userSessions.map(s => s._id);
        const questions = await Question.find({
            session: { $in: sessionIds },
            'performanceHistory.0': { $exists: true }
        }).populate('session', 'role');

        const performanceByTopic = {};
        questions.forEach(q => {
            const topic = q.session.role;
            if (!performanceByTopic[topic]) {
                performanceByTopic[topic] = { totalScore: 0, count: 0 };
            }
            q.performanceHistory.forEach(review => {
                performanceByTopic[topic].totalScore += review.performanceScore;
                performanceByTopic[topic].count += 1;
            });
        });

        const chartData = Object.keys(performanceByTopic).map(topic => {
            const avgPerformance = (performanceByTopic[topic].totalScore / performanceByTopic[topic].count) * 100;
            return { topic, performance: Math.round(avgPerformance) };
        });

        res.status(200).json({ success: true, data: chartData });
    } catch (error) {
        console.error("Error in getPerformanceByTopic:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


/**
 * @desc    Get count of cards reviewed per day for the last 30 days.
 * @route   GET /api/analytics/daily-activity
 * @access  Private
 */
const getDailyActivity = async (req, res) => {
    try {
        const userId = req.user._id;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const userSessions = await Session.find({ user: userId }).select('_id');
        const sessionIds = userSessions.map(s => s._id);

        const activity = await Question.aggregate([
            { $match: { session: { $in: sessionIds } } },
            { $unwind: "$performanceHistory" },
            { $match: { "performanceHistory.reviewDate": { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$performanceHistory.reviewDate" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({ success: true, data: activity });
    } catch (error) {
        console.error("Error in getDailyActivity:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Get the ratio of mastered vs. unmastered cards.
 * @route   GET /api/analytics/mastery-ratio
 * @access  Private
 */
const getMasteryRatio = async (req, res) => {
    try {
        const userId = req.user._id;
        const userSessions = await Session.find({ user: userId }).select('_id');
        const sessionIds = userSessions.map(s => s._id);

        const ratio = await Question.aggregate([
            { $match: { session: { $in: sessionIds } } },
            {
                $group: {
                    _id: "$isMastered",
                    count: { $sum: 1 }
                }
            }
        ]);

        const masteryData = { mastered: 0, unmastered: 0 };
        ratio.forEach(item => {
            if (item._id === true) {
                masteryData.mastered = item.count;
            } else {
                masteryData.unmastered = item.count;
            }
        });

        res.status(200).json({ success: true, data: masteryData });
    } catch (error) {
        console.error("Error in getMasteryRatio:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


// Helper function to get the week number of a date
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}


module.exports = {
    getPerformanceOverTime,
    getPerformanceByTopic,
    getDailyActivity,
    getMasteryRatio,
};
