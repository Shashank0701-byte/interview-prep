import React, { useState, useEffect } from 'react';
import { LuStar } from 'react-icons/lu';

const RatingModal = ({ isOpen, onClose, sessionData, onSubmit }) => {
    const [ratings, setRatings] = useState({
        overall: 3,
        difficulty: 3,
        usefulness: 3
    });

    useEffect(() => {
        if (isOpen && sessionData?.userRating) {
            setRatings(sessionData.userRating);
        }
    }, [isOpen, sessionData]);

    const handleSubmit = () => {
        onSubmit(ratings);
        onClose();
    };

    const StarRating = ({ value, onChange, label, description }) => {
        return (
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-800">{label}</span>
                    <span className="text-sm font-medium text-blue-600">({value}/5)</span>
                </div>
                {description && (
                    <p className="text-sm text-gray-600 mb-3">{description}</p>
                )}
                <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => onChange(star)}
                            className={`text-3xl transition-colors duration-200 focus:outline-none ${
                                star <= value ? 'text-yellow-400' : 'text-gray-300'
                            } hover:text-yellow-400`}
                            type="button"
                        >
                            <LuStar 
                                fill={star <= value ? 'currentColor' : 'none'} 
                                className="drop-shadow-sm"
                            />
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
                
                <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Rate Your Session</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {sessionData?.role} • {sessionData?.topicsToFocus}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    {/* Content */}
                    <div className="px-6 py-6">
                        <StarRating
                            label="Overall Experience"
                            description="How would you rate this interview session overall?"
                            value={ratings.overall}
                            onChange={(value) => setRatings(prev => ({ ...prev, overall: value }))}
                        />
                        
                        <StarRating
                            label="Question Difficulty"
                            description="How challenging were the questions in this session?"
                            value={ratings.difficulty}
                            onChange={(value) => setRatings(prev => ({ ...prev, difficulty: value }))}
                        />
                        
                        <StarRating
                            label="Usefulness"
                            description="How useful was this session for your interview preparation?"
                            value={ratings.usefulness}
                            onChange={(value) => setRatings(prev => ({ ...prev, usefulness: value }))}
                        />
                    </div>
                    
                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 text-gray-700 font-medium border border-gray-300 rounded-xl hover:bg-white hover:border-gray-400 transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Save Rating
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RatingModal;
