import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import SpinnerLoader from '../../components/Loader/SpinnerLoader.jsx';
import ReactMarkdown from 'react-markdown';

const ReviewPage = () => {
    const [queue, setQueue] = useState([]);
    const [initialCount, setInitialCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [showAnswer, setShowAnswer] = useState(false);
    const navigate = useNavigate(); // Initialize the navigate hook

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

    // --- NEW: Function to navigate to the practice page ---
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
            <div className="container mx-auto p-4 md:p-8 flex flex-col items-center">
                <div className="w-full max-w-2xl">
                    <h1 className="text-2xl font-bold mb-4">Review Session</h1>
                    {currentQuestion ? (
                        <>
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <p className="text-right text-sm text-gray-500 mb-2">Card {currentCardNumber} of {initialCount}</p>
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${initialCount > 0 ? (currentCardNumber / initialCount) * 100 : 0}%` }}></div>
                                </div>
                                <div className="min-h-[80px] flex items-center">
                                    <p className="font-semibold text-lg">{currentQuestion.question}</p>
                                </div>
                                
                                {showAnswer ? (
                                    <div className="mt-4 pt-4 border-t">
                                        <div className="prose prose-sm max-w-none mb-6">
                                            <ReactMarkdown>{currentQuestion.answer}</ReactMarkdown>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                                            <button onClick={() => handleReview(currentQuestion._id, 'again')} className="w-full bg-black text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-800 transition-colors cursor-pointer">Again</button>
                                            <button onClick={() => handleReview(currentQuestion._id, 'hard')} className="w-full bg-black text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-800 transition-colors cursor-pointer">Hard</button>
                                            <button onClick={() => handleReview(currentQuestion._id, 'good')} className="w-full bg-black text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-800 transition-colors cursor-pointer">Good</button>
                                            <button onClick={() => handleReview(currentQuestion._id, 'easy')} className="w-full bg-black text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-800 transition-colors cursor-pointer">Easy</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center mt-6">
                                        <button onClick={() => setShowAnswer(true)} className="w-full bg-black text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">Show Answer</button>
                                    </div>
                                )}
                            </div>
                            {/* --- NEW: "Practice Now" Button --- */}
                            <div className="text-center mt-4">
                                <button
                                    onClick={() => handlePractice(currentQuestion)}
                                    className="bg-blue-600 text-white font-bold py-2 px-8 rounded-lg hover:bg-blue-700 transition-colors shadow-md cursor-pointer"
                                >
                                    Practice Now
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
                            <p className="text-gray-600 text-lg">You have no questions due for review. Great job! 🎉</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ReviewPage;