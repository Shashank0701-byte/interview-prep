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
            {/* Header Section */}
            <div className='p-6 relative'>
                <div className='flex items-start justify-between'>
                    <div className='flex items-start gap-4 flex-1'>
                        <div className='flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center'>
                            <span className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                                {getInitials(role)}
                            </span>
                        </div>
                        
                        <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-2 mb-2'>
                                <h2 className='text-lg font-semibold text-gray-900 dark:text-white truncate'>{role}</h2>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-md border ${getStatusColor(status)} flex-shrink-0`}>
                                    {status}
                                </span>
                            </div>
                            <p className='text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed'>
                                {topicsToFocus}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 ml-4">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRateClick();
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-200"
                            title="Rate session"
                        >
                            <LuStar className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) =>{
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                            title="Delete session"
                        >
                            <LuTrash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress Section - Simplified */}
            <div className='px-6 pb-4'>
                <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-3'>
                        <div className='text-sm text-gray-600 dark:text-gray-400'>
                            <span className='font-medium text-gray-900 dark:text-white'>{masteredQuestions}</span> of {questions} completed
                        </div>
                        <div className='flex items-center gap-1'>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <LuStar
                                    key={star}
                                    className={`w-3 h-3 ${
                                        star <= Math.round(avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'
                                    }`}
                                />
                            ))}
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({avgRating.toFixed(1)})</span>
                        </div>
                    </div>
                    <div className='text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full'>
                        {experience}y exp
                    </div>
                </div>
                
                {/* Simple Progress Bar */}
                <div className='w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2'>
                    <div 
                        className='bg-gray-600 dark:bg-slate-400 h-2 rounded-full transition-all duration-500'
                        style={{ width: `${questions > 0 ? (masteredQuestions / questions) * 100 : 0}%` }}
                    />
                </div>
            </div>

            {/* Footer - Minimal */}
            <div className='px-6 pb-6 pt-2 border-t border-gray-100 dark:border-slate-700'>
                <div className='flex items-center justify-between text-xs text-gray-500 dark:text-gray-400'>
                    <span>Updated {lastUpdated}</span>
                    {masteredQuestions === questions && questions > 0 ? (
                        <span className='text-green-600 dark:text-green-400 font-medium'>✓ Complete</span>
                    ) : masteredQuestions > 0 ? (
                        <span className='text-blue-600 dark:text-blue-400 font-medium'>In Progress</span>
                    ) : (
                        <span className='text-gray-600 dark:text-gray-400 font-medium'>Not Started</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SummaryCard;