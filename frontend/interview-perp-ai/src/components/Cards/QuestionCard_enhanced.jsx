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
        switch (diff) {
            case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Hard': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getProbabilityColor = (prob) => {
        switch (prob) {
            case 'Very High': return 'bg-red-100 text-red-800 border-red-200';
            case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Medium': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Low': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
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
        <div className="bg-white rounded-xl mb-6 overflow-hidden shadow-lg border border-gray-100 group hover:shadow-xl transition-all duration-300">
            {/* Header with badges */}
            <div className="px-6 pt-4 pb-2">
                <div className="flex flex-wrap gap-2 mb-3">
                    {difficulty && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(difficulty)}`}>
                            {difficulty}
                        </span>
                    )}
                    {justification?.interviewType && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                            {getInterviewTypeIcon(justification.interviewType)} {justification.interviewType}
                        </span>
                    )}
                    {justification?.probability && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getProbabilityColor(justification.probability)}`}>
                            🎯 {justification.probability}
                        </span>
                    )}
                    {category && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                            {category}
                        </span>
                    )}
                </div>
            </div>

            {/* Main content */}
            <div className="px-6 pb-4">
                <div className="flex items-start justify-between cursor-pointer" onClick={toggleExpand}>
                    <div className="flex items-start gap-4 flex-1">
                        <span className="text-sm font-bold text-blue-600 mt-1">Q</span>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-800 leading-relaxed mb-2">
                                {question}
                            </h3>
                            
                            {/* Justification preview */}
                            {justification?.reasoning && (
                                <p className="text-xs text-gray-600 bg-blue-50 px-3 py-2 rounded-lg mb-2">
                                    💡 {justification.reasoning.substring(0, 100)}...
                                </p>
                            )}

                            {/* Rating display */}
                            {userRating && (
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex items-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <LuStar
                                                key={star}
                                                className={`w-3 h-3 ${
                                                    star <= avgRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-600">
                                        ({avgRating.toFixed(1)})
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                        {/* Action buttons */}
                        <div className={`flex items-center gap-2 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 ${isExpanded ? "!opacity-100" : ""}`}>
                            <button
                                className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded border transition-all ${
                                    isMastered
                                    ? 'bg-green-100 text-green-800 border-green-200 hover:border-green-300'
                                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={(e) => { e.stopPropagation(); onToggleMastered(); }}
                            >
                                <LuCheck className="w-3 h-3" />
                                {isMastered ? "Mastered" : "Master"}
                            </button>
                            
                            <button
                                className="flex items-center gap-1 text-xs text-indigo-800 font-medium bg-indigo-50 px-2 py-1 rounded border border-indigo-100 hover:border-indigo-200 transition-all"
                                onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
                            >
                                {isPinned ? <LuPinOff className="w-3 h-3" /> : <LuPin className="w-3 h-3" />}
                            </button>
                            
                            <button
                                className="flex items-center gap-1 text-xs text-cyan-800 font-medium bg-cyan-50 px-2 py-1 rounded border border-cyan-100 hover:border-cyan-200 transition-all"
                                onClick={(e) => { e.stopPropagation(); onAskFollowUp(); }}
                            >
                                <LuMessageSquarePlus className="w-3 h-3" />
                            </button>

                            <button
                                className="flex items-center gap-1 text-xs text-yellow-800 font-medium bg-yellow-50 px-2 py-1 rounded border border-yellow-100 hover:border-yellow-200 transition-all"
                                onClick={(e) => { e.stopPropagation(); setShowRatingModal(true); }}
                            >
                                <LuStar className="w-3 h-3" />
                            </button>
                        </div>

                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <LuChevronDown
                                className={`w-5 h-5 transform transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
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
                        <div className="text-sm text-gray-700 bg-gray-50 px-4 py-3 rounded-lg">
                            <AIResponsePreview content={answer} />
                        </div>

                        {/* Full justification */}
                        {justification?.reasoning && (
                            <div className="bg-blue-50 px-4 py-3 rounded-lg">
                                <h4 className="text-xs font-semibold text-blue-800 mb-2">Why this question matters</h4>
                                <p className="text-sm text-blue-700">{justification.reasoning}</p>
                                {justification.commonCompanies && justification.commonCompanies.length > 0 && (
                                    <div className="mt-2">
                                        <span className="text-xs text-blue-600">Common at: </span>
                                        <span className="text-xs text-blue-800 font-medium">
                                            {justification.commonCompanies.join(', ')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Notes section */}
                        <div className="border-t pt-3">
                            <h4 className="text-xs font-semibold text-gray-500 mb-2">My Notes</h4>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Write your personal notes here..."
                                className="w-full h-20 p-3 text-sm border rounded-lg bg-white focus:ring-2 focus:ring-blue-300 outline-none resize-none"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSaveNote(questionId, note);
                                }}
                                disabled={note === (userNote || "")}
                                className="mt-2 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Save Note
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rating Modal */}
            {showRatingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowRatingModal(false)}>
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-4">Rate this Question</h3>
                        
                        {['difficulty', 'usefulness', 'clarity'].map((aspect) => (
                            <div key={aspect} className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                                    {aspect}
                                </label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setTempRating(prev => ({ ...prev, [aspect]: star }))}
                                            className="text-2xl hover:scale-110 transition-transform"
                                        >
                                            <LuStar
                                                className={`w-6 h-6 ${
                                                    star <= tempRating[aspect] ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowRatingModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRatingSubmit}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
