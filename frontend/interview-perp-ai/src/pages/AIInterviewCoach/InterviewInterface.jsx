import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Video, VideoOff, Mic, MicOff, Phone, 
    Eye, CheckCircle, Clock, User,
    Volume2, VolumeX, CameraOff, Zap, ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';

// Import analysis components
import FacialAnalyzer from '../../components/AIInterview/FacialAnalyzer';
import VoiceAnalyzer from '../../components/AIInterview/VoiceAnalyzer';
import EnvironmentAnalyzer from '../../components/AIInterview/EnvironmentAnalyzer';
import RealTimeFeedback from '../../components/AIInterview/RealTimeFeedback';
import RealTimeCoach from '../../components/AIInterview/RealTimeCoach';
import DynamicQuestionGenerator from '../../components/AIInterview/DynamicQuestionGenerator';

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
    const [textResponse, setTextResponse] = useState('');
    const [currentScore, setCurrentScore] = useState({
        eyeContact: 95,
        confidence: 90,
        voiceClarity: 85,
        professionalism: 92
    });

    // AI Interviewer state
    const [aiSpeaking, setAiSpeaking] = useState(false);
    const [aiPersona, setAiPersona] = useState(null);
    
    // Real-time coaching state
    const [coachingEnabled, setCoachingEnabled] = useState(true);
    const [coachingStats, setCoachingStats] = useState({
        hintsGiven: 0,
        paceCorrections: 0,
        confidenceBoosts: 0,
        bodyLanguageTips: 0
    });

    // Dynamic question generation state
    const [followUpQuestions, setFollowUpQuestions] = useState([]);
    const [currentFollowUp, setCurrentFollowUp] = useState(null);
    const [questionGenerationEnabled, setQuestionGenerationEnabled] = useState(true);
    const [adaptiveDifficulty, setAdaptiveDifficulty] = useState('medium');

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
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
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
            setTimeElapsed(0);
            setInterviewStarted(true);
            setIsRecording(true);
            
            const introText = `Hello! I'm ${aiPersona?.name}, and I'll be conducting your interview today. Let's begin with our first question: ${currentQuestion?.question}`;
            speakAIResponse(introText);
            
            toast.success('Interview session initiated!');
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
                toast.success('Interview session finalized!');
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
            
            setTimeout(() => {
                speakAIResponse(`Great! Let's move to the next question: ${interview.questions[nextIndex].question}`);
            }, 1000);
        } else {
            endInterview();
        }
    };

    const simulateVoiceResponse = () => {
        toast.success('Answer submitted successfully!');
        setTimeout(() => {
            nextQuestion();
        }, 2000);
    };

    const handleAnalysisUpdate = useCallback((type, data) => {
        setAnalysisData(prev => ({
            ...prev,
            [type]: data
        }));
        
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
                updateRealTimeScores(response.data.flags);
            }
        } catch (error) {
            console.error('Error submitting analysis data:', error);
        }
    };

    const updateRealTimeScores = (flags) => {
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

    const handleCoachingAction = (coaching) => {
        setCoachingStats(prev => {
            const newStats = { ...prev };
            switch (coaching.type) {
                case 'hint': newStats.hintsGiven++; break;
                case 'pace': newStats.paceCorrections++; break;
                case 'confidence': newStats.confidenceBoosts++; break;
                case 'body-language': newStats.bodyLanguageTips++; break;
            }
            return newStats;
        });

        if (coaching.severity === 'warning' || coaching.severity === 'encouragement') {
            submitAnalysisData('coaching', {
                type: coaching.type,
                message: coaching.message,
                action: coaching.action,
                timestamp: Date.now()
            });
        }

        if (navigator.vibrate && coaching.severity === 'warning') {
            navigator.vibrate(100);
        }
    };

    const handleFollowUpGenerated = (followUpQuestion) => {
        setFollowUpQuestions(prev => [...prev, {
            ...followUpQuestion,
            id: `followup-${Date.now()}`,
            generatedAt: new Date(),
            originalQuestionId: currentQuestion?.id
        }]);

        setCurrentFollowUp(followUpQuestion);

        if (followUpQuestion.difficulty !== adaptiveDifficulty) {
            setAdaptiveDifficulty(followUpQuestion.difficulty);
        }

        setTimeout(() => {
            const introText = getFollowUpIntro(followUpQuestion.type);
            speakAIResponse(`${introText} ${followUpQuestion.question}`);
        }, 1000);

        toast.success('AI interviewer asked a follow-up question!');
    };

    const getFollowUpIntro = (type) => {
        const intros = {
            'clarification': "Could you clarify this detail?",
            'deep-dive': "Let's dive a bit deeper into that point.",
            'scenario': "How would you handle this scenario?",
            'alternative': "What alternative choices would you weigh?",
            'real-world': "In a practical setting,",
            'problem-solving': "Let's probe this problem further."
        };
        return intros[type] || "Here's a follow-up:";
    };

    const proceedToFollowUp = () => {
        if (currentFollowUp) {
            setTextResponse('');
            setInterview(prev => {
                const updatedInterview = { ...prev };
                const currentQ = updatedInterview.questions.find(q => q.id === currentQuestion.id);
                if (currentQ) {
                    if (!currentQ.aiFollowUp) currentQ.aiFollowUp = [];
                    currentQ.aiFollowUp.push({
                        ...currentFollowUp,
                        askedAt: new Date()
                    });
                }
                return updatedInterview;
            });
            setCurrentFollowUp(null);
            toast.info('Answer box ready for follow-up response!');
        }
    };

    if (!interview) {
        return (
            <div className="min-h-screen bg-cream dark:bg-navy font-body flex items-center justify-center text-charcoal dark:text-cream">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-charcoal dark:border-cream mx-auto mb-4"></div>
                    <p className="text-xs font-mono font-bold uppercase tracking-wider">Syncing Interview session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream dark:bg-navy font-body text-charcoal dark:text-cream transition-colors duration-300">
            {/* Header bar */}
            <div className="bg-white dark:bg-navy-light border-b-4 border-charcoal dark:border-cream/40 p-4 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 bg-red-500/10 border-2 border-red-500 px-3 py-1.5 rounded-sm shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)]">
                            <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-600">Coach Live</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-cream dark:bg-navy border-2 border-charcoal dark:border-cream/25 rounded-sm px-3.5 py-1.5 shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)]">
                            <Clock className="w-4 h-4 text-charcoal/60 dark:text-cream/60" strokeWidth={2.5} />
                            <span className="font-mono text-sm font-bold tracking-widest">{formatTime(timeElapsed)}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <span className="text-[10px] font-mono font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-widest bg-cream dark:bg-navy border-2 border-charcoal/20 px-2.5 py-1.5 rounded-sm">
                            Question {questionIndex + 1} / {interview.questions.length}
                        </span>
                        <button
                          onClick={endInterview}
                          className="border-3 border-charcoal dark:border-cream bg-charcoal dark:bg-cream text-white dark:text-navy px-4 py-2 rounded-sm font-mono font-bold uppercase tracking-wider text-[10px] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_var(--color-shadow)]"
                        >
                            <Phone className="w-3.5 h-3.5" strokeWidth={2.5} />
                            <span>End Session</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Video Interface Panel */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="card-editorial overflow-hidden bg-white dark:bg-navy-light flex flex-col">
                            {/* AI Interviewer avatar frame */}
                            <div className="relative h-48 bg-cream dark:bg-navy p-6 flex items-center justify-center border-b-4 border-charcoal dark:border-cream/40">
                                <div className="text-center flex flex-col items-center">
                                    <div className="w-14 h-14 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream rounded-sm flex items-center justify-center shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                                        <User className="w-7 h-7 text-charcoal/60 dark:text-cream/60" strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-lg font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide mt-2">{aiPersona?.name || 'Interviewer'}</h3>
                                    <p className="text-[10px] font-mono font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-widest mt-0.5">{aiPersona?.role} at {aiPersona?.company}</p>
                                    
                                    {aiSpeaking && (
                                        <div className="flex items-center justify-center mt-2.5 bg-emerald-500/10 border-2 border-emerald-500 px-3 py-1 rounded-sm">
                                            <div className="flex space-x-1">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                            </div>
                                            <span className="ml-2 text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Speaking</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* User Webcam Frame */}
                            <div className="relative h-96 bg-charcoal dark:bg-[#1a1a1a] flex items-center justify-center">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                                
                                {!isVideoOn && (
                                    <div className="absolute inset-0 bg-charcoal dark:bg-[#121212] flex items-center justify-center">
                                        <div className="text-center font-mono">
                                            <CameraOff className="w-12 h-12 text-white/40 mx-auto mb-2" strokeWidth={2.5} />
                                            <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Webcam feeds disabled</p>
                                        </div>
                                    </div>
                                )}

                                {/* Real-time Analyzer processes */}
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

                                {/* Diagnostic Realtime Score Overlay */}
                                <div className="absolute top-4 right-4 bg-white dark:bg-navy border-2 border-charcoal dark:border-cream/40 rounded-sm p-3 shadow-[3px_3px_0px_0px_var(--color-shadow)] z-10">
                                    <div className="grid grid-cols-2 gap-3 text-[10px] font-mono font-bold uppercase tracking-wider text-charcoal dark:text-cream">
                                        <div className="flex items-center space-x-1.5">
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>Eye: {currentScore.eyeContact}%</span>
                                        </div>
                                        <div className="flex items-center space-x-1.5">
                                            <Volume2 className="w-3.5 h-3.5" />
                                            <span>Voice: {currentScore.voiceClarity}%</span>
                                        </div>
                                        <div className="flex items-center space-x-1.5">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            <span>Conf: {currentScore.confidence}%</span>
                                        </div>
                                        <div className="flex items-center space-x-1.5">
                                            <User className="w-3.5 h-3.5" />
                                            <span>Prof: {currentScore.professionalism}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Feed Controls bar */}
                            <div className="p-4 bg-cream dark:bg-navy flex items-center justify-center gap-3 border-t-4 border-charcoal dark:border-cream/40">
                                <button
                                    onClick={toggleVideo}
                                    className={`p-3 border-2 border-charcoal dark:border-cream/40 rounded-sm hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all cursor-pointer ${
                                        isVideoOn ? 'bg-white dark:bg-navy-light text-charcoal dark:text-cream' : 'bg-charcoal dark:bg-cream text-white dark:text-navy border-charcoal'
                                    }`}
                                    title="Toggle Camera"
                                >
                                    {isVideoOn ? <Video className="w-4 h-4" strokeWidth={2.5} /> : <VideoOff className="w-4 h-4" strokeWidth={2.5} />}
                                </button>
                                
                                <button
                                    onClick={toggleAudio}
                                    className={`p-3 border-2 border-charcoal dark:border-cream/40 rounded-sm hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all cursor-pointer ${
                                        isAudioOn ? 'bg-white dark:bg-navy-light text-charcoal dark:text-cream' : 'bg-charcoal dark:bg-cream text-white dark:text-navy border-charcoal'
                                    }`}
                                    title="Toggle Microphone"
                                >
                                    {isAudioOn ? <Mic className="w-4 h-4" strokeWidth={2.5} /> : <MicOff className="w-4 h-4" strokeWidth={2.5} />}
                                </button>
                                
                                <button
                                    onClick={() => setIsAIAudioOn(!isAIAudioOn)}
                                    className={`p-3 border-2 border-charcoal dark:border-cream/40 rounded-sm hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all cursor-pointer ${
                                        isAIAudioOn ? 'bg-white dark:bg-navy-light text-charcoal dark:text-cream' : 'bg-charcoal dark:bg-cream text-white dark:text-navy border-charcoal'
                                    }`}
                                    title="Toggle Interviewer Speech"
                                >
                                    {isAIAudioOn ? <Volume2 className="w-4 h-4" strokeWidth={2.5} /> : <VolumeX className="w-4 h-4" strokeWidth={2.5} />}
                                </button>

                                <div className="h-6 w-0.5 bg-charcoal/20 dark:bg-cream/20 mx-2"></div>

                                {!interviewStarted ? (
                                    <button
                                        onClick={startInterview}
                                        className="border-3 border-charcoal dark:border-cream bg-charcoal dark:bg-cream text-white dark:text-navy px-5 py-2.5 rounded-sm font-mono font-bold uppercase tracking-wider text-[10px] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 shadow-[2px_2px_0px_0px_var(--color-shadow)] cursor-pointer"
                                    >
                                        Start Interview Session
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={simulateVoiceResponse}
                                            className="border-3 border-charcoal dark:border-cream bg-charcoal dark:bg-cream text-white dark:text-navy px-5 py-2.5 rounded-sm font-mono font-bold uppercase tracking-wider text-[10px] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 shadow-[2px_2px_0px_0px_var(--color-shadow)] cursor-pointer"
                                        >
                                            Submit Answer
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar controls */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Current Question */}
                        <div className="card-editorial p-4 bg-white dark:bg-navy-light">
                            <h3 className="text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-widest mb-3 border-b border-dashed border-charcoal/15 dark:border-cream/10 pb-2">Active Challenge</h3>
                            {currentQuestion && (
                                <div>
                                    <p className="text-xs font-bold text-charcoal dark:text-cream leading-relaxed">{currentQuestion.question}</p>
                                    <div className="text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal/50 dark:text-cream/50 mt-3 flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>Target limits: {Math.floor(currentQuestion.expectedDuration / 60)} minutes</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Start Panel */}
                        {!interviewStarted && (
                            <div className="bg-cream dark:bg-navy rounded-sm p-6 text-center border-3 border-charcoal dark:border-cream/40 shadow-[4px_4px_0px_0px_var(--color-shadow)] flex flex-col items-center">
                                <h3 className="text-lg font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide mb-2">Ready to Start?</h3>
                                <p className="text-xs text-charcoal/60 dark:text-cream/60 mb-6 font-medium font-body leading-relaxed max-w-xs">
                                    Initiate webcam feeds and click the start trigger to launch the coach queries.
                                </p>
                                <button
                                    onClick={startInterview}
                                    className="bg-charcoal text-white dark:bg-cream dark:text-navy px-5 py-2.5 rounded-sm font-mono font-bold uppercase tracking-wider text-[10px] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 border-2 border-charcoal shadow-[2px_2px_0px_0px_var(--color-shadow)] cursor-pointer"
                                >
                                    🚀 Start Interview
                                </button>
                            </div>
                        )}

                        {/* Response Input Area */}
                        {interviewStarted ? (
                            <div className="card-editorial p-4 border-l-6 border-l-charcoal dark:border-l-cream bg-white dark:bg-navy-light">
                                <h3 className="text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-widest mb-3 border-b border-dashed border-charcoal/15 dark:border-cream/10 pb-2">Submit Answer</h3>
                                <textarea
                                    placeholder="Type your response here or use mock voice recorder..."
                                    className="w-full h-32 bg-cream dark:bg-navy text-charcoal dark:text-cream rounded-sm border-2 border-charcoal dark:border-cream/40 p-3.5 resize-none focus:outline-none focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all font-bold text-xs leading-normal"
                                    value={textResponse}
                                    onChange={(e) => setTextResponse(e.target.value)}
                                />
                                <div className="flex flex-col sm:flex-row justify-between items-center mt-3 gap-2 w-full border-t border-dashed border-charcoal/10 dark:border-cream/10 pt-3">
                                    <span className="text-[10px] font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-wider">
                                        {textResponse.length} chars
                                    </span>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={() => {
                                                toast.success('Voice recording simulated!');
                                                setTimeout(() => {
                                                    setTextResponse('This is a mock transcribed voice response. The microphone capture engine registered vocal pacing metrics.');
                                                    toast.success('Vocal capture finished!');
                                                }, 1500);
                                            }}
                                            className="flex-1 px-3 py-2 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy text-charcoal dark:text-cream hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-shadow)] rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)]"
                                        >
                                            🎤 Record
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (textResponse.trim()) {
                                                    simulateVoiceResponse();
                                                    setTextResponse('');
                                                }
                                            }}
                                            disabled={!textResponse.trim()}
                                            className="flex-1 px-3 py-2 border-2 border-charcoal dark:border-cream bg-charcoal text-white dark:bg-cream dark:text-navy hover:-translate-y-0.5 hover:shadow-[2.5px_2.5px_0px_0px_var(--color-shadow)] disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer shadow-[2px_2px_0px_0px_var(--color-shadow)]"
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="card-editorial p-4 bg-white dark:bg-navy-light opacity-50">
                                <h3 className="text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-widest mb-3 border-b border-dashed border-charcoal/15 dark:border-cream/10 pb-2">Response Box</h3>
                                <div className="bg-cream dark:bg-navy border-2 border-charcoal/15 dark:border-cream/20 rounded-sm p-4 text-[10px] font-mono font-bold text-charcoal/50 dark:text-cream/50 text-center uppercase tracking-wider leading-relaxed">
                                    Awaiting session start trigger...
                                </div>
                            </div>
                        )}

                        {/* Debug Info */}
                        <div className="card-editorial p-4 bg-white dark:bg-navy-light">
                            <h3 className="text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-widest mb-3 border-b border-dashed border-charcoal/15 dark:border-cream/10 pb-2">Diagnostic Data</h3>
                            <div className="text-[10px] font-mono font-bold text-charcoal/80 dark:text-cream/80 space-y-1.5 uppercase tracking-wide">
                                <div>Session Active: <span className={interviewStarted ? 'text-emerald-500' : ''}>{interviewStarted ? 'YES' : 'NO'}</span></div>
                                <div>Clock time: <span>{formatTime(timeElapsed)}</span></div>
                                <div>Question Index: <span>{questionIndex + 1}</span></div>
                            </div>
                        </div>

                        {/* Real-time Feedback flags */}
                        <RealTimeFeedback 
                            flags={feedbackFlags}
                            onDismiss={(flagId) => {
                                setFeedbackFlags(prev => prev.filter(f => f.id !== flagId));
                            }}
                        />

                        {/* Voice Analyzer process */}
                        <VoiceAnalyzer
                            audioRef={audioRef}
                            isActive={interviewStarted && isAudioOn}
                            onAnalysisUpdate={(data) => handleAnalysisUpdate('voice', data)}
                        />

                        {/* Dynamic Question generator */}
                        <DynamicQuestionGenerator
                            sessionId={sessionId}
                            currentQuestion={currentQuestion}
                            userResponse={textResponse}
                            analysisData={analysisData}
                            onFollowUpGenerated={handleFollowUpGenerated}
                            isActive={questionGenerationEnabled && interviewStarted}
                        />

                        {/* Active follow-ups */}
                        {currentFollowUp && (
                            <div className="bg-charcoal text-white dark:bg-cream dark:text-navy rounded-sm p-4 border-2 border-charcoal dark:border-cream/40 shadow-[4px_4px_0px_0px_var(--color-shadow)] flex flex-col items-center">
                                <h3 className="text-xs font-mono font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                    <Zap className="w-4.5 h-4.5" />
                                    <span>Follow-up Generated</span>
                                </h3>
                                <div className="bg-white/10 dark:bg-navy/10 rounded-sm p-3 mb-4 w-full text-xs font-bold leading-normal">
                                    {currentFollowUp.question}
                                </div>
                                <button
                                    onClick={proceedToFollowUp}
                                    className="w-full bg-white text-charcoal dark:bg-navy-light dark:text-cream py-2 px-4 rounded-sm font-mono font-bold uppercase tracking-widest text-[9px] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 border-2 border-charcoal cursor-pointer shadow-[2px_2px_0px_0px_var(--color-shadow)]"
                                >
                                    Load follow-up
                                </button>
                            </div>
                        )}

                        {/* Coaching Stats */}
                        {interviewStarted && (
                            <div className="card-editorial p-4 bg-white dark:bg-navy-light">
                                <h3 className="text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-widest mb-3 border-b border-dashed border-charcoal/15 dark:border-cream/10 pb-2">Coach Metrics</h3>
                                
                                <div className="grid grid-cols-2 gap-2.5 text-center mb-4">
                                    {[
                                        { count: coachingStats.hintsGiven, label: 'Coach Tips' },
                                        { count: followUpQuestions.length, label: 'Follow-ups' },
                                        { count: adaptiveDifficulty, label: 'Difficulty' },
                                        { count: questionIndex + 1, label: 'Questions' }
                                    ].map((stat, idx) => (
                                        <div key={idx} className="bg-cream dark:bg-navy border-2 border-charcoal/10 dark:border-cream/15 rounded-sm p-2 shadow-[1px_1px_0px_0px_var(--color-shadow)]">
                                            <div className="text-charcoal dark:text-cream font-mono font-bold text-sm truncate uppercase">{stat.count}</div>
                                            <div className="text-charcoal/50 dark:text-cream/50 font-mono font-bold uppercase tracking-wider text-[8px] mt-0.5">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Coaching Toggle buttons */}
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setCoachingEnabled(!coachingEnabled)}
                                        className={`w-full px-3 py-2 border-2 border-charcoal dark:border-cream/40 rounded-sm font-mono font-bold uppercase tracking-wider text-[9px] transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)] ${
                                            coachingEnabled 
                                                ? 'bg-charcoal text-white dark:bg-cream dark:text-navy' 
                                                : 'bg-white dark:bg-navy-light text-charcoal dark:text-cream'
                                        }`}
                                    >
                                        {coachingEnabled ? '🤖 Coaching tips: Active' : '🤖 Coaching tips: Disabled'}
                                    </button>
                                    
                                    <button
                                        onClick={() => setQuestionGenerationEnabled(!questionGenerationEnabled)}
                                        className={`w-full px-3 py-2 border-2 border-charcoal dark:border-cream/40 rounded-sm font-mono font-bold uppercase tracking-wider text-[9px] transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)] ${
                                            questionGenerationEnabled 
                                                ? 'bg-charcoal text-white dark:bg-cream dark:text-navy' 
                                                : 'bg-white dark:bg-navy-light text-charcoal dark:text-cream'
                                        }`}
                                    >
                                        {questionGenerationEnabled ? '🧠 Dynamic Followups: Active' : '🧠 Dynamic Followups: Disabled'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Realtime coach float layer */}
            <RealTimeCoach
                isActive={coachingEnabled}
                analysisData={analysisData}
                currentQuestion={currentQuestion}
                interviewStarted={interviewStarted}
                onCoachingAction={handleCoachingAction}
            />
        </div>
    );
};

export default InterviewInterface;
