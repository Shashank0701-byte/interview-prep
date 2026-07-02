import React, { useState } from 'react';
import { 
  Users, 
  Crown, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  MoreVertical,
  UserX,
  Shield
} from 'lucide-react';

const ParticipantsList = ({ participants, currentUser, isHost }) => {
  const [showMenu, setShowMenu] = useState(null);

  const formatJoinTime = (joinedAt) => {
    const now = new Date();
    const joined = new Date(joinedAt);
    const diff = now - joined;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just joined';
    if (minutes < 60) return `${minutes}m ago`;
    return `${hours}h ago`;
  };

  const getStatusColor = (participant) => {
    if (!participant.isActive) return 'bg-gray-400';
    // You can add logic here for different statuses
    return 'bg-green-400';
  };

  const handleKickUser = (userId) => {
    // Implement kick user functionality
    console.log('Kick user:', userId);
    setShowMenu(null);
  };

  const handleMakeHost = (userId) => {
    // Implement make host functionality
    console.log('Make host:', userId);
    setShowMenu(null);
  };

  return (
    <div className="card-editorial p-6 h-80 bg-white">
      <div className="flex items-center justify-between mb-4 border-b-2 border-charcoal/10 pb-4">
        <h3 className="text-lg font-display font-bold text-charcoal flex items-center gap-2 uppercase tracking-wider">
          <Users className="w-5 h-5 text-charcoal" />
          Participants ({participants.filter(p => p.isActive).length})
        </h3>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-64">
        {participants
          .filter(p => p.isActive)
          .sort((a, b) => {
            // Sort by role (host first), then by join time
            if (a.role === 'host' && b.role !== 'host') return -1;
            if (b.role === 'host' && a.role !== 'host') return 1;
            return new Date(a.joinedAt) - new Date(b.joinedAt);
          })
          .map((participant) => (
            <div
              key={participant.userId}
              className="flex items-center justify-between p-3 bg-cream border-2 border-charcoal/10 rounded-md hover:border-charcoal transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 border-2 border-charcoal bg-white rounded-full flex items-center justify-center text-charcoal font-bold">
                    {participant.username.charAt(0).toUpperCase()}
                  </div>
                  {/* Status indicator */}
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(participant)} rounded-full border-2 border-charcoal`}></div>
                </div>

                {/* User info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal">
                      {participant.username}
                    </span>
                    {participant.role === 'host' && (
                      <Crown className="w-4 h-4 text-charcoal" title="Host" />
                    )}
                    {participant.userId === currentUser?._id && (
                      <span className="text-xs bg-charcoal text-white px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-charcoal/60 font-medium">
                    {formatJoinTime(participant.joinedAt)}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Voice/Video status */}
                <div className="flex items-center gap-1">
                  <div className="p-1 rounded bg-red-100 text-red-600" title="Microphone off">
                    <MicOff className="w-3 h-3" />
                  </div>
                  <div className="p-1 rounded bg-red-100 text-red-600" title="Camera off">
                    <VideoOff className="w-3 h-3" />
                  </div>
                </div>

                {/* Menu for host actions */}
                {isHost && participant.userId !== currentUser?._id && (
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(showMenu === participant.userId ? null : participant.userId)}
                      className="p-1 text-charcoal/60 hover:text-charcoal hover:bg-charcoal/10 rounded-sm transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {showMenu === participant.userId && (
                      <div className="absolute right-0 top-8 bg-white border-2 border-charcoal rounded-md shadow-[4px_4px_0px_0px_#1A1A1A] py-1 z-10 min-w-32">
                        <button
                          onClick={() => handleMakeHost(participant.userId)}
                          className="w-full px-3 py-2 text-left text-sm font-bold text-charcoal hover:bg-cream flex items-center gap-2 uppercase tracking-wider"
                        >
                          <Shield className="w-4 h-4" />
                          Make Host
                        </button>
                        <button
                          onClick={() => handleKickUser(participant.userId)}
                          className="w-full px-3 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 uppercase tracking-wider"
                        >
                          <UserX className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* Room capacity indicator */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Room Capacity</span>
          <span>
            {participants.filter(p => p.isActive).length} / {participants.length > 0 ? '6' : '6'} {/* You might want to get this from room data */}
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(participants.filter(p => p.isActive).length / 6) * 100}%`
            }}
          ></div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-4 flex gap-2">
        <button className="flex-1 bg-charcoal text-white border-2 border-charcoal py-2 px-3 rounded-md text-sm font-bold uppercase tracking-wider hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] cursor-pointer transition-all duration-200">
          Invite More
        </button>
        {isHost && (
          <button className="flex-1 bg-white text-charcoal border-2 border-charcoal py-2 px-3 rounded-md text-sm font-bold uppercase tracking-wider hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#1A1A1A] cursor-pointer transition-all duration-200">
            Settings
          </button>
        )}
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowMenu(null)}
        ></div>
      )}
    </div>
  );
};

export default ParticipantsList;
