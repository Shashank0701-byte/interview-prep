const RecruiterProfile = require("../models/RecruiterProfile");
const InterviewSession = require("../models/InterviewSession");
const User = require("../models/User");
const Company = require("../models/Company");

// @desc    Get recruiter dashboard overview
// @route   GET /api/recruiter/dashboard
// @access  Private (Recruiter only)
const getDashboardOverview = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Get recruiter profile
        const recruiterProfile = await RecruiterProfile.findOne({ user: userId })
            .populate('company', 'name logo industry');
        
        if (!recruiterProfile) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Recruiter profile not found."
            });
        }

        // Get company statistics
        const companyStats = await getCompanyStatistics(recruiterProfile.company._id);
        
        // Get top candidates
        const topCandidates = await getTopCandidates(recruiterProfile.company._id);
        
        // Get recent activity
        const recentActivity = await getRecentActivity(recruiterProfile.company._id);

        res.status(200).json({
            success: true,
            data: {
                recruiterProfile,
                companyStats,
                topCandidates,
                recentActivity
            }
        });

    } catch (error) {
        console.error('Recruiter Dashboard Error:', error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// @desc    Get candidate insights and performance
// @route   GET /api/recruiter/candidates
// @access  Private (Recruiter only)
const getCandidateInsights = async (req, res) => {
    try {
        const userId = req.user._id;
        const { role, experience, minScore, limit = 20 } = req.query;
        
        // Verify recruiter access
        const recruiterProfile = await RecruiterProfile.findOne({ user: userId });
        if (!recruiterProfile) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Recruiter profile not found."
            });
        }

        // Build query for candidate search
        let query = { company: recruiterProfile.company };
        if (role) query.role = { $regex: role, $options: 'i' };
        if (experience) query.experience = experience;
        if (minScore) query.overallScore = { $gte: parseInt(minScore) };

        // Get candidates with their performance data
        const candidates = await InterviewSession.find(query)
            .populate('user', 'name email profileImageUrl')
            .populate('company', 'name')
            .sort({ overallScore: -1, createdAt: -1 })
            .limit(parseInt(limit));

        // Transform data for frontend
        const candidateInsights = candidates.map(session => ({
            userId: session.user._id,
            name: session.user.name,
            email: session.user.email,
            profileImage: session.user.profileImageUrl,
            role: session.role,
            experience: session.experience,
            overallScore: session.overallScore,
            interviewType: session.interviewType,
            totalTime: session.totalTime,
            completedAt: session.endTime,
            strengths: session.analytics.strengths,
            improvementAreas: session.analytics.improvementAreas
        }));

        res.status(200).json({
            success: true,
            data: candidateInsights
        });

    } catch (error) {
        console.error('Candidate Insights Error:', error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// @desc    Get detailed candidate profile
// @route   GET /api/recruiter/candidates/:candidateId
// @access  Private (Recruiter only)
const getCandidateProfile = async (req, res) => {
    try {
        const { candidateId } = req.params;
        const userId = req.user._id;
        
        // Verify recruiter access
        const recruiterProfile = await RecruiterProfile.findOne({ user: userId });
        if (!recruiterProfile) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Recruiter profile not found."
            });
        }

        // Get candidate's interview sessions for this company
        const candidateSessions = await InterviewSession.find({
            user: candidateId,
            company: recruiterProfile.company
        }).populate('company', 'name');

        if (candidateSessions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Candidate not found or no interviews completed for this company."
            });
        }

        // Get candidate user info
        const candidateUser = await User.findById(candidateId).select('name email profileImageUrl');

        // Calculate performance trends
        const performanceTrends = calculatePerformanceTrends(candidateSessions);

        // Get skill breakdown
        const skillBreakdown = getSkillBreakdown(candidateSessions);

        res.status(200).json({
            success: true,
            data: {
                candidate: candidateUser,
                company: candidateSessions[0].company,
                interviewSessions: candidateSessions,
                performanceTrends,
                skillBreakdown,
                totalSessions: candidateSessions.length,
                averageScore: Math.round(
                    candidateSessions.reduce((sum, session) => sum + session.overallScore, 0) / candidateSessions.length
                )
            }
        });

    } catch (error) {
        console.error('Candidate Profile Error:', error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// @desc    Get company analytics and insights
// @route   GET /api/recruiter/analytics
// @access  Private (Recruiter only)
const getCompanyAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;
        const { timeframe = '30d' } = req.query;
        
        // Verify recruiter access
        const recruiterProfile = await RecruiterProfile.findOne({ user: userId });
        if (!recruiterProfile) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Recruiter profile not found."
            });
        }

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        if (timeframe === '7d') startDate.setDate(endDate.getDate() - 7);
        else if (timeframe === '30d') startDate.setDate(endDate.getDate() - 30);
        else if (timeframe === '90d') startDate.setDate(endDate.getDate() - 90);

        // Get analytics data
        const analytics = await getAnalyticsData(recruiterProfile.company, startDate, endDate);

        res.status(200).json({
            success: true,
            data: analytics
        });

    } catch (error) {
        console.error('Company Analytics Error:', error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message
        });
    }
};

