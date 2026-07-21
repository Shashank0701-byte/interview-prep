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
        emerald: 'bg-white dark:bg-navy-light border-charcoal dark:border-cream/40 text-charcoal dark:text-cream',
        blue: 'bg-white dark:bg-navy-light border-charcoal dark:border-cream/40 text-charcoal dark:text-cream',
        purple: 'bg-white dark:bg-navy-light border-charcoal dark:border-cream/40 text-charcoal dark:text-cream',
        amber: 'bg-white dark:bg-navy-light border-charcoal dark:border-cream/40 text-charcoal dark:text-cream',
        red: 'bg-white dark:bg-navy-light border-charcoal dark:border-cream/40 text-charcoal dark:text-cream',
        orange: 'bg-white dark:bg-navy-light border-charcoal dark:border-cream/40 text-charcoal dark:text-cream',
        yellow: 'bg-white dark:bg-navy-light border-charcoal dark:border-cream/40 text-charcoal dark:text-cream',
        teal: 'bg-white dark:bg-navy-light border-charcoal dark:border-cream/40 text-charcoal dark:text-cream',
        indigo: 'bg-white dark:bg-navy-light border-charcoal dark:border-cream/40 text-charcoal dark:text-cream',
        green: 'bg-white dark:bg-navy-light border-charcoal dark:border-cream/40 text-charcoal dark:text-cream'
    };

    return (
        <div className="space-y-6">
            {/* Progress Insights */}
            {visibleInsights.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-charcoal dark:text-cream flex items-center gap-2">
                        <span className="text-xl">💡</span>
                        Your Progress Insights
                    </h3>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                        {visibleInsights.map((insight, index) => (
                            <div
                                key={index}
                                className={`
                                    p-4 rounded-sm border-4 transition-all duration-500 hover:-translate-y-1 shadow-[3px_3px_0px_0px_var(--color-shadow)]
                                    ${colorSchemes[insight.color] || 'bg-white dark:bg-navy-light border-charcoal dark:border-cream/40 text-charcoal dark:text-cream'}
                                    ${animated ? 'animate-fade-in-up' : ''}
                                `}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl flex-shrink-0">
                                        {insight.icon}
                                    </span>
                                    <div>
                                        <h4 className="font-mono font-bold uppercase tracking-wide text-sm mb-1">
                                            {insight.title}
                                        </h4>
                                        <p className="text-xs font-mono font-bold uppercase tracking-wide text-charcoal/70 dark:text-cream/70 opacity-90">
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
                    <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-charcoal dark:text-cream flex items-center gap-2">
                        <span className="text-xl">🎯</span>
                        Personalized Tips
                    </h3>
                    
                    <div className="space-y-3">
                        {getTips().map((tip, index) => (
                            <div
                                key={index}
                                className="p-4 bg-white dark:bg-navy-light rounded-sm border-3 border-charcoal dark:border-cream/40 shadow-[3px_3px_0px_0px_var(--color-shadow)] hover:-translate-y-0.5 transition-all duration-300"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-xl flex-shrink-0">
                                        {tip.icon}
                                    </span>
                                    <div>
                                        <h4 className="font-mono font-bold uppercase tracking-wide text-sm text-charcoal dark:text-cream mb-1">
                                            {tip.title}
                                        </h4>
                                        <p className="text-xs font-mono font-bold uppercase tracking-wide text-charcoal/70 dark:text-cream/70 leading-relaxed">
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
                <div className="p-6 bg-white dark:bg-navy-light rounded-sm border-4 border-charcoal dark:border-cream/40 shadow-[4px_4px_0px_0px_var(--color-shadow)]">
                    <div className="text-center space-y-3">
                        <div className="text-3xl">🌟</div>
                        <h3 className="text-lg font-mono font-bold text-charcoal dark:text-cream uppercase tracking-wider">
                            Remember: Progress, Not Perfection
                        </h3>
                        <p className="text-xs font-mono font-bold uppercase tracking-wide text-charcoal/70 dark:text-cream/70 leading-relaxed max-w-md mx-auto">
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
