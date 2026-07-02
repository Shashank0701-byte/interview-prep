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
            <div className="min-h-screen bg-cream font-body text-charcoal">
                {/* Enhanced Hero Header */}
                <div className="bg-cream border-b-2 border-charcoal/10">
                    <div className="container mx-auto px-4 md:px-6 py-8">
                        <div className="text-center space-y-4">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-charcoal rounded-md flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(26,26,26,0.2)]">
                                    <LuBrain className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-3xl md:text-4xl font-display font-bold text-charcoal">
                                    Review Session
                                </h1>
                            </div>
                            <p className="text-charcoal/80 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
                                {currentQuestion ? 
                                    "Take your time, breathe deeply, and trust your knowledge. Every review strengthens your understanding." :
                                    "All caught up! Your dedication to consistent learning is paying off beautifully."
                                }
                            </p>
                            {currentQuestion && (
                                <div className="flex items-center justify-center gap-6 text-sm mt-6">
                                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-md border-2 border-charcoal shadow-[4px_4px_0px_0px_#1A1A1A]">
                                        <LuTarget className="w-4 h-4 text-charcoal" />
                                        <span className="text-charcoal font-bold uppercase tracking-wider">Question {currentCardNumber} of {initialCount}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-md border-2 border-charcoal shadow-[4px_4px_0px_0px_#1A1A1A]">
                                        <LuCheck className="w-4 h-4 text-charcoal" />
                                        <span className="text-charcoal font-bold uppercase tracking-wider">{Math.round((currentCardNumber / initialCount) * 100)}% Complete</span>
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
                                                stroke="currentColor"
                                                strokeWidth="8"
                                                fill="none"
                                                className="text-charcoal/20"
                                            />
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                stroke="currentColor"
                                                strokeWidth="8"
                                                fill="none"
                                                strokeLinecap="square"
                                                strokeDasharray={`${2 * Math.PI * 40}`}
                                                strokeDashoffset={`${2 * Math.PI * 40 * (1 - (currentCardNumber / initialCount))}`}
                                                className="transition-all duration-1000 ease-out text-charcoal"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-lg font-display font-bold text-charcoal">
                                                {Math.round((currentCardNumber / initialCount) * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Enhanced Question Card */}
                                <div className="card-editorial overflow-hidden mb-8 transition-all duration-300">
                                    <div className="bg-cream p-6 border-b-2 border-charcoal">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-charcoal rounded-md flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">Q</span>
                                                </div>
                                                <span className="text-charcoal font-bold uppercase tracking-wider">Interview Question</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-charcoal/60">
                                                <LuStar className="w-4 h-4" />
                                                <span>Spaced Repetition</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-8">
                                        <div className="min-h-[120px] flex items-center justify-center">
                                            <p className="text-xl md:text-2xl font-display font-bold text-charcoal leading-relaxed text-center">
                                                {currentQuestion.question}
                                            </p>
                                        </div>
                                        
                                        {showAnswer ? (
                                            <div className="mt-8 pt-8 border-t-2 border-charcoal/10">
                                                <div className="bg-cream rounded-md p-6 mb-8 border-2 border-charcoal">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <LuCheck className="w-5 h-5 text-charcoal" />
                                                        <span className="font-bold uppercase tracking-wider text-charcoal">Answer</span>
                                                    </div>
                                                    <div className="prose prose-lg max-w-none font-medium text-charcoal/80">
                                                        <ReactMarkdown>{currentQuestion.answer}</ReactMarkdown>
                                                    </div>
                                                </div>
                                                
                                                {/* Professional Review Buttons */}
                                                <div className="space-y-4">
                                                    <p className="text-center font-bold uppercase tracking-wider text-charcoal/80 mb-6">
                                                        How well did you recall this answer? Be honest with yourself - it helps you learn better!
                                                    </p>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        <button 
                                                            onClick={() => handleReview(currentQuestion._id, 'again')} 
                                                            className="bg-cream text-charcoal border-2 border-charcoal py-4 px-6 rounded-md hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all duration-200 cursor-pointer"
                                                        >
                                                            <div className="flex flex-col items-center gap-2">
                                                                <LuRefreshCw className="w-5 h-5" />
                                                                <span className="font-bold uppercase tracking-wider">Again</span>
                                                                <span className="text-xs font-bold opacity-60">&lt; 1 day</span>
                                                            </div>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleReview(currentQuestion._id, 'hard')} 
                                                            className="bg-cream text-charcoal border-2 border-charcoal py-4 px-6 rounded-md hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all duration-200 cursor-pointer"
                                                        >
                                                            <div className="flex flex-col items-center gap-2">
                                                                <LuTarget className="w-5 h-5" />
                                                                <span className="font-bold uppercase tracking-wider">Hard</span>
                                                                <span className="text-xs font-bold opacity-60">1-2 days</span>
                                                            </div>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleReview(currentQuestion._id, 'good')} 
                                                            className="bg-cream text-charcoal border-2 border-charcoal py-4 px-6 rounded-md hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all duration-200 cursor-pointer"
                                                        >
                                                            <div className="flex flex-col items-center gap-2">
                                                                <LuCheck className="w-5 h-5" />
                                                                <span className="font-bold uppercase tracking-wider">Good</span>
                                                                <span className="text-xs font-bold opacity-60">3-5 days</span>
                                                            </div>
                                                        </button>
                                                        <button 
                                                            onClick={() => handleReview(currentQuestion._id, 'easy')} 
                                                            className="bg-charcoal text-white border-2 border-charcoal py-4 px-6 rounded-md hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all duration-200 cursor-pointer"
                                                        >
                                                            <div className="flex flex-col items-center gap-2">
                                                                <LuStar className="w-5 h-5" />
                                                                <span className="font-bold uppercase tracking-wider">Easy</span>
                                                                <span className="text-xs font-bold opacity-80">1+ week</span>
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center mt-8">
                                                <button 
                                                    onClick={() => setShowAnswer(true)} 
                                                    className="bg-charcoal text-white font-bold uppercase tracking-wider py-4 px-12 rounded-md border-2 border-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all duration-200 cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <LuPlay className="w-5 h-5" />
                                                        <span>Show Answer</span>
                                                    </div>
                                                </button>
                                                <p className="text-charcoal/60 font-bold uppercase tracking-wider text-sm mt-4">
                                                    Take a moment to think through your answer first
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Practice Button */}
                                <div className="text-center">
                                    <button
                                        onClick={() => handlePractice(currentQuestion)}
                                        className="bg-cream text-charcoal border-2 border-charcoal font-bold uppercase tracking-wider py-3 px-8 rounded-md hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all duration-200 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2">
                                            <LuPlay className="w-4 h-4" />
                                            <span>Practice This Question</span>
                                        </div>
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* Professional Empty State */
                            <div className="text-center card-editorial p-12">
                                <div className="space-y-6">
                                    <div className="flex justify-center">
                                        <div className="w-20 h-20 bg-charcoal rounded-md flex items-center justify-center border-2 border-charcoal">
                                            <LuCheck className="w-10 h-10 text-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h2 className="text-2xl md:text-3xl font-display font-bold text-charcoal">
                                            All Caught Up!
                                        </h2>
                                        <p className="text-lg font-medium text-charcoal/80 max-w-md mx-auto leading-relaxed">
                                            You have no questions due for review right now. Your consistent learning is paying off beautifully!
                                        </p>
                                    </div>
                                    <div className="bg-cream rounded-md p-6 border-2 border-charcoal shadow-[4px_4px_0px_0px_#1A1A1A]">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-bold uppercase tracking-wider text-charcoal">
                                            <div className="flex items-center gap-2 justify-center">
                                                <LuCheck className="w-4 h-4" />
                                                <span>Reviews completed</span>
                                            </div>
                                            <div className="flex items-center gap-2 justify-center">
                                                <LuBrain className="w-4 h-4" />
                                                <span>Knowledge retained</span>
                                            </div>
                                            <div className="flex items-center gap-2 justify-center">
                                                <LuStar className="w-4 h-4" />
                                                <span>Progress made</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-charcoal/60 font-bold uppercase tracking-wider text-sm">
                                        Come back later for your next review session, or practice some questions to keep the momentum going!
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