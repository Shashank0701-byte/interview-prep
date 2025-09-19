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
                    bgGradient: 'from-green-50 via-emerald-50 to-teal-50',
                    iconBg: 'from-green-500 to-emerald-500',
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
                    bgGradient: 'from-blue-50 via-indigo-50 to-purple-50',
                    iconBg: 'from-blue-500 to-indigo-500',
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
                    bgGradient: 'from-slate-50 via-gray-50 to-zinc-50',
                    iconBg: 'from-gray-500 to-slate-500',
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
                <div className={`relative mx-auto w-48 h-48 bg-gradient-to-br ${config.bgGradient} rounded-full flex items-center justify-center shadow-2xl ${animated ? 'animate-float' : ''}`}>
                    <div className={`w-32 h-32 bg-gradient-to-r ${config.iconBg} rounded-full flex items-center justify-center shadow-xl`}>
                        <span className="text-6xl filter drop-shadow-lg">
                            {config.icon}
                        </span>
                    </div>
                    
                    {/* Floating particles */}
                    {animated && (
                        <>
                            <div className="absolute top-8 right-8 w-4 h-4 bg-blue-200 rounded-full animate-bounce opacity-60" style={{animationDelay: '0s'}}></div>
                            <div className="absolute bottom-12 left-6 w-3 h-3 bg-purple-200 rounded-full animate-bounce opacity-60" style={{animationDelay: '0.5s'}}></div>
                            <div className="absolute top-16 left-12 w-2 h-2 bg-green-200 rounded-full animate-bounce opacity-60" style={{animationDelay: '1s'}}></div>
                        </>
                    )}
                </div>

                {/* Content */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
                            {config.title}
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed max-w-xl mx-auto">
                            {config.message}
                        </p>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                        {onAction ? (
                            <button
                                onClick={onAction}
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                {config.actionText}
                            </button>
                        ) : config.actionLink ? (
                            <Link
                                to={config.actionLink}
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                {config.actionText}
                            </Link>
                        ) : null}
                    </div>
                </div>

                {/* Helpful Tips */}
                {showTips && config.tips && (
                    <div className="pt-8 border-t border-gray-100">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 flex items-center justify-center gap-2">
                                <span className="text-xl">💡</span>
                                Helpful Tips to Get Started
                            </h3>
                            <div className="grid gap-4 md:grid-cols-3">
                                {config.tips.map((tip, index) => (
                                    <div 
                                        key={index}
                                        className={`p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 ${animated ? 'animate-fade-in-up' : ''}`}
                                        style={{ animationDelay: `${index * 200}ms` }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl flex-shrink-0">
                                                {tip.icon}
                                            </span>
                                            <p className="text-sm text-gray-600 leading-relaxed">
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
                <div className="pt-6">
                    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <span className="text-2xl">🌟</span>
                            <h4 className="text-lg font-semibold text-gray-800">
                                You're in the Right Place
                            </h4>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            Take your time, be patient with yourself, and remember that every small step forward is progress worth celebrating.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmptyProgressState;
