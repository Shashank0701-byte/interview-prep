import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    LuCheck, 
    LuStar, 
    LuTarget, 
    LuArrowRight, 
    LuRefreshCw,
    LuAward,
    LuTrendingUp,
    LuX
} from 'react-icons/lu';

const PhaseCompletionModal = ({ 
    isOpen, 
    onClose, 
    sessionData, 
    phaseInfo, 
    nextRecommendation 
}) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const getPhaseColor = (color) => {
        const colors = {
            blue: 'from-blue-500 to-cyan-500',
            purple: 'from-purple-500 to-indigo-500',
            emerald: 'from-emerald-500 to-green-500',
            amber: 'from-amber-500 to-orange-500',
            cyan: 'from-cyan-500 to-blue-500',
            green: 'from-green-500 to-emerald-500',
            red: 'from-red-500 to-pink-500',
            indigo: 'from-indigo-500 to-purple-500',
            orange: 'from-orange-500 to-red-500'
        };
        return colors[color] || 'from-gray-500 to-gray-600';
    };

    const handleReviewWeakQuestions = () => {
        navigate('/review');
        onClose();
    };

    const handleNextRecommendation = () => {
        if (nextRecommendation?.type === 'session') {
            navigate(`/interview-prep/${nextRecommendation.id}`);
        } else if (nextRecommendation?.type === 'quiz') {
            navigate(`/phase-quiz/${nextRecommendation.role}/${nextRecommendation.phaseId}`);
        } else if (nextRecommendation?.type === 'phase') {
            navigate(`/phase/${nextRecommendation.role}/${nextRecommendation.phaseId}`);
        }
        onClose();
    };

    const handleBackToPhase = () => {
        if (phaseInfo) {
            navigate(`/phase/${encodeURIComponent(phaseInfo.role)}/${phaseInfo.phaseId}`);
        } else {
            navigate('/roadmap');
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className={`bg-gradient-to-r ${phaseInfo ? getPhaseColor(phaseInfo.color) : 'from-emerald-500 to-green-500'} p-6 text-white rounded-t-3xl relative`}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                    
                    <div className="text-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                            <LuCheck className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Session Complete! 🎉</h2>
                        <p className="text-white/90">
                            Great job on completing your practice session
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Session Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-emerald-50 rounded-2xl">
                            <LuCheck className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                            <div className="font-bold text-emerald-600">{sessionData?.masteredQuestions || 0}</div>
                            <div className="text-xs text-emerald-600">Mastered</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-2xl">
                            <LuTarget className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                            <div className="font-bold text-blue-600">{sessionData?.questions?.length || 0}</div>
                            <div className="text-xs text-blue-600">Total Q&A</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-2xl">
                            <LuTrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                            <div className="font-bold text-purple-600">{sessionData?.completionPercentage || 0}%</div>
                            <div className="text-xs text-purple-600">Complete</div>
                        </div>
                        <div className="text-center p-4 bg-amber-50 rounded-2xl">
                            <LuStar className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                            <div className="font-bold text-amber-600">{phaseInfo?.completionPercentage || 0}%</div>
                            <div className="text-xs text-amber-600">Phase Progress</div>
                        </div>
                    </div>

                    {/* Phase Progress */}
                    {phaseInfo && (
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-8 h-8 bg-gradient-to-r ${getPhaseColor(phaseInfo.color)} rounded-xl flex items-center justify-center`}>
                                    <span className="text-white font-bold text-sm">{phaseInfo.order}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{phaseInfo.name}</h3>
                                    <p className="text-sm text-gray-600">Phase Progress</p>
                                </div>
                            </div>
                            
                            <div className="w-full bg-white/50 rounded-full h-3 mb-2">
                                <div 
                                    className={`bg-gradient-to-r ${getPhaseColor(phaseInfo.color)} h-3 rounded-full transition-all duration-1000 ease-out`}
                                    style={{ width: `${phaseInfo.completionPercentage}%` }}
                                ></div>
                            </div>
                            <div className="text-sm text-gray-600 text-center">
                                {phaseInfo.masteredQuestions} of {phaseInfo.totalQuestions} questions mastered
                            </div>
                        </div>
                    )}

                    {/* Next Steps */}
                    <div>
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <LuArrowRight className="w-5 h-5 text-indigo-500" />
                            What's Next?
                        </h3>
                        
                        <div className="space-y-3">
                            {/* Review Weak Questions */}
                            <button
                                onClick={handleReviewWeakQuestions}
                                className="w-full flex items-center justify-between p-4 bg-amber-50 hover:bg-amber-100 rounded-2xl border border-amber-200 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                                        <LuRefreshCw className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-gray-800">Review Weak Questions</div>
                                        <div className="text-sm text-gray-600">Practice questions you found challenging</div>
                                    </div>
                                </div>
                                <LuArrowRight className="w-5 h-5 text-amber-500 group-hover:translate-x-1 transition-transform" />
                            </button>

                            {/* Next Recommendation */}
                            {nextRecommendation && (
                                <button
                                    onClick={handleNextRecommendation}
                                    className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-2xl border border-blue-200 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                            {nextRecommendation.type === 'quiz' ? (
                                                <LuAward className="w-5 h-5 text-white" />
                                            ) : (
                                                <LuTarget className="w-5 h-5 text-white" />
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold text-gray-800">{nextRecommendation.title}</div>
                                            <div className="text-sm text-gray-600">{nextRecommendation.description}</div>
                                        </div>
                                    </div>
                                    <LuArrowRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}

                            {/* Back to Phase */}
                            {phaseInfo && (
                                <button
                                    onClick={handleBackToPhase}
                                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-200 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 bg-gradient-to-r ${getPhaseColor(phaseInfo.color)} rounded-xl flex items-center justify-center`}>
                                            <span className="text-white font-bold text-sm">{phaseInfo.order}</span>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold text-gray-800">Back to {phaseInfo.name}</div>
                                            <div className="text-sm text-gray-600">Continue your phase journey</div>
                                        </div>
                                    </div>
                                    <LuArrowRight className="w-5 h-5 text-gray-500 group-hover:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Motivational Message */}
                    <div className={`bg-gradient-to-r ${phaseInfo ? getPhaseColor(phaseInfo.color) : 'from-emerald-500 to-green-500'} rounded-2xl p-6 text-white text-center`}>
                        <LuStar className="w-8 h-8 mx-auto mb-3" />
                        <h4 className="font-bold text-lg mb-2">
                            {phaseInfo?.completionPercentage >= 100 
                                ? "Phase Complete! Ready for the quiz?" 
                                : phaseInfo?.completionPercentage >= 70 
                                    ? "Almost there! Keep going!" 
                                    : "Great progress! Every question counts!"
                            }
                        </h4>
                        <p className="text-white/90 text-sm">
                            {phaseInfo?.completionPercentage >= 100 
                                ? "You've mastered this phase. Time to test your knowledge!" 
                                : "Consistent practice leads to mastery. You're doing amazing!"
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhaseCompletionModal;
