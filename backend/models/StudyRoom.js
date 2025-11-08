const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['host', 'participant'],
    default: 'participant'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  cursor: {
    line: { type: Number, default: 0 },
    column: { type: Number, default: 0 }
  }
});

const studyRoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [participantSchema],
  maxParticipants: {
    type: Number,
    default: 6,
    min: 2,
    max: 10
  },
  currentSession: {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session'
    },
    questionIndex: {
      type: Number,
      default: 0
    },
    startedAt: Date,
    isActive: {
      type: Boolean,
      default: false
    }
  },
  topic: {
    type: String,
    default: 'javascript'
  },
  questions: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  sharedCode: {
    content: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: 'javascript'
    },
    lastModified: {
      by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      at: {
        type: Date,
        default: Date.now
      }
    }
  },
  whiteboard: {
    content: {
      type: String,
      default: ''
    },
    lastModified: {
      by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      at: {
        type: Date,
        default: Date.now
      }
    }
  },
  chat: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['message', 'system', 'code_share', 'question_change'],
      default: 'message'
    }
  }],
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowCodeEditing: {
      type: Boolean,
      default: true
    },
    allowWhiteboard: {
      type: Boolean,
      default: true
    },
    allowVoiceChat: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'paused', 'completed', 'archived'],
    default: 'waiting'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
});

// Indexes for performance
studyRoomSchema.index({ roomId: 1 });
studyRoomSchema.index({ host: 1 });
studyRoomSchema.index({ 'participants.userId': 1 });
studyRoomSchema.index({ createdAt: -1 });
studyRoomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for participant count
studyRoomSchema.virtual('participantCount').get(function() {
  return this.participants.filter(p => p.isActive).length;
});

// Methods
studyRoomSchema.methods.addParticipant = function(userId, username, role = 'participant') {
  const existingParticipant = this.participants.find(p => p.userId.toString() === userId.toString());
  
  if (existingParticipant) {
    existingParticipant.isActive = true;
    existingParticipant.joinedAt = new Date();
  } else {
    this.participants.push({
      userId,
      username,
      role,
      isActive: true
    });
  }
  
  this.lastActivity = new Date();
  return this.save();
};

studyRoomSchema.methods.removeParticipant = function(userId) {
  const participant = this.participants.find(p => p.userId.toString() === userId.toString());
  if (participant) {
    participant.isActive = false;
  }
  this.lastActivity = new Date();
  return this.save();
};

// Clean up inactive participants (remove all inactive participants immediately)
studyRoomSchema.methods.cleanupInactiveParticipants = function() {
  // Simply remove all inactive participants
  // Active participants are those currently connected via socket
  this.participants = this.participants.filter(p => p.isActive === true);
  
  this.lastActivity = new Date();
  return this.save();
};

studyRoomSchema.methods.updateCode = function(content, userId) {
  this.sharedCode.content = content;
  this.sharedCode.lastModified.by = userId;
  this.sharedCode.lastModified.at = new Date();
  this.lastActivity = new Date();
  return this.save();
};

studyRoomSchema.methods.addChatMessage = function(userId, username, message, type = 'message') {
  this.chat.push({
    userId,
    username,
    message,
    type,
    timestamp: new Date()
  });
  
  // Keep only last 100 messages
  if (this.chat.length > 100) {
    this.chat = this.chat.slice(-100);
  }
  
  this.lastActivity = new Date();
  return this.save();
};

// Generate unique room ID
studyRoomSchema.statics.generateRoomId = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

module.exports = mongoose.model('StudyRoom', studyRoomSchema);
