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
  SkipBack
} from 'lucide-react';
import io from 'socket.io-client';
import axiosInstance from '../../utils/axiosInstance';
import CollaborativeCodeEditor from './CollaborativeCodeEditor';
import ParticipantsList from './ParticipantsList';
import ChatPanel from './ChatPanel';

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

  const initializeRoom = async () => {
    try {
      setLoading(true);
      
      // Get room details
      const roomResponse = await axiosInstance.get(`/api/study-rooms/${roomId}`);
      const roomData = roomResponse.data.data;
      setParticipants(roomData.participants);
      setCurrentSession(roomData.currentSession);
      setSharedCode(roomData.sharedCode?.content || '');
      setCodeLanguage(roomData.sharedCode?.language || 'javascript');

      // Get current user
      const userResponse = await axiosInstance.get('/api/auth/profile');
      const userData = userResponse.data;
      setCurrentUser(userData);
      setIsHost(roomData.host._id === userData._id);

      // Initialize socket connection
      initializeSocket(userData);

      // Load current session if exists
      if (roomData.currentSession?.sessionId) {
        loadSession(roomData.currentSession.sessionId, roomData.currentSession.questionIndex);
      }

    } catch (error) {
      console.error('Failed to initialize room:', error);
      setError('Failed to load study room');
    } finally {
      setLoading(false);
    }
  };

  const initializeSocket = (userData) => {
    const token = localStorage.getItem('token');
    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:8000', {
      auth: { token }
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
      setParticipants(data.room.participants);
      setMessages(data.room.chat || []);
      setSharedCode(data.room.sharedCode?.content || '');
    });

    socket.on('user-joined', (data) => {
      setParticipants(prev => [...prev.filter(p => p.userId !== data.userId), {
        userId: data.userId,
        username: data.username,
        isActive: true,
        joinedAt: new Date()
      }]);
    });

    socket.on('user-left', (data) => {
      setParticipants(prev => prev.filter(p => p.userId !== data.userId));
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
      if (currentSession?.questions) {
        setCurrentQuestion(currentSession.questions[data.questionIndex]);
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
    if (!isHost || !currentSession) return;

    const newIndex = direction === 'next' 
      ? Math.min(questionIndex + 1, currentSession.questions.length - 1)
      : Math.max(questionIndex - 1, 0);

    if (newIndex !== questionIndex && socketRef.current) {
      socketRef.current.emit('navigate-question', {
        questionIndex: newIndex,
        direction
      });
    }
  };

  const copyInviteLink = async () => {
    const inviteLink = `${window.location.origin}/study-room/${roomId}`;
    await navigator.clipboard.writeText(inviteLink);
    setShowInviteModal(false);
    // Add toast notification
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
                  Question {questionIndex + 1} of {currentSession.questions?.length || 0}
                </p>
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
                    disabled={questionIndex >= (currentSession.questions?.length || 1) - 1}
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
            <div className="h-full p-6">
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
                <div className="h-full overflow-y-auto">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    {currentQuestion.title}
                  </h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {currentQuestion.description}
                    </p>
                    {currentQuestion.examples && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3">Examples:</h3>
                        <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                          {currentQuestion.examples}
                        </pre>
                      </div>
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
