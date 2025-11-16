import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';
import ReactMarkdown from 'react-markdown';
import SpinnerLoader from '../components/Loader/SpinnerLoader.jsx';
import { FaMicrophone, FaStopCircle, FaRedo } from 'react-icons/fa';
import { LuMic, LuMicOff, LuPlay, LuArrowLeft, LuMessageSquare, LuTarget, LuStar, LuCheck, LuRefreshCw } from 'react-icons/lu';

// Hook for Speech Recognition
const useSpeechRecognition = () => {
    const [transcript, setTranscript] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Speech Recognition is not supported by this browser.");
            return;
        }
        
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            // Using a function to update state to ensure we have the latest previous transcript
            setTranscript(prev => prev + finalTranscript);
        };
        
        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const startRecording = () => {
        if (recognitionRef.current) {
            setTranscript(''); // Clear previous transcript
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
    };

    return { transcript, setTranscript, isRecording, startRecording, stopRecording };
};


const PracticePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { question } = location.state || {};
    const topRef = useRef(null); // Ref for scrolling to the top
    
    const { transcript, setTranscript, isRecording, startRecording, stopRecording } = useSpeechRecognition();
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!question) {
            navigate('/dashboard'); 
        }
    }, [question, navigate]);

    const handleGetFeedback = async () => {
        if (!transcript.trim()) {
            alert("Please provide an answer before getting feedback.");
            return;
        }
        setIsLoading(true);
        setFeedback('');
        try {
            const response = await axiosInstance.post(API_PATHS.FEEDBACK.GENERATE, {
                question: question.question,
                userAnswer: transcript,
            });
            setFeedback(response.data.feedback);
        } catch (error) {
            console.error("Failed to get feedback", error);
            setFeedback("Sorry, an error occurred while generating feedback. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- NEW: Function to reset the practice session ---
    const handlePracticeAgain = () => {
        setFeedback('');
        setTranscript('');
        topRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (!question) {
        return <DashboardLayout><SpinnerLoader /></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
                {/* Enhanced Hero Header */}
                <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                    <div className="container mx-auto px-4 md:px-6 py-8">
                        <div className="text-center space-y-4">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gray-600 dark:bg-slate-600 rounded-2xl flex items-center justify-center shadow-sm">
                                    <LuTarget className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                                    Practice Session
                                </h1>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                                Practice makes perfect! Take your time to articulate your thoughts clearly and confidently.
                            </p>
                            <div className="flex items-center justify-center">
                                <button 
                                    onClick={() => navigate(-1)} 
                                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors bg-gray-100 dark:bg-slate-700 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
                                >
                                    <LuArrowLeft className="w-4 h-4" />
                                    <span>Back to Review</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto p-4 md:p-8 max-w-5xl">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden" ref={topRef}>
                        {/* Question Header */}
                        <div className="bg-gray-50 dark:bg-slate-700 p-6 border-b border-gray-200 dark:border-slate-600">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-gray-600 dark:bg-slate-600 rounded-xl flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">Q</span>
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">Interview Question</span>
                            </div>
                            <p className="text-xl md:text-2xl font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                                {question.question}
                            </p>
                        </div>
                        
                        <div className="p-8">
                            {/* Answer Input Section */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <LuMessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">Your Answer</span>
                                </div>
                                <div className="relative">
                                    <textarea
                                        className="w-full h-48 p-6 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 focus:ring-2 focus:ring-gray-500 dark:focus:ring-slate-400 focus:border-gray-400 dark:focus:border-slate-500 transition-all duration-200 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                                        value={transcript}
                                        onChange={(e) => setTranscript(e.target.value)}
                                        placeholder="Start typing your answer here, or use the microphone to record your response..."
                                        readOnly={!!feedback}
                                    />
                                    {isRecording && (
                                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                                            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                                            Recording...
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {!feedback && (
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                                    <button 
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={`group flex items-center gap-3 px-8 py-4 font-semibold rounded-lg text-white transition-all duration-200 shadow-sm ${
                                            isRecording 
                                                ? 'bg-red-600 hover:bg-red-700' 
                                                : 'bg-gray-600 dark:bg-slate-600 hover:bg-gray-700 dark:hover:bg-slate-500'
                                        }`}
                                    >
                                        {isRecording ? (
                                            <>
                                                <LuMicOff className="w-5 h-5" />
                                                <span>Stop Recording</span>
                                            </>
                                        ) : (
                                            <>
                                                <LuMic className="w-5 h-5" />
                                                <span>Start Recording</span>
                                            </>
                                        )}
                                    </button>
                                    
                                    <button 
                                        onClick={handleGetFeedback}
                                        disabled={isRecording || isLoading || !transcript.trim()}
                                        className="group flex items-center gap-3 px-8 py-4 font-semibold rounded-lg text-white bg-gray-900 dark:bg-slate-700 hover:bg-gray-800 dark:hover:bg-slate-600 disabled:bg-gray-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                                    >
                                        <LuStar className="w-5 h-5" />
                                        <span>{isLoading ? 'Analyzing...' : 'Get AI Feedback'}</span>
                                    </button>
                                </div>
                            )}

                            {/* Loading State */}
                            {isLoading && (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <SpinnerLoader />
                                    <p className="text-gray-600 dark:text-gray-400 mt-4 text-center">
                                        Our AI is carefully analyzing your response...
                                    </p>
                                </div>
                            )}

                            {/* Feedback Section */}
                            {feedback && (
                                <div className="space-y-6">
                                    <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-6 border border-gray-200 dark:border-slate-600">
                                        <div className="flex items-center gap-2 mb-4">
                                            <LuCheck className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">AI Feedback & Analysis</span>
                                        </div>
                                        <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
                                            <ReactMarkdown>{feedback}</ReactMarkdown>
                                        </div>
                                    </div>
                                    
                                    {/* Practice Again Button */}
                                    <div className="text-center pt-6 border-t border-gray-200 dark:border-slate-600">
                                        <button
                                            onClick={handlePracticeAgain}
                                            className="group flex items-center gap-3 mx-auto px-8 py-4 font-semibold rounded-lg text-white bg-gray-600 dark:bg-slate-600 hover:bg-gray-700 dark:hover:bg-slate-500 transition-all duration-200 shadow-sm"
                                        >
                                            <LuRefreshCw className="w-5 h-5" />
                                            <span>Practice Again</span>
                                        </button>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
                                            Keep practicing to build confidence and fluency!
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PracticePage;