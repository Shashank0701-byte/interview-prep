// const asyncHandler = require('express-async-handler');
// const Card = require('../models/cardModel');
// const User = require('../models/userModel');
const Review = require('../models/reviewModel'); // ✅ add this
const Question = require('../models/Question'); // ✅ add this for actual question data
const Session = require('../models/Session'); // ✅ add this for session data
const AIInterview = require('../models/AIInterview'); // ✅ add this for AI interview analytics


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


/**
 * @desc    Get comprehensive progress statistics for the user
 * @route   GET /api/analytics/progress-stats
 * @access  Private
 */
const getProgressStats = asyncHandler(async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.user._id;

    try {
        // Get all user sessions
        const userSessions = await Session.find({ user: userId });
        const sessionIds = userSessions.map(s => s._id);

        // Get all questions for user's sessions
        const allQuestions = await Question.find({ session: { $in: sessionIds } });

        // Calculate overall statistics
        const totalSessions = userSessions.length;
        const completedSessions = userSessions.filter(s => s.status === 'Completed').length;
        const totalQuestions = allQuestions.length;
        const masteredQuestions = allQuestions.filter(q => q.isMastered).length;
        
        // Calculate average session rating
        const sessionsWithRatings = userSessions.filter(s => s.userRating && s.userRating.overall);
        const averageRating = sessionsWithRatings.length > 0 
            ? sessionsWithRatings.reduce((sum, s) => sum + s.userRating.overall, 0) / sessionsWithRatings.length
            : 0;

        // Calculate overall progress based on mastery and completion
        const masteryProgress = totalQuestions > 0 ? (masteredQuestions / totalQuestions) * 100 : 0;
        const sessionProgress = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
        const overallProgress = Math.round((masteryProgress + sessionProgress) / 2);

        // Calculate weekly progress (compare this week vs last week)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const thisWeekQuestions = allQuestions.filter(q => 
            q.performanceHistory.some(p => p.reviewDate >= oneWeekAgo)
        );
        const thisWeekMastered = thisWeekQuestions.filter(q => q.isMastered).length;
        const thisWeekProgress = thisWeekQuestions.length > 0 ? (thisWeekMastered / thisWeekQuestions.length) * 100 : 0;
        
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        const lastWeekQuestions = allQuestions.filter(q => 
            q.performanceHistory.some(p => p.reviewDate >= twoWeeksAgo && p.reviewDate < oneWeekAgo)
        );
        const lastWeekMastered = lastWeekQuestions.filter(q => q.isMastered).length;
        const lastWeekProgress = lastWeekQuestions.length > 0 ? (lastWeekMastered / lastWeekQuestions.length) * 100 : 0;
        
        const weeklyProgress = Math.round(thisWeekProgress - lastWeekProgress);

        const result = {
            overallProgress,
            totalSessions,
            completedSessions,
            totalQuestions,
            masteredQuestions,
            averageRating: Math.round(averageRating * 10) / 10,
            weeklyProgress,
            streakDays: 0 // Will be calculated in getStreakData
        };

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Error in getProgressStats:", error);
        res.status(500).json({
            success: false,
            message: "Server Error fetching progress stats",
        });
    }
});

/**
 * @desc    Get user's learning streak data
 * @route   GET /api/analytics/streak-data
 * @access  Private
 */
