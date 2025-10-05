const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  createStudyRoom,
  getStudyRoom,
  joinStudyRoom,
  leaveStudyRoom,
  updateStudyRoom,
  getUserStudyRooms,
  deleteStudyRoom,
  setRoomSession
} = require('../controllers/studyRoomController');

// Create a new study room
router.post('/create', protect, createStudyRoom);

// Get user's study rooms
router.get('/my-rooms', protect, getUserStudyRooms);

// Get study room details
router.get('/:roomId', protect, getStudyRoom);

// Join study room
router.post('/:roomId/join', protect, joinStudyRoom);

// Leave study room
router.post('/:roomId/leave', protect, leaveStudyRoom);

// Update study room settings (host only)
router.put('/:roomId', protect, updateStudyRoom);

// Delete study room (host only)
router.delete('/:roomId', protect, deleteStudyRoom);

// Set current session for room (host only)
router.post('/:roomId/session', protect, setRoomSession);

module.exports = router;
