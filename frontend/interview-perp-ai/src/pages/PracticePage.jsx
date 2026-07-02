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
            <div className="min-h-screen bg-cream dark:bg-navy font-body text-charcoal dark:text-cream">
                {/* Enhanced Hero Header */}
                <div className="border-b-2 border-charcoal/10 dark:border-cream/10 bg-cream dark:bg-navy">
                    <div className="container mx-auto px-4 md:px-6 py-8">
                        <div className="text-center space-y-4">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-charcoal dark:bg-cream rounded-sm flex items-center justify-center" style={{ boxShadow: '4px 4px 0px 0px var(--color-shadow)' }}>
                                    <LuTarget className="w-6 h-6 text-white dark:text-navy" />
                                </div>
                                <h1 className="text-4xl md:text-5xl font-display font-bold text-charcoal dark:text-cream">
                                    Practice Session
                                </h1>
                            </div>
                            <p className="text-charcoal/80 dark:text-cream/80 text-lg max-w-2xl mx-auto leading-relaxed">
                                Practice makes perfect! Take your time to articulate your thoughts clearly and confidently.
                            </p>
                            <div className="flex items-center justify-center">
                                <button 
                                    onClick={() => navigate(-1)} 
                                    className="flex items-center gap-2 text-charcoal dark:text-cream font-bold uppercase tracking-wider text-xs bg-white dark:bg-navy-input px-4 py-2 rounded-sm border-2 border-charcoal dark:border-cream/40 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                                    style={{ boxShadow: '4px 4px 0px 0px var(--color-shadow)' }}
                                >
                                    <LuArrowLeft className="w-4 h-4" />
                                    <span>Back to Review</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto p-4 md:p-8 max-w-5xl">
                    <div className="card-editorial overflow-hidden" ref={topRef}>
                        {/* Question Header */}
                        <div className="bg-white dark:bg-navy-light p-6 border-b-2 border-charcoal dark:border-cream/40">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-charcoal dark:bg-cream rounded-sm flex items-center justify-center">
                                    <span className="text-white dark:text-navy font-bold text-sm font-display">Q</span>
                                </div>
                                <span className="text-charcoal dark:text-cream font-bold uppercase tracking-wider text-sm">Interview Question</span>
                            </div>
                            <p className="text-2xl md:text-3xl font-display font-bold text-charcoal dark:text-cream leading-relaxed">
                                {question.question}
                            </p>
                        </div>
                        
                        <div className="p-8 bg-cream dark:bg-navy">
                            {/* Answer Input Section */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <LuMessageSquare className="w-5 h-5 text-charcoal dark:text-cream" />
                                    <span className="font-bold text-charcoal dark:text-cream uppercase tracking-wider text-sm">Your Answer</span>
                                </div>
                                <div className="relative">
                                    <textarea
                                        className="w-full h-48 p-6 border-2 border-charcoal dark:border-cream/40 rounded-sm bg-white dark:bg-navy-input focus:outline-none transition-all duration-200 text-charcoal dark:text-cream placeholder-charcoal/50 dark:placeholder-cream/50 resize-none font-bold"
                                        style={{ boxShadow: '4px 4px 0px 0px var(--color-shadow)' }}
                                        value={transcript}
                                        onChange={(e) => setTranscript(e.target.value)}
                                        placeholder="Start typing your answer here, or use the microphone to record your response..."
                                        readOnly={!!feedback}
                                    />
                                    {isRecording && (
                                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-crimson border-2 border-charcoal dark:border-cream/40 text-white px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider animate-pulse" style={{ boxShadow: '2px 2px 0px 0px var(--color-shadow)' }}>
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
                                        className={`group flex items-center gap-3 px-8 py-4 font-bold uppercase tracking-wider text-sm rounded-sm text-white dark:text-navy transition-all duration-200 border-2 border-charcoal dark:border-cream/40 hover:-translate-y-1 cursor-pointer ${
                                            isRecording 
                                                ? 'bg-crimson' 
                                                : 'bg-charcoal dark:bg-cream'
                                        }`}
                                        style={{ boxShadow: '4px 4px 0px 0px var(--color-shadow)' }}
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
                                        className="group flex items-center gap-3 px-8 py-4 font-bold uppercase tracking-wider text-sm rounded-sm text-charcoal dark:text-cream bg-white dark:bg-navy-input border-2 border-charcoal dark:border-cream/40 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                                        style={{ boxShadow: '4px 4px 0px 0px var(--color-shadow)' }}
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
                                    <p className="text-charcoal dark:text-cream font-bold uppercase tracking-wider mt-4 text-center">
                                        Our AI is carefully analyzing your response...
                                    </p>
                                </div>
                            )}

                            {/* Feedback Section */}
                            {feedback && (
                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-navy-light rounded-sm p-6 border-2 border-charcoal dark:border-cream/40" style={{ boxShadow: '4px 4px 0px 0px var(--color-shadow)' }}>
                                        <div className="flex items-center gap-2 mb-4 pb-4 border-b-2 border-charcoal/10 dark:border-cream/10">
                                            <LuCheck className="w-5 h-5 text-charcoal dark:text-cream" />
                                            <span className="font-bold text-charcoal dark:text-cream uppercase tracking-wider">AI Feedback & Analysis</span>
                                        </div>
                                        <div className="prose prose-lg max-w-none text-charcoal/90 dark:text-cream/90 prose-slate dark:prose-invert">
                                            <ReactMarkdown>{feedback}</ReactMarkdown>
                                        </div>
                                    </div>
                                    
                                    {/* Practice Again Button */}
                                    <div className="text-center pt-6">
                                        <button
                                            onClick={handlePracticeAgain}
                                            className="group flex items-center gap-3 mx-auto px-8 py-4 font-bold uppercase tracking-wider text-sm rounded-sm text-white dark:text-navy bg-charcoal dark:bg-cream border-2 border-charcoal dark:border-cream/40 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                                            style={{ boxShadow: '4px 4px 0px 0px var(--color-shadow)' }}
                                        >
                                            <LuRefreshCw className="w-5 h-5" />
                                            <span>Practice Again</span>
                                        </button>
                                        <p className="text-charcoal/60 dark:text-cream/60 font-bold uppercase tracking-wider text-xs mt-4">
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