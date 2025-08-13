import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import SpinnerLoader from '../../components/Loader/SpinnerLoader';
import ReactMarkdown from 'react-markdown';

const ReviewPage = () => {
    const [queue, setQueue] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAnswer, setShowAnswer] = useState(false);

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const response = await axiosInstance.get(API_PATHS.SESSIONS.GET_REVIEW_QUEUE);
                setQueue(response.data.reviewQueue || []);
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
        } catch (error) {
            console.error("Failed to submit review", error);
        }
    };

    if (isLoading) {
        return <DashboardLayout><div className="flex items-center justify-center h-screen"><SpinnerLoader /></div></DashboardLayout>;
    }
    
    const currentQuestion = queue[0];

    return (
        <DashboardLayout>
            <div className="container mx-auto p-8">
                <h1 className="text-2xl font-bold mb-6">Review Session</h1>
                {currentQuestion ? (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <p className="font-semibold text-lg">{currentQuestion.question}</p>
                        {showAnswer ? (
                            <div className="mt-4 pt-4 border-t">
                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown>{currentQuestion.answer}</ReactMarkdown>
                                </div>
                                <div className="flex justify-center gap-4 mt-6">
                                    <button onClick={() => handleReview(currentQuestion._id, 'hard')} className="btn-secondary bg-red-100 text-red-700">Hard</button>
                                    <button onClick={() => handleReview(currentQuestion._id, 'good')} className="btn-secondary bg-blue-100 text-blue-700">Good</button>
                                    <button onClick={() => handleReview(currentQuestion._id, 'easy')} className="btn-secondary bg-green-100 text-green-700">Easy</button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setShowAnswer(true)} className="btn-primary mt-4">Show Answer</button>
                        )}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">You have no questions due for review. Great job!</p>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ReviewPage;
