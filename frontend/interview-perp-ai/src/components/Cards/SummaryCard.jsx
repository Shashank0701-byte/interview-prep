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
    // New props for enhanced features
    userRating = { overall: 3, difficulty: 3, usefulness: 3 },
    status = 'Active',
    completionPercentage = 0,
    masteredQuestions = 0,
    onRateClick,
    sessionId
}) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'text-slate-700 bg-slate-100 border-slate-200';
            case 'Completed': return 'text-slate-700 bg-slate-100 border-slate-200';
            case 'Paused': return 'text-slate-600 bg-slate-50 border-slate-200';
            default: return 'text-slate-600 bg-slate-50 border-slate-200';
        }
    };
    
    
    const avgRating = (userRating.overall + userRating.difficulty + userRating.usefulness) / 3;
    const [showRatingTooltip, setShowRatingTooltip] = useState(false);
    
    return (
        <div 
            className='bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden cursor-pointer hover:shadow-md shadow-sm relative group transition-all duration-200'
            onClick={onSelect}
        >
                <div className='p-4 cursor-pointer relative'>
            <div className='flex items-start'>
                <div className='flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mr-4'>
                    <span className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                        {getInitials(role)}
                    </span>
                </div>

                <div className='flex-grow'>
                    <div className='flex justify-between items-start'>
                        <div className='flex-1 pr-4'>
                            <div className='flex items-center gap-2 mb-1'>
                                <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>{role}</h2>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-md border ${getStatusColor(status)}`}>
                                    {status}
                                </span>
                            </div>
                            <p className='text-sm text-gray-600 dark:text-gray-400 leading-relaxed'>
                                {topicsToFocus}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Header with Action Buttons */}
            <div className="absolute top-2 right-2 flex items-center gap-2">
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center gap-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRateClick();
                        }}
                        className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 font-medium bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-500 transition-all duration-200"
                    >
                        <LuStar className="w-4 h-4" />
                        <span className="font-medium">Rate</span>
                    </button>
                    <button
                        className='flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 font-medium bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-500 transition-all duration-200'
                        onClick={(e) =>{
                            e.stopPropagation();
                            onDelete();
                        }}
                        title="Delete session"
                    >
                        <LuTrash2 className="w-4 h-4" />
                        <span className="font-medium">Delete</span>
                    </button>
                </div>
            </div>
    </div>

    <div className='px-5 pb-5 pt-3'>
        {/* Consolidated Progress Section */}
        <div className="mb-4">
            {/* Primary Progress Indicator - Mastered Questions */}
            {masteredQuestions > 0 ? (
                <div className='bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border border-gray-200 dark:border-slate-600'>
                    <div className='flex items-center justify-between mb-3'>
                        <div className='flex items-center gap-2'>
                            <span className='text-gray-600 dark:text-gray-400'>📊</span>
                            <div className='text-sm font-medium text-gray-700 dark:text-gray-300'>Progress</div>
                        </div>
                        <div className='text-xs text-gray-600 dark:text-gray-400 font-medium bg-gray-200 dark:bg-slate-600 px-2 py-1 rounded-full'>
                            {questions > 0 ? Math.round((masteredQuestions / questions) * 100) : 0}% complete
                        </div>
                    </div>
                    <div className='flex items-center justify-between mb-2'>
                        <div className='text-sm font-semibold text-gray-900 dark:text-white'>{masteredQuestions} of {questions} mastered</div>
                    </div>
                    <div className='w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2'>
                        <div 
                            className='bg-gray-600 dark:bg-slate-400 h-2 rounded-full transition-all duration-500'
                            style={{ width: `${questions > 0 ? (masteredQuestions / questions) * 100 : 0}%` }}
                        >
                        </div>
                    </div>
                </div>
            ) : (
                <div className='bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border border-gray-200 dark:border-slate-600'>
                    <div className='flex items-center gap-2 mb-2'>
                        <span className='text-gray-600 dark:text-gray-400'>📋</span>
                        <div className='text-sm font-medium text-gray-700 dark:text-gray-300'>Ready to Start</div>
                    </div>
                    <div className='text-sm font-semibold text-gray-900 dark:text-white'>{questions} questions waiting</div>
                    <div className='text-xs text-gray-600 dark:text-gray-400 mt-1'>Begin your session</div>
                </div>
            )}
        </div>

        {/* Clarified Rating Display with Tooltip */}
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-gray-600">Self-Assessment:</span>
                    <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <LuStar
                                key={star}
                                className={`w-4 h-4 ${
                                    star <= Math.round(avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">({avgRating.toFixed(1)})</span>
                </div>
                <div className="relative">
                    <LuInfo 
                        className="w-3 h-3 text-gray-400 cursor-help hover:text-gray-600 transition-colors"
                        onMouseEnter={() => setShowRatingTooltip(true)}
                        onMouseLeave={() => setShowRatingTooltip(false)}
                    />
                    {showRatingTooltip && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 z-10">
                            Average of your self-rated difficulty, usefulness, and clarity scores
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Secondary metadata - Experience as small tag */}
            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                <span>💼</span>
                <span>{experience}y exp</span>
            </div>
        </div>
        
        {/* Simplified Stats */}
        <div className='bg-gray-50 dark:bg-slate-700 rounded-lg p-3 border border-gray-200 dark:border-slate-600 mb-4'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <span className='text-gray-600 dark:text-gray-400'>❓</span>
                    <div className='text-xs font-medium text-gray-700 dark:text-gray-300'>Total Questions</div>
                </div>
                <div className='text-sm font-semibold text-gray-900 dark:text-white'>{questions}</div>
            </div>
        </div>

        {/* Description */}
        {description && (
            <p className='text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed'>
                {description}
            </p>
        )}
        
        {/* Last Updated with Encouraging Message */}
        <div className='space-y-2'>
            <div className='flex items-center gap-2 text-xs text-gray-500'>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Updated {lastUpdated}
            </div>
            
            {/* Gentle Encouragement Based on Progress */}
            {completionPercentage === 0 && (
                <div className='flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-lg'>
                    <span>📋</span>
                    <span className='font-medium'>Ready to start</span>
                </div>
            )}
            {completionPercentage > 0 && completionPercentage < 50 && (
                <div className='flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-lg'>
                    <span>📈</span>
                    <span className='font-medium'>In progress</span>
                </div>
            )}
            {completionPercentage >= 50 && completionPercentage < 100 && (
                <div className='flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-lg'>
                    <span>⚡</span>
                    <span className='font-medium'>Almost complete</span>
                </div>
            )}
            {completionPercentage === 100 && (
                <div className='flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-lg'>
                    <span>✓</span>
                    <span className='font-medium'>Completed</span>
                </div>
            )}
        </div>
    </div>
    
        </div>
    );
};

export default SummaryCard;