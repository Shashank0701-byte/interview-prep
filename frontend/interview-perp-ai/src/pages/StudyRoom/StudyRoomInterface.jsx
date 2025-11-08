import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  MessageSquare, 
  Code, 
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
import CollaborativeCodeEditor from './CollaborativeCodeEditor';
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
        setCurrentQuestion(generatedQuestions[0]);
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
    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:8000', {
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

  const navigateQuestion = (direction) => {
    if (!isHost || studyQuestions.length === 0) return;

    const newIndex = direction === 'next' 
      ? Math.min(questionIndex + 1, studyQuestions.length - 1)
      : Math.max(questionIndex - 1, 0);

    if (newIndex !== questionIndex) {
      setQuestionIndex(newIndex);
      setCurrentQuestion(studyQuestions[newIndex]);
      
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Joining study room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/study-rooms')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Study Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Navigation Back Button */}
              <button
                onClick={handleLeaveRoom}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Leave Room & Back to Study Rooms"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Leave Room</span>
              </button>
              
              {/* Dashboard Button */}
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
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Leave Room & Go to Dashboard"
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>

              <div className="h-6 w-px bg-gray-300"></div>

              <h1 className="text-2xl font-bold text-gray-800">{room?.name}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{participants.length}/{room?.maxParticipants}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Voice/Video Controls */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-lg transition-colors ${
                  isMuted ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-2 rounded-lg transition-colors ${
                  isVideoOff ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                }`}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              {/* Invite Button */}
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Invite
              </button>
            </div>
          </div>

          {/* Current Session Info */}
          {currentSession && (
            <div className="mt-4 flex items-center justify-between bg-blue-50 rounded-lg p-3">
              <div>
                <p className="font-medium text-blue-800">{currentSession.name}</p>
                <p className="text-sm text-blue-600">
                  Question {questionIndex + 1} of {studyQuestions.length}
                </p>
                {currentQuestion && (
                  <p className="text-xs text-blue-500">
                    {currentQuestion.type === 'coding' ? '💻 Coding' : '🔍 Code Review'} • {currentQuestion.difficulty}
                  </p>
                )}
              </div>
              
              {isHost && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateQuestion('prev')}
                    disabled={questionIndex === 0}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg disabled:opacity-50"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigateQuestion('next')}
                    disabled={questionIndex >= studyQuestions.length - 1}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg disabled:opacity-50"
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
          {/* Left Panel - Question/Code */}
          <div className="lg:col-span-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b bg-gray-50/50">
              {[
                { key: 'code', label: 'Code Editor', icon: Code },
                { key: 'question', label: 'Question', icon: MessageSquare }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                    activeTab === key
                      ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="h-[calc(100%-60px)] p-6 overflow-hidden">
              {activeTab === 'code' && (
                <CollaborativeCodeEditor
                  code={sharedCode}
                  language={codeLanguage}
                  onChange={handleCodeChange}
                  participants={participants}
                  currentUser={currentUser}
                  socket={socketRef.current}
                />
              )}

              {activeTab === 'question' && currentQuestion && (
                <div className="h-full overflow-y-auto pb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {currentQuestion.title}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      currentQuestion.type === 'coding' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {currentQuestion.type === 'coding' ? '💻 Coding' : '🔍 Code Review'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      currentQuestion.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      currentQuestion.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {currentQuestion.difficulty}
                    </span>
                  </div>

                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {currentQuestion.description}
                    </p>

                    {/* Coding Question Display */}
                    {currentQuestion.type === 'coding' && currentQuestion.starterCode && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">Starter Code:</h3>
                        <div className="overflow-auto max-h-96 bg-gray-900 rounded-lg">
                          <pre className="text-green-400 p-4 text-sm">
                            <code className="whitespace-pre">{currentQuestion.starterCode}</code>
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Code Review Question Display */}
                    {currentQuestion.type === 'code-review' && currentQuestion.codeToReview && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">Code to Review:</h3>
                        <div className="overflow-auto max-h-96 bg-gray-900 rounded-lg">
                          <pre className="text-green-400 p-4 text-sm">
                            <code className="whitespace-pre">{currentQuestion.codeToReview}</code>
                          </pre>
                        </div>
                        {currentQuestion.issues && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-600">
                              💡 <strong>Hint:</strong> Look for {currentQuestion.issues.length} potential issues in this code.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Solution (Hidden by default, can be revealed) */}
                    {currentQuestion.solution && (
                      <details className="mt-6">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                          💡 View Solution (Click to reveal)
                        </summary>
                        <div className="mt-3 overflow-auto max-h-96 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                          <pre className="p-4 text-sm">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Invite Friends</h2>
            <p className="text-gray-600 mb-4">
              Share this link with your friends to invite them to the study room:
            </p>
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={`${window.location.origin}/study-room/${roomId}`}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              <button
                onClick={copyInviteLink}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
