import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  MessageSquare, 
  Settings, 
  Share2, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  Send,
  Copy,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ArrowLeft,
  Home
} from 'lucide-react';
import io from 'socket.io-client';
import axiosInstance from '../../utils/axiosInstance';
import ParticipantsList from './ParticipantsList';
import ChatPanel from './ChatPanel';
import { generateStudyRoomQuestions } from '../../utils/studyRoomQuestions';
import { clearQuestionCache, testGeminiAPI } from '../../services/geminiQuestionService';

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
  const [activeTab, setActiveTab] = useState('code'); // code, chat, participants, settings
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
      // Cleanup on unmount
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId]); // Remove currentUser from dependencies to prevent infinite loop

  // Separate effect for handling beforeunload
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

  // Cleanup duplicates periodically
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

    // Clean up duplicates every 5 seconds
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
      // Don't set participants from room data initially - let socket handle it
      // setParticipants(roomData.participants);
      setSharedCode(roomData.sharedCode?.content || '');
      setCodeLanguage(roomData.sharedCode?.language || 'javascript');

      // Get current user
      const userResponse = await axiosInstance.get('/api/auth/profile');
      const userData = userResponse.data;
      setCurrentUser(userData);
      setIsHost(roomData.host._id === userData._id);

      // Load or generate study questions based on room topic
      const topic = roomData.topic || roomData.name || 'javascript';
      console.log('Room topic detected:', topic); // Debug log
      setRoomTopic(topic);
      
      let generatedQuestions = [];
      
      // Check if room already has questions stored in database
      if (roomData.questions && roomData.questions.length > 0) {
        console.log('✅ Loading existing questions from database:', roomData.questions.length);
        console.log('First question:', roomData.questions[0]?.title);
        generatedQuestions = roomData.questions;
        setStudyQuestions(generatedQuestions);
        
        // Load the saved current question index
        const savedIndex = roomData.currentQuestionIndex || 0;
        setQuestionIndex(savedIndex);
        setCurrentQuestion(generatedQuestions[savedIndex]);
      } else {
        console.log('🔄 No existing questions in database, generating new ones...');
        
        // Test Gemini API first
        const apiWorking = await testGeminiAPI();
        if (!apiWorking) {
          console.error('❌ Gemini API test failed, using fallback questions');
        }
        
        // Generate questions asynchronously with Gemini API
        try {
          generatedQuestions = await generateStudyRoomQuestions(topic);
          console.log('✅ Generated new questions for topic:', topic, '- Count:', generatedQuestions.length);
          console.log('First generated question:', generatedQuestions[0]?.title);
          setStudyQuestions(generatedQuestions);
          setCurrentQuestion(generatedQuestions[0]);
          
          // Save generated questions to the room
          try {
            await axiosInstance.put(`/api/study-rooms/${roomId}/questions`, {
              questions: generatedQuestions
            });
            console.log('✅ Saved questions to room');
          } catch (saveError) {
            console.error('Failed to save questions to room:', saveError);
          }
        } catch (error) {
          console.error('Failed to generate questions:', error);
          // Set empty questions array as fallback
          setStudyQuestions([]);
          setCurrentQuestion(null);
        }
      }

      // Initialize socket connection
      initializeSocket(userData);
      
      // Clear participants initially - let socket populate them
      setParticipants([]);

      // Create a mock session with generated questions
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
    // Don't create socket if one already exists
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

    // Join room
    socket.emit('join-room', {
      roomId,
      userId: userData._id,
      username: userData.name
    });

    // Socket event listeners
    socket.on('room-state', (data) => {
      setRoom(data.room);
      // Ensure participants are unique by both userId and username
      const uniqueParticipants = [];
      const seenUserIds = new Set();
      const seenUsernames = new Set();
      
      if (data.room.participants) {
        data.room.participants.forEach(participant => {
          const userId = participant.userId;
          const username = participant.username || participant.name;
          
          // Skip if we've already seen this userId OR username
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
        // More robust deduplication - check by both userId and username
        const existingByUserId = prev.findIndex(p => p.userId === data.userId);
        const existingByUsername = prev.findIndex(p => p.username === data.username);
        
        // Remove any existing entries for this user (by ID or username)
        let filtered = prev.filter(p => p.userId !== data.userId && p.username !== data.username);
        
        // Add the user once
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
        // Remove all instances of this user (by userId and username)
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

    // Handle disconnect events
    socket.on('disconnect', () => {
      // Socket disconnected - could show a reconnecting message
    });

    // Handle connection errors
    socket.on('connect_error', (error) => {
      setError('Failed to connect to study room. Please check your internet connection.');
      setLoading(false);
    });

    // Handle successful connection
    socket.on('connect', () => {
      setError(null); // Clear any previous errors
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

  const handleCodeChange = (newCode) => {
    setSharedCode(newCode);
    if (socketRef.current) {
      socketRef.current.emit('code-change', {
        content: newCode,
        language: codeLanguage
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
      
      // Save current question index to backend
      try {
        await axiosInstance.put(`/api/study-rooms/${roomId}/current-question`, {
          questionIndex: newIndex
        });
        console.log('✅ Saved current question index:', newIndex);
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
    const inviteLink = `${window.location.origin}/study-room/${roomId}`;
    await navigator.clipboard.writeText(inviteLink);
    setShowInviteModal(false);
    // Add toast notification
  };

  const handleLeaveRoom = () => {
    // Emit leave room event before navigating
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
          <p className="text-charcoal/80 dark:text-cream/80 font-bold uppercase tracking-wider">Joining study room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream dark:bg-navy font-body flex items-center justify-center text-charcoal dark:text-cream">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4 font-bold">{error}</p>
          <button
            onClick={() => navigate('/study-rooms')}
            className="border-2 border-charcoal dark:border-cream/40 bg-charcoal dark:bg-cream text-white dark:text-navy px-6 py-2 rounded-md font-bold uppercase tracking-wider text-sm hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] cursor-pointer transition-all duration-200"
          >
            Back to Study Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-navy font-body text-charcoal dark:text-cream">
      {/* Header */}
      <div className="bg-white dark:bg-navy-light border-b-2 border-charcoal/10 dark:border-cream/10 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Navigation Back Button */}
              <button
                onClick={handleLeaveRoom}
                className="flex items-center gap-2 px-3 py-2 text-charcoal dark:text-cream hover:bg-charcoal/10 dark:hover:bg-cream/10 rounded-md transition-colors font-bold uppercase tracking-wider text-xs"
                title="Leave Room & Back to Study Rooms"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Leave Room</span>
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
                className="flex items-center gap-2 px-3 py-2 text-charcoal dark:text-cream hover:bg-charcoal/10 dark:hover:bg-cream/10 rounded-md transition-colors font-bold uppercase tracking-wider text-xs"
                title="Leave Room & Go to Dashboard"
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>

              <div className="h-6 w-px bg-charcoal/20 dark:bg-cream/20"></div>

              <h1 className="text-2xl font-display font-bold text-charcoal dark:text-cream">{room?.name}</h1>
              <div className="flex items-center gap-2 text-sm text-charcoal/80 dark:text-cream/80">
                <Users className="w-4 h-4" />
                <span>{participants.length}/{room?.maxParticipants}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Voice/Video Controls */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-lg transition-colors ${
                  isMuted ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-2 rounded-lg transition-colors ${
                  isVideoOff ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setShowInviteModal(true)}
                className="border-2 border-charcoal dark:border-cream/40 bg-charcoal dark:bg-cream text-white dark:text-navy px-4 py-2 rounded-md hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] cursor-pointer transition-all duration-200 flex items-center gap-2 font-bold uppercase tracking-wider text-sm"
              >
                <Share2 className="w-4 h-4" />
                Invite
              </button>
            </div>
          </div>

          {/* Current Session Info */}
          {currentSession && (
            <div className="mt-4 flex items-center justify-between border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light rounded-md p-3">
              <div>
                <p className="font-bold text-charcoal dark:text-cream uppercase tracking-wider">{currentSession.name}</p>
                <p className="text-sm font-bold text-charcoal/80 dark:text-cream/80">
                  Question {questionIndex + 1} of {studyQuestions.length}
                </p>
                {currentQuestion && (
                  <p className="text-xs font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-wider mt-1">
                    {currentQuestion.type === 'coding' ? '💻 Coding' : '🔍 Code Review'} • {currentQuestion.difficulty}
                  </p>
                )}
              </div>
              
              {isHost && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateQuestion('prev')}
                    disabled={questionIndex === 0}
                    className="p-2 text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 rounded-md bg-white dark:bg-navy hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-200"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigateQuestion('next')}
                    disabled={questionIndex >= studyQuestions.length - 1}
                    className="p-2 text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 rounded-md bg-white dark:bg-navy hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-200"
                  >
                    <SkipForward className="w-4 h-4" />
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
          {/* Left Panel - Question */}
          <div className="lg:col-span-3 card-editorial overflow-hidden flex flex-col bg-white dark:bg-navy-light">
            {/* Question Header */}
            <div className="flex items-center gap-2 px-6 py-3 border-b-2 border-charcoal/10 dark:border-cream/10">
              <MessageSquare className="w-5 h-5 text-charcoal dark:text-cream" />
              <h3 className="font-bold text-charcoal dark:text-cream uppercase tracking-wider text-sm">Question</h3>
            </div>

            {/* Question Content */}
            <div className="h-[calc(100%-60px)] p-6 overflow-hidden">
              {currentQuestion && (
                <div className="h-full overflow-y-auto pb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream">
                      {currentQuestion.title}
                    </h2>
                    <span className={`px-3 py-1 rounded-sm text-xs font-bold border-2 border-charcoal dark:border-cream/40 uppercase tracking-wider bg-white dark:bg-navy`}>
                      {currentQuestion.type === 'coding' ? '💻 Coding' : '🔍 Code Review'}
                    </span>
                    <span className={`px-2 py-1 rounded-sm text-xs font-bold border-2 border-charcoal dark:border-cream/40 uppercase tracking-wider bg-white dark:bg-navy`}>
                      {currentQuestion.difficulty}
                    </span>
                  </div>

                  <div className="prose max-w-none">
                    <p className="text-charcoal/80 dark:text-cream/80 leading-relaxed mb-6 font-medium">
                      {currentQuestion.description}
                    </p>

                    {/* Coding Question Display */}
                    {currentQuestion.type === 'coding' && currentQuestion.starterCode && (
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-charcoal dark:text-cream mb-3 uppercase tracking-wider text-sm">Starter Code:</h3>
                        <div className="overflow-auto max-h-96 bg-charcoal dark:bg-[#1e1e1e] rounded-sm p-4">
                          <pre className="text-emerald-400 text-sm">
                            <code className="whitespace-pre">{currentQuestion.starterCode}</code>
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Code Review Question Display */}
                    {currentQuestion.type === 'code-review' && currentQuestion.codeToReview && (
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-charcoal dark:text-cream mb-3 uppercase tracking-wider text-sm">Code to Review:</h3>
                        <div className="overflow-auto max-h-96 bg-charcoal dark:bg-[#1e1e1e] rounded-sm p-4">
                          <pre className="text-emerald-400 text-sm">
                            <code className="whitespace-pre">{currentQuestion.codeToReview}</code>
                          </pre>
                        </div>
                        {currentQuestion.issues && (
                          <div className="mt-4 p-3 border-l-2 border-charcoal dark:border-cream/40 bg-charcoal/5 dark:bg-navy-input rounded-sm">
                            <p className="text-sm font-bold text-charcoal/80 dark:text-cream/80">
                              💡 Hint: Look for {currentQuestion.issues.length} potential issues in this code.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Solution (Hidden by default, can be revealed) */}
                    {currentQuestion.solution && (
                      <details className="mt-6 border-2 border-charcoal dark:border-cream/40 rounded-sm">
                        <summary className="cursor-pointer text-charcoal dark:text-cream font-bold p-3 bg-white dark:bg-navy-light hover:bg-cream dark:hover:bg-navy transition-colors uppercase tracking-wider text-sm border-b-2 border-transparent">
                          💡 View Solution (Click to reveal)
                        </summary>
                        <div className="overflow-auto max-h-96 bg-cream dark:bg-navy border-t-2 border-charcoal dark:border-cream/40">
                          <pre className="p-4 text-sm text-charcoal dark:text-cream font-medium">
                            <code className="whitespace-pre">{currentQuestion.solution}</code>
                          </pre>
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Participants & Chat */}
          <div className="space-y-6">
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
        <div className="fixed inset-0 bg-charcoal/80 dark:bg-navy/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-body">
          <div className="card-editorial max-w-md w-full p-6 bg-white dark:bg-navy-light">
            <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream mb-4">Invite Friends</h2>
            <p className="text-charcoal/80 dark:text-cream/80 mb-4 font-medium">
              Share this link with your friends to invite them to the study room:
            </p>
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={`${window.location.origin}/study-room/${roomId}`}
                readOnly
                className="flex-1 px-4 py-2 border-2 border-charcoal dark:border-cream/40 rounded-md bg-cream dark:bg-navy text-charcoal dark:text-cream font-medium focus:outline-none shadow-[2px_2px_0px_0px_#1A1A1A] dark:shadow-[2px_2px_0px_0px_var(--color-shadow)]"
              />
              <button
                onClick={copyInviteLink}
                className="bg-charcoal dark:bg-cream text-white dark:text-navy border-2 border-charcoal dark:border-cream px-4 py-2 rounded-md hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] cursor-pointer transition-all duration-200"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 text-charcoal dark:text-cream bg-white dark:bg-navy-light border-2 border-charcoal dark:border-cream/40 rounded-md font-bold uppercase tracking-wider text-sm hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] dark:hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] cursor-pointer transition-all"
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
