import React, { useState } from 'react';
import { 
  Users, 
  Crown, 
  MicOff, 
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
    return 'bg-green-500';
  };

  const handleKickUser = (userId) => {
    console.log('Kick user:', userId);
    setShowMenu(null);
  };

  const handleMakeHost = (userId) => {
    console.log('Make host:', userId);
    setShowMenu(null);
  };

  return (
    <div className="card-editorial p-6 h-80 bg-white dark:bg-navy-light flex flex-col justify-between relative z-20 flex-1 min-h-0">
      <div>
        <div className="flex items-center justify-between mb-4 border-b-2 border-charcoal/10 dark:border-cream/10 pb-4 bg-cream dark:bg-navy p-3 rounded-sm">
          <h3 className="text-xs font-mono font-bold text-charcoal dark:text-cream flex items-center gap-1.5 uppercase tracking-widest">
            <Users className="w-4 h-4" />
            <span>Peers ({participants.filter(p => p.isActive).length})</span>
          </h3>
        </div>

        <div className="space-y-2.5 overflow-y-auto max-h-36 pr-1">
          {participants
            .filter(p => p.isActive)
            .sort((a, b) => {
              if (a.role === 'host' && b.role !== 'host') return -1;
              if (b.role === 'host' && a.role !== 'host') return 1;
              return new Date(a.joinedAt) - new Date(b.joinedAt);
            })
            .map((participant) => (
              <div
                key={participant.userId}
                className="flex items-center justify-between p-2.5 bg-cream dark:bg-navy border-2 border-charcoal/10 dark:border-cream/10 rounded-sm hover:border-charcoal dark:hover:border-cream/40 transition-all shadow-[1.5px_1.5px_0px_0px_var(--color-shadow)]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 border-2 border-charcoal dark:border-cream/40 bg-white dark:bg-navy-light rounded-sm flex items-center justify-center text-charcoal dark:text-cream font-mono font-bold text-xs shadow-[1px_1px_0px_0px_var(--color-shadow)]">
                      {participant.username.charAt(0).toUpperCase()}
                    </div>
                    {/* Status indicator */}
                    <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 ${getStatusColor(participant)} rounded-full border-2 border-charcoal`}></div>
                  </div>

                  {/* User info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-charcoal dark:text-cream truncate">
                        {participant.username}
                      </span>
                      {participant.role === 'host' && (
                        <Crown className="w-3.5 h-3.5 text-charcoal dark:text-cream" title="Host" />
                      )}
                      {participant.userId === currentUser?._id && (
                        <span className="text-[8px] bg-charcoal text-white dark:bg-cream dark:text-navy px-1.5 py-0.5 rounded-sm font-mono font-bold uppercase tracking-wider">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-charcoal/50 dark:text-cream/50 font-mono font-bold uppercase tracking-wider">
                      {formatJoinTime(participant.joinedAt)}
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1.5">
                  {/* Voice/Video status icons */}
                  <div className="flex items-center gap-1">
                    <div className="p-1 rounded-sm bg-red-500/10 text-red-600 dark:text-red-400" title="Microphone off">
                      <MicOff className="w-3 h-3" />
                    </div>
                    <div className="p-1 rounded-sm bg-red-500/10 text-red-600 dark:text-red-400" title="Camera off">
                      <VideoOff className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Menu for host actions */}
                  {isHost && participant.userId !== currentUser?._id && (
                    <div className="relative">
                      <button
                        onClick={() => setShowMenu(showMenu === participant.userId ? null : participant.userId)}
                        className="p-1 text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream hover:bg-charcoal/10 dark:hover:bg-cream/10 rounded-sm transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {showMenu === participant.userId && (
                        <div className="absolute right-0 top-7 bg-white dark:bg-navy-light border-3 border-charcoal dark:border-cream/40 rounded-sm py-1 z-30 min-w-[120px] shadow-[3px_3px_0px_0px_var(--color-shadow)]">
                          <button
                            onClick={() => handleMakeHost(participant.userId)}
                            className="w-full px-3 py-2.5 text-left text-[10px] font-mono font-bold text-charcoal dark:text-cream hover:bg-cream dark:hover:bg-navy flex items-center gap-1.5 uppercase tracking-wider"
                          >
                            <Shield className="w-3.5 h-3.5" />
                            Make Host
                          </button>
                          <button
                            onClick={() => handleKickUser(participant.userId)}
                            className="w-full px-3 py-2.5 text-left text-[10px] font-mono font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-1.5 uppercase tracking-wider"
                          >
                            <UserX className="w-3.5 h-3.5" />
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
      </div>

      {/* Room capacity indicator */}
      <div className="mt-4 pt-4 border-t border-dashed border-charcoal/10 dark:border-cream/10">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-charcoal/50 dark:text-cream/50 uppercase tracking-wider">
          <span>Capacity</span>
          <span>
            {participants.filter(p => p.isActive).length} / 6
          </span>
        </div>
        <div className="w-full bg-cream dark:bg-navy border-2 border-charcoal/20 dark:border-cream/20 rounded-sm h-3 mt-2 overflow-hidden shadow-[1px_1px_0px_0px_var(--color-shadow)]">
          <div
            className="bg-charcoal dark:bg-cream h-full transition-all duration-300"
            style={{
              width: `${(participants.filter(p => p.isActive).length / 6) * 100}%`
            }}
          ></div>
        </div>
      </div>

      {showMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowMenu(null)}
        ></div>
      )}
    </div>
  );
};

export default ParticipantsList;
