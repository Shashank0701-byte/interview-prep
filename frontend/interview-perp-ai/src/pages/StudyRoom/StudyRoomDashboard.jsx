import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Clock, Share2, Trash2, Edit3, ArrowLeft } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import SpinnerLoader from '../../components/Loader/SpinnerLoader';

const StudyRoomDashboard = () => {
  const navigate = useNavigate();
  const [studyRooms, setStudyRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, hosted, joined
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    fetchStudyRooms();
  }, [filter]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axiosInstance.get('/api/auth/profile');
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const fetchStudyRooms = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/study-rooms/my-rooms?type=${filter}`);
      setStudyRooms(response.data.data.studyRooms);
    } catch (error) {
      console.error('Failed to fetch study rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 border-green-500 text-green-600 dark:text-green-400';
      case 'waiting': return 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400';
      case 'paused': return 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400';
      case 'completed': return 'bg-charcoal/10 dark:bg-cream/10 border-charcoal/30 dark:border-cream/20 text-charcoal dark:text-cream';
      default: return 'bg-cream dark:bg-navy border-charcoal/30 text-charcoal dark:text-cream';
    }
  };

  const copyInviteLink = async (roomId) => {
    try {
      const inviteLink = `${window.location.origin}/study-room/${roomId}`;
      await navigator.clipboard.writeText(inviteLink);
      alert('Invite link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const deleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this study room?')) {
      try {
        await axiosInstance.delete(`/api/study-rooms/${roomId}`);
        fetchStudyRooms();
      } catch (error) {
        console.error('Failed to delete room:', error);
      }
    }
  };

  const isUserHost = (room) => {
    if (!currentUser || !room.host) return false;
    const hostId = typeof room.host === 'object' ? room.host._id : room.host;
    return hostId === currentUser._id;
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-navy font-body p-6 text-charcoal dark:text-cream transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="card-editorial p-8 mb-8 bg-white dark:bg-navy-light">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-10 h-10 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light text-charcoal dark:text-cream rounded-sm flex items-center justify-center shadow-[2px_2px_0px_0px_var(--color-shadow)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={3} />
              </button>
              <div>
                <h1 className="text-4xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wider">
                  Study Rooms
                </h1>
                <p className="text-charcoal/70 dark:text-cream/70 text-sm mt-1">
                  Collaborate and practice code challenges together in real-time.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="border-3 border-charcoal bg-charcoal text-white dark:bg-cream dark:text-navy dark:border-cream px-5 py-2.5 rounded-sm font-bold uppercase tracking-widest text-xs hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_0px_var(--color-shadow)]"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
              <span>Create Room</span>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2.5 mt-8 border-t border-dashed border-charcoal/10 dark:border-cream/10 pt-6">
            {[
              { key: 'all', label: 'All Rooms' },
              { key: 'hosted', label: 'Hosted by Me' },
              { key: 'joined', label: 'Joined Rooms' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 border-2 rounded-sm font-bold uppercase tracking-wider text-xs transition-all duration-200 cursor-pointer shadow-[2.5px_2.5px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none ${
                  filter === key
                    ? 'bg-charcoal text-white border-charcoal dark:bg-cream dark:text-navy dark:border-cream/80'
                    : 'bg-white dark:bg-navy-light text-charcoal dark:text-cream border-charcoal dark:border-cream/40 hover:-translate-y-0.5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Study Rooms Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <SpinnerLoader />
            <p className="text-xs font-mono font-bold uppercase tracking-widest mt-4">Syncing lobby rooms... ✨</p>
          </div>
        ) : studyRooms.length === 0 ? (
          <div className="card-editorial p-12 text-center bg-white dark:bg-navy-light max-w-xl mx-auto my-12">
            <Users className="w-16 h-16 text-charcoal/40 dark:text-cream/40 mx-auto mb-6" />
            <h3 className="text-2xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide">
              No Study Rooms
            </h3>
            <p className="text-charcoal/60 dark:text-cream/60 mb-8 font-body text-sm max-w-xs mx-auto leading-relaxed">
              Create a virtual coding room and invite your peers to tackle tech interviews together!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="border-3 border-charcoal bg-charcoal text-white dark:bg-cream dark:text-navy dark:border-cream px-5 py-2.5 rounded-sm font-bold uppercase tracking-widest text-xs hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 cursor-pointer shadow-[2px_2px_0px_0px_var(--color-shadow)]"
            >
              Create Your First Room
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyRooms.map((room) => (
              <div
                key={room.roomId}
                className="card-editorial p-6 bg-white dark:bg-navy-light flex flex-col justify-between"
              >
                <div>
                  {/* Room Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-display font-bold text-charcoal dark:text-cream mb-1 truncate">
                        {room.name}
                      </h3>
                      <p className="text-charcoal/60 dark:text-cream/60 text-xs font-medium line-clamp-2 leading-relaxed">
                        {room.description || 'No description provided'}
                      </p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-sm text-[10px] font-mono font-bold border-2 uppercase tracking-wider shadow-[2px_2px_0px_0px_var(--color-shadow)] ${getStatusColor(room.status)}`}>
                      {room.status}
                    </span>
                  </div>

                  {/* Room Stats */}
                  <div className="flex items-center gap-4 mb-4 text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{room.participantCount} / {room.maxParticipants}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimeAgo(room.lastActivity)}</span>
                    </div>
                  </div>

                  {/* Host Info */}
                  <div className="mb-4 text-xs font-bold text-charcoal/60 dark:text-cream/60">
                    Host: <span className="font-mono text-charcoal dark:text-cream font-bold">{room.host?.username || 'Peer'}</span>
                  </div>

                  {/* Current Session */}
                  {room.currentSession?.sessionId && (
                    <div className="bg-cream dark:bg-navy border-2 border-charcoal/10 dark:border-cream/10 rounded-sm p-3 mb-5 shadow-[2px_2px_0px_0px_var(--color-shadow)]">
                      <p className="text-xs font-bold text-charcoal dark:text-cream uppercase tracking-wider font-mono">
                        Active Challenge
                      </p>
                      <p className="text-[10px] font-mono font-bold text-charcoal/60 dark:text-cream/60 mt-0.5">
                        Question {room.currentSession.questionIndex + 1} in progress
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => navigate(`/study-room/${room.roomId}`)}
                    className="flex-1 bg-charcoal text-white dark:bg-cream dark:text-navy border-3 border-charcoal dark:border-cream py-2 px-4 rounded-sm font-mono font-bold uppercase tracking-widest text-[10px] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none cursor-pointer transition-all duration-200 shadow-[2px_2px_0px_0px_var(--color-shadow)]"
                  >
                    Join Room
                  </button>
                  
                  <button
                    onClick={() => copyInviteLink(room.roomId)}
                    className="p-2 text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 rounded-sm bg-white dark:bg-navy-light hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none cursor-pointer transition-all duration-200 shadow-[2px_2px_0px_0px_var(--color-shadow)]"
                    title="Copy invite link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  {isUserHost(room) && (
                    <>
                      <button
                        onClick={() => deleteRoom(room.roomId)}
                        className="p-2 text-white bg-charcoal dark:bg-cream dark:text-navy border-2 border-charcoal dark:border-cream rounded-sm hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none cursor-pointer transition-all duration-200 shadow-[2px_2px_0px_0px_var(--color-shadow)]"
                        title="Delete room"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Room Modal */}
        {showCreateModal && (
          <CreateRoomModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchStudyRooms();
            }}
          />
        )}
      </div>
    </div>
  );
};

