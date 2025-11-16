import React, { useEffect, useState } from 'react';

const ProgressRing = ({ 
    progress = 0, 
    size = 120, 
    strokeWidth = 8, 
    showPercentage = true,
    color = 'emerald',
    label = '',
    encouragingMessage = '',
    animated = true,
    glowEffect = true
}) => {
    const [animatedProgress, setAnimatedProgress] = useState(0);
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = radius * 2 * Math.PI;
    
    // Gentle animation for progress
    useEffect(() => {
        if (animated) {
            const timer = setTimeout(() => {
                setAnimatedProgress(progress);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setAnimatedProgress(progress);
        }
    }, [progress, animated]);

    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

    // Color schemes for different moods
    const colorSchemes = {
        emerald: {
            track: 'stroke-emerald-100',
            progress: 'stroke-emerald-500',
            glow: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]',
            text: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        blue: {
            track: 'stroke-blue-100',
            progress: 'stroke-blue-500',
            glow: 'drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]',
            text: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        purple: {
            track: 'stroke-purple-100',
            progress: 'stroke-purple-500',
            glow: 'drop-shadow-[0_0_8px_rgba(147,51,234,0.4)]',
            text: 'text-purple-600',
            bg: 'bg-purple-50'
        },
        amber: {
            track: 'stroke-amber-100',
            progress: 'stroke-amber-500',
            glow: 'drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]',
            text: 'text-amber-600',
            bg: 'bg-amber-50'
        }
    };

    const scheme = colorSchemes[color] || colorSchemes.emerald;

    // Encouraging messages based on progress
    const getEncouragingMessage = () => {
        if (encouragingMessage) return encouragingMessage;
        
        if (progress === 0) return "Every journey begins with a single step 🌱";
        if (progress < 25) return "You're building momentum! 💪";
        if (progress < 50) return "Great progress! Keep going! 🚀";
        if (progress < 75) return "You're doing amazing! 🌟";
        if (progress < 100) return "Almost there! You've got this! 🎯";
        return "Congratulations! Well done! 🎉";
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            {/* Progress Ring */}
            <div className="relative">
                <div className={`rounded-full ${scheme.bg} p-4 transition-all duration-500 hover:scale-105`}>
                    <svg
                        className={`transform -rotate-90 transition-all duration-1000 ${glowEffect ? scheme.glow : ''}`}
                        width={size}
                        height={size}
                    >
                        {/* Background circle */}
                        <circle
                            className={`${scheme.track} transition-all duration-300`}
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            r={radius}
                            cx={size / 2}
                            cy={size / 2}
                        />
                        
                        {/* Progress circle */}
                        <circle
                            className={`${scheme.progress} transition-all duration-1000 ease-out`}
                            strokeWidth={strokeWidth}
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            fill="transparent"
                            r={radius}
                            cx={size / 2}
                            cy={size / 2}
                            style={{
                                filter: glowEffect ? `drop-shadow(0 0 6px ${scheme.progress.replace('stroke-', 'rgb(')})` : 'none'
                            }}
                        />
                    </svg>
                    
                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        {showPercentage && (
                            <div className={`text-2xl font-bold ${scheme.text} transition-all duration-300`}>
                                {Math.round(animatedProgress)}%
                            </div>
                        )}
                        {label && (
                            <div className="text-xs text-gray-500 font-medium text-center mt-1">
                                {label}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Encouraging Message */}
            <div className="text-center max-w-xs">
                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                    {getEncouragingMessage()}
                </p>
            </div>
        </div>
    );
};

export default ProgressRing;
