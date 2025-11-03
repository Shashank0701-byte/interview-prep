import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Video, VideoOff, Mic, MicOff, Phone, Settings, 
    Eye, AlertTriangle, CheckCircle, Clock, User,
    Volume2, VolumeX, Camera, CameraOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';

// Import analysis components (we'll create these next)
import FacialAnalyzer from '../../components/AIInterview/FacialAnalyzer';
import VoiceAnalyzer from '../../components/AIInterview/VoiceAnalyzer';
import EnvironmentAnalyzer from '../../components/AIInterview/EnvironmentAnalyzer';
import RealTimeFeedback from '../../components/AIInterview/RealTimeFeedback';

const InterviewInterface = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    
    // Video/Audio refs
    const videoRef = useRef(null);
    const audioRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    
    // Interview state
    const [interview, setInterview] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    
    // Media controls
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [isAIAudioOn, setIsAIAudioOn] = useState(true);
    
    // Analysis data
    const [analysisData, setAnalysisData] = useState({
        facial: null,
        voice: null,
        environment: null
    });
    
    // Real-time feedback
    const [feedbackFlags, setFeedbackFlags] = useState([]);
    const [currentScore, setCurrentScore] = useState({
        eyeContact: 0,
        confidence: 0,
        voiceClarity: 0,
        professionalism: 0
    });

    // AI Interviewer state
    const [aiSpeaking, setAiSpeaking] = useState(false);
    const [aiPersona, setAiPersona] = useState(null);

    useEffect(() => {
        fetchInterviewSession();
        initializeMediaDevices();
        
        return () => {
            cleanupMediaDevices();
        };
    }, [sessionId]);

    useEffect(() => {
        let interval;
        if (interviewStarted) {
            interval = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [interviewStarted]);

    const fetchInterviewSession = async () => {
        try {
            const response = await axiosInstance.get(`/api/ai-interview-coach/${sessionId}`);
            
            if (response.data.success) {
                setInterview(response.data.interview);
                setAiPersona(response.data.interview.aiPersona);
                if (response.data.interview.questions.length > 0) {
                    setCurrentQuestion(response.data.interview.questions[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching interview session:', error);
            toast.error('Failed to load interview session');
            navigate('/ai-interview-coach');
        }
    };

    const initializeMediaDevices = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, facingMode: 'user' },
                audio: { 
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });
            
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            
            // Initialize media recorder for voice analysis
            mediaRecorderRef.current = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });
            
        } catch (error) {
            console.error('Error accessing media devices:', error);
            toast.error('Please allow camera and microphone access');
        }
    };

    const cleanupMediaDevices = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };

    const startInterview = async () => {
        try {
            await axiosInstance.post(`/api/ai-interview-coach/${sessionId}/start`, {});
            
            setInterviewStarted(true);
            setIsRecording(true);
            
            // Start AI introduction
            speakAIResponse(`Hello! I'm ${aiPersona?.name}, and I'll be conducting your interview today. Let's begin with our first question.`);
            
            toast.success('Interview started! Good luck!');
        } catch (error) {
            console.error('Error starting interview:', error);
            toast.error('Failed to start interview');
        }
    };

    const endInterview = async () => {
        try {
            setIsRecording(false);
            setInterviewStarted(false);
            
            const response = await axiosInstance.post(`/api/ai-interview-coach/${sessionId}/complete`, {});
            
            if (response.data.success) {
                toast.success('Interview completed!');
                navigate(`/ai-interview/${sessionId}/report`);
            }
        } catch (error) {
            console.error('Error ending interview:', error);
            toast.error('Failed to end interview');
        }
    };

    const toggleVideo = () => {
        if (streamRef.current) {
            const videoTrack = streamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !isVideoOn;
                setIsVideoOn(!isVideoOn);
            }
        }
    };

    const toggleAudio = () => {
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !isAudioOn;
                setIsAudioOn(!isAudioOn);
            }
        }
    };

    const speakAIResponse = (text) => {
        if ('speechSynthesis' in window && isAIAudioOn) {
            setAiSpeaking(true);
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            
            utterance.onend = () => {
                setAiSpeaking(false);
            };
            
            speechSynthesis.speak(utterance);
        }
    };

    const nextQuestion = () => {
        if (questionIndex < interview.questions.length - 1) {
            const nextIndex = questionIndex + 1;
            setQuestionIndex(nextIndex);
            setCurrentQuestion(interview.questions[nextIndex]);
            
            // AI asks the next question
            speakAIResponse(interview.questions[nextIndex].question);
        } else {
            endInterview();
        }
    };

    const handleAnalysisUpdate = useCallback((type, data) => {
        setAnalysisData(prev => ({
            ...prev,
            [type]: data
        }));
        
        // Submit to backend for real-time analysis
        if (interviewStarted) {
            submitAnalysisData(type, data);
        }
    }, [interviewStarted, sessionId]);

    const submitAnalysisData = async (type, data) => {
        try {
            const response = await axiosInstance.post(`/api/ai-interview-coach/${sessionId}/analysis`, {
                type,
                data
            });
            
            if (response.data.success && response.data.flags) {
                setFeedbackFlags(prev => [...prev, ...response.data.flags]);
                
                // Update real-time scores
                updateRealTimeScores(response.data.flags);
            }
        } catch (error) {
            console.error('Error submitting analysis data:', error);
        }
    };

    const updateRealTimeScores = (flags) => {
        // Update scores based on analysis flags
        setCurrentScore(prev => {
            const newScore = { ...prev };
            
            flags.forEach(flag => {
                switch (flag.type) {
                    case 'eye-contact':
                        newScore.eyeContact = Math.max(0, newScore.eyeContact - 5);
                        break;
                    case 'nervousness':
                        newScore.confidence = Math.max(0, newScore.confidence - 3);
                        break;
                    case 'background-noise':
                        newScore.professionalism = Math.max(0, newScore.professionalism - 5);
                        break;
                    case 'speaking-pace':
                        newScore.voiceClarity = Math.max(0, newScore.voiceClarity - 2);
                        break;
                }
            });
            
            return newScore;
        });
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!interview) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-white">Loading interview session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium">LIVE INTERVIEW</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-300">
                            <Clock className="w-4 h-4" />
                            <span className="font-mono">{formatTime(timeElapsed)}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-300">
                            Question {questionIndex + 1} of {interview.questions.length}
                        </div>
                        <button
                            onClick={endInterview}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                        >
                            <Phone className="w-4 h-4" />
                            <span>End Interview</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Video Call Interface */}
                    <div className="lg:col-span-3">
                        <div className="bg-gray-800 rounded-xl overflow-hidden">
                            {/* AI Interviewer */}
                            <div className="relative h-48 bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-3 mx-auto">
                                        <User className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">{aiPersona?.name}</h3>
                                    <p className="text-indigo-200">{aiPersona?.role} at {aiPersona?.company}</p>
                                    {aiSpeaking && (
                                        <div className="flex items-center justify-center mt-2">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                            </div>
                                            <span className="ml-2 text-sm text-white">Speaking...</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* User Video */}
                            <div className="relative h-96 bg-gray-900">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                                
                                {!isVideoOn && (
                                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                        <div className="text-center">
                                            <CameraOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-400">Camera is off</p>
                                        </div>
                                    </div>
                                )}

                                {/* Analysis Overlays */}
                                <FacialAnalyzer
                                    videoRef={videoRef}
                                    isActive={interviewStarted && isVideoOn}
                                    onAnalysisUpdate={(data) => handleAnalysisUpdate('facial', data)}
                                />
                                
                                <EnvironmentAnalyzer
                                    videoRef={videoRef}
                                    isActive={interviewStarted && isVideoOn}
                                    onAnalysisUpdate={(data) => handleAnalysisUpdate('environment', data)}
                                />

                                {/* Real-time Score Overlay */}
                                <div className="absolute top-4 right-4 bg-black/50 rounded-lg p-3 backdrop-blur-sm">
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="flex items-center space-x-1">
                                            <Eye className="w-3 h-3 text-blue-400" />
                                            <span>Eye: {currentScore.eyeContact}%</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Volume2 className="w-3 h-3 text-green-400" />
                                            <span>Voice: {currentScore.voiceClarity}%</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <CheckCircle className="w-3 h-3 text-purple-400" />
                                            <span>Conf: {currentScore.confidence}%</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <User className="w-3 h-3 text-indigo-400" />
                                            <span>Prof: {currentScore.professionalism}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="p-4 bg-gray-800 flex items-center justify-center space-x-4">
                                <button
                                    onClick={toggleVideo}
                                    className={`p-3 rounded-full transition-colors duration-200 ${
                                        isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                >
                                    {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                                </button>
                                
                                <button
                                    onClick={toggleAudio}
                                    className={`p-3 rounded-full transition-colors duration-200 ${
                                        isAudioOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                >
                                    {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                                </button>
                                
                                <button
                                    onClick={() => setIsAIAudioOn(!isAIAudioOn)}
                                    className={`p-3 rounded-full transition-colors duration-200 ${
                                        isAIAudioOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                >
                                    {isAIAudioOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                                </button>

                                {!interviewStarted ? (
                                    <button
                                        onClick={startInterview}
                                        className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                                    >
                                        Start Interview
                                    </button>
                                ) : (
                                    <button
                                        onClick={nextQuestion}
                                        className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                                        disabled={questionIndex >= interview.questions.length - 1}
                                    >
                                        Next Question
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Current Question */}
                        <div className="bg-gray-800 rounded-xl p-4">
                            <h3 className="text-lg font-semibold mb-3">Current Question</h3>
                            {currentQuestion && (
                                <div>
                                    <p className="text-gray-300 mb-2">{currentQuestion.question}</p>
                                    <div className="text-xs text-gray-500">
                                        Expected: {Math.floor(currentQuestion.expectedDuration / 60)} minutes
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Real-time Feedback */}
                        <RealTimeFeedback 
                            flags={feedbackFlags}
                            onDismiss={(flagId) => {
                                setFeedbackFlags(prev => prev.filter(f => f.id !== flagId));
                            }}
                        />

                        {/* Voice Analyzer */}
                        <VoiceAnalyzer
                            audioRef={audioRef}
                            isActive={interviewStarted && isAudioOn}
                            onAnalysisUpdate={(data) => handleAnalysisUpdate('voice', data)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewInterface;
