import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Clock, Shield, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

const StudyRoomJoin = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchRoomDetails();
    fetchCurrentUser();
  }, [roomId]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axiosInstance.get('/api/auth/profile');
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // Redirect to login if not authenticated
      navigate('/login');
    }
  };

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/study-rooms/${roomId}`);
      setRoom(response.data.data);
    } catch (error) {
      console.error('Failed to fetch room details:', error);
      if (error.response?.status === 404) {
        setError('Study room not found or has expired');
      } else if (error.response?.status === 410) {
        setError('This study room has expired');
      } else {
        setError('Failed to load study room details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    try {
      setJoining(true);
      await axiosInstance.post(`/api/study-rooms/${roomId}/join`);
      // Navigate to the study room interface
      navigate(`/study-room/${roomId}`);
    } catch (error) {
      console.error('Failed to join room:', error);
      if (error.response?.status === 400) {
        setError('Room is full or you cannot join this room');
      } else {
        setError('Failed to join room. Please try again.');
      }
    } finally {
      setJoining(false);
    }
  };

  const formatCreatedTime = (createdAt) => {
    const date = new Date(createdAt);
    return date.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      waiting: { color: 'bg-blue-100 text-blue-800', label: 'Waiting' },
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      paused: { color: 'bg-yellow-100 text-yellow-800', label: 'Paused' },
      completed: { color: 'bg-gray-100 text-gray-800', label: 'Completed' }
    };
    
    const config = statusConfig[status] || statusConfig.waiting;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-navy font-body flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-charcoal dark:border-cream mx-auto mb-4"></div>
          <p className="text-charcoal/80 dark:text-cream/80">Loading study room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream dark:bg-navy font-body flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="card-editorial p-8 text-center bg-white dark:bg-navy-light">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream mb-2">Oops!</h2>
            <p className="text-charcoal/80 dark:text-cream/80 mb-6 font-medium">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/study-rooms')}
                className="w-full bg-charcoal border-2 border-charcoal text-white py-3 px-4 rounded-md font-bold uppercase tracking-wider text-sm hover:-translate-y-1 cursor-pointer transition-all duration-200"
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--color-shadow)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                Browse Study Rooms
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light py-3 px-4 rounded-md font-bold uppercase tracking-wider text-sm hover:-translate-y-1 cursor-pointer transition-all duration-200"
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--color-shadow)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isAlreadyParticipant = room?.participants?.some(p => p.userId === currentUser?._id && p.isActive);
  const isRoomFull = room?.participantCount >= room?.maxParticipants;

  return (
    <div className="min-h-screen bg-cream dark:bg-navy font-body flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="card-editorial overflow-hidden bg-white dark:bg-navy-light">
          {/* Header */}
          <div className="bg-charcoal text-white p-8 border-b-2 border-charcoal">
            <div className="text-center">
              <div className="w-16 h-16 border-2 border-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-display font-bold mb-2">{room?.name}</h1>
              <p className="text-white/80 font-medium">
                You've been invited to join this study room
              </p>
            </div>
          </div>

          {/* Room Details */}
          <div className="p-8">
            {/* Description */}
            {room?.description && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-charcoal dark:text-cream mb-2 uppercase tracking-wider">About this room</h3>
                <p className="text-charcoal/80 dark:text-cream/80 font-medium">{room.description}</p>
              </div>
            )}

            {/* Room Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Participants */}
              <div className="bg-cream dark:bg-navy border-2 border-charcoal/10 dark:border-cream/10 rounded-md p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-charcoal dark:text-cream" />
                  <span className="font-bold text-charcoal dark:text-cream uppercase tracking-wider text-sm">Participants</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-charcoal/80 dark:text-cream/80">Current</span>
                    <span className="font-bold text-charcoal dark:text-cream">{room?.participantCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-charcoal/80 dark:text-cream/80">Maximum</span>
                    <span className="font-bold text-charcoal dark:text-cream">{room?.maxParticipants || 0}</span>
                  </div>
                  <div className="w-full bg-white dark:bg-navy-light border-2 border-charcoal/20 dark:border-cream/20 rounded-full h-3 mt-3 overflow-hidden">
                    <div
                      className="bg-charcoal h-full transition-all duration-300"
                      style={{
                        width: `${((room?.participantCount || 0) / (room?.maxParticipants || 1)) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Host Info */}
              <div className="bg-cream dark:bg-navy border-2 border-charcoal/10 dark:border-cream/10 rounded-md p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-charcoal dark:text-cream" />
                  <span className="font-bold text-charcoal dark:text-cream uppercase tracking-wider text-sm">Host</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border-2 border-charcoal dark:border-cream/40 rounded-full flex items-center justify-center text-charcoal dark:text-cream font-bold bg-white dark:bg-navy-light">
                    {room?.host?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-charcoal dark:text-cream">{room?.host?.username}</p>
                    <p className="text-sm text-charcoal/60 dark:text-cream/60 font-medium">Room creator</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-cream dark:bg-navy border-2 border-charcoal/10 dark:border-cream/10 rounded-md p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Settings className="w-5 h-5 text-charcoal dark:text-cream" />
                  <span className="font-bold text-charcoal dark:text-cream uppercase tracking-wider text-sm">Status</span>
                </div>
                <div className="flex items-center justify-between">
                  {getStatusBadge(room?.status)}
                </div>
              </div>

              {/* Created */}
              <div className="bg-cream dark:bg-navy border-2 border-charcoal/10 dark:border-cream/10 rounded-md p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-charcoal dark:text-cream" />
                  <span className="font-bold text-charcoal dark:text-cream uppercase tracking-wider text-sm">Created</span>
                </div>
                <p className="text-sm font-medium text-charcoal/80 dark:text-cream/80">
                  {formatCreatedTime(room?.createdAt)}
                </p>
              </div>
            </div>

            {/* Current Session */}
            {room?.currentSession?.sessionId && (
              <div className="bg-white dark:bg-navy-light border-2 border-charcoal dark:border-cream/40 rounded-md p-4 mb-6">
                <h3 className="font-bold text-charcoal dark:text-cream uppercase tracking-wider mb-2">Active Session</h3>
                <p className="text-sm text-charcoal/80 dark:text-cream/80 font-medium">
                  The room is currently working on a practice session
                </p>
              </div>
            )}

            {/* Room Settings Preview */}
            <div className="bg-cream dark:bg-navy border-2 border-charcoal/10 dark:border-cream/10 rounded-md p-4 mb-8">
              <h3 className="font-bold text-charcoal dark:text-cream mb-3 uppercase tracking-wider">Room Features</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-charcoal dark:text-cream" />
                    <span className="font-medium text-charcoal/80 dark:text-cream/80">Code Collaboration</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-charcoal dark:text-cream" />
                    <span className="font-medium text-charcoal/80 dark:text-cream/80">Shared Whiteboard</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-charcoal dark:text-cream" />
                    <span className="font-medium text-charcoal/80 dark:text-cream/80">Voice Chat</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-charcoal dark:text-cream" />
                    <span className="font-medium text-charcoal/80 dark:text-cream/80">Real-time Chat</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isAlreadyParticipant ? (
                <button
                  onClick={() => navigate(`/study-room/${roomId}`)}
                  className="w-full bg-charcoal text-white py-3 px-4 rounded-md font-bold hover:-translate-y-1 cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-wider border-2 border-charcoal"
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--color-shadow)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <CheckCircle className="w-5 h-5" />
                  Continue to Room
                </button>
              ) : isRoomFull ? (
                <div className="text-center">
                  <button
                    disabled
                    className="w-full bg-cream dark:bg-navy border-2 border-charcoal/20 dark:border-cream/20 text-charcoal/40 dark:text-cream/40 py-3 px-4 rounded-md font-bold uppercase tracking-wider cursor-not-allowed"
                  >
                    Room is Full
                  </button>
                  <p className="text-sm font-medium text-charcoal/60 dark:text-cream/60 mt-2">
                    This study room has reached its maximum capacity
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleJoinRoom}
                  disabled={joining}
                  className="w-full bg-charcoal text-white py-3 px-4 rounded-md font-bold border-2 border-charcoal hover:-translate-y-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-wider"
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--color-shadow)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  {joining ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Joining...
                    </>
                  ) : (
                    <>
                      <Users className="w-5 h-5" />
                      Join Study Room
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={() => navigate('/study-rooms')}
                className="w-full bg-white dark:bg-navy-light text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 py-3 px-4 rounded-md hover:-translate-y-1 cursor-pointer transition-all duration-200 font-bold uppercase tracking-wider text-sm mt-3"
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--color-shadow)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                Browse Other Rooms
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyRoomJoin;
