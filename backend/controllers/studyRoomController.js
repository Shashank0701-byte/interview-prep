const StudyRoom = require('../models/StudyRoom');
const Session = require('../models/Session');
const User = require('../models/User');

// Create a new study room
const createStudyRoom = async (req, res) => {
  try {
    const { name, description, maxParticipants, settings, topic } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Generate unique room ID
    let roomId;
    let isUnique = false;
    while (!isUnique) {
      roomId = StudyRoom.generateRoomId();
      const existingRoom = await StudyRoom.findOne({ roomId });
      if (!existingRoom) isUnique = true;
    }

    const studyRoom = new StudyRoom({
      roomId,
      name,
      description,
      host: userId,
      topic: topic || name || 'javascript',
      maxParticipants: maxParticipants || 6,
      settings: {
        isPublic: settings?.isPublic || false,
        allowCodeEditing: settings?.allowCodeEditing !== false,
        allowWhiteboard: settings?.allowWhiteboard !== false,
        allowVoiceChat: settings?.allowVoiceChat !== false,
        requireApproval: settings?.requireApproval || false
      }
    });

    // Add host as first participant
    studyRoom.participants.push({
      userId,
      username: user.name,
      role: 'host',
      isActive: true
    });

    await studyRoom.save();

    res.status(201).json({
      success: true,
      data: {
        roomId: studyRoom.roomId,
        name: studyRoom.name,
        description: studyRoom.description,
        host: {
          id: userId,
          username: user.username
        },
        maxParticipants: studyRoom.maxParticipants,
        settings: studyRoom.settings,
        inviteLink: `${process.env.FRONTEND_URL}/study-room/${studyRoom.roomId}`,
        createdAt: studyRoom.createdAt
      }
    });
  } catch (error) {
    console.error('Create study room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create study room'
    });
  }
};

// Get study room details
const getStudyRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const studyRoom = await StudyRoom.findOne({ roomId })
      .populate('host', 'username')
      .populate('participants.userId', 'username')
      .populate('currentSession.sessionId');

    if (!studyRoom) {
      return res.status(404).json({
        success: false,
        message: 'Study room not found'
      });
    }

    // Check if room has expired
    if (studyRoom.expiresAt < new Date()) {
      return res.status(410).json({
        success: false,
        message: 'Study room has expired'
      });
    }

    res.json({
      success: true,
      data: {
        roomId: studyRoom.roomId,
        name: studyRoom.name,
        description: studyRoom.description,
        host: studyRoom.host,
        participants: studyRoom.participants.filter(p => p.isActive),
        participantCount: studyRoom.participantCount,
        maxParticipants: studyRoom.maxParticipants,
        currentSession: studyRoom.currentSession,
        settings: studyRoom.settings,
        status: studyRoom.status,
        createdAt: studyRoom.createdAt,
        lastActivity: studyRoom.lastActivity,
        topic: studyRoom.topic,
        questions: studyRoom.questions,
        sharedCode: studyRoom.sharedCode,
        whiteboard: studyRoom.whiteboard,
        chat: studyRoom.chat
      }
    });
  } catch (error) {
    console.error('Get study room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get study room'
    });
  }
};

// Join study room
const joinStudyRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;
    const user = await User.findById(userId);

    const studyRoom = await StudyRoom.findOne({ roomId });
    
    if (!studyRoom) {
      return res.status(404).json({
        success: false,
        message: 'Study room not found'
      });
    }

    // Check if room has expired
    if (studyRoom.expiresAt < new Date()) {
      return res.status(410).json({
        success: false,
        message: 'Study room has expired'
      });
    }

    // Check if room is full
    if (studyRoom.participantCount >= studyRoom.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Study room is full'
      });
    }

    // Add participant
    await studyRoom.addParticipant(userId, user.name);

    res.json({
      success: true,
      message: 'Successfully joined study room',
      data: {
        roomId: studyRoom.roomId,
        participantCount: studyRoom.participantCount
      }
    });
  } catch (error) {
    console.error('Join study room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join study room'
    });
  }
};

// Leave study room
const leaveStudyRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const studyRoom = await StudyRoom.findOne({ roomId });
    
    if (!studyRoom) {
      return res.status(404).json({
        success: false,
        message: 'Study room not found'
      });
    }

    await studyRoom.removeParticipant(userId);

    res.json({
      success: true,
      message: 'Successfully left study room'
    });
  } catch (error) {
    console.error('Leave study room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave study room'
    });
  }
};

