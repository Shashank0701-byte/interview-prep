import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Clock, Shield, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import SpinnerLoader from '../../components/Loader/SpinnerLoader';

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
      waiting: { color: 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400', label: 'Waiting' },
      active: { color: 'bg-green-500/10 border-green-500 text-green-600 dark:text-green-400', label: 'Active' },
      paused: { color: 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400', label: 'Paused' },
      completed: { color: 'bg-charcoal/10 border-charcoal/30 text-charcoal dark:text-cream', label: 'Completed' }
    };
    
    const config = statusConfig[status] || statusConfig.waiting;
    return (
      <span className={`px-2.5 py-0.5 rounded-sm border-2 text-xs font-mono font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)] ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-navy font-body flex items-center justify-center">
        <div className="text-center">
          <SpinnerLoader />
          <p className="text-xs font-mono font-bold uppercase tracking-widest mt-4 text-charcoal/80 dark:text-cream/80">Loading invite details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream dark:bg-navy font-body flex items-center justify-center p-4">
        <div className="max-w-md w-full mx-auto">
          <div className="card-editorial p-8 text-center bg-white dark:bg-navy-light flex flex-col items-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
            <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide mb-2">Oops!</h2>
            <p className="text-charcoal/60 dark:text-cream/60 mb-8 font-body text-sm font-medium leading-relaxed">{error}</p>
            <div className="space-y-3 w-full">
              <button
                onClick={() => navigate('/study-rooms')}
                className="w-full bg-charcoal text-white dark:bg-cream dark:text-navy border-3 border-charcoal dark:border-cream py-3 rounded-sm font-mono font-bold uppercase tracking-widest text-xs hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 cursor-pointer shadow-[2px_2px_0px_0px_var(--color-shadow)]"
              >
                Browse Study Rooms
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light py-3 rounded-sm font-mono font-bold uppercase tracking-widest text-xs hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 cursor-pointer shadow-[2px_2px_0px_0px_var(--color-shadow)]"
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
    <div className="min-h-screen bg-cream dark:bg-navy font-body flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-2xl w-full">
        <div className="card-editorial overflow-hidden bg-white dark:bg-navy-light">
          {/* Header */}
          <div className="bg-cream dark:bg-navy text-charcoal dark:text-cream p-8 border-b-4 border-charcoal dark:border-cream/40">
            <div className="text-center">
              <div className="w-16 h-16 border-3 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream rounded-sm flex items-center justify-center mx-auto mb-5 shadow-[3px_3px_0px_0px_var(--color-shadow)]">
                <Users className="w-8 h-8" strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl font-display font-bold mb-2 uppercase tracking-wide">{room?.name}</h1>
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-charcoal/60 dark:text-cream/60">
                You've been invited to join this room
              </p>
            </div>
          </div>

          {/* Room Details */}
          <div className="p-8">
            {/* Description */}
            {room?.description && (
              <div className="mb-6 border-b border-dashed border-charcoal/10 dark:border-cream/10 pb-5">
                <h3 className="text-xs font-mono font-bold text-charcoal/60 dark:text-cream/60 mb-2 uppercase tracking-wider">About Room</h3>
                <p className="text-sm font-medium text-charcoal dark:text-cream leading-relaxed">{room.description}</p>
              </div>
            )}

            {/* Room Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Participants */}
              <div className="bg-cream dark:bg-navy border-2 border-charcoal/10 dark:border-cream/10 rounded-sm p-4 shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4.5 h-4.5 text-charcoal dark:text-cream" />
                  <span className="font-mono font-bold text-charcoal dark:text-cream uppercase tracking-wider text-xs">Peers</span>
                </div>
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-charcoal/60 dark:text-cream/60 font-bold uppercase tracking-wider text-[10px]">Joined</span>
                    <span className="font-extrabold text-charcoal dark:text-cream">{room?.participantCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-charcoal/60 dark:text-cream/60 font-bold uppercase tracking-wider text-[10px]">Max</span>
                    <span className="font-extrabold text-charcoal dark:text-cream">{room?.maxParticipants || 0}</span>
                  </div>
                  <div className="w-full bg-white dark:bg-navy-light border-2 border-charcoal/20 dark:border-cream/20 rounded-sm h-3 mt-3 overflow-hidden shadow-[1px_1px_0px_0px_var(--color-shadow)]">
                    <div
                      className="bg-charcoal dark:bg-cream h-full transition-all duration-300"
                      style={{
                        width: `${((room?.participantCount || 0) / (room?.maxParticipants || 1)) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Host Info */}
              <div className="bg-cream dark:bg-navy border-2 border-charcoal/10 dark:border-cream/10 rounded-sm p-4 shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4.5 h-4.5 text-charcoal dark:text-cream" />
                  <span className="font-mono font-bold text-charcoal dark:text-cream uppercase tracking-wider text-xs">Host Profile</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 border-2 border-charcoal dark:border-cream/40 rounded-sm flex items-center justify-center text-charcoal dark:text-cream font-mono font-bold bg-white dark:bg-navy-light shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)]">
                    {room?.host?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-charcoal dark:text-cream truncate">{room?.host?.username}</p>
                    <p className="text-[9px] text-charcoal/50 dark:text-cream/50 font-mono font-bold uppercase tracking-wider mt-0.5">Creator</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-cream dark:bg-navy border-2 border-charcoal/10 dark:border-cream/10 rounded-sm p-4 shadow-[2px_2px_0px_0px_var(--color-shadow)] flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-4.5 h-4.5 text-charcoal dark:text-cream" />
                  <span className="font-mono font-bold text-charcoal dark:text-cream uppercase tracking-wider text-xs">Room status</span>
                </div>
                <div>
                  {getStatusBadge(room?.status)}
                </div>
              </div>

              {/* Created */}
              <div className="bg-cream dark:bg-navy border-2 border-charcoal/10 dark:border-cream/10 rounded-sm p-4 shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4.5 h-4.5 text-charcoal dark:text-cream" />
                  <span className="font-mono font-bold text-charcoal dark:text-cream uppercase tracking-wider text-xs">Created On</span>
                </div>
                <p className="text-[11px] font-mono font-bold text-charcoal/75 dark:text-cream/75 leading-relaxed">
                  {formatCreatedTime(room?.createdAt)}
                </p>
              </div>
            </div>

            {/* Room Features Preview */}
            <div className="bg-cream dark:bg-navy border-2 border-charcoal/15 dark:border-cream/20 rounded-sm p-5 mb-8 shadow-[2px_2px_0px_0px_var(--color-shadow)]">
              <h3 className="font-mono font-bold text-charcoal dark:text-cream mb-4 uppercase tracking-wider text-xs">Room Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  'Code Collaboration Active',
                  'Shared Whiteboard Enabled',
                  'Live Audio Chat Integration',
                  'Real-time Lobby Chat'
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" strokeWidth={2.5} />
                    <span className="font-bold text-charcoal/85 dark:text-cream/85">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isAlreadyParticipant ? (
                <button
                  onClick={() => navigate(`/study-room/${roomId}`)}
                  className="w-full bg-charcoal text-white dark:bg-cream dark:text-navy py-3.5 rounded-sm font-mono font-bold uppercase tracking-widest text-xs hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 flex items-center justify-center gap-2 border-3 border-charcoal dark:border-cream shadow-[3px_3px_0px_0px_var(--color-shadow)] cursor-pointer"
                >
                  <CheckCircle className="w-4.5 h-4.5" strokeWidth={2.5} />
                  <span>Continue to Workspace</span>
                </button>
              ) : isRoomFull ? (
                <div className="text-center">
                  <button
                    disabled
                    className="w-full bg-cream dark:bg-navy border-2 border-charcoal/20 dark:border-cream/20 text-charcoal/40 dark:text-cream/40 py-3.5 rounded-sm font-mono font-bold uppercase tracking-wider text-xs cursor-not-allowed"
                  >
                    Lobby Capacity Reached
                  </button>
                  <p className="text-[10px] font-mono font-bold text-charcoal/50 dark:text-cream/50 mt-2 uppercase tracking-wide">
                    This room has reached its maximum peer limit.
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleJoinRoom}
                  disabled={joining}
                  className="w-full bg-charcoal text-white dark:bg-cream dark:text-navy py-3.5 rounded-sm font-mono font-bold border-3 border-charcoal dark:border-cream hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-widest text-xs shadow-[3px_3px_0px_0px_var(--color-shadow)] cursor-pointer"
                >
                  {joining ? (
                    <>
                      <div className="animate-spin rounded-full h-4.5 w-4.5 border-b-2 border-white dark:border-navy"></div>
                      <span>Joining room...</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-4.5 h-4.5" strokeWidth={2.5} />
                      <span>Join Study Room</span>
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={() => navigate('/study-rooms')}
                className="w-full bg-white dark:bg-navy-light text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 py-3.5 rounded-sm hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 font-mono font-bold uppercase tracking-widest text-xs cursor-pointer shadow-[2px_2px_0px_0px_var(--color-shadow)]"
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