const getStreakData = asyncHandler(async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.user._id;

    try {
        // Get all user sessions
        const userSessions = await Session.find({ user: userId });
        const sessionIds = userSessions.map(s => s._id);

        // Get all performance history entries, sorted by date
        const performanceEntries = await Question.aggregate([
            { $match: { session: { $in: sessionIds } } },
            { $unwind: '$performanceHistory' },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$performanceHistory.reviewDate" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } }
        ]);

        // Calculate current streak
        let streakDays = 0;
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        
        // Create a set of active dates for faster lookup
        const activeDates = new Set(performanceEntries.map(entry => entry._id));
        
        // Start from today and go backwards
        let currentDate = new Date(today);
        
        // Check each day going backwards
        for (let i = 0; i < 365; i++) { // Max 365 days to prevent infinite loop
            const dateString = currentDate.toISOString().split('T')[0];
            
            if (activeDates.has(dateString)) {
                streakDays++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                // If we haven't started counting yet (no activity today), keep looking
                if (streakDays === 0 && dateString !== todayString) {
                    currentDate.setDate(currentDate.getDate() - 1);
                    continue;
                }
                // If we've started counting and hit a gap, break
                break;
            }
        }

        res.status(200).json({
            success: true,
            data: {
                streakDays,
                totalActiveDays: performanceEntries.length
            },
        });
    } catch (error) {
        console.error("Error in getStreakData:", error);
        res.status(500).json({
            success: false,
            message: "Server Error fetching streak data",
        });
    }
});

/**
 * @desc    Get AI Interview performance analytics with actionable insights
 * @route   GET /api/analytics/ai-interview-insights
 * @access  Private
 */
const getAIInterviewInsights = asyncHandler(async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.user._id;

    try {
        // Get all AI interviews for the user
        const aiInterviews = await AIInterview.find({ user: userId }).sort({ createdAt: -1 });

        if (aiInterviews.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    insights: [],
                    recommendations: ["Start your first AI interview to get personalized insights!"],
                    readinessScore: 0,
                    performanceMetrics: {}
                }
            });
        }

        // Calculate performance metrics
        const performanceMetrics = calculatePerformanceMetrics(aiInterviews);
        
        // Generate actionable insights
        const insights = generateActionableInsights(aiInterviews, performanceMetrics);
        
        // Calculate interview readiness score
        const readinessScore = calculateReadinessScore(performanceMetrics);
        
        // Generate personalized recommendations
        const recommendations = generatePersonalizedRecommendations(performanceMetrics, insights);

        res.status(200).json({
            success: true,
            data: {
                insights,
                recommendations,
                readinessScore,
                performanceMetrics,
                totalInterviews: aiInterviews.length,
                recentTrend: calculateRecentTrend(aiInterviews)
            }
        });

    } catch (error) {
        console.error("Error in getAIInterviewInsights:", error);
        res.status(500).json({
            success: false,
            message: "Server Error fetching AI interview insights",
        });
    }
});

/**
 * @desc    Get detailed communication analysis
 * @route   GET /api/analytics/communication-analysis
 * @access  Private
 */
const getCommunicationAnalysis = asyncHandler(async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.user._id;

    try {
        const aiInterviews = await AIInterview.find({ user: userId }).sort({ createdAt: -1 }).limit(10);

        if (aiInterviews.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    communicationScore: 0,
                    trends: [],
                    strengths: [],
                    improvements: []
                }
            });
        }

        const communicationAnalysis = analyzeCommunicationPatterns(aiInterviews);

        res.status(200).json({
            success: true,
            data: communicationAnalysis
        });

    } catch (error) {
        console.error("Error in getCommunicationAnalysis:", error);
        res.status(500).json({
            success: false,
            message: "Server Error fetching communication analysis",
        });
    }
});

/**
 * @desc    Get skill gap analysis and improvement roadmap
 * @route   GET /api/analytics/skill-gap-analysis
 * @access  Private
 */
const getSkillGapAnalysis = asyncHandler(async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.user._id;
    const { targetRole, targetCompany } = req.query;

    try {
        const aiInterviews = await AIInterview.find({ user: userId }).sort({ createdAt: -1 });
        
        const skillGapAnalysis = analyzeSkillGaps(aiInterviews, targetRole, targetCompany);

        res.status(200).json({
            success: true,
            data: skillGapAnalysis
        });

    } catch (error) {
        console.error("Error in getSkillGapAnalysis:", error);
        res.status(500).json({
            success: false,
            message: "Server Error fetching skill gap analysis",
        });
    }
});

