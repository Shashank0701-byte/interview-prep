import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Video, VideoOff, Mic, MicOff, Phone, Settings, 
    Eye, AlertTriangle, CheckCircle, Clock, User,
    Volume2, VolumeX, Camera, CameraOff, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';

// Import analysis components (we'll create these next)
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
        eyeContact: 0,
        confidence: 0,
        voiceClarity: 0,
        professionalism: 0
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

    // Debug: Log current question when it changes
    useEffect(() => {
        console.log('Current question updated:', currentQuestion);
    }, [currentQuestion]);

    // Debug: Log interview started state changes
    useEffect(() => {
        console.log('Interview started state changed:', interviewStarted);
    }, [interviewStarted]);

    useEffect(() => {
        let interval;
        if (interviewStarted) {
            console.log('Timer starting - interview is active');
            interval = setInterval(() => {
                setTimeElapsed(prev => {
                    const newTime = prev + 1;
                    console.log('Timer tick:', newTime);
                    return newTime;
                });
            }, 1000);
        } else {
            console.log('Timer stopped - interview not active');
        }
        return () => {
            if (interval) {
                console.log('Clearing timer interval');
                clearInterval(interval);
            }
        };
    }, [interviewStarted]);

    const fetchInterviewSession = async () => {
        try {
            console.log('Fetching interview session:', sessionId);
            const response = await axiosInstance.get(`/api/ai-interview-coach/${sessionId}`);
            
            console.log('Interview session response:', response.data);
            
            if (response.data.success) {
                setInterview(response.data.interview);
                setAiPersona(response.data.interview.aiPersona);
                if (response.data.interview.questions.length > 0) {
                    setCurrentQuestion(response.data.interview.questions[0]);
                    console.log('First question set:', response.data.interview.questions[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching interview session:', error);
            console.error('Error details:', error.response?.data);
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
            console.log('Starting interview for session:', sessionId);
            console.log('AI Persona:', aiPersona);
            console.log('Current Question:', currentQuestion);
            
            await axiosInstance.post(`/api/ai-interview-coach/${sessionId}/start`, {});
            
            // Reset timer and start interview
            setTimeElapsed(0);
            setInterviewStarted(true);
            setIsRecording(true);
            
            console.log('Interview started - timer should begin');
            
            // Start AI introduction and first question
            const introText = `Hello! I'm ${aiPersona?.name}, and I'll be conducting your interview today. Let's begin with our first question: ${currentQuestion?.question}`;
            console.log('Speaking intro text:', introText);
            speakAIResponse(introText);
            
            toast.success('Interview started! Good luck!');
        } catch (error) {
            console.error('Error starting interview:', error);
            console.error('Start interview error details:', error.response?.data);
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
            setTimeout(() => {
                speakAIResponse(`Great! Let's move to the next question: ${interview.questions[nextIndex].question}`);
            }, 1000);
        } else {
            endInterview();
        }
    };

    // Add a simple voice response simulation
    const simulateVoiceResponse = () => {
        toast.success('Voice response recorded! AI is analyzing...');
        
        // Simulate some analysis delay
        setTimeout(() => {
            // Move to next question or end interview
            nextQuestion();
        }, 2000);
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

    const handleCoachingAction = (coaching) => {
        // Update coaching stats
        setCoachingStats(prev => {
            const newStats = { ...prev };
            switch (coaching.type) {
                case 'hint':
                    newStats.hintsGiven++;
                    break;
                case 'pace':
                    newStats.paceCorrections++;
                    break;
                case 'confidence':
                    newStats.confidenceBoosts++;
                    break;
                case 'body-language':
                    newStats.bodyLanguageTips++;
                    break;
            }
            return newStats;
        });

        // Optional: Send coaching data to backend for analytics
        if (coaching.severity === 'warning' || coaching.severity === 'encouragement') {
            submitAnalysisData('coaching', {
                type: coaching.type,
                message: coaching.message,
                action: coaching.action,
                timestamp: Date.now()
            });
        }

        // Provide haptic feedback on mobile devices
        if (navigator.vibrate && coaching.severity === 'warning') {
            navigator.vibrate(100);
        }
    };

    const handleFollowUpGenerated = (followUpQuestion) => {
        // Add to follow-up questions list
        setFollowUpQuestions(prev => [...prev, {
            ...followUpQuestion,
            id: `followup-${Date.now()}`,
            generatedAt: new Date(),
            originalQuestionId: currentQuestion?.id
        }]);

        // Set as current follow-up
        setCurrentFollowUp(followUpQuestion);

        // Adjust difficulty based on response quality
        if (followUpQuestion.difficulty !== adaptiveDifficulty) {
            setAdaptiveDifficulty(followUpQuestion.difficulty);
        }

        // AI speaks the follow-up question
        setTimeout(() => {
            const introText = getFollowUpIntro(followUpQuestion.type);
            speakAIResponse(`${introText} ${followUpQuestion.question}`);
        }, 1000);

        toast.success('AI generated a follow-up question!');
    };

    const getFollowUpIntro = (type) => {
        const intros = {
            'clarification': "Let me ask for some clarification.",
            'deep-dive': "I'd like to dive deeper into that.",
            'scenario': "Here's a scenario for you to consider.",
            'alternative': "What about alternative approaches?",
            'real-world': "In a real-world situation,",
            'problem-solving': "Let's explore this problem further."
        };
        return intros[type] || "Here's a follow-up question:";
    };

    const proceedToFollowUp = () => {
        if (currentFollowUp) {
            // Clear current response and set follow-up as active question
            setTextResponse('');
            
            // Add follow-up to interview questions
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
            toast.info('Ready for your follow-up response!');
        }
    };

    if (!interview) {
        return (
            <div className="min-h-screen bg-cream font-body flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-charcoal mx-auto mb-4"></div>
                    <p className="text-charcoal font-bold uppercase tracking-wider text-sm">Loading interview session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream font-body text-charcoal">
            {/* Header */}
            <div className="bg-cream border-b-2 border-charcoal/10 p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 border border-charcoal rounded-full animate-pulse"></div>
                            <span className="text-sm font-bold uppercase tracking-wider text-charcoal">LIVE INTERVIEW</span>
                        </div>
                        <div className="flex items-center space-x-2 text-charcoal/80">
                            <Clock className="w-4 h-4" />
                            <span className="font-mono">{formatTime(timeElapsed)}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <div className="text-sm font-bold uppercase tracking-wider text-charcoal/80">
                            Question {questionIndex + 1} of {interview.questions.length}
                        </div>
                        <button
                            onClick={endInterview}
                            className="border-2 border-charcoal bg-charcoal text-white hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] px-4 py-2 rounded-md font-bold uppercase tracking-wider text-sm transition-all duration-200 flex items-center space-x-2 cursor-pointer"
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
                        <div className="card-editorial overflow-hidden">
                            {/* AI Interviewer */}
                            <div className="relative h-48 bg-charcoal flex items-center justify-center border-b-2 border-charcoal">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-cream/20 rounded-md flex items-center justify-center mb-3 mx-auto">
                                        <User className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-xl font-display font-bold text-white">{aiPersona?.name}</h3>
                                    <p className="text-white/80">{aiPersona?.role} at {aiPersona?.company}</p>
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
                            <div className="relative h-96 bg-charcoal/10 border-b-2 border-charcoal">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                                
                                {!isVideoOn && (
                                    <div className="absolute inset-0 bg-charcoal/90 flex items-center justify-center">
                                        <div className="text-center">
                                            <CameraOff className="w-12 h-12 text-white/40 mx-auto mb-2" />
                                            <p className="text-white/40">Camera is off</p>
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
                                <div className="absolute top-4 right-4 bg-white border-2 border-charcoal rounded-md p-3 shadow-[4px_4px_0px_0px_#1A1A1A]">
                                    <div className="grid grid-cols-2 gap-3 text-xs font-bold uppercase tracking-wider text-charcoal">
                                        <div className="flex items-center space-x-1">
                                            <Eye className="w-3 h-3 text-charcoal" />
                                            <span>Eye: {currentScore.eyeContact}%</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Volume2 className="w-3 h-3 text-charcoal" />
                                            <span>Voice: {currentScore.voiceClarity}%</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <CheckCircle className="w-3 h-3 text-charcoal" />
                                            <span>Conf: {currentScore.confidence}%</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <User className="w-3 h-3 text-charcoal" />
                                            <span>Prof: {currentScore.professionalism}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="p-4 bg-cream flex items-center justify-center space-x-4">
                                <button
                                    onClick={toggleVideo}
                                    className={`p-3 rounded-md border-2 border-charcoal transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] ${
                                        isVideoOn ? 'bg-white text-charcoal' : 'bg-charcoal text-white'
                                    }`}
                                >
                                    {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                                </button>
                                
                                <button
                                    onClick={toggleAudio}
                                    className={`p-3 rounded-md border-2 border-charcoal transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] ${
                                        isAudioOn ? 'bg-white text-charcoal' : 'bg-charcoal text-white'
                                    }`}
                                >
                                    {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                                </button>
                                
                                <button
                                    onClick={() => setIsAIAudioOn(!isAIAudioOn)}
                                    className={`p-3 rounded-md border-2 border-charcoal transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] ${
                                        isAIAudioOn ? 'bg-white text-charcoal' : 'bg-charcoal text-white'
                                    }`}
                                >
                                    {isAIAudioOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                                </button>

                                {!interviewStarted ? (
                                    <button
                                        onClick={startInterview}
                                        className="border-2 border-charcoal bg-charcoal text-white px-6 py-3 rounded-md font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A]"
                                    >
                                        Start Interview
                                    </button>
                                ) : (
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={simulateVoiceResponse}
                                            className="border-2 border-charcoal bg-white text-charcoal px-6 py-3 rounded-md font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A]"
                                        >
                                            Submit Response
                                        </button>
                                        {questionIndex >= interview.questions.length - 1 && (
                                            <button
                                                onClick={endInterview}
                                                className="border-2 border-charcoal bg-charcoal text-white px-6 py-3 rounded-md font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A]"
                                            >
                                                End Interview
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Current Question */}
                        <div className="card-editorial p-4">
                            <h3 className="text-lg font-display font-bold text-charcoal mb-3">Current Question</h3>
                            {currentQuestion && (
                                <div>
                                    <p className="text-charcoal/80 mb-2 font-medium">{currentQuestion.question}</p>
                                    <div className="text-xs font-bold uppercase tracking-wider text-charcoal/60">
                                        Expected: {Math.floor(currentQuestion.expectedDuration / 60)} minutes
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Start Interview Button - Prominent Placement */}
                        {!interviewStarted && (
                            <div className="bg-charcoal rounded-md p-6 text-center border-2 border-charcoal shadow-[6px_6px_0px_0px_#1A1A1A]">
                                <h3 className="text-xl font-display font-bold text-white mb-3">Ready to Begin?</h3>
                                <p className="text-white/80 mb-4 text-sm font-medium">
                                    Click the button below to start your AI interview session
                                </p>
                                <button
                                    onClick={startInterview}
                                    className="bg-white text-charcoal px-8 py-4 rounded-md font-bold uppercase tracking-wider text-sm transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] border-2 border-charcoal"
                                >
                                    🚀 Start Interview
                                </button>
                            </div>
                        )}

                        {/* Response Input Area */}
                        {interviewStarted ? (
                            <div className="card-editorial p-4 border-l-4 border-l-charcoal">
                                <h3 className="text-lg font-display font-bold text-charcoal mb-3">Your Response</h3>
                                <div className="text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-2">✅ Interview Active - Type your answer below</div>
                                <textarea
                                    placeholder="Type your response here or use voice recording..."
                                    className="w-full h-32 bg-white text-charcoal rounded-md border-2 border-charcoal p-3 resize-none focus:outline-none focus:ring-2 focus:ring-charcoal"
                                    value={textResponse}
                                    onChange={(e) => setTextResponse(e.target.value)}
                                />
                                <div className="flex justify-between items-center mt-3">
                                    <span className="text-xs font-bold text-charcoal/60">
                                        {textResponse.length} characters
                                    </span>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                // Simple voice recording simulation
                                                toast.success('Voice recording started! (Mock)');
                                                setTimeout(() => {
                                                    setTextResponse('This is a mock voice response. Voice recording would work with proper microphone access.');
                                                    toast.success('Voice recording completed!');
                                                }, 2000);
                                            }}
                                            className="px-3 py-2 border-2 border-charcoal bg-white text-charcoal hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] rounded-md text-sm font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
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
                                            className="px-4 py-2 border-2 border-charcoal bg-charcoal text-white hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none rounded-md text-sm font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="card-editorial p-4 opacity-50">
                                <h3 className="text-lg font-display font-bold text-charcoal mb-3">Response Area</h3>
                                <div className="text-xs font-bold uppercase tracking-wider text-charcoal/60 mb-2">❌ Interview Not Started - Click "Start Interview" first</div>
                                <div className="bg-cream border-2 border-charcoal/20 rounded-md p-3 text-charcoal/60 text-center font-medium">
                                    Response area will appear here once interview starts
                                </div>
                            </div>
                        )}

                        {/* Debug Info */}
                        <div className="bg-white border-2 border-charcoal rounded-md p-4 shadow-[4px_4px_0px_0px_#1A1A1A]">
                            <h3 className="text-lg font-display font-bold text-charcoal mb-3">Debug Info</h3>
                            <div className="text-xs font-mono font-medium text-charcoal/80 space-y-1">
                                <div>Interview Started: <span className={interviewStarted ? 'font-bold' : ''}>{interviewStarted ? 'YES' : 'NO'}</span></div>
                                <div>Timer: <span className="font-bold">{formatTime(timeElapsed)}</span></div>
                                <div>Current Question: <span className="font-bold">{currentQuestion ? 'Loaded' : 'Not Loaded'}</span></div>
                                <div>Session ID: <span className="font-bold">{sessionId}</span></div>
                            </div>
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

                        {/* Dynamic Question Generator */}
                        <DynamicQuestionGenerator
                            sessionId={sessionId}
                            currentQuestion={currentQuestion}
                            userResponse={textResponse}
                            analysisData={analysisData}
                            onFollowUpGenerated={handleFollowUpGenerated}
                            isActive={questionGenerationEnabled && interviewStarted}
                        />

                        {/* Current Follow-up Question */}
                        {currentFollowUp && (
                            <div className="bg-charcoal text-white rounded-md p-4 border-2 border-charcoal shadow-[4px_4px_0px_0px_#1A1A1A]">
                                <h3 className="text-lg font-display font-bold mb-3 flex items-center">
                                    <Zap className="w-5 h-5 mr-2" />
                                    Active Follow-up
                                </h3>
                                <div className="bg-white/10 rounded-md p-3 mb-3">
                                    <p className="font-medium leading-relaxed">
                                        {currentFollowUp.question}
                                    </p>
                                </div>
                                <button
                                    onClick={proceedToFollowUp}
                                    className="w-full bg-white text-charcoal py-2 px-4 rounded-md font-bold uppercase tracking-wider text-sm transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] border-2 border-charcoal"
                                >
                                    Answer Follow-up Question
                                </button>
                            </div>
                        )}

                        {/* Coaching Stats */}
                        {interviewStarted && (
                            <div className="card-editorial p-4">
                                <h3 className="text-lg font-display font-bold text-charcoal mb-3">AI Features</h3>
                                
                                {/* Feature Stats */}
                                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                                    <div className="bg-cream border-2 border-charcoal rounded-md p-2 text-center">
                                        <div className="text-charcoal font-bold text-lg">{coachingStats.hintsGiven}</div>
                                        <div className="text-charcoal/80 font-bold uppercase tracking-wider text-[10px]">Coaching Tips</div>
                                    </div>
                                    <div className="bg-cream border-2 border-charcoal rounded-md p-2 text-center">
                                        <div className="text-charcoal font-bold text-lg">{followUpQuestions.length}</div>
                                        <div className="text-charcoal/80 font-bold uppercase tracking-wider text-[10px]">Follow-ups</div>
                                    </div>
                                    <div className="bg-cream border-2 border-charcoal rounded-md p-2 text-center">
                                        <div className="text-charcoal font-bold text-lg">{adaptiveDifficulty}</div>
                                        <div className="text-charcoal/80 font-bold uppercase tracking-wider text-[10px]">Difficulty</div>
                                    </div>
                                    <div className="bg-cream border-2 border-charcoal rounded-md p-2 text-center">
                                        <div className="text-charcoal font-bold text-lg">{questionIndex + 1}</div>
                                        <div className="text-charcoal/80 font-bold uppercase tracking-wider text-[10px]">Question #</div>
                                    </div>
                                </div>

                                {/* Feature Toggles */}
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setCoachingEnabled(!coachingEnabled)}
                                        className={`w-full px-3 py-2 border-2 border-charcoal rounded-md font-bold uppercase tracking-wider text-xs transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] ${
                                            coachingEnabled 
                                                ? 'bg-charcoal text-white' 
                                                : 'bg-white text-charcoal'
                                        }`}
                                    >
                                        {coachingEnabled ? '🤖 AI Coach: ON' : '🤖 AI Coach: OFF'}
                                    </button>
                                    
                                    <button
                                        onClick={() => setQuestionGenerationEnabled(!questionGenerationEnabled)}
                                        className={`w-full px-3 py-2 border-2 border-charcoal rounded-md font-bold uppercase tracking-wider text-xs transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] ${
                                            questionGenerationEnabled 
                                                ? 'bg-charcoal text-white' 
                                                : 'bg-white text-charcoal'
                                        }`}
                                    >
                                        {questionGenerationEnabled ? '🧠 Dynamic Q: ON' : '🧠 Dynamic Q: OFF'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Real-Time AI Coach - Floating Overlay */}
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
