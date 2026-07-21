import React from 'react';
import { Link } from 'react-router-dom';

const EmptyProgressState = ({ 
    type = 'no-data', // 'no-data', 'getting-started', 'no-sessions'
    title = '',
    message = '',
    actionText = '',
    actionLink = '',
    onAction = null,
    showTips = true,
    animated = true
}) => {
    const getStateConfig = () => {
        switch (type) {
            case 'getting-started':
                return {
                    icon: '🌱',
                    title: title || 'Your Journey Begins Here',
                    message: message || 'Every expert was once a beginner. Take your first step towards interview success.',
                    actionText: actionText || 'Create Your First Session',
                    actionLink: actionLink || '/dashboard',
                    bgGradient: 'bg-white dark:bg-navy-light',
                    iconBg: 'bg-white dark:bg-navy-input',
                    tips: [
                        { icon: '🎯', text: 'Start with questions matching your experience level' },
                        { icon: '📅', text: 'Practice consistently, even 10 minutes daily helps' },
                        { icon: '🔄', text: 'Review and reflect on each session' }
                    ]
                };
            case 'no-sessions':
                return {
                    icon: '📚',
                    title: title || 'Ready to Practice?',
                    message: message || 'Create your first interview session and start building confidence with AI-generated questions.',
                    actionText: actionText || 'Start Practicing',
                    actionLink: actionLink || '/dashboard',
                    bgGradient: 'bg-white dark:bg-navy-light',
                    iconBg: 'bg-white dark:bg-navy-input',
                    tips: [
                        { icon: '⚡', text: 'Quick 15-minute sessions are perfect to start' },
                        { icon: '🎨', text: 'Customize difficulty based on your comfort level' },
                        { icon: '📈', text: 'Track your improvement over time' }
                    ]
                };
            default: // 'no-data'
                return {
                    icon: '📊',
                    title: title || 'Building Your Progress Story',
                    message: message || 'Your progress data will appear here as you complete sessions and master questions. Every step counts!',
                    actionText: actionText || 'Continue Learning',
                    actionLink: actionLink || '/dashboard',
                    bgGradient: 'bg-white dark:bg-navy-light',
                    iconBg: 'bg-white dark:bg-navy-input',
                    tips: [
                        { icon: '📝', text: 'Complete sessions to see detailed analytics' },
                        { icon: '⭐', text: 'Rate sessions to get personalized insights' },
                        { icon: '🎯', text: 'Set goals and track your achievements' }
                    ]
                };
        }
    };

    const config = getStateConfig();

    return (
        <div className="flex items-center justify-center py-16 px-4">
            <div className="max-w-2xl mx-auto text-center space-y-8">
                {/* Main Illustration */}
                <div className="relative mx-auto w-48 h-48 bg-white dark:bg-navy-light border-4 border-charcoal dark:border-cream/40 rounded-sm flex items-center justify-center shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all">
                    <div className="w-32 h-32 bg-white dark:bg-navy-input border-3 border-charcoal dark:border-cream/40 rounded-sm flex items-center justify-center">
                        <span className="text-6xl filter drop-shadow-lg">
                            {config.icon}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-4xl font-mono font-bold text-charcoal dark:text-cream leading-tight uppercase tracking-wider">
                            {config.title}
                        </h2>
                        <p className="text-sm font-mono font-bold uppercase tracking-wide text-charcoal/70 dark:text-cream/70 leading-relaxed max-w-xl mx-auto">
                            {config.message}
                        </p>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                        {onAction ? (
                            <button
                                onClick={onAction}
                                className="btn-primary inline-flex items-center gap-3 px-8 py-4"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                {config.actionText}
                            </button>
                        ) : config.actionLink ? (
                            <Link
                                to={config.actionLink}
                                className="btn-primary inline-flex items-center gap-3 px-8 py-4"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                {config.actionText}
                            </Link>
                        ) : null}
                    </div>
                </div>

                {/* Helpful Tips */}
                {showTips && config.tips && (
                    <div className="pt-8 border-t-2 border-charcoal/20 dark:border-cream/20">
                        <div className="space-y-4">
                            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-charcoal dark:text-cream flex items-center justify-center gap-2">
                                <span className="text-xl">💡</span>
                                Helpful Tips to Get Started
                            </h3>
                            <div className="grid gap-4 md:grid-cols-3">
                                {config.tips.map((tip, index) => (
                                    <div 
                                        key={index}
                                        className="p-4 bg-white dark:bg-navy-light rounded-sm border-3 border-charcoal dark:border-cream/40 shadow-[3px_3px_0px_0px_var(--color-shadow)] hover:-translate-y-0.5 transition-all duration-300"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl flex-shrink-0">
                                                {tip.icon}
                                            </span>
                                            <p className="text-xs font-mono font-bold uppercase tracking-wide text-charcoal/70 dark:text-cream/70 leading-relaxed text-left">
                                                {tip.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Encouraging Footer */}
                <div className="p-6 bg-white dark:bg-navy-light border-4 border-charcoal dark:border-cream/40 rounded-sm shadow-[4px_4px_0px_0px_var(--color-shadow)] mt-6 text-center">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <span className="text-2xl">🌟</span>
                        <h4 className="text-lg font-mono font-bold text-charcoal dark:text-cream uppercase tracking-wider">
                            You're in the Right Place
                        </h4>
                    </div>
                    <p className="text-xs font-mono font-bold uppercase tracking-wide text-charcoal/70 dark:text-cream/70 leading-relaxed max-w-md mx-auto">
                        Take your time, be patient with yourself, and remember that every small step forward is progress worth celebrating.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmptyProgressState;