// Update study room settings
const updateStudyRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;
    const { name, description, settings, maxParticipants } = req.body;

    const studyRoom = await StudyRoom.findOne({ roomId });
    
    if (!studyRoom) {
      return res.status(404).json({
        success: false,
        message: 'Study room not found'
      });
    }

    // Check if user is host
    if (studyRoom.host.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the host can update room settings'
      });
    }

    // Update fields
    if (name) studyRoom.name = name;
    if (description !== undefined) studyRoom.description = description;
    if (maxParticipants) studyRoom.maxParticipants = maxParticipants;
    if (settings) {
      studyRoom.settings = { ...studyRoom.settings, ...settings };
    }

    await studyRoom.save();

    res.json({
      success: true,
      message: 'Study room updated successfully',
      data: {
        roomId: studyRoom.roomId,
        name: studyRoom.name,
        description: studyRoom.description,
        settings: studyRoom.settings,
        maxParticipants: studyRoom.maxParticipants
      }
    });
  } catch (error) {
    console.error('Update study room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update study room'
    });
  }
};

// Get user's study rooms
const getUserStudyRooms = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type = 'all', limit = 10, page = 1 } = req.query;

    let query = {};
    
    if (type === 'hosted') {
      query.host = userId;
    } else if (type === 'joined') {
      query['participants.userId'] = userId;
      query.host = { $ne: userId };
    } else {
      // All rooms user is involved in
      query.$or = [
        { host: userId },
        { 'participants.userId': userId }
      ];
    }

    const studyRooms = await StudyRoom.find(query)
      .populate('host', 'username')
      .populate('currentSession.sessionId', 'name')
      .sort({ lastActivity: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await StudyRoom.countDocuments(query);

    res.json({
      success: true,
      data: {
        studyRooms: studyRooms.map(room => ({
          roomId: room.roomId,
          name: room.name,
          description: room.description,
          host: room.host,
          participantCount: room.participantCount,
          maxParticipants: room.maxParticipants,
          currentSession: room.currentSession,
          status: room.status,
          createdAt: room.createdAt,
          lastActivity: room.lastActivity
        })),
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: studyRooms.length,
          totalRooms: total
        }
      }
    });
  } catch (error) {
    console.error('Get user study rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get study rooms'
    });
  }
};

// Delete study room
const deleteStudyRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const studyRoom = await StudyRoom.findOne({ roomId });
    
    if (!studyRoom) {
      return res.status(404).json({
        success: false,
        message: 'Study room not found'
      });
    }

    // Check if user is host
    if (studyRoom.host.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the host can delete the room'
      });
    }

    await StudyRoom.deleteOne({ roomId });

    res.json({
      success: true,
      message: 'Study room deleted successfully'
    });
  } catch (error) {
    console.error('Delete study room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete study room'
    });
  }
};

// Set current session for room
const setRoomSession = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { sessionId } = req.body;
    const userId = req.user._id;

    const studyRoom = await StudyRoom.findOne({ roomId });
    
    if (!studyRoom) {
      return res.status(404).json({
        success: false,
        message: 'Study room not found'
      });
    }

    // Check if user is host
    if (studyRoom.host.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the host can change the session'
      });
    }

    // Verify session exists and belongs to host
    const session = await Session.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or not accessible'
      });
    }

    studyRoom.currentSession.sessionId = sessionId;
    studyRoom.currentSession.questionIndex = 0;
    studyRoom.currentSession.startedAt = new Date();
    studyRoom.currentSession.isActive = true;
    studyRoom.status = 'active';

    await studyRoom.save();

    res.json({
      success: true,
      message: 'Session set successfully',
      data: {
        currentSession: studyRoom.currentSession
      }
    });
  } catch (error) {
    console.error('Set room session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set session'
    });
  }
};

// Update room questions
const updateRoomQuestions = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { questions } = req.body;
    const userId = req.user._id;

    const studyRoom = await StudyRoom.findOne({ roomId });

    if (!studyRoom) {
      return res.status(404).json({
        success: false,
        message: 'Study room not found'
      });
    }

    // Only host can update questions
    if (studyRoom.host.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the host can update questions'
      });
    }

    studyRoom.questions = questions;
    studyRoom.lastActivity = new Date();
    await studyRoom.save();

    res.status(200).json({
      success: true,
      message: 'Questions updated successfully',
      data: {
        questions: studyRoom.questions
      }
    });
  } catch (error) {
    console.error('Update room questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update questions'
    });
  }
};

module.exports = {
  createStudyRoom,
  getStudyRoom,
  joinStudyRoom,
  leaveStudyRoom,
  updateStudyRoom,
  getUserStudyRooms,
  deleteStudyRoom,
  setRoomSession,
  updateRoomQuestions
};
