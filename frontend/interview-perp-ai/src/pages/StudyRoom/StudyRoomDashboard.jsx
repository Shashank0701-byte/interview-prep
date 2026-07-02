import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Clock, Settings, Share2, Trash2, Edit3, ArrowLeft } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

const StudyRoomDashboard = () => {
  const navigate = useNavigate();
  const [studyRooms, setStudyRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, hosted, joined

  useEffect(() => {
    fetchStudyRooms();
  }, [filter]);

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
      case 'active': return 'bg-gray-100 dark:bg-navy text-gray-700 dark:text-cream/80';
      case 'waiting': return 'bg-gray-100 dark:bg-navy text-gray-700 dark:text-cream/80';
      case 'paused': return 'bg-gray-100 dark:bg-navy text-gray-700 dark:text-cream/80';
      case 'completed': return 'bg-gray-100 dark:bg-navy text-gray-700 dark:text-cream/80';
      default: return 'bg-gray-100 dark:bg-navy text-gray-700 dark:text-cream/80';
    }
  };

  const copyInviteLink = async (roomId) => {
    const inviteLink = `${window.location.origin}/study-room/${roomId}`;
    await navigator.clipboard.writeText(inviteLink);
    // You could add a toast notification here
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

  return (
    <div className="min-h-screen bg-cream dark:bg-navy font-body p-6 text-charcoal dark:text-cream">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="card-editorial p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-charcoal dark:text-cream hover:bg-charcoal/10 dark:hover:bg-cream/10 rounded-md transition-all duration-200"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-4xl font-display font-bold text-charcoal dark:text-cream">
                  Study Rooms
                </h1>
                <p className="text-charcoal/80 dark:text-cream/80 mt-2">
                  Collaborate with friends and practice together in real-time
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="border-2 border-charcoal bg-charcoal text-white px-6 py-3 rounded-md font-bold uppercase tracking-wider text-sm hover:-translate-y-1 cursor-pointer transition-all duration-200 flex items-center gap-2"
              style={{ boxShadow: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--color-shadow)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              <Plus className="w-5 h-5" />
              Create Room
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-4 mt-6">
            {[
              { key: 'all', label: 'All Rooms' },
              { key: 'hosted', label: 'Hosted by Me' },
              { key: 'joined', label: 'Joined Rooms' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-md font-bold uppercase tracking-wider text-sm transition-all duration-200 border-2 ${
                  filter === key
                    ? 'bg-charcoal text-white border-charcoal'
                    : 'bg-white dark:bg-navy-light text-charcoal dark:text-cream border-charcoal dark:border-cream/40 hover:-translate-y-1 cursor-pointer'
                }`}
                style={filter !== key ? {} : {}}
                onMouseEnter={(e) => { if (filter !== key) e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--color-shadow)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Study Rooms Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-charcoal dark:border-cream"></div>
          </div>
        ) : studyRooms.length === 0 ? (
          <div className="card-editorial p-12 text-center">
            <Users className="w-16 h-16 text-charcoal/40 dark:text-cream/40 mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold text-charcoal dark:text-cream mb-2">
              No Study Rooms Yet
            </h3>
            <p className="text-charcoal/80 dark:text-cream/80 mb-6">
              Create your first study room and invite friends to practice together!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="border-2 border-charcoal bg-charcoal text-white px-6 py-3 rounded-md font-bold uppercase tracking-wider text-sm hover:-translate-y-1 cursor-pointer transition-all duration-200"
              style={{}} 
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--color-shadow)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              Create Your First Room
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyRooms.map((room) => (
              <div
                key={room.roomId}
                className="card-editorial p-6"
              >
                {/* Room Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-display font-bold text-charcoal dark:text-cream mb-1">
                      {room.name}
                    </h3>
                    <p className="text-charcoal/80 dark:text-cream/80 text-sm line-clamp-2">
                      {room.description || 'No description'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 border-charcoal dark:border-cream/40 uppercase tracking-wider ${getStatusColor(room.status)}`}>
                    {room.status}
                  </span>
                </div>

                {/* Room Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-charcoal/80 dark:text-cream/80">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{room.participantCount}/{room.maxParticipants}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatTimeAgo(room.lastActivity)}</span>
                  </div>
                </div>

                {/* Host Info */}
                <div className="mb-4">
                  <p className="text-sm text-charcoal/60 dark:text-cream/60">
                    Hosted by <span className="font-bold text-charcoal dark:text-cream">{room.host.username}</span>
                  </p>
                </div>

                {/* Current Session */}
                {room.currentSession?.sessionId && (
                  <div className="bg-cream dark:bg-navy border-2 border-charcoal/10 dark:border-cream/10 rounded-md p-3 mb-4">
                    <p className="text-sm font-bold text-charcoal dark:text-cream">
                      Active Session
                    </p>
                    <p className="text-xs text-charcoal/80 dark:text-cream/80">
                      Question {room.currentSession.questionIndex + 1}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/study-room/${room.roomId}`)}
                    className="flex-1 bg-charcoal text-white py-2 px-4 rounded-md font-bold uppercase tracking-wider text-sm border-2 border-charcoal hover:-translate-y-1 cursor-pointer transition-all duration-200"
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--color-shadow)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    Join Room
                  </button>
                  
                  <button
                    onClick={() => copyInviteLink(room.roomId)}
                    className="p-2 text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 rounded-md bg-white dark:bg-navy-light hover:-translate-y-1 cursor-pointer transition-all duration-200"
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--color-shadow)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                    title="Copy invite link"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>

                  {room.host._id === 'currentUserId' && ( // You'll need to get current user ID
                    <>
                      <button
                        onClick={() => {/* Open edit modal */}}
                        className="p-2 text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 rounded-md bg-white dark:bg-navy-light hover:-translate-y-1 cursor-pointer transition-all duration-200"
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--color-shadow)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                        title="Edit room"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteRoom(room.roomId)}
                        className="p-2 text-white bg-charcoal border-2 border-charcoal rounded-md hover:-translate-y-1 cursor-pointer transition-all duration-200"
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--color-shadow)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                        title="Delete room"
                      >
                        <Trash2 className="w-5 h-5" />
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
      // Navigate to the new room
      window.location.href = `/study-room/${roomId}`;
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-charcoal/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-body">
      <div className="card-editorial max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-display font-bold text-charcoal dark:text-cream mb-6">Create Study Room</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-charcoal dark:text-cream mb-2 uppercase tracking-wider">
                Room Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border-2 border-charcoal dark:border-cream/40 rounded-md focus:outline-none focus:ring-0 bg-white dark:bg-navy-input dark:text-cream"
                placeholder="e.g., JavaScript Study Group"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-charcoal dark:text-cream mb-2 uppercase tracking-wider">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border-2 border-charcoal dark:border-cream/40 rounded-md focus:outline-none focus:ring-0 bg-white dark:bg-navy-input dark:text-cream"
                rows="3"
                placeholder="What will you be studying together?"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-charcoal dark:text-cream mb-2 uppercase tracking-wider">
                Max Participants
              </label>
              <select
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border-2 border-charcoal dark:border-cream/40 rounded-md focus:outline-none focus:ring-0 bg-white dark:bg-navy-input dark:text-cream"
              >
                {[2, 3, 4, 5, 6, 8, 10].map(num => (
                  <option key={num} value={num}>{num} people</option>
                ))}
              </select>
            </div>

            {/* Settings */}
            <div className="space-y-3">
              <h3 className="font-bold text-charcoal dark:text-cream uppercase tracking-wider text-sm">Room Settings</h3>
              
              {[
                { key: 'allowCodeEditing', label: 'Allow collaborative code editing' },
                { key: 'allowWhiteboard', label: 'Enable shared whiteboard' },
                { key: 'allowVoiceChat', label: 'Enable voice chat' },
                { key: 'requireApproval', label: 'Require approval to join' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.settings[key]}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, [key]: e.target.checked }
                    })}
                    className="w-4 h-4 text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 rounded-sm focus:ring-0"
                  />
                  <span className="text-sm text-charcoal dark:text-cream">{label}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-charcoal dark:text-cream border-2 border-charcoal dark:border-cream/40 rounded-md hover:bg-charcoal/10 dark:hover:bg-cream/10 transition-colors font-bold uppercase tracking-wider text-sm hover:-translate-y-1 cursor-pointer"
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--color-shadow)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-charcoal text-white border-2 border-charcoal py-2 px-4 rounded-md font-bold uppercase tracking-wider text-sm hover:-translate-y-1 cursor-pointer transition-all duration-200 disabled:opacity-50"
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '4px 4px 0px 0px var(--color-shadow)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
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
