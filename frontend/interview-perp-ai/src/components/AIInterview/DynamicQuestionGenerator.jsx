import React, { useState, useEffect } from 'react';
import { 
    Brain, 
    Lightbulb, 
    Target, 
    TrendingUp, 
    MessageSquare,
    Zap,
    CheckCircle,
    Clock,
    ArrowRight
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

const DynamicQuestionGenerator = ({ 
    sessionId, 
    currentQuestion, 
    userResponse, 
    analysisData,
    onFollowUpGenerated,
    isActive 
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [followUpQuestion, setFollowUpQuestion] = useState(null);
    const [generationHistory, setGenerationHistory] = useState([]);
    const [responseQuality, setResponseQuality] = useState(null);
    const [, setShowGenerator] = useState(false);

    // Analyze response quality when user provides a response
    useEffect(() => {
        if (userResponse && userResponse.trim().length > 10) {
            analyzeResponseQuality(userResponse);
        }
    }, [userResponse]);

    const analyzeResponseQuality = (response) => {
        // Simple response quality analysis (in real app, this could use AI)
        const wordCount = response.split(' ').length;
        const hasExamples = /example|instance|case|situation|experience/i.test(response);
        const hasTechnicalTerms = /algorithm|database|api|framework|architecture|design|pattern/i.test(response);
        const hasNumbers = /\d+/.test(response);
        
        const quality = {
            overall: Math.min(100, Math.max(20, wordCount * 2 + (hasExamples ? 20 : 0) + (hasTechnicalTerms ? 15 : 0))),
            completeness: Math.min(100, wordCount * 3),
            technical: hasTechnicalTerms ? Math.min(100, 60 + wordCount) : Math.max(20, wordCount),
            communication: Math.min(100, 50 + wordCount + (hasExamples ? 25 : 0)),
            specificity: hasNumbers || hasExamples ? Math.min(100, 70 + wordCount) : Math.max(30, wordCount * 2)
        };

        setResponseQuality(quality);
        
        // Auto-show generator if response quality suggests follow-up needed
        if (quality.overall < 70 || quality.completeness < 60) {
            setShowGenerator(true);
        }
    };

    const generateFollowUpQuestion = async () => {
        if (!userResponse || !currentQuestion) return;

        setIsGenerating(true);
        try {
            const performanceMetrics = {
                confidence: analysisData?.facial?.emotions?.confidence * 100 || 75,
                pace: analysisData?.voice?.pace || 150,
                eyeContact: analysisData?.facial?.eyeContact?.lookingAtCamera ? 80 : 60,
                clarity: analysisData?.voice?.clarity || 75
            };

            const response = await axiosInstance.post(
                `/api/ai-interview-coach/${sessionId}/generate-followup`,
                {
                    userResponse,
                    currentQuestionId: currentQuestion.id,
                    responseQuality,
                    performanceMetrics
                }
            );

            if (response.data.success) {
                const newFollowUp = response.data.followUpQuestion;
                setFollowUpQuestion(newFollowUp);
                setGenerationHistory(prev => [...prev, {
                    ...newFollowUp,
                    generatedAt: new Date(),
                    originalResponse: userResponse.substring(0, 100) + '...'
                }]);

                // Notify parent component
                if (onFollowUpGenerated) {
                    onFollowUpGenerated(newFollowUp);
                }
            }
        } catch (error) {
            console.error('Error generating follow-up question:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const getQualityColor = (score) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getQualityBg = (score) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getFollowUpTypeIcon = (type) => {
        switch (type) {
            case 'clarification': return MessageSquare;
            case 'deep-dive': return Target;
            case 'scenario': return Lightbulb;
            case 'alternative': return TrendingUp;
            case 'real-world': return Zap;
            case 'problem-solving': return Brain;
            default: return MessageSquare;
        }
    };

    const getFollowUpTypeColor = (type) => {
        switch (type) {
            case 'clarification': return 'text-blue-400 bg-blue-100';
            case 'deep-dive': return 'text-purple-400 bg-purple-100';
            case 'scenario': return 'text-green-400 bg-green-100';
            case 'alternative': return 'text-orange-400 bg-orange-100';
            case 'real-world': return 'text-indigo-400 bg-indigo-100';
            case 'problem-solving': return 'text-pink-400 bg-pink-100';
            default: return 'text-gray-400 bg-gray-100';
        }
    };

    if (!isActive) return null;

    return (
        <div className="space-y-4">
            {/* Response Quality Analysis */}
            {responseQuality && (
                <div className="bg-gray-800 rounded-xl p-4">
                    <h3 className="text-lg font-semibold mb-3 text-white flex items-center">
                        <Brain className="w-5 h-5 mr-2 text-purple-400" />
                        Response Analysis
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {Object.entries(responseQuality).map(([key, value]) => (
                            <div key={key} className="bg-gray-700 rounded-lg p-2">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-gray-300 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1')}
                                    </span>
                                    <span className={`text-xs font-bold ${getQualityColor(value)}`}>
                                        {Math.round(value)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-600 rounded-full h-1.5">
                                    <div 
                                        className={`h-1.5 rounded-full ${getQualityBg(value)}`}
                                        style={{ width: `${value}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Generate Follow-up Button */}
                    <button
                        onClick={generateFollowUpQuestion}
                        disabled={isGenerating || !userResponse}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                            isGenerating 
                                ? 'bg-gray-600 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                        } text-white`}
                    >
                        {isGenerating ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Generating Follow-up...</span>
                            </>
                        ) : (
                            <>
                                <Zap className="w-4 h-4" />
                                <span>Generate AI Follow-up</span>
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Generated Follow-up Question */}
            {followUpQuestion && (
                <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl p-4 border border-indigo-500">
                    <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                            <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                            AI Follow-up Question
                        </h3>
                        
                        <div className="flex items-center space-x-2">
                            {/* Question Type Badge */}
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getFollowUpTypeColor(followUpQuestion.type)}`}>
                                {React.createElement(getFollowUpTypeIcon(followUpQuestion.type), { className: "w-3 h-3 inline mr-1" })}
                                {followUpQuestion.type}
                            </div>
                            
                            {/* Difficulty Badge */}
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                followUpQuestion.difficulty === 'hard' ? 'bg-red-100 text-red-600' :
                                followUpQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-green-100 text-green-600'
                            }`}>
                                {followUpQuestion.difficulty}
                            </div>
                        </div>
                    </div>

                    <div className="bg-black/20 rounded-lg p-3 mb-3">
                        <p className="text-white font-medium leading-relaxed">
                            {followUpQuestion.question}
                        </p>
                    </div>

                    <div className="text-sm text-indigo-200 mb-2">
                        <strong>Context:</strong> {followUpQuestion.context}
                    </div>

                    <div className="text-xs text-indigo-300">
                        <strong>Expected Response:</strong> {followUpQuestion.expectedResponse}
                    </div>
                </div>
            )}

            {/* Generation History */}
            {generationHistory.length > 0 && (
                <div className="bg-gray-800 rounded-xl p-4">
                    <h3 className="text-lg font-semibold mb-3 text-white flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-gray-400" />
                        Follow-up History ({generationHistory.length})
                    </h3>
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {generationHistory.slice(-3).map((item, index) => (
                            <div key={index} className="bg-gray-700 rounded-lg p-2 text-sm">
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`px-2 py-1 rounded text-xs ${getFollowUpTypeColor(item.type)}`}>
                                        {item.type}
                                    </span>
                                    <span className="text-gray-400 text-xs">
                                        {new Date(item.generatedAt).toLocaleTimeString()}
                                    </span>
                                </div>
                                <p className="text-gray-300 text-xs leading-relaxed">
                                    {item.question.length > 80 ? item.question.substring(0, 80) + '...' : item.question}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DynamicQuestionGenerator;