// Create Room Modal Component
const CreateRoomModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxParticipants: 6,
    settings: {
      isPublic: false,
      allowCodeEditing: true,
      allowWhiteboard: true,
      allowVoiceChat: true,
      requireApproval: false
    }
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post('/api/study-rooms/create', formData);
      const { roomId } = response.data.data;
      onSuccess();
      window.location.href = `/study-room/${roomId}`;
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1a1a1a]/85 dark:bg-[#0a0a0a]/85 backdrop-blur-md flex items-center justify-center z-50 p-4 font-body">
      <div className="card-editorial max-w-md w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-navy-light">
        <div className="p-6">
          <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream uppercase tracking-wide mb-6">Create Study Room</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono font-bold text-charcoal dark:text-cream mb-2 uppercase tracking-wider">
                Room Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-charcoal dark:border-cream/40 rounded-sm focus:ring-0 outline-none bg-cream dark:bg-navy text-charcoal dark:text-cream text-sm font-bold focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all"
                placeholder="e.g., Python LeetCode Prep"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-charcoal dark:text-cream mb-2 uppercase tracking-wider">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-charcoal dark:border-cream/40 rounded-sm focus:ring-0 outline-none bg-cream dark:bg-navy text-charcoal dark:text-cream text-sm font-bold focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all leading-relaxed"
                rows="3"
                placeholder="What topics are you preparing for?"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-charcoal dark:text-cream mb-2 uppercase tracking-wider">
                Max Participants
              </label>
              <select
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 border-2 border-charcoal dark:border-cream/40 rounded-sm focus:ring-0 outline-none bg-cream dark:bg-navy text-charcoal dark:text-cream text-sm font-bold cursor-pointer focus:shadow-[2px_2px_0px_0px_var(--color-shadow)] transition-all"
              >
                {[2, 3, 4, 5, 6, 8, 10].map(num => (
                  <option key={num} value={num}>{num} people</option>
                ))}
              </select>
            </div>

            {/* Settings */}
            <div className="space-y-3 border-t border-dashed border-charcoal/10 dark:border-cream/10 pt-4">
              <h3 className="font-mono font-bold text-charcoal/60 dark:text-cream/60 uppercase tracking-wider text-[10px]">Room Features</h3>
              
              {[
                { key: 'allowCodeEditing', label: 'Allow collaborative code editing' },
                { key: 'allowWhiteboard', label: 'Enable shared whiteboard' },
                { key: 'allowVoiceChat', label: 'Enable voice chat' },
                { key: 'requireApproval', label: 'Require approval to join' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.settings[key]}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, [key]: e.target.checked }
                    })}
                    className="w-4 h-4 text-charcoal border-2 border-charcoal dark:border-cream/40 rounded-sm focus:ring-0 cursor-pointer bg-cream dark:bg-navy"
                  />
                  <span className="text-xs font-bold text-charcoal dark:text-cream">{label}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-charcoal dark:text-cream bg-white dark:bg-navy-light border-3 border-charcoal dark:border-cream/40 rounded-sm hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 font-mono font-bold uppercase tracking-widest text-[10px] cursor-pointer shadow-[2px_2px_0px_0px_var(--color-shadow)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-charcoal text-white dark:bg-cream dark:text-navy border-3 border-charcoal dark:border-cream py-2 px-4 rounded-sm font-mono font-bold uppercase tracking-widest text-[10px] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--color-shadow)] active:translate-y-0.5 active:shadow-none transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-[2px_2px_0px_0px_var(--color-shadow)] flex items-center justify-center gap-1.5"
              >
                {loading ? 'Creating...' : 'Create Room'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudyRoomDashboard;
