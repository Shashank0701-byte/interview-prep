import React, { useEffect, useState } from 'react';

const ProgressMilestones = ({ 
    progress = 0,
    milestones = [
        { value: 0, label: 'Start', icon: '🌱', message: 'Every expert was once a beginner' },
        { value: 25, label: 'Getting Started', icon: '🚀', message: 'You\'re building great habits!' },
        { value: 50, label: 'Halfway There', icon: '⭐', message: 'Amazing progress! Keep it up!' },
        { value: 75, label: 'Almost Done', icon: '🎯', message: 'You\'re in the final stretch!' },
        { value: 100, label: 'Complete', icon: '🎉', message: 'Congratulations! You did it!' }
    ],
    animated = true,
    showCurrentMessage = true
}) => {
    const [animatedProgress, setAnimatedProgress] = useState(0);
    const [currentMilestone, setCurrentMilestone] = useState(0);

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

    // Update current milestone
    useEffect(() => {
        const current = milestones.findIndex(milestone => 
            animatedProgress >= milestone.value && 
            (milestones[milestones.findIndex(m => m === milestone) + 1]?.value > animatedProgress || milestone.value === 100)
        );
        setCurrentMilestone(Math.max(0, current));
    }, [animatedProgress, milestones]);

    const getMilestoneStatus = (index, milestoneValue) => {
        if (animatedProgress >= milestoneValue) return 'completed';
        if (index === currentMilestone && animatedProgress < milestoneValue) return 'current';
        return 'upcoming';
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'completed':
                return {
                    dot: 'bg-gradient-to-r from-emerald-500 to-green-500 scale-110 shadow-lg shadow-emerald-200',
                    line: 'bg-gradient-to-r from-emerald-400 to-green-400',
                    text: 'text-emerald-700 font-semibold',
                    icon: 'scale-110 filter drop-shadow-sm'
                };
            case 'current':
                return {
                    dot: 'bg-gradient-to-r from-blue-500 to-indigo-500 scale-125 shadow-xl shadow-blue-200 animate-pulse',
                    line: 'bg-gradient-to-r from-gray-200 to-gray-300',
                    text: 'text-blue-700 font-bold',
                    icon: 'scale-125 animate-bounce filter drop-shadow-md'
                };
            default:
                return {
                    dot: 'bg-gray-200 hover:bg-gray-300',
                    line: 'bg-gray-200',
                    text: 'text-gray-500',
                    icon: 'opacity-50'
                };
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Current Milestone Message */}
            {showCurrentMessage && milestones[currentMilestone] && (
                <div className="text-center mb-8 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-100 shadow-sm">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <span className="text-3xl animate-bounce">
                            {milestones[currentMilestone].icon}
                        </span>
                        <h3 className="text-xl font-bold text-gray-800">
                            {milestones[currentMilestone].label}
                        </h3>
                    </div>
                    <p className="text-gray-600 font-medium leading-relaxed">
                        {milestones[currentMilestone].message}
                    </p>
                </div>
            )}

            {/* Milestone Timeline */}
            <div className="relative">
                {/* Progress Line Background */}
                <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
                
                {/* Animated Progress Line */}
                <div 
                    className="absolute top-8 left-0 h-1 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${animatedProgress}%` }}
                ></div>

                {/* Milestones */}
                <div className="relative flex justify-between items-start">
                    {milestones.map((milestone, index) => {
                        const status = getMilestoneStatus(index, milestone.value);
                        const styles = getStatusStyles(status);
                        
                        return (
                            <div 
                                key={index} 
                                className="flex flex-col items-center group cursor-pointer"
                                style={{ width: `${100 / (milestones.length - 1)}%` }}
                            >
                                {/* Milestone Dot */}
                                <div className={`
                                    w-6 h-6 rounded-full border-4 border-white transition-all duration-500 z-10 relative
                                    ${styles.dot}
                                    group-hover:scale-110
                                `}>
                                    {/* Ripple effect for current milestone */}
                                    {status === 'current' && (
                                        <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-30"></div>
                                    )}
                                </div>

                                {/* Milestone Icon */}
                                <div className={`
                                    text-2xl mt-3 transition-all duration-300
                                    ${styles.icon}
                                    group-hover:scale-110
                                `}>
                                    {milestone.icon}
                                </div>

                                {/* Milestone Label */}
                                <div className={`
                                    text-center mt-2 transition-all duration-300
                                    ${styles.text}
                                    group-hover:text-blue-600
                                `}>
                                    <div className="text-sm font-medium">
                                        {milestone.label}
                                    </div>
                                    <div className="text-xs opacity-75 mt-1">
                                        {milestone.value}%
                                    </div>
                                </div>

                                {/* Tooltip on Hover */}
                                <div className="absolute top-full mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20">
                                    <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                                        {milestone.message}
                                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Progress Stats */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="text-2xl font-bold text-emerald-600">
                        {Math.round(animatedProgress)}%
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                        Complete
                    </div>
                </div>
                
                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="text-2xl font-bold text-blue-600">
                        {milestones.filter(m => animatedProgress >= m.value).length}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                        Milestones
                    </div>
                </div>
                
                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="text-2xl font-bold text-purple-600">
                        {100 - Math.round(animatedProgress)}%
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                        Remaining
                    </div>
                </div>
                
                <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                    <div className="text-2xl font-bold text-amber-600">
                        {milestones[currentMilestone]?.icon || '🎯'}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                        Current Goal
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressMilestones;
