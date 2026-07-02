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
                    <span className="section-label">{label}</span>
                    <span className="text-sm font-bold text-charcoal dark:text-cream">({value}/5)</span>
                </div>
                {description && (
                    <p className="text-xs text-charcoal/50 dark:text-cream/50 mb-3">{description}</p>
                )}
                <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => onChange(star)}
                            className={`text-3xl transition-colors duration-200 focus:outline-none ${
                                star <= value ? 'text-charcoal dark:text-cream' : 'text-charcoal/10 dark:text-cream/10'
                            } hover:text-charcoal/80 dark:hover:text-cream/80`}
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
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
                
                <div className="relative bg-white dark:bg-navy-light border-2 border-charcoal dark:border-cream/20 rounded-md shadow-lg max-w-md w-full mx-4 transform transition-all">
                    {/* Header */}
                    <div className="px-6 py-5 border-b-2 border-charcoal/10 dark:border-cream/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-display text-charcoal dark:text-cream">Rate Your Session</h3>
                                <p className="text-sm text-charcoal/50 dark:text-cream/50 mt-1">
                                    {sessionData?.role} • {sessionData?.topicsToFocus}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-charcoal/40 dark:text-cream/40 hover:text-charcoal dark:hover:text-cream hover:bg-charcoal/5 dark:hover:bg-cream/10 rounded-md transition-all duration-200"
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
                    <div className="px-6 py-4 bg-cream dark:bg-navy border-t-2 border-charcoal/10 dark:border-cream/10">
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-charcoal dark:text-cream border-2 border-charcoal/20 dark:border-cream/20 hover:border-charcoal dark:hover:border-cream/60 rounded-md transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 px-4 py-2.5 bg-charcoal text-white text-sm font-bold uppercase tracking-wider rounded-md hover:bg-charcoal/80 transition-all duration-200"
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
