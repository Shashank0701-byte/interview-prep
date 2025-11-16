import React, { useState, useEffect } from 'react';

const ProgressInsights = ({ 
    progressData = {},
    showTips = true,
    showEncouragement = true,
    animated = true
}) => {
    const [visibleInsights, setVisibleInsights] = useState([]);
    
    // Default progress data structure
    const defaultData = {
        totalSessions: 0,
        completedSessions: 0,
        totalQuestions: 0,
        masteredQuestions: 0,
        averageRating: 0,
        weeklyProgress: 0,
        strongestTopics: [],
        improvementAreas: [],
        streakDays: 0,
        ...progressData
    };

    const data = defaultData;

    // Generate insights based on progress data
    const generateInsights = () => {
        const insights = [];
        
        // Completion rate insight
        const completionRate = data.totalSessions > 0 ? (data.completedSessions / data.totalSessions) * 100 : 0;
        if (completionRate > 80) {
            insights.push({
                type: 'success',
                icon: '🎯',
                title: 'Excellent Completion Rate',
                message: `You've completed ${Math.round(completionRate)}% of your sessions. Your consistency is paying off!`,
                color: 'emerald'
            });
        } else if (completionRate > 50) {
            insights.push({
                type: 'progress',
                icon: '📈',
                title: 'Good Progress',
                message: `${Math.round(completionRate)}% completion rate. You're building great momentum!`,
                color: 'blue'
            });
        } else if (data.totalSessions > 0) {
            insights.push({
                type: 'encouragement',
                icon: '💪',
                title: 'Keep Going',
                message: 'Every session counts! Small steps lead to big achievements.',
                color: 'amber'
            });
        }

        // Mastery insight
        const masteryRate = data.totalQuestions > 0 ? (data.masteredQuestions / data.totalQuestions) * 100 : 0;
        if (masteryRate > 70) {
            insights.push({
                type: 'success',
                icon: '🌟',
                title: 'Knowledge Master',
                message: `You've mastered ${Math.round(masteryRate)}% of questions. You're becoming an expert!`,
                color: 'purple'
            });
        } else if (masteryRate > 30) {
            insights.push({
                type: 'progress',
                icon: '🚀',
                title: 'Learning Fast',
                message: `${Math.round(masteryRate)}% mastery rate shows you're absorbing knowledge well!`,
                color: 'indigo'
            });
        }

        // Streak insight
        if (data.streakDays > 7) {
            insights.push({
                type: 'success',
                icon: '🔥',
                title: 'Amazing Streak',
                message: `${data.streakDays} days in a row! Your dedication is inspiring.`,
                color: 'red'
            });
        } else if (data.streakDays > 3) {
            insights.push({
                type: 'progress',
                icon: '⚡',
                title: 'Building Momentum',
                message: `${data.streakDays} day streak! Consistency is key to success.`,
                color: 'orange'
            });
        }

        // Rating insight
        if (data.averageRating > 4) {
            insights.push({
                type: 'success',
                icon: '⭐',
                title: 'High Quality Sessions',
                message: `${data.averageRating.toFixed(1)}/5 average rating. You're choosing great content!`,
                color: 'yellow'
            });
        }

        // Weekly progress insight
        if (data.weeklyProgress > 0) {
            insights.push({
                type: 'progress',
                icon: '📊',
                title: 'Weekly Growth',
                message: `${data.weeklyProgress}% improvement this week. You're on the right track!`,
                color: 'teal'
            });
        }

        // First session encouragement
        if (data.totalSessions === 0) {
            insights.push({
                type: 'encouragement',
                icon: '🌱',
                title: 'Ready to Start?',
                message: 'Your learning journey is about to begin. Every expert was once a beginner!',
                color: 'green'
            });
        }

        return insights;
    };

    // Animate insights appearance
    useEffect(() => {
        const insights = generateInsights();
        if (animated) {
            setVisibleInsights([]);
            insights.forEach((insight, index) => {
                setTimeout(() => {
                    setVisibleInsights(prev => [...prev, insight]);
                }, index * 200);
            });
        } else {
            setVisibleInsights(insights);
        }
    }, [data, animated]);

    // Tips based on progress
    const getTips = () => {
        const tips = [];
        
        const completionRate = data.totalSessions > 0 ? (data.completedSessions / data.totalSessions) * 100 : 0;
        const masteryRate = data.totalQuestions > 0 ? (data.masteredQuestions / data.totalQuestions) * 100 : 0;

        if (completionRate < 50) {
            tips.push({
                icon: '⏰',
                title: 'Set a Schedule',
                message: 'Try setting aside 15-20 minutes daily for consistent practice.'
            });
        }

        if (masteryRate < 40) {
            tips.push({
                icon: '🔄',
                title: 'Review Regularly',
                message: 'Revisit challenging questions to reinforce your learning.'
            });
        }

        if (data.streakDays === 0) {
            tips.push({
                icon: '🎯',
                title: 'Start Small',
                message: 'Begin with just one question a day to build the habit.'
            });
        }

        if (data.averageRating < 3) {
            tips.push({
                icon: '🔍',
                title: 'Focus on Quality',
                message: 'Choose sessions that match your experience level for better results.'
            });
        }

        return tips.slice(0, 3); // Limit to 3 tips to avoid overwhelm
    };

    const colorSchemes = {
        emerald: 'from-emerald-50 to-green-50 border-emerald-200 text-emerald-800',
        blue: 'from-blue-50 to-indigo-50 border-blue-200 text-blue-800',
        purple: 'from-purple-50 to-indigo-50 border-purple-200 text-purple-800',
        amber: 'from-amber-50 to-yellow-50 border-amber-200 text-amber-800',
        red: 'from-red-50 to-pink-50 border-red-200 text-red-800',
        orange: 'from-orange-50 to-red-50 border-orange-200 text-orange-800',
        yellow: 'from-yellow-50 to-amber-50 border-yellow-200 text-yellow-800',
        teal: 'from-teal-50 to-cyan-50 border-teal-200 text-teal-800',
        indigo: 'from-indigo-50 to-purple-50 border-indigo-200 text-indigo-800',
        green: 'from-green-50 to-emerald-50 border-green-200 text-green-800'
    };

    return (
        <div className="space-y-6">
            {/* Progress Insights */}
            {visibleInsights.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <span className="text-xl">💡</span>
                        Your Progress Insights
                    </h3>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                        {visibleInsights.map((insight, index) => (
                            <div
                                key={index}
                                className={`
                                    p-4 rounded-xl border-2 bg-gradient-to-br transition-all duration-500 hover:scale-105 hover:shadow-lg
                                    ${colorSchemes[insight.color]}
                                    ${animated ? 'animate-fade-in-up' : ''}
                                `}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl flex-shrink-0">
                                        {insight.icon}
                                    </span>
                                    <div>
                                        <h4 className="font-semibold mb-1">
                                            {insight.title}
                                        </h4>
                                        <p className="text-sm leading-relaxed opacity-90">
                                            {insight.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Helpful Tips */}
            {showTips && getTips().length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <span className="text-xl">🎯</span>
                        Personalized Tips
                    </h3>
                    
                    <div className="space-y-3">
                        {getTips().map((tip, index) => (
                            <div
                                key={index}
                                className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-300"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-xl flex-shrink-0">
                                        {tip.icon}
                                    </span>
                                    <div>
                                        <h4 className="font-medium text-gray-800 mb-1">
                                            {tip.title}
                                        </h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {tip.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Encouraging Message */}
            {showEncouragement && (
                <div className="p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-200">
                    <div className="text-center space-y-3">
                        <div className="text-3xl">🌟</div>
                        <h3 className="text-lg font-semibold text-gray-800">
                            Remember: Progress, Not Perfection
                        </h3>
                        <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
                            Every small step you take is building towards your success. 
                            Be patient with yourself and celebrate the journey.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgressInsights;
