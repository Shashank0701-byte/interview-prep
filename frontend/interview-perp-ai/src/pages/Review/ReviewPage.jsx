import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import SpinnerLoader from '../../components/Loader/SpinnerLoader';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';

const ReviewPage = () => {
    const [queue, setQueue] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAnswer, setShowAnswer] = useState(false);
    const [initialQueueSize, setInitialQueueSize] = useState(0);

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const response = await axiosInstance.get(API_PATHS.SESSIONS.GET_REVIEW_QUEUE);
                const reviewQueue = response.data.reviewQueue || [];
                setQueue(reviewQueue);
                setInitialQueueSize(reviewQueue.length);
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
    const cardsReviewed = initialQueueSize - queue.length;
    const progressPercentage = initialQueueSize > 0 ? ((cardsReviewed + 1) / initialQueueSize) * 100 : 0;

    return (
        <DashboardLayout>
            {/* 1. Main container with gradient blob background */}
            <div 
                className="w-full h-full flex items-center justify-center p-4 relative overflow-hidden"
                style={{ background: '#f8f9fa' }}
            >
                {/* Gradient Blob */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-100 to-blue-200 rounded-full filter blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-100 to-red-200 rounded-full filter blur-3xl opacity-20"></div>

                {/* Grain Texture Overlay */}
                <div 
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{
                        backgroundImage: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXWBgYGHh4d5eXlzc3OLi4ubm5uVlZWPj4+NjY19fX2JiYl/f39ra2uRkZGZmZlpaWmXl5dvb29xcXGTk5NnZ2c8TV1mAAAAG3RSTlNAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAvEOwtAAAAYklEQVRIx+3NMQoAIAwDwPkf5/22sVltA9PpnxRUciTGe/CWSV1iKMWAIeMAjaoIAHcucscFnG5vupIWdiWacG8rCacROyIA2v8BYKCRi1sJqKha7Hw3PTop62M7JpHBC5MvJoAAAAASUVORK5CYII=)',
                        opacity: 0.05,
                    }}
                ></div>

                <div className="container mx-auto max-w-2xl relative z-10">
                    {/* 2. Defined Content Area Header */}
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold text-slate-800">Review Session</h1>
                        {initialQueueSize > 0 && (
                            <span className="text-sm font-medium text-slate-500">
                                Card {cardsReviewed + 1} of {initialQueueSize}
                            </span>
                        )}
                    </div>
                    
                    {/* 3. Progress Bar */}
                    {initialQueueSize > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
                            <motion.div
                                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1.5 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                            ></motion.div>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {currentQuestion ? (
                            <motion.div
                                key={currentQuestion._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="bg-white/70 backdrop-blur-sm p-6 md:p-8 rounded-xl shadow-lg border border-slate-200/80">
                                    <p className="font-semibold text-lg text-slate-900">{currentQuestion.question}</p>
                                    
                                    {showAnswer ? (
                                        <div className="mt-4 pt-4 border-t border-slate-200">
                                            <div className="prose prose-sm max-w-none text-gray-700">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentQuestion.answer}</ReactMarkdown>
                                            </div>
                                            
                                            <div className="flex justify-center gap-3 md:gap-4 mt-8">
                                                <button onClick={() => handleReview(currentQuestion._id, 'again')} className="btn-primary bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg ...">Again</button>
                                                <button onClick={() => handleReview(currentQuestion._id, 'hard')} className="btn-primary bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-3 px-6 rounded-lg ...">Hard</button>
                                                <button onClick={() => handleReview(currentQuestion._id, 'good')} className="btn-primary bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-3 px-6 rounded-lg ...">Good</button>
                                                <button onClick={() => handleReview(currentQuestion._id, 'easy')} className="btn-primary bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-3 px-6 rounded-lg ...">Easy</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button onClick={() => setShowAnswer(true)} className="btn-primary mt-4">Show Answer</button>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="text-center text-gray-500 bg-white p-8 rounded-xl shadow-lg border border-slate-200/80">
                                <p>You have no questions due for review. Great job!</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ReviewPage;