// Helper Functions
const getCompanyStatistics = async (companyId) => {
    const totalCandidates = await InterviewSession.distinct('user', { company: companyId });
    const totalInterviews = await InterviewSession.countDocuments({ company: companyId });
    const averageScore = await InterviewSession.aggregate([
        { $match: { company: companyId, status: 'Completed' } },
        { $group: { _id: null, avgScore: { $avg: '$overallScore' } } }
    ]);

    return {
        totalCandidates: totalCandidates.length,
        totalInterviews,
        averageScore: Math.round(averageScore[0]?.avgScore || 0),
        activeCandidates: totalCandidates.length
    };
};

const getTopCandidates = async (companyId, limit = 10) => {
    return await InterviewSession.find({ 
        company: companyId, 
        status: 'Completed' 
    })
    .populate('user', 'name email profileImageUrl')
    .sort({ overallScore: -1 })
    .limit(limit)
    .select('user role experience overallScore interviewType endTime');
};

const getRecentActivity = async (companyId, limit = 10) => {
    return await InterviewSession.find({ company: companyId })
        .populate('user', 'name email profileImageUrl')
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('user role experience overallScore status createdAt');
};

const calculatePerformanceTrends = (sessions) => {
    const sortedSessions = sessions.sort((a, b) => a.createdAt - b.createdAt);
    
    return {
        scoreTrend: sortedSessions.map(s => s.overallScore),
        timeTrend: sortedSessions.map(s => s.totalTime),
        confidenceTrend: sortedSessions.flatMap(s => s.analytics.confidenceTrend),
        dates: sortedSessions.map(s => s.createdAt)
    };
};

const getSkillBreakdown = (sessions) => {
    const skillMap = {};
    
    sessions.forEach(session => {
        session.questions.forEach(question => {
            if (!skillMap[question.category]) {
                skillMap[question.category] = { total: 0, count: 0 };
            }
            skillMap[question.category].total += question.score;
            skillMap[question.category].count += 1;
        });
    });

    return Object.entries(skillMap).map(([skill, data]) => ({
        skill,
        averageScore: Math.round(data.total / data.count),
        questionCount: data.count
    }));
};

const getAnalyticsData = async (companyId, startDate, endDate) => {
    const sessions = await InterviewSession.find({
        company: companyId,
        createdAt: { $gte: startDate, $lte: endDate }
    });

    // Calculate various metrics
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === 'Completed');
    const averageScore = completedSessions.length > 0 
        ? Math.round(completedSessions.reduce((sum, s) => sum + s.overallScore, 0) / completedSessions.length)
        : 0;

    // Role distribution
    const roleDistribution = {};
    sessions.forEach(session => {
        roleDistribution[session.role] = (roleDistribution[session.role] || 0) + 1;
    });

    // Experience level distribution
    const experienceDistribution = {};
    sessions.forEach(session => {
        experienceDistribution[session.experience] = (experienceDistribution[session.experience] || 0) + 1;
    });

    return {
        totalSessions,
        completedSessions: completedSessions.length,
        completionRate: Math.round((completedSessions.length / totalSessions) * 100),
        averageScore,
        roleDistribution,
        experienceDistribution,
        timeRange: { startDate, endDate }
    };
};

module.exports = {
    getDashboardOverview,
    getCandidateInsights,
    getCandidateProfile,
    getCompanyAnalytics
};
