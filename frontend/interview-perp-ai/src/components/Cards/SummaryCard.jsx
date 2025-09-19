import React from 'react'
import { LuTrash2, LuStar } from 'react-icons/lu';
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
            case 'Active': return 'text-green-700 bg-green-100 border-green-200';
            case 'Completed': return 'text-blue-700 bg-blue-100 border-blue-200';
            case 'Paused': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
            default: return 'text-gray-700 bg-gray-100 border-gray-200';
        }
    };
    
    
    const avgRating = (userRating.overall + userRating.difficulty + userRating.usefulness) / 3;
    
    return (
        <div 
            className='bg-white border border-gray-100 rounded-3xl overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-blue-100/50 shadow-lg shadow-gray-100/50 relative group transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.03] hover:rotate-1'
            onClick={onSelect}
        >
                <div 
                    className='rounded-lg p-4 cursor-pointer relative'
                    style={{
                        background: colors.bgcolor,
                    }}
                >
            <div className='flex items-start'>
                <div className='flex-shrink-0 w-14 h-14 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110'>
                    <span className='text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300'>
                        {getInitials(role)}
                    </span>
                </div>

                <div className='flex-grow'>
                    <div className='flex justify-between items-start'>
                        <div>
                            <h2 className='text-lg font-semibold text-gray-900 group-hover:text-blue-800 transition-colors duration-300'>{role}</h2>
                            <p className='text-sm text-gray-700 mt-1 leading-relaxed'>
                                {topicsToFocus}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Header with Status and Rating */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
                <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border backdrop-blur-sm ${getStatusColor(status)}`}>
                    {status}
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center gap-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRateClick();
                        }}
                        className="flex items-center gap-2 text-xs text-yellow-600 hover:text-yellow-700 bg-yellow-50/90 hover:bg-yellow-100 backdrop-blur-sm px-3 py-2 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl border border-yellow-200/50"
                    >
                        <LuStar className="w-4 h-4" />
                        <span className="font-medium">Rate</span>
                    </button>
                    <button
                        className='flex items-center gap-2 text-xs text-rose-700 font-medium bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl border border-rose-200/50 cursor-pointer hover:bg-rose-50 hover:border-rose-300 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl'
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
        {/* Rating Display */}
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
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
            
            {completionPercentage > 0 && (
                <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div 
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${completionPercentage}%` }}
                        ></div>
                    </div>
                    <span className="text-xs font-medium text-emerald-600">{completionPercentage}%</span>
                </div>
            )}
        </div>
        
        {/* Enhanced Stats */}
        <div className='grid grid-cols-2 gap-3 mb-4'>
            <div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100/50'>
                <div className='text-xs font-medium text-blue-700 mb-1'>Experience</div>
                <div className='text-sm font-bold text-blue-900'>{experience} {experience == 1 ? "Year" : "Years"}</div>
            </div>
            
            <div className='bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100/50'>
                <div className='text-xs font-medium text-purple-700 mb-1'>Questions</div>
                <div className='text-sm font-bold text-purple-900'>{questions} Q&A</div>
            </div>
            
            {masteredQuestions > 0 && (
                <div className='bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-3 border border-emerald-100/50 col-span-2'>
                    <div className='text-xs font-medium text-emerald-700 mb-1'>Mastered Questions</div>
                    <div className='text-sm font-bold text-emerald-900'>{masteredQuestions} completed</div>
                </div>
            )}
        </div>

        {/* Description */}
        {description && (
            <p className='text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed'>
                {description}
            </p>
        )}
        
        {/* Last Updated */}
        <div className='flex items-center gap-2 text-xs text-gray-500'>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Updated {lastUpdated}
        </div>
    </div>
    
        </div>
    );
};

export default SummaryCard;