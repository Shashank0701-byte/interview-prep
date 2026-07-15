import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Share2, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Copy,
  SkipForward,
  SkipBack,
  ArrowLeft,
  Home
} from 'lucide-react';
import io from 'socket.io-client';
import axiosInstance from '../../utils/axiosInstance';
import ParticipantsList from './ParticipantsList';
import ChatPanel from './ChatPanel';
import CollaborativeCodeEditor from './CollaborativeCodeEditor';
import { generateStudyRoomQuestions } from '../../utils/studyRoomQuestions';
import { testGeminiAPI } from '../../services/geminiQuestionService';

const StudyRoomInterface = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  
  // Room state
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [activeTab, setActiveTab] = useState('question'); // question, code
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(true);

  // Session state
  const [currentSession, setCurrentSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [studyQuestions, setStudyQuestions] = useState([]);
  const [roomTopic, setRoomTopic] = useState('javascript');

  // Chat state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Code state
  const [sharedCode, setSharedCode] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');

  useEffect(() => {
    initializeRoom();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socketRef.current && currentUser) {
        socketRef.current.emit('leave-room', {
          roomId,
          userId: currentUser._id
        });
      }
    };

    if (currentUser) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser, roomId]);

  useEffect(() => {
    const cleanupDuplicates = () => {
      setParticipants(prev => {
        const unique = [];
        const seenIds = new Set();
        const seenUsernames = new Set();
        
        prev.forEach(participant => {
          if (!seenIds.has(participant.userId) && !seenUsernames.has(participant.username)) {
            seenIds.add(participant.userId);
            seenUsernames.add(participant.username);
            unique.push(participant);
          }
        });
        
        return unique;
      });
    };

    const interval = setInterval(cleanupDuplicates, 5000);
    return () => clearInterval(interval);
  }, []);

  const initializeRoom = async () => {
    try {
      setLoading(true);
      
      // Get room details
      const roomResponse = await axiosInstance.get(`/api/study-rooms/${roomId}`);
      const roomData = roomResponse.data.data;
      setRoom(roomData);
      setSharedCode(roomData.sharedCode?.content || '');
      setCodeLanguage(roomData.sharedCode?.language || 'javascript');

      // Get current user
      const userResponse = await axiosInstance.get('/api/auth/profile');
      const userData = userResponse.data;
      setCurrentUser(userData);
      setIsHost(roomData.host._id === userData._id);

      const topic = roomData.topic || roomData.name || 'javascript';
      setRoomTopic(topic);
      
      let generatedQuestions = [];
      
      if (roomData.questions && roomData.questions.length > 0) {
        generatedQuestions = roomData.questions;
        setStudyQuestions(generatedQuestions);
        const savedIndex = roomData.currentQuestionIndex || 0;
        setQuestionIndex(savedIndex);
        setCurrentQuestion(generatedQuestions[savedIndex]);
      } else {
        const apiWorking = await testGeminiAPI();
        if (!apiWorking) {
          console.error('Gemini API test failed');
        }
        
        try {
          generatedQuestions = await generateStudyRoomQuestions(topic);
          setStudyQuestions(generatedQuestions);
          setCurrentQuestion(generatedQuestions[0]);
          
          await axiosInstance.put(`/api/study-rooms/${roomId}/questions`, {
            questions: generatedQuestions
          });
        } catch (error) {
          console.error('Failed to generate questions:', error);
          setStudyQuestions([]);
          setCurrentQuestion(null);
        }
      }

      initializeSocket(userData);
      setParticipants([]);

      const mockSession = {
        name: `${topic} Study Session`,
        questions: generatedQuestions,
        topic: topic
      };
      setCurrentSession(mockSession);

    } catch (error) {
      console.error('Failed to initialize room:', error);
      setError('Failed to load study room');
    } finally {
      setLoading(false);
    }
  };

  const initializeSocket = (userData) => {
    if (socketRef.current && socketRef.current.connected) {
      return;
    }

    const token = localStorage.getItem('token');
    socketRef.current = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000
    });

    const socket = socketRef.current;

    socket.emit('join-room', {
      roomId,
      userId: userData._id,
      username: userData.name
    });

    socket.on('room-state', (data) => {
      setRoom(data.room);
      const uniqueParticipants = [];
      const seenUserIds = new Set();
      const seenUsernames = new Set();
      
      if (data.room.participants) {
        data.room.participants.forEach(participant => {
          const userId = participant.userId;
          const username = participant.username || participant.name;
          
          if (!seenUserIds.has(userId) && !seenUsernames.has(username)) {
            seenUserIds.add(userId);
            seenUsernames.add(username);
            uniqueParticipants.push({
              userId: userId,
              username: username,
              isActive: true,
              joinedAt: participant.joinedAt || new Date(),
              role: participant.role || (userId === data.room.host?._id ? 'host' : 'member')
            });
          }
        });
      }
      
      setParticipants(uniqueParticipants);
      setMessages(data.room.chat || []);
      setSharedCode(data.room.sharedCode?.content || '');
    });

    socket.on('user-joined', (data) => {
      setParticipants(prev => {
        let filtered = prev.filter(p => p.userId !== data.userId && p.username !== data.username);
        const newParticipant = {
          userId: data.userId,
          username: data.username,
          isActive: true,
          joinedAt: new Date(),
          role: data.userId === currentUser?._id ? 'host' : 'member'
        };
        return [...filtered, newParticipant];
      });
    });

    socket.on('user-left', (data) => {
      setParticipants(prev => {
        return prev.filter(p => 
          p.userId !== data.userId && 
          p.username !== data.username
        );
      });
    });

    socket.on('code-updated', (data) => {
      setSharedCode(data.content);
      setCodeLanguage(data.language);
    });

    socket.on('chat-message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    socket.on('session-changed', (data) => {
      loadSession(data.sessionId, data.questionIndex);
    });

    socket.on('question-navigated', (data) => {
      setQuestionIndex(data.questionIndex);
      if (data.question) {
        setCurrentQuestion(data.question);
      } else if (studyQuestions[data.questionIndex]) {
        setCurrentQuestion(studyQuestions[data.questionIndex]);
      }
    });

    socket.on('error', (data) => {
      setError(data.message);
    });
  };

  const loadSession = async (sessionId, qIndex = 0) => {
    try {
      const response = await axiosInstance.get(`/api/sessions/${sessionId}`);
      const sessionData = response.data.data;
      setCurrentSession(sessionData);
      setQuestionIndex(qIndex);
      setCurrentQuestion(sessionData.questions[qIndex]);
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const handleCodeChange = (newCode, languageOverride) => {
    const lang = languageOverride || codeLanguage;
    setSharedCode(newCode);
    if (languageOverride) {
      setCodeLanguage(languageOverride);
    }
    if (socketRef.current) {
      socketRef.current.emit('code-change', {
        content: newCode,
        language: lang
      });
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && socketRef.current) {
      socketRef.current.emit('chat-message', {
        message: newMessage.trim()
      });
      setNewMessage('');
    }
  };

  const navigateQuestion = async (direction) => {
    if (!isHost || studyQuestions.length === 0) return;

    const newIndex = direction === 'next' 
      ? Math.min(questionIndex + 1, studyQuestions.length - 1)
      : Math.max(questionIndex - 1, 0);

    if (newIndex !== questionIndex) {
      setQuestionIndex(newIndex);
      setCurrentQuestion(studyQuestions[newIndex]);
      
      try {
        await axiosInstance.put(`/api/study-rooms/${roomId}/current-question`, {
          questionIndex: newIndex
        });
      } catch (error) {
        console.error('Failed to save current question index:', error);
      }
      
      if (socketRef.current) {
        socketRef.current.emit('navigate-question', {
          questionIndex: newIndex,
          direction,
          question: studyQuestions[newIndex]
        });
      }
    }
  };

  const copyInviteLink = async () => {
    try {
      const inviteLink = `${window.location.origin}/study-room/${roomId}`;
      await navigator.clipboard.writeText(inviteLink);
      alert('Invite link copied!');
      setShowInviteModal(false);
    } catch (err) {
      console.error('Failed to copy invite link:', err);
    }
  };

  const handleLeaveRoom = () => {
    if (socketRef.current && currentUser) {
      socketRef.current.emit('leave-room', {
        roomId,
        userId: currentUser._id
      });
    }
    navigate('/study-rooms');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-navy font-body flex items-center justify-center text-charcoal dark:text-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-charcoal dark:border-cream mx-auto mb-4"></div>
          <p className="text-charcoal/80 dark:text-cream/80 font-bold uppercase tracking-wider text-xs font-mono">Joining study room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream dark:bg-navy font-body flex items-center justify-center text-charcoal dark:text-cream p-4">
        <div className="text-center py-10 bg-white dark:bg-navy-light border-4 border-charcoal dark:border-cream/40 rounded-sm shadow-[8px_8px_0px_0px_var(--color-shadow)] max-w-xl mx-auto px-6">
          <p className="text-red-600 dark:text-red-400 mb-6 font-bold font-mono text-sm leading-relaxed">{error}</p>
          <button
            onClick={() => navigate('/study-rooms')}
            className="px-5 py-2.5 bg-charcoal text-white dark:bg-cream dark:text-navy font-bold uppercase tracking-widest text-xs rounded-sm border-3 border-charcoal dark:border-cream/40 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer shadow-[2px_2px_0px_0px_var(--color-shadow)]"
          >
            Back to Study Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-navy font-body text-charcoal dark:text-cream transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-navy-light border-b-4 border-charcoal dark:border-cream/40 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleLeaveRoom}
                className="flex items-center gap-2 px-3 py-2 border-2 border-charcoal dark:border-cream/40 rounded-sm bg-white dark:bg-navy-light text-charcoal dark:text-cream font-mono font-bold uppercase tracking-wider text-[9px] hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer shadow-[1px_1px_0px_0px_var(--color-shadow)]"
                title="Leave Room & Back to Study Rooms"
              >
                <ArrowLeft className="w-3.5 h-3.5" strokeWidth={3} />
                <span>Leave Room</span>
              </button>
              
              <button
                onClick={() => {
                  if (socketRef.current && currentUser) {
                    socketRef.current.emit('leave-room', {
                      roomId,
                      userId: currentUser._id
                    });
                  }
                  navigate('/dashboard');
                }}
                className="flex items-center gap-2 px-3 py-2 border-2 border-charcoal dark:border-cream/40 rounded-sm bg-white dark:bg-navy-light text-charcoal dark:text-cream font-mono font-bold uppercase tracking-wider text-[9px] hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer shadow-[1px_1px_0px_0px_var(--color-shadow)]"
                title="Leave Room & Go to Dashboard"
              >
                <Home className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span>Dashboard</span>
              </button>

              <div className="h-5 w-0.5 bg-charcoal/20 dark:bg-cream/20"></div>

              <h1 className="text-xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide">{room?.name}</h1>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-charcoal/60 dark:text-cream/60">
                <Users className="w-4 h-4" />
                <span>{participants.length} / {room?.maxParticipants}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 border-2 border-charcoal dark:border-cream/40 rounded-sm hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all cursor-pointer ${
                  isMuted ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-green-500/10 text-green-600 dark:text-green-400'
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4" strokeWidth={2.5} /> : <Mic className="w-4 h-4" strokeWidth={2.5} />}
              </button>

              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-2 border-2 border-charcoal dark:border-cream/40 rounded-sm hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all cursor-pointer ${
                  isVideoOff ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-green-500/10 text-green-600 dark:text-green-400'
                }`}
              >
                {isVideoOff ? <VideoOff className="w-4 h-4" strokeWidth={2.5} /> : <Video className="w-4 h-4" strokeWidth={2.5} />}
              </button>

              <button
                onClick={() => setShowInviteModal(true)}
                className="border-3 border-charcoal dark:border-cream bg-charcoal dark:bg-cream text-white dark:text-navy px-4 py-2 rounded-sm hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none cursor-pointer transition-all duration-200 flex items-center gap-1.5 font-mono font-bold uppercase tracking-wider text-[10px] shadow-[2px_2px_0px_0px_var(--color-shadow)]"
              >
                <Share2 className="w-3.5 h-3.5" strokeWidth={3} />
                <span>Invite</span>
              </button>
            </div>
          </div>

          {/* Current Session Info */}
          {currentSession && (
            <div className="mt-4 flex items-center justify-between border-3 border-charcoal dark:border-cream/40 bg-cream dark:bg-navy rounded-sm p-4 shadow-[2px_2px_0px_0px_var(--color-shadow)]">
              <div>
                <p className="font-bold text-charcoal dark:text-cream uppercase tracking-wider text-sm">{currentSession.name}</p>
                <p className="text-xs font-mono font-bold text-charcoal/70 dark:text-cream/70 mt-0.5">
                  Question {questionIndex + 1} of {studyQuestions.length}
                </p>
                {currentQuestion && (
                  <p className="text-[10px] font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-widest mt-1">
                    {currentQuestion.type === 'coding' ? '💻 Coding' : '🔍 Code Review'} • {currentQuestion.difficulty}
                  </p>
                )}
              </div>
              
              {isHost && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateQuestion('prev')}
                    disabled={questionIndex === 0}
                    className="p-2 text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 rounded-sm bg-white dark:bg-navy-light hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-200 shadow-[1px_1px_0px_0px_var(--color-shadow)]"
                  >
                    <SkipBack className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => navigateQuestion('next')}
                    disabled={questionIndex >= studyQuestions.length - 1}
                    className="p-2 text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 rounded-sm bg-white dark:bg-navy-light hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-200 shadow-[1px_1px_0px_0px_var(--color-shadow)]"
                  >
                    <SkipForward className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Left Panel - Question / Shared Editor Switcher */}
          <div className="lg:col-span-3 card-editorial overflow-hidden flex flex-col bg-white dark:bg-navy-light">
            {/* Brutalist Tab Header */}
            <div className="flex items-center border-b-4 border-charcoal dark:border-cream/40 bg-cream dark:bg-navy">
              <button
                onClick={() => setActiveTab('question')}
                className={`px-5 py-3 font-mono font-bold uppercase tracking-wider text-xs border-r-2 border-charcoal dark:border-cream/40 transition-colors cursor-pointer ${
                  activeTab === 'question'
                    ? 'bg-white dark:bg-navy-light text-charcoal dark:text-cream font-extrabold'
                    : 'text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream'
                }`}
              >
                📝 Question
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-5 py-3 font-mono font-bold uppercase tracking-wider text-xs border-r-2 border-charcoal dark:border-cream/40 transition-colors cursor-pointer ${
                  activeTab === 'code'
                    ? 'bg-white dark:bg-navy-light text-charcoal dark:text-cream font-extrabold'
                    : 'text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream'
                }`}
              >
                💻 Code Workspace
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 h-[calc(100%-48px)] overflow-hidden">
              {activeTab === 'question' ? (
                <div className="h-full p-6 overflow-y-auto pb-8">
                  {currentQuestion && (
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5 mb-5">
                        <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide leading-tight">
                          {currentQuestion.title}
                        </h2>
                        <div className="flex gap-1.5">
                          <span className="px-2 py-0.5 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)]">
                            {currentQuestion.type === 'coding' ? '💻 Coding' : '🔍 Code Review'}
                          </span>
                          <span className="px-2 py-0.5 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)]">
                            {currentQuestion.difficulty}
                          </span>
                        </div>
                      </div>

                      <div className="prose max-w-none text-sm text-charcoal/80 dark:text-cream/80 leading-relaxed font-body font-medium mb-6">
                        {currentQuestion.description}
                      </div>

                      {/* Coding Question Display */}
                      {currentQuestion.type === 'coding' && currentQuestion.starterCode && (
                        <div className="mb-6">
                          <h4 className="text-xs font-mono font-bold text-charcoal dark:text-cream mb-2 uppercase tracking-wider">Starter Template:</h4>
                          <div className="overflow-auto max-h-72 bg-charcoal dark:bg-[#1e1e1e] rounded-sm p-4 border-2 border-charcoal dark:border-cream/20 shadow-[3px_3px_0px_0px_var(--color-shadow)]">
                            <pre className="text-emerald-400 text-xs font-mono">
                              <code className="whitespace-pre">{currentQuestion.starterCode}</code>
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Code Review Question Display */}
                      {currentQuestion.type === 'code-review' && currentQuestion.codeToReview && (
                        <div className="mb-6">
                          <h4 className="text-xs font-mono font-bold text-charcoal dark:text-cream mb-2 uppercase tracking-wider">Review Target:</h4>
                          <div className="overflow-auto max-h-72 bg-charcoal dark:bg-[#1e1e1e] rounded-sm p-4 border-2 border-charcoal dark:border-cream/20 shadow-[3px_3px_0px_0px_var(--color-shadow)]">
                            <pre className="text-emerald-400 text-xs font-mono">
                              <code className="whitespace-pre">{currentQuestion.codeToReview}</code>
                            </pre>
                          </div>
                          {currentQuestion.issues && (
                            <div className="mt-4 p-3.5 border-l-4 border-charcoal dark:border-cream/40 bg-cream dark:bg-navy rounded-sm font-mono text-[11px] font-bold">
                              💡 Diagnostic Tip: Identify {currentQuestion.issues.length} structural defects in this file.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Solution Details */}
                      {currentQuestion.solution && (
                        <details className="mt-6 border-2 border-charcoal dark:border-cream/40 rounded-sm shadow-[2px_2px_0px_0px_var(--color-shadow)] overflow-hidden">
                          <summary className="cursor-pointer text-charcoal dark:text-cream font-bold p-3 bg-cream dark:bg-navy hover:bg-white dark:hover:bg-navy-light transition-colors uppercase tracking-wider text-xs font-mono">
                            🔑 View Solution Code (Click to toggle)
                          </summary>
                          <div className="overflow-auto max-h-72 bg-charcoal dark:bg-[#1e1e1e] border-t-2 border-charcoal dark:border-cream/40">
                            <pre className="p-4 text-xs text-emerald-300 font-mono">
                              <code className="whitespace-pre">{currentQuestion.solution}</code>
                            </pre>
                          </div>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full">
                  <CollaborativeCodeEditor
                    code={sharedCode}
                    language={codeLanguage}
                    onChange={handleCodeChange}
                    participants={participants}
                    currentUser={currentUser}
                    socket={socketRef.current}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Participants & Chat */}
          <div className="space-y-6 flex flex-col h-full lg:col-span-1 min-h-0">
            {/* Participants */}
            <ParticipantsList 
              participants={participants}
              currentUser={currentUser}
              isHost={isHost}
            />

            {/* Chat */}
            <ChatPanel
              messages={messages}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              onSendMessage={handleSendMessage}
              currentUser={currentUser}
            />
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-[#1a1a1a]/85 dark:bg-[#0a0a0a]/85 backdrop-blur-md flex items-center justify-center z-50 p-4 font-body">
          <div className="card-editorial max-w-md w-full p-6 bg-white dark:bg-navy-light">
            <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide mb-3">Invite Collaborators</h2>
            <p className="text-xs text-charcoal/70 dark:text-cream/70 mb-4 font-medium font-body leading-relaxed">
              Copy and share this invite link with your study mates:
            </p>
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={`${window.location.origin}/join/${roomId}`}
                readOnly
                className="flex-1 px-4 py-2.5 border-2 border-charcoal dark:border-cream/40 rounded-sm bg-cream dark:bg-navy text-charcoal dark:text-cream font-mono text-xs font-bold focus:outline-none shadow-[2px_2px_0px_0px_var(--color-shadow)]"
              />
              <button
                onClick={copyInviteLink}
                className="bg-charcoal text-white dark:bg-cream dark:text-navy border-2 border-charcoal dark:border-cream px-3 py-2 rounded-sm hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none cursor-pointer transition-all duration-200 shadow-[2px_2px_0px_0px_var(--color-shadow)]"
              >
                <Copy className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2.5 text-charcoal dark:text-cream bg-white dark:bg-navy-light border-3 border-charcoal dark:border-cream/40 rounded-sm font-mono font-bold uppercase tracking-widest text-[10px] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none cursor-pointer transition-all shadow-[2px_2px_0px_0px_var(--color-shadow)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyRoomInterface;
