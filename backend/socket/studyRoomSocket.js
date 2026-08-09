const StudyRoom = require('../models/StudyRoom');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

class StudyRoomSocket {
  constructor(io) {
    this.io = io;
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) return next(new Error('Authentication required'));
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('name');
        if (!user) return next(new Error('User not found'));
        socket.userId = decoded.id;
        socket.username = user.name;
        next();
      } catch (err) {
        next(new Error('Invalid token'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Join study room
      socket.on('join-room', async (data) => {
        try {
          const { roomId } = data;

          const room = await StudyRoom.findOne({ roomId }).populate('participants.userId', 'username');
          if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
          }

          // Check if user is already in the room
          const existingParticipant = room.participants.find(p => p.userId.toString() === socket.userId.toString());
          const wasAlreadyActive = existingParticipant && existingParticipant.isActive;

          // Check if room is full (but allow existing participants to rejoin)
          if (!existingParticipant && room.participantCount >= room.maxParticipants) {
            socket.emit('error', { message: 'Room is full' });
            return;
          }

          // Add user to room (or reactivate if they were inactive)
          await room.addParticipant(socket.userId, socket.username);

          // Reload room to get updated participant count
          const updatedRoom = await StudyRoom.findOne({ roomId }).populate('participants.userId', 'username');

          // Join socket room
          socket.join(roomId);
          socket.roomId = roomId;

          // Only notify others if this is a new join (not a refresh/reconnect)
          if (!wasAlreadyActive) {
            socket.to(roomId).emit('user-joined', {
              userId: socket.userId,
              username: socket.username,
              participantCount: updatedRoom.participantCount
            });

            // Add system message only for new joins
            await updatedRoom.addChatMessage(socket.userId, socket.username, `${socket.username} joined the room`, 'system');
            socket.to(roomId).emit('chat-message', {
              userId: socket.userId,
              username: socket.username,
              message: `${socket.username} joined the room`,
              type: 'system',
              timestamp: new Date()
            });
          }

          // Send room state to user (always, even on refresh)
          socket.emit('room-state', {
            room: {
              roomId: updatedRoom.roomId,
              name: updatedRoom.name,
              participants: updatedRoom.participants.filter(p => p.isActive),
              sharedCode: updatedRoom.sharedCode,
              whiteboard: updatedRoom.whiteboard,
              currentSession: updatedRoom.currentSession,
              chat: updatedRoom.chat.slice(-20), // Last 20 messages
              settings: updatedRoom.settings
            }
          });

        } catch (error) {
          console.error('Join room error:', error);
          socket.emit('error', { message: 'Failed to join room' });
        }
      });

      // Leave study room
      socket.on('leave-room', async () => {
        if (socket.roomId && socket.userId) {
          try {
            const room = await StudyRoom.findOne({ roomId: socket.roomId });
            if (room) {
              await room.removeParticipant(socket.userId);
              
              socket.to(socket.roomId).emit('user-left', {
                userId: socket.userId,
                username: socket.username,
                participantCount: room.participantCount - 1
              });

              // Add system message
              await room.addChatMessage(socket.userId, socket.username, `${socket.username} left the room`, 'system');
              socket.to(socket.roomId).emit('chat-message', {
                userId: socket.userId,
                username: socket.username,
                message: `${socket.username} left the room`,
                type: 'system',
                timestamp: new Date()
              });
            }
            
            socket.leave(socket.roomId);
          } catch (error) {
            console.error('Leave room error:', error);
          }
        }
      });

      // Handle code changes
      socket.on('code-change', async (data) => {
        if (!socket.roomId || !socket.userId) return;

        try {
          const { content, language, cursor } = data;
          
          const room = await StudyRoom.findOne({ roomId: socket.roomId });
          if (room && room.settings.allowCodeEditing) {
            await room.updateCode(content, socket.userId);
            
            // Broadcast to other users
            socket.to(socket.roomId).emit('code-updated', {
              content,
              language,
              modifiedBy: {
                userId: socket.userId,
                username: socket.username
              },
              cursor,
              timestamp: new Date()
            });
          }
        } catch (error) {
          console.error('Code change error:', error);
        }
      });

      // Handle cursor movement
      socket.on('cursor-move', (data) => {
        if (!socket.roomId) return;
        
        socket.to(socket.roomId).emit('cursor-updated', {
          userId: socket.userId,
          username: socket.username,
          cursor: data.cursor,
          selection: data.selection
        });
      });

      // Handle whiteboard changes
      socket.on('whiteboard-change', async (data) => {
        if (!socket.roomId || !socket.userId) return;

        try {
          const { content } = data;
          
          const room = await StudyRoom.findOne({ roomId: socket.roomId });
          if (room && room.settings.allowWhiteboard) {
            room.whiteboard.content = content;
            room.whiteboard.lastModified.by = socket.userId;
            room.whiteboard.lastModified.at = new Date();
            await room.save();
            
            socket.to(socket.roomId).emit('whiteboard-updated', {
              content,
              modifiedBy: {
                userId: socket.userId,
                username: socket.username
              },
              timestamp: new Date()
            });
          }
        } catch (error) {
          console.error('Whiteboard change error:', error);
        }
      });

      // Handle chat messages
      socket.on('chat-message', async (data) => {
        if (!socket.roomId || !socket.userId) return;

        try {
          const { message } = data;
          
          const room = await StudyRoom.findOne({ roomId: socket.roomId });
          if (room) {
            await room.addChatMessage(socket.userId, socket.username, message);
            
            // Broadcast to all users in room
            this.io.to(socket.roomId).emit('chat-message', {
              userId: socket.userId,
              username: socket.username,
              message,
              type: 'message',
              timestamp: new Date()
            });
          }
        } catch (error) {
          console.error('Chat message error:', error);
        }
      });

      // Handle session changes
      socket.on('change-session', async (data) => {
        if (!socket.roomId || !socket.userId) return;

        try {
          const { sessionId, questionIndex } = data;
          
          const room = await StudyRoom.findOne({ roomId: socket.roomId });
          if (room && room.host.toString() === socket.userId) {
            room.currentSession.sessionId = sessionId;
            room.currentSession.questionIndex = questionIndex || 0;
            room.currentSession.startedAt = new Date();
            room.currentSession.isActive = true;
            await room.save();
            
            // Broadcast session change
            socket.to(socket.roomId).emit('session-changed', {
              sessionId,
              questionIndex: questionIndex || 0,
              changedBy: {
                userId: socket.userId,
                username: socket.username
              }
            });

            // Add system message
            await room.addChatMessage(socket.userId, socket.username, `Session changed by ${socket.username}`, 'question_change');
            this.io.to(socket.roomId).emit('chat-message', {
              userId: socket.userId,
              username: socket.username,
              message: `Session changed by ${socket.username}`,
              type: 'question_change',
              timestamp: new Date()
            });
          }
        } catch (error) {
          console.error('Session change error:', error);
        }
      });

      // Handle question navigation
      socket.on('navigate-question', async (data) => {
        if (!socket.roomId || !socket.userId) return;

        try {
          const { questionIndex, direction } = data;
          
          const room = await StudyRoom.findOne({ roomId: socket.roomId });
          if (room && room.host.toString() === socket.userId) {
            room.currentSession.questionIndex = questionIndex;
            await room.save();
            
            socket.to(socket.roomId).emit('question-navigated', {
              questionIndex,
              direction,
              navigatedBy: {
                userId: socket.userId,
                username: socket.username
              }
            });
          }
        } catch (error) {
          console.error('Question navigation error:', error);
        }
      });

      // Handle typing indicators
      socket.on('typing-start', () => {
        if (!socket.roomId) return;
        socket.to(socket.roomId).emit('user-typing', {
          userId: socket.userId,
          username: socket.username,
          isTyping: true
        });
      });

      socket.on('typing-stop', () => {
        if (!socket.roomId) return;
        socket.to(socket.roomId).emit('user-typing', {
          userId: socket.userId,
          username: socket.username,
          isTyping: false
        });
      });

      // Handle disconnect
      socket.on('disconnect', async () => {
        console.log(`User disconnected: ${socket.id}`);
        
        if (socket.roomId && socket.userId) {
          try {
            const room = await StudyRoom.findOne({ roomId: socket.roomId });
            if (room) {
              await room.removeParticipant(socket.userId);
              
              socket.to(socket.roomId).emit('user-left', {
                userId: socket.userId,
                username: socket.username,
                participantCount: room.participantCount - 1
              });

              // Add system message
              await room.addChatMessage(socket.userId, socket.username, `${socket.username} disconnected`, 'system');
              socket.to(socket.roomId).emit('chat-message', {
                userId: socket.userId,
                username: socket.username,
                message: `${socket.username} disconnected`,
                type: 'system',
                timestamp: new Date()
              });
            }
          } catch (error) {
            console.error('Disconnect error:', error);
          }
        }
      });
    });
  }
}

module.exports = StudyRoomSocket;
