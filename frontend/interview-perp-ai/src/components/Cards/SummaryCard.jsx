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
            case 'Active': return 'text-charcoal bg-white border-2 border-charcoal';
            case 'Completed': return 'text-white bg-charcoal border-2 border-charcoal';
            case 'Paused': return 'text-charcoal/60 bg-cream border-2 border-charcoal/30';
            default: return 'text-charcoal/60 bg-cream border-2 border-charcoal/30';
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
                    <div className='flex items-start gap-4 flex-1'>
                        <div className='flex-shrink-0 w-12 h-12 bg-cream border-2 border-charcoal rounded-md flex items-center justify-center'>
                            <span className='text-sm font-bold text-charcoal uppercase'>
                                {getInitials(role)}
                            </span>
                        </div>
                        
                        <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2 mb-2'>
                                <h2 className='text-lg font-display text-charcoal dark:text-white truncate'>{role}</h2>
                                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] rounded-sm ${getStatusColor(status)} flex-shrink-0`}>
                                    {status}
                                </span>
                            </div>
                            <p className='text-sm text-charcoal/50 dark:text-gray-400 line-clamp-2 leading-relaxed'>
                                {topicsToFocus}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 ml-4">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRateClick();
                            }}
                            className="p-2 text-charcoal/30 hover:text-charcoal hover:bg-cream rounded-md transition-all duration-200"
                            title="Rate session"
                        >
                            <LuStar className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) =>{
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="p-2 text-charcoal/30 hover:text-crimson hover:bg-red-50 rounded-md transition-all duration-200"
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
                        <div className='text-sm text-charcoal/50 dark:text-gray-400'>
                            <span className='font-bold text-charcoal dark:text-white'>{masteredQuestions}</span> of {questions} completed
                        </div>
                        <div className='flex items-center gap-0.5'>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <LuStar
                                    key={star}
                                    className={`w-3 h-3 ${
                                        star <= Math.round(avgRating) ? 'text-charcoal fill-current' : 'text-charcoal/20'
                                    }`}
                                />
                            ))}
                            <span className="text-xs text-charcoal/40 ml-1">({avgRating.toFixed(1)})</span>
                        </div>
                    </div>
                    <div className='text-[10px] font-bold uppercase tracking-[0.1em] text-charcoal/50 bg-cream border border-charcoal/15 px-2.5 py-1 rounded-sm'>
                        {experience}y exp
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className='w-full bg-charcoal/10 rounded-sm h-1.5'>
                    <div 
                        className='bg-charcoal dark:bg-slate-400 h-1.5 rounded-sm transition-all duration-500'
                        style={{ width: `${questions > 0 ? (masteredQuestions / questions) * 100 : 0}%` }}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className='px-6 pb-5 pt-3 border-t-2 border-charcoal/10'>
                <div className='flex items-center justify-between text-[11px] uppercase tracking-[0.1em] font-semibold text-charcoal/40'>
                    <span>Updated {lastUpdated}</span>
                    {masteredQuestions === questions && questions > 0 ? (
                        <span className='text-charcoal font-bold'>✓ COMPLETE</span>
                    ) : masteredQuestions > 0 ? (
                        <span className='text-crimson font-bold'>IN PROGRESS</span>
                    ) : (
                        <span className='text-charcoal/40 font-bold'>NOT STARTED</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SummaryCard;