// Helper functions for advanced analytics

function calculatePerformanceMetrics(aiInterviews) {
    const metrics = {
        averageScore: 0,
        technicalAccuracy: 0,
        communicationClarity: 0,
        confidenceLevel: 0,
        responseCompleteness: 0,
        improvementTrend: 0
    };

    if (aiInterviews.length === 0) return metrics;

    // Calculate averages from recent interviews
    const recentInterviews = aiInterviews.slice(0, 5); // Last 5 interviews
    
    let totalScore = 0;
    let totalTechnical = 0;
    let totalCommunication = 0;
    let totalConfidence = 0;
    let totalCompleteness = 0;

    recentInterviews.forEach(interview => {
        if (interview.scores) {
            totalScore += interview.scores.overall || 0;
            totalTechnical += interview.scores.technical || 0;
            totalCommunication += interview.scores.communication || 0;
            totalConfidence += interview.scores.confidence || 0;
            totalCompleteness += interview.scores.responseRelevance || 0;
        }
    });

    const count = recentInterviews.length;
    metrics.averageScore = Math.round(totalScore / count);
    metrics.technicalAccuracy = Math.round(totalTechnical / count);
    metrics.communicationClarity = Math.round(totalCommunication / count);
    metrics.confidenceLevel = Math.round(totalConfidence / count);
    metrics.responseCompleteness = Math.round(totalCompleteness / count);

    // Calculate improvement trend (compare first half vs second half of recent interviews)
    if (aiInterviews.length >= 4) {
        const firstHalf = aiInterviews.slice(-4, -2);
        const secondHalf = aiInterviews.slice(-2);
        
        const firstAvg = firstHalf.reduce((sum, interview) => 
            sum + (interview.scores?.overall || 0), 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, interview) => 
            sum + (interview.scores?.overall || 0), 0) / secondHalf.length;
        
        metrics.improvementTrend = Math.round(secondAvg - firstAvg);
    }

    return metrics;
}

function generateActionableInsights(aiInterviews, performanceMetrics) {
    const insights = [];

    // Performance insights
    if (performanceMetrics.averageScore >= 80) {
        insights.push({
            type: 'success',
            category: 'Performance',
            message: `Excellent performance! Your average score of ${performanceMetrics.averageScore}% shows strong interview skills.`,
            action: 'Focus on advanced system design questions to reach senior-level readiness.'
        });
    } else if (performanceMetrics.averageScore >= 60) {
        insights.push({
            type: 'warning',
            category: 'Performance',
            message: `Good progress with ${performanceMetrics.averageScore}% average. You're on the right track!`,
            action: 'Practice more behavioral questions and work on specific technical weak points.'
        });
    } else {
        insights.push({
            type: 'improvement',
            category: 'Performance',
            message: `Your average score of ${performanceMetrics.averageScore}% shows room for improvement.`,
            action: 'Focus on fundamentals and practice daily. Consider reviewing basic concepts.'
        });
    }

    // Communication insights
    if (performanceMetrics.communicationClarity < 70) {
        insights.push({
            type: 'improvement',
            category: 'Communication',
            message: 'Your communication clarity could be improved.',
            action: 'Practice explaining technical concepts in simple terms. Record yourself and review.'
        });
    }

    // Technical insights
    if (performanceMetrics.technicalAccuracy < 75) {
        insights.push({
            type: 'improvement',
            category: 'Technical',
            message: 'Technical accuracy needs attention.',
            action: 'Review fundamental concepts and practice coding problems daily.'
        });
    }

    // Confidence insights
    if (performanceMetrics.confidenceLevel < 70) {
        insights.push({
            type: 'improvement',
            category: 'Confidence',
            message: 'Building confidence will improve your interview performance.',
            action: 'Practice mock interviews regularly and prepare strong examples from your experience.'
        });
    }

    // Trend insights
    if (performanceMetrics.improvementTrend > 5) {
        insights.push({
            type: 'success',
            category: 'Progress',
            message: `Great improvement trend! You've improved by ${performanceMetrics.improvementTrend} points recently.`,
            action: 'Keep up the momentum with consistent practice.'
        });
    } else if (performanceMetrics.improvementTrend < -5) {
        insights.push({
            type: 'warning',
            category: 'Progress',
            message: 'Recent performance shows a declining trend.',
            action: 'Take a break if needed, then focus on your weak areas systematically.'
        });
    }

    return insights;
}

