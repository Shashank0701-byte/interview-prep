import React, { useState } from 'react'
import { LuTrash2, LuStar, LuInfo } from 'react-icons/lu';
import { getInitials } from '../../utils/helper';

const SummaryCard = ({
    colors,
    role,
    topicsToFocus,
    experience,
    questions,
    description,
    lastUpdated,
    onSelect,
    onDelete,
    userRating = { overall: 3, difficulty: 3, usefulness: 3 },
    status = 'Active',
    completionPercentage = 0,
    masteredQuestions = 0,
    onRateClick,
    sessionId
}) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'text-charcoal dark:text-cream bg-white dark:bg-navy-light border-2 border-charcoal dark:border-cream/40 shadow-[2px_2px_0px_0px_#1A1A1A] dark:shadow-[2px_2px_0px_0px_rgba(245,240,232,0.3)]';
            case 'Completed': return 'text-white bg-charcoal border-2 border-charcoal shadow-[2px_2px_0px_0px_#1A1A1A] dark:shadow-[2px_2px_0px_0px_rgba(245,240,232,0.3)]';
            case 'Paused': return 'text-charcoal/60 dark:text-cream/60 bg-cream dark:bg-navy border-2 border-charcoal/30 dark:border-cream/20 shadow-[2px_2px_0px_0px_rgba(26,26,26,0.2)]';
            default: return 'text-charcoal/60 dark:text-cream/60 bg-cream dark:bg-navy border-2 border-charcoal/30 dark:border-cream/20 shadow-[2px_2px_0px_0px_rgba(26,26,26,0.2)]';
        }
    };
    
    const avgRating = (userRating.overall + userRating.difficulty + userRating.usefulness) / 3;
    
    return (
        <div 
            className='card-editorial overflow-hidden cursor-pointer relative group'
            onClick={onSelect}
        >
            {/* Header Section */}
            <div className='p-6 relative'>
                <div className='flex items-start justify-between'>
                    <div className='flex items-start gap-4 flex-1 min-w-0'>
                        {/* Thick square charcoal avatar */}
                        <div className='flex-shrink-0 w-14 h-14 bg-charcoal dark:bg-cream border-4 border-charcoal dark:border-cream/40 rounded-sm flex items-center justify-center shadow-[3px_3px_0px_0px_var(--color-shadow)]'>
                            <span className='text-sm font-bold text-cream dark:text-charcoal uppercase tracking-widest'>
                                {getInitials(role)}
                            </span>
                        </div>
                        
                        <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-3 mb-2 flex-wrap'>
                                <h2 className='text-xl font-display font-bold text-charcoal dark:text-cream truncate'>{role}</h2>
                                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] rounded-sm ${getStatusColor(status)} flex-shrink-0`}>
                                    {status}
                                </span>
                            </div>
                            <p className='text-sm font-body text-charcoal/50 dark:text-cream/50 line-clamp-2 leading-relaxed'>
                                {topicsToFocus}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons — thick-bordered square buttons, always visible for better accessibility */}
                    <div className="flex items-center gap-2 ml-4">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRateClick();
                            }}
                            className="p-2 border-2 border-charcoal dark:border-cream/40 bg-cream dark:bg-navy text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream hover:bg-white dark:hover:bg-navy-light hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none rounded-sm transition-all duration-200 cursor-pointer"
                            title="Rate session"
                        >
                            <LuStar className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) =>{
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="p-2 border-2 border-charcoal dark:border-cream/40 bg-cream dark:bg-navy text-charcoal/60 dark:text-cream/60 hover:text-crimson hover:border-crimson hover:bg-red-50 dark:hover:bg-red-900/20 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none rounded-sm transition-all duration-200 cursor-pointer"
                            title="Delete session"
                        >
                            <LuTrash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress Section */}
            <div className='px-6 pb-4'>
                <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-3'>
                        <div className='text-sm font-body text-charcoal/50 dark:text-cream/50'>
                            <span className='font-bold text-charcoal dark:text-cream font-mono'>{masteredQuestions}</span>
                            <span className='font-mono'> / {questions}</span> completed
                        </div>
                        <div className='flex items-center gap-0.5'>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <LuStar
                                    key={star}
                                    className={`w-3.5 h-3.5 ${
                                        star <= Math.round(avgRating) ? 'text-charcoal dark:text-cream fill-current' : 'text-charcoal/20 dark:text-cream/20'
                                    }`}
                                />
                            ))}
                            <span className="text-xs font-mono text-charcoal/40 dark:text-cream/40 ml-1">({avgRating.toFixed(1)})</span>
                        </div>
                    </div>
                    <div className='flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-charcoal dark:text-cream bg-cream dark:bg-navy border-2 border-charcoal/20 dark:border-cream/20 px-3 py-1 rounded-sm'>
                        <span className='w-2 h-2 bg-charcoal dark:bg-cream rounded-sm inline-block'></span>
                        <span className='font-mono'>{experience}y exp</span>
                    </div>
                </div>
                
                {/* Brutalist Progress Bar */}
                <div className='w-full bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm h-3'>
                    <div 
                        className='bg-charcoal dark:bg-cream h-full rounded-sm transition-all duration-500'
                        style={{ width: `${questions > 0 ? (masteredQuestions / questions) * 100 : 0}%` }}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className='px-6 pb-5 pt-3 border-t-4 border-charcoal/15 dark:border-cream/15'>
                <div className='flex items-center justify-between text-[11px] uppercase tracking-widest font-semibold text-charcoal/40 dark:text-cream/40'>
                    <span className='font-mono'>Updated {lastUpdated}</span>
                    {masteredQuestions === questions && questions > 0 ? (
                        <span className='text-charcoal dark:text-cream font-bold font-mono flex items-center gap-1.5'>
                            <span className='w-2 h-2 bg-charcoal dark:bg-cream inline-block'></span>
                            COMPLETE
                        </span>
                    ) : masteredQuestions > 0 ? (
                        <span className='text-crimson font-bold font-mono flex items-center gap-1.5'>
                            <span className='w-2 h-2 bg-crimson inline-block'></span>
                            IN PROGRESS
                        </span>
                    ) : (
                        <span className='text-charcoal/40 dark:text-cream/40 font-bold font-mono flex items-center gap-1.5'>
                            <span className='w-2 h-2 bg-charcoal/30 dark:bg-cream/30 inline-block'></span>
                            NOT STARTED
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SummaryCard;