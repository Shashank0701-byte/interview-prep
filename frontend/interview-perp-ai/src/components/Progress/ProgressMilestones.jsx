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
                    dot: 'bg-charcoal dark:bg-cream border-4 border-charcoal dark:border-cream/40 scale-110 shadow-[2px_2px_0px_0px_var(--color-shadow)]',
                    line: 'bg-charcoal dark:bg-cream',
                    text: 'text-charcoal dark:text-cream font-bold font-mono',
                    icon: 'scale-110'
                };
            case 'current':
                return {
                    dot: 'bg-white dark:bg-navy-light border-4 border-charcoal dark:border-cream/40 scale-125 shadow-[4px_4px_0px_0px_var(--color-shadow)] animate-pulse',
                    line: 'bg-charcoal/20 dark:bg-cream/20',
                    text: 'text-charcoal dark:text-cream font-extrabold font-mono',
                    icon: 'scale-125 animate-bounce'
                };
            default:
                return {
                    dot: 'bg-white dark:bg-navy-light border-4 border-charcoal/20 dark:border-cream/20 scale-100',
                    line: 'bg-charcoal/10 dark:bg-cream/10',
                    text: 'text-charcoal/40 dark:text-cream/40 font-mono',
                    icon: 'opacity-40'
                };
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Current Milestone Message */}
            {showCurrentMessage && milestones[currentMilestone] && (
                <div className="text-center mb-8 p-6 bg-white dark:bg-navy-light border-4 border-charcoal dark:border-cream/40 rounded-sm shadow-[4px_4px_0px_0px_var(--color-shadow)]">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <span className="text-3xl animate-bounce">
                            {milestones[currentMilestone].icon}
                        </span>
                        <h3 className="text-xl font-mono font-bold text-charcoal dark:text-cream uppercase tracking-wide">
                            {milestones[currentMilestone].label}
                        </h3>
                    </div>
                    <p className="text-sm font-mono font-bold uppercase tracking-wide text-charcoal/70 dark:text-cream/70 leading-relaxed">
                        {milestones[currentMilestone].message}
                    </p>
                </div>
            )}

            {/* Milestone Timeline */}
            <div className="relative mb-12">
                {/* Progress Line Background */}
                <div className="absolute top-8 left-0 right-0 h-1.5 bg-charcoal/15 dark:bg-cream/15 rounded-sm"></div>
                
                {/* Animated Progress Line */}
                <div 
                    className="absolute top-8 left-0 h-1.5 bg-charcoal dark:bg-cream rounded-sm transition-all duration-1000 ease-out"
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
                                    w-6 h-6 rounded-full border-4 border-white dark:border-navy transition-all duration-500 z-10 relative
                                    ${styles.dot}
                                    group-hover:scale-110
                                `}>
                                    {/* Ripple effect for current milestone */}
                                    {status === 'current' && (
                                        <div className="absolute inset-0 rounded-full bg-charcoal dark:bg-cream animate-ping opacity-30"></div>
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
                                `}>
                                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider">
                                        {milestone.label}
                                    </div>
                                    <div className="text-[9px] font-mono opacity-75 mt-0.5">
                                        {milestone.value}%
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Progress Stats */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { value: `${Math.round(animatedProgress)}%`, label: 'Complete' },
                    { value: milestones.filter(m => animatedProgress >= m.value).length, label: 'Milestones' },
                    { value: `${100 - Math.round(animatedProgress)}%`, label: 'Remaining' },
                    { value: milestones[currentMilestone]?.icon || '🎯', label: 'Current Goal' }
                ].map((stat, i) => (
                    <div key={i} className="text-center p-4 bg-white dark:bg-navy-light rounded-sm border-3 border-charcoal dark:border-cream/40 shadow-[3px_3px_0px_0px_var(--color-shadow)] hover:-translate-y-0.5 transition-all">
                        <div className="text-2xl font-mono font-bold text-charcoal dark:text-cream">{stat.value}</div>
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal/50 dark:text-cream/50 mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProgressMilestones;
