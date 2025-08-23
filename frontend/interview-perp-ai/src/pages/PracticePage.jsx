import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layouts/DashboardLayout';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';
import ReactMarkdown from 'react-markdown';
import SpinnerLoader from '../components/Loader/SpinnerLoader';
import { FaMicrophone, FaStopCircle, FaRedo } from 'react-icons/fa';

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
            <div className="container mx-auto p-4 md:p-8 max-w-4xl">
                <button onClick={() => navigate(-1)} className="text-blue-500 hover:underline mb-4 cursor-pointer">&larr; Back to Review</button>
                <div className="bg-white p-6 rounded-lg shadow-lg" ref={topRef}>
                    <h1 className="text-xl font-bold mb-2">Practice Session</h1>
                    <p className="text-lg font-semibold text-gray-800 mb-4">{question.question}</p>
                    
                    <div className="mb-4">
                        <textarea
                            className="w-full h-40 p-3 border rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-500"
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            placeholder="Your answer will appear here... You can also type."
                            readOnly={!!feedback} // Make textarea readonly after getting feedback
                        />
                    </div>

                    {/* Hide recording buttons after feedback is shown */}
                    {!feedback && (
                        <div className="flex items-center justify-center gap-4">
                            <button 
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`flex items-center gap-2 px-6 py-3 cursor-pointer font-semibold rounded-lg text-white transition-colors ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                            >
                                {isRecording ? <><FaStopCircle /> Stop Recording</> : <><FaMicrophone /> Start Recording</>}
                            </button>
                            <button 
                                onClick={handleGetFeedback}
                                disabled={isRecording || isLoading}
                                className="px-6 py-3 font-semibold rounded-lg text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-400 cursor-pointer"
                            >
                                Get Feedback
                            </button>
                        </div>
                    )}

                    {isLoading && <div className="mt-6 flex justify-center"><SpinnerLoader /></div>}

                    {feedback && (
                        <div className="mt-6 pt-4 border-t">
                            <h2 className="text-lg font-bold mb-2">Feedback</h2>
                            <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-md">
                                <ReactMarkdown>{feedback}</ReactMarkdown>
                            </div>
                            
                            {/* --- NEW: "Practice Again" button --- */}
                            <div className="mt-6 text-center">
                                <button
                                    onClick={handlePracticeAgain}
                                    className="flex items-center gap-2 mx-auto px-8 py-3 font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md cursor-pointer"
                                >
                                    <FaRedo /> Practice Again
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PracticePage;