function calculateReadinessScore(performanceMetrics) {
    const weights = {
        averageScore: 0.3,
        technicalAccuracy: 0.25,
        communicationClarity: 0.2,
        confidenceLevel: 0.15,
        responseCompleteness: 0.1
    };

    const readinessScore = 
        (performanceMetrics.averageScore * weights.averageScore) +
        (performanceMetrics.technicalAccuracy * weights.technicalAccuracy) +
        (performanceMetrics.communicationClarity * weights.communicationClarity) +
        (performanceMetrics.confidenceLevel * weights.confidenceLevel) +
        (performanceMetrics.responseCompleteness * weights.responseCompleteness);

    return Math.round(readinessScore);
}

function generatePersonalizedRecommendations(performanceMetrics, insights) {
    const recommendations = [];

    // Based on performance level
    if (performanceMetrics.averageScore >= 80) {
        recommendations.push("You're ready for senior-level interviews! Focus on system design and leadership questions.");
        recommendations.push("Consider practicing with real interviewers to simulate actual interview pressure.");
    } else if (performanceMetrics.averageScore >= 60) {
        recommendations.push("Practice 2-3 interviews per week to build consistency.");
        recommendations.push("Focus on your weakest areas while maintaining your strengths.");
    } else {
        recommendations.push("Start with fundamental concepts and basic interview questions.");
        recommendations.push("Practice daily for at least 30 minutes to build a strong foundation.");
    }

    // Specific skill recommendations
    if (performanceMetrics.technicalAccuracy < 70) {
        recommendations.push("Dedicate 40% of your practice time to technical skill building.");
    }
    
    if (performanceMetrics.communicationClarity < 70) {
        recommendations.push("Practice the STAR method for behavioral questions.");
        recommendations.push("Record yourself explaining technical concepts and review for clarity.");
    }

    if (performanceMetrics.confidenceLevel < 70) {
        recommendations.push("Prepare 5-7 strong examples from your work experience.");
        recommendations.push("Practice positive self-talk and visualization techniques.");
    }

    return recommendations;
}

function calculateRecentTrend(aiInterviews) {
    if (aiInterviews.length < 3) return 'insufficient_data';

    const recent = aiInterviews.slice(0, 3);
    const scores = recent.map(interview => interview.scores?.overall || 0);
    
    const avgRecent = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const older = aiInterviews.slice(3, 6);
    
    if (older.length === 0) return 'improving';
    
    const olderScores = older.map(interview => interview.scores?.overall || 0);
    const avgOlder = olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length;
    
    const difference = avgRecent - avgOlder;
    
    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
}

function analyzeCommunicationPatterns(aiInterviews) {
    // Analyze communication patterns from interview data
    const analysis = {
        communicationScore: 0,
        trends: [],
        strengths: [],
        improvements: []
    };

    // Calculate communication score
    const communicationScores = aiInterviews
        .map(interview => interview.scores?.communication || 0)
        .filter(score => score > 0);

    if (communicationScores.length > 0) {
        analysis.communicationScore = Math.round(
            communicationScores.reduce((sum, score) => sum + score, 0) / communicationScores.length
        );
    }

    // Analyze trends (simplified)
    if (communicationScores.length >= 3) {
        const recent = communicationScores.slice(0, 3);
        const older = communicationScores.slice(3, 6);
        
        if (older.length > 0) {
            const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
            const olderAvg = older.reduce((sum, score) => sum + score, 0) / older.length;
            
            if (recentAvg > olderAvg + 5) {
                analysis.trends.push('Improving communication clarity');
            } else if (recentAvg < olderAvg - 5) {
                analysis.trends.push('Communication needs attention');
            } else {
                analysis.trends.push('Stable communication performance');
            }
        }
    }

    // Add strengths and improvements based on score
    if (analysis.communicationScore >= 80) {
        analysis.strengths.push('Clear and articulate responses');
        analysis.strengths.push('Good structure and flow');
    } else if (analysis.communicationScore >= 60) {
        analysis.strengths.push('Generally clear communication');
        analysis.improvements.push('Work on response structure');
    } else {
        analysis.improvements.push('Practice explaining concepts clearly');
        analysis.improvements.push('Work on reducing filler words');
        analysis.improvements.push('Improve response organization');
    }

    return analysis;
}

