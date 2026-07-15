import React, { useEffect, useRef, useState } from "react";
import { LuChevronDown, LuPin, LuPinOff, LuMessageSquarePlus, LuCheck, LuStar } from "react-icons/lu";
import AIResponsePreview from "../../pages/InterviewPrep/components/AIResponsePreview";

const QuestionCard = ({
    questionId,
    question,
    answer,
    userNote,
    onAskFollowUp,
    isMastered,
    onToggleMastered,
    isPinned,
    onTogglePin,
    onSaveNote,
    // Enhanced props
    justification,
    userRating,
    onUpdateRating,
    difficulty,
    tags,
    category,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [height, setHeight] = useState(0);
    const contentRef = useRef(null);
    const [note, setNote] = useState(userNote || "");
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [tempRating, setTempRating] = useState(userRating || { difficulty: 3, usefulness: 3, clarity: 3 });

    useEffect(() => {
        setNote(userNote || "");
    }, [userNote]);

    useEffect(() => {
        if (isExpanded && contentRef.current) {
            const contentHeight = contentRef.current.scrollHeight;
            setHeight(contentHeight + 20);
        } else {
            setHeight(0);
        }
    }, [isExpanded, answer, userNote]);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const handleRatingSubmit = () => {
        onUpdateRating(questionId, tempRating);
        setShowRatingModal(false);
    };

    const getDifficultyColor = (diff) => {
        return 'border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream shadow-[2px_2px_0px_0px_var(--color-shadow)]';
    };

    const getProbabilityColor = (prob) => {
        return 'border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream shadow-[2px_2px_0px_0px_var(--color-shadow)]';
    };

    const getInterviewTypeIcon = (type) => {
        switch (type) {
            case 'Technical': return '💻';
            case 'Behavioral': return '🤝';
            case 'System Design': return '🏗️';
            case 'Coding': return '⌨️';
            default: return '📋';
        }
    };

    const avgRating = userRating ? (userRating.difficulty + userRating.usefulness + userRating.clarity) / 3 : 0;

    return (
        <div className="card-editorial mb-6 overflow-hidden group bg-white dark:bg-navy transition-colors duration-300">
            {/* Header with badges */}
            <div className="px-6 pt-4 pb-2">
                <div className="flex flex-wrap gap-2 mb-3">
                    {difficulty && (
                        <span className={`px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider rounded-sm ${getDifficultyColor(difficulty)}`}>
                            {difficulty}
                        </span>
                    )}
                    {justification?.interviewType && (
                        <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider rounded-sm border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                            {getInterviewTypeIcon(justification.interviewType)} {justification.interviewType}
                        </span>
                    )}
                    {justification?.probability && (
                        <span className={`px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider rounded-sm ${getProbabilityColor(justification.probability)}`}>
                            🎯 {justification.probability}
                        </span>
                    )}
                    {category && (
                        <span className="px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider rounded-sm border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                            {category}
                        </span>
                    )}
                </div>
            </div>

            {/* Main content */}
            <div className="px-6 pb-4">
                <div className="flex items-start justify-between cursor-pointer" onClick={toggleExpand}>
                    <div className="flex items-start gap-4 flex-1">
                        <span className="w-8 h-8 bg-charcoal dark:bg-cream text-cream dark:text-charcoal flex items-center justify-center font-bold text-sm rounded-sm shrink-0">
                            Q
                        </span>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-charcoal dark:text-cream leading-relaxed mb-2">
                                {question}
                            </h3>
                            
                            {/* Justification preview */}
                            {justification?.reasoning && (
                                <p className="text-xs text-charcoal/80 dark:text-cream/80 bg-cream dark:bg-navy px-3 py-2 rounded-sm border-2 border-charcoal/20 dark:border-cream/20 mb-2 font-bold font-mono">
                                    💡 {justification.reasoning.substring(0, 100)}...
                                </p>
                            )}

                            {/* Rating display */}
                            {userRating && (
                                <div className="flex items-center gap-2 mb-2 font-mono">
                                    <div className="flex items-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <LuStar
                                                key={star}
                                                className={`w-3 h-3 ${
                                                    star <= avgRating ? 'text-charcoal dark:text-cream fill-current' : 'text-charcoal/20 dark:text-cream/20'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-charcoal/85 dark:text-cream/85 font-bold">
                                        ({avgRating.toFixed(1)})
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                        {/* Action buttons */}
                        <div className={`flex items-center gap-2 transition-all duration-200 md:opacity-0 md:group-hover:opacity-100 ${isExpanded ? "!opacity-100" : ""}`}>
                            <button
                                className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-2 py-1.5 rounded-sm border-2 transition-all cursor-pointer shadow-[2px_2px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none ${
                                    isMastered
                                    ? 'bg-charcoal text-white border-charcoal dark:border-cream/40 -translate-y-0.5'
                                    : 'bg-white dark:bg-navy-light text-charcoal dark:text-cream border-charcoal dark:border-cream/40 hover:-translate-y-0.5'
                                }`}
                                onClick={(e) => { e.stopPropagation(); onToggleMastered(); }}
                            >
                                <LuCheck className="w-3.5 h-3.5" strokeWidth={3} />
                                {isMastered ? "Mastered" : "Master"}
                            </button>
                            
                            <button
                                className="flex items-center gap-1 text-charcoal dark:text-cream font-bold bg-white dark:bg-navy-light px-2 py-1.5 rounded-sm border-2 border-charcoal dark:border-cream/40 shadow-[2px_2px_0px_0px_var(--color-shadow)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
                            >
                                {isPinned ? <LuPinOff className="w-3.5 h-3.5" strokeWidth={3} /> : <LuPin className="w-3.5 h-3.5" strokeWidth={3} />}
                            </button>
                            
                            <button
                                className="flex items-center gap-1 text-charcoal dark:text-cream font-bold bg-white dark:bg-navy-light px-2 py-1.5 rounded-sm border-2 border-charcoal dark:border-cream/40 shadow-[2px_2px_0px_0px_var(--color-shadow)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); onAskFollowUp(); }}
                            >
                                <LuMessageSquarePlus className="w-3.5 h-3.5" strokeWidth={3} />
                            </button>

                            <button
                                className="flex items-center gap-1 text-charcoal dark:text-cream font-bold bg-white dark:bg-navy-light px-2 py-1.5 rounded-sm border-2 border-charcoal dark:border-cream/40 shadow-[2px_2px_0px_0px_var(--color-shadow)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); setShowRatingModal(true); }}
                            >
                                <LuStar className="w-3.5 h-3.5" strokeWidth={3} />
                            </button>
                        </div>

                        <button className="text-charcoal dark:text-cream hover:text-charcoal/80 dark:hover:text-cream/80 transition-colors p-1 border-2 border-transparent hover:border-charcoal dark:hover:border-cream/40 rounded-sm">
                            <LuChevronDown
                                className={`w-5 h-5 transform transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                                strokeWidth={3}
                            />
                        </button>
                    </div>
                </div>

                {/* Expanded content */}
                <div
                    className="overflow-hidden transition-all duration-500 ease-in-out"
                    style={{ maxHeight: `${height}px` }}
                >
                    <div ref={contentRef} className="pt-4 space-y-4">
                        <div className="text-sm text-charcoal dark:text-cream bg-cream dark:bg-navy border-4 border-charcoal dark:border-cream/40 px-4 py-4 rounded-sm shadow-[4px_4px_0px_0px_var(--color-shadow)]">
                            <AIResponsePreview content={answer} />
                        </div>

                        {/* Full justification */}
                        {justification?.reasoning && (
                            <div className="bg-cream dark:bg-navy border-2 border-charcoal/30 dark:border-cream/30 px-4 py-3 rounded-sm">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal dark:text-cream mb-2 font-mono">Why this question matters</h4>
                                <p className="text-sm text-charcoal dark:text-cream leading-relaxed">{justification.reasoning}</p>
                                {justification.commonCompanies && justification.commonCompanies.length > 0 && (
                                    <div className="mt-2 font-mono">
                                        <span className="text-xs text-charcoal/80 dark:text-cream/80 font-bold">Common at: </span>
                                        <span className="text-xs text-charcoal dark:text-cream font-bold">
                                            {justification.commonCompanies.join(', ')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Notes section */}
                        <div className="border-t-2 border-charcoal/20 dark:border-cream/20 pt-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal dark:text-cream mb-2 font-mono">My Notes</h4>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Write your personal notes here..."
                                className="w-full h-20 p-3 text-sm border-2 border-charcoal dark:border-cream/40 rounded-sm bg-white dark:bg-navy-light dark:text-cream focus:bg-cream/20 focus:outline-none focus:shadow-[4px_4px_0px_0px_var(--color-shadow)] transition-all resize-none"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSaveNote(questionId, note);
                                }}
                                disabled={note === (userNote || "")}
                                className="mt-4 px-6 py-2.5 bg-charcoal text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all border-2 border-charcoal dark:border-cream/40 cursor-pointer"
                            >
                                Save Note
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rating Modal */}
            {showRatingModal && (
                <div className="fixed inset-0 bg-charcoal/70 dark:bg-navy/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowRatingModal(false)}>
                    <div className="bg-white dark:bg-navy border-4 border-charcoal dark:border-cream/40 rounded-sm shadow-[12px_12px_0px_0px_#1A1A1A] dark:shadow-[12px_12px_0px_0px_var(--color-shadow)] p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-2xl font-display font-bold text-charcoal dark:text-cream mb-6 uppercase tracking-wider border-b-2 border-charcoal dark:border-cream/40 pb-2">Rate Question</h3>
                        
                        {['difficulty', 'usefulness', 'clarity'].map((aspect) => (
                            <div key={aspect} className="mb-4">
                                <label className="block text-xs font-mono font-bold uppercase tracking-widest text-charcoal/60 dark:text-cream/60 mb-2">
                                    {aspect}
                                </label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setTempRating(prev => ({ ...prev, [aspect]: star }))}
                                            className="text-2xl hover:-translate-y-0.5 transition-transform cursor-pointer"
                                        >
                                            <LuStar
                                                className={`w-6 h-6 ${
                                                    star <= tempRating[aspect] ? 'text-charcoal dark:text-cream fill-current' : 'text-charcoal/20 dark:text-cream/20'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowRatingModal(false)}
                                className="flex-1 px-4 py-2.5 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream font-bold uppercase tracking-widest rounded-sm hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all text-xs cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRatingSubmit}
                                className="flex-1 px-4 py-2.5 bg-charcoal text-white font-bold uppercase tracking-widest border-2 border-charcoal dark:border-cream/40 rounded-sm hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(26,26,26,0.3)] active:translate-y-0.5 active:shadow-none transition-all text-xs cursor-pointer"
                            >
                                Save Rating
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionCard;
