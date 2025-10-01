import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import SpinnerLoader from '../../components/Loader/SpinnerLoader.jsx';
import ReactMarkdown from 'react-markdown';
import { LuBrain, LuTarget, LuStar, LuCheck, LuRefreshCw, LuPlay, LuHeart } from 'react-icons/lu';

const ReviewPage = () => {
    // Auto scroll to top when navigating to this page
    useScrollToTop();
    
    const [queue, setQueue] = useState([]);
    const [initialCount, setInitialCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [showAnswer, setShowAnswer] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const response = await axiosInstance.get(API_PATHS.SESSIONS.GET_REVIEW_QUEUE);
                const reviewQueue = response.data.reviewQueue || [];
                setQueue(reviewQueue);
                setInitialCount(reviewQueue.length);
            } catch (error) {
                console.error("Failed to fetch review queue", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchQueue();
    }, []);

    const handleReview = async (questionId, quality) => {
        try {
            await axiosInstance.put(API_PATHS.QUESTION.REVIEW(questionId), { quality });
            setQueue(prevQueue => prevQueue.slice(1));
            setShowAnswer(false);
            
            // Trigger analytics refresh after review
            window.dispatchEvent(new Event('analytics-refresh'));
        } catch (error) {
            console.error("Failed to submit review", error);
        }
    };

    const handlePractice = (question) => {
        if (question) {
            // Pass the entire question object to the practice page
            navigate('/practice', { state: { question } });
        }
    };

    if (isLoading) {
        return <DashboardLayout><div className="flex items-center justify-center h-screen"><SpinnerLoader /></div></DashboardLayout>;
    }
    
    const currentQuestion = queue[0];
    const currentCardNumber = initialCount > 0 ? initialCount - queue.length + 1 : 0;

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
                {/* Enhanced Hero Header */}
                <div className="bg-gradient-to-r from-white via-blue-50/30 to-indigo-50/20 border-b border-gray-100/60">
                    <div className="container mx-auto px-4 md:px-6 py-8">
                        <div className="text-center space-y-4">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                                    <LuBrain className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-800 bg-clip-text text-transparent">
                                    Review Session
                                </h1>
                            </div>
                            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
                                {currentQuestion ? 
                                    "Take your time, breathe deeply, and trust your knowledge. Every review strengthens your understanding." :
                                    "All caught up! Your dedication to consistent learning is paying off beautifully."
                                }
                            </p>
                            {currentQuestion && (
                                <div className="flex items-center justify-center gap-6 text-sm text-slate-600 mt-6">
                                    <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-xl border border-purple-100/50">
                                        <LuTarget className="w-4 h-4 text-purple-500" />
                                        <span>Question {currentCardNumber} of {initialCount}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-xl border border-emerald-100/50">
                                        <LuCheck className="w-4 h-4 text-emerald-500" />
                                        <span>{Math.round((currentCardNumber / initialCount) * 100)}% Complete</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="container mx-auto p-4 md:p-8 flex flex-col items-center">
                    <div className="w-full max-w-4xl">
                        {currentQuestion ? (
                            <>
                                {/* Beautiful Progress Ring */}
                                <div className="flex justify-center mb-8">
                                    <div className="relative w-24 h-24">
                                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                stroke="#e5e7eb"
                                                strokeWidth="8"
                                                fill="none"
                                                className="opacity-20"
                                            />
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                stroke="url(#progressGradient)"
                                                strokeWidth="8"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeDasharray={`${2 * Math.PI * 40}`}
                                                strokeDashoffset={`${2 * Math.PI * 40 * (1 - (currentCardNumber / initialCount))}`}
                                                className="transition-all duration-1000 ease-out drop-shadow-sm"
                                            />
                                            <defs>
                                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#8b5cf6" />
                                                    <stop offset="100%" stopColor="#06b6d4" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-lg font-bold text-gray-700">
                                                {Math.round((currentCardNumber / initialCount) * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Enhanced Question Card */}
                                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-blue-100/50 border border-white/50 overflow-hidden mb-8 transform transition-all duration-500 hover:shadow-3xl hover:shadow-blue-200/30">
                                    <div className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10 p-6 border-b border-gray-100/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-xl flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">Q</span>
                                                </div>
                                                <span className="text-slate-600 font-medium">Interview Question</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <LuStar className="w-4 h-4" />
                                                <span>Spaced Repetition</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-8">
                                        <div className="min-h-[120px] flex items-center justify-center">
                                            <p className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed text-center">
                                                {currentQuestion.question}
                                            </p>
                                        </div>
                                        
                                        {showAnswer ? (
                                            <div className="mt-8 pt-8 border-t border-gray-100/80">
                                                <div className="bg-gradient-to-r from-emerald-50/50 to-blue-50/50 rounded-2xl p-6 mb-8 border border-emerald-100/30">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <LuCheck className="w-5 h-5 text-emerald-500" />
                                                        <span className="font-semibold text-emerald-700">Answer</span>
                                                    </div>
                                                    <div className="prose prose-lg max-w-none text-gray-700">
                                                        <ReactMarkdown>{currentQuestion.answer}</ReactMarkdown>
                                                    </div>
                                                </div>
                                                
                                                {/* Beautiful Review Buttons */}
                                                <div className="space-y-4">
                                                    <p className="text-center text-slate-600 font-medium mb-6">
                                                        How well did you recall this answer? Be honest with yourself - it helps you learn better! 💪
                                                    </p>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        <button 
                                                            onClick={() => handleReview(currentQuestion._id, 'again')} 
                                                            className="group relative bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold py-4 px-6 rounded-2xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
                                                        >
                                                            <div className="flex flex-col items-center gap-2">
                                                                <LuRefreshCw className="w-5 h-5" />
                                                                <span>Again</span>
                                                                <span className="text-xs opacity-80">&lt; 1 day</span>
                                                            </div>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleReview(currentQuestion._id, 'hard')} 
                                                            className="group relative bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-4 px-6 rounded-2xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
                                                        >
                                                            <div className="flex flex-col items-center gap-2">
                                                                <LuTarget className="w-5 h-5" />
                                                                <span>Hard</span>
                                                                <span className="text-xs opacity-80">1-2 days</span>
                                                            </div>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleReview(currentQuestion._id, 'good')} 
                                                            className="group relative bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-4 px-6 rounded-2xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
                                                        >
                                                            <div className="flex flex-col items-center gap-2">
                                                                <LuCheck className="w-5 h-5" />
                                                                <span>Good</span>
                                                                <span className="text-xs opacity-80">3-5 days</span>
                                                            </div>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleReview(currentQuestion._id, 'easy')} 
                                                            className="group relative bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold py-4 px-6 rounded-2xl hover:from-emerald-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
                                                        >
                                                            <div className="flex flex-col items-center gap-2">
                                                                <LuStar className="w-5 h-5" />
                                                                <span>Easy</span>
                                                                <span className="text-xs opacity-80">1+ week</span>
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center mt-8">
                                                <button 
                                                    onClick={() => setShowAnswer(true)} 
                                                    className="group bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-12 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-xl"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <LuPlay className="w-5 h-5 group-hover:animate-pulse" />
                                                        <span>Show Answer</span>
                                                    </div>
                                                </button>
                                                <p className="text-slate-500 text-sm mt-4">
                                                    Take a moment to think through your answer first ✨
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Practice Button */}
                                <div className="text-center">
                                    <button
                                        onClick={() => handlePractice(currentQuestion)}
                                        className="group bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-8 rounded-2xl hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                                    >
                                        <div className="flex items-center gap-2">
                                            <LuPlay className="w-4 h-4 group-hover:animate-pulse" />
                                            <span>Practice This Question</span>
                                        </div>
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* Beautiful Empty State */
                            <div className="text-center bg-gradient-to-br from-white via-emerald-50/30 to-green-50/50 backdrop-blur-sm p-12 rounded-3xl shadow-2xl shadow-emerald-100/50 border border-white/50">
                                <div className="space-y-6">
                                    <div className="flex justify-center">
                                        <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-xl">
                                            <LuHeart className="w-10 h-10 text-white animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                            All Caught Up! 🎉
                                        </h2>
                                        <p className="text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
                                            You have no questions due for review right now. Your consistent learning is paying off beautifully!
                                        </p>
                                    </div>
                                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100/50">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div className="flex items-center gap-2 text-emerald-600">
                                                <LuCheck className="w-4 h-4" />
                                                <span>Reviews completed</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-blue-600">
                                                <LuBrain className="w-4 h-4" />
                                                <span>Knowledge retained</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-purple-600">
                                                <LuStar className="w-4 h-4" />
                                                <span>Progress made</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-slate-500 text-sm">
                                        Come back later for your next review session, or practice some questions to keep the momentum going! 🚀
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ReviewPage;