function analyzeSkillGaps(aiInterviews, targetRole, targetCompany) {
    const analysis = {
        skillGaps: [],
        strengths: [],
        recommendations: [],
        readinessLevel: 'beginner'
    };

    // Define skill requirements for different roles
    const roleRequirements = {
        'software-engineer': ['algorithms', 'data-structures', 'system-design', 'coding'],
        'frontend-developer': ['javascript', 'react', 'css', 'web-performance'],
        'backend-developer': ['apis', 'databases', 'scalability', 'security'],
        'full-stack-developer': ['frontend', 'backend', 'databases', 'deployment']
    };

    const requiredSkills = roleRequirements[targetRole] || roleRequirements['software-engineer'];

    // Analyze performance in each skill area (simplified)
    requiredSkills.forEach(skill => {
        const skillPerformance = calculateSkillPerformance(aiInterviews, skill);
        
        if (skillPerformance < 60) {
            analysis.skillGaps.push({
                skill: skill,
                currentLevel: skillPerformance,
                targetLevel: 80,
                priority: 'high'
            });
        } else if (skillPerformance < 75) {
            analysis.skillGaps.push({
                skill: skill,
                currentLevel: skillPerformance,
                targetLevel: 80,
                priority: 'medium'
            });
        } else {
            analysis.strengths.push(skill);
        }
    });

    // Generate recommendations
    analysis.skillGaps.forEach(gap => {
        if (gap.priority === 'high') {
            analysis.recommendations.push(`Focus heavily on ${gap.skill} - practice daily for 2 weeks`);
        } else {
            analysis.recommendations.push(`Improve ${gap.skill} - dedicate 30% of practice time`);
        }
    });

    // Determine readiness level
    const averagePerformance = aiInterviews.length > 0 
        ? aiInterviews.reduce((sum, interview) => sum + (interview.scores?.overall || 0), 0) / aiInterviews.length
        : 0;

    if (averagePerformance >= 80) analysis.readinessLevel = 'senior';
    else if (averagePerformance >= 65) analysis.readinessLevel = 'mid-level';
    else if (averagePerformance >= 50) analysis.readinessLevel = 'junior';
    else analysis.readinessLevel = 'beginner';

    return analysis;
}

function calculateSkillPerformance(aiInterviews, skill) {
    // Simplified skill performance calculation
    // In a real implementation, this would analyze specific question types and responses
    const relevantInterviews = aiInterviews.filter(interview => 
        interview.configuration?.industryFocus?.includes(skill) ||
        interview.questions?.some(q => q.category?.toLowerCase().includes(skill))
    );

    if (relevantInterviews.length === 0) return 0;

    const totalScore = relevantInterviews.reduce((sum, interview) => 
        sum + (interview.scores?.technical || 0), 0);
    
    return Math.round(totalScore / relevantInterviews.length);
}

module.exports = {
    getPerformanceOverTime,
    getPerformanceByTopic,
    getDailyActivity,
    getMasteryRatio,
    getProgressStats,
    getStreakData,
    getAIInterviewInsights,
    getCommunicationAnalysis,
    getSkillGapAnalysis,
};
