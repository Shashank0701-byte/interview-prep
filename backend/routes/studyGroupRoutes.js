const express = require('express');
const router = express.Router();
const studyGroupController = require('../controllers/studyGroupController');
const { protect } = require('../middlewares/authMiddleware');

// Create a new study group
router.post('/', protect, studyGroupController.createStudyGroup);

// Get all study groups (with filtering options)
router.get('/', protect, studyGroupController.getAllStudyGroups);

// Get study groups for a specific user
router.get('/user/groups', protect, studyGroupController.getUserStudyGroups);

// Search for users to invite
router.get('/search-users', protect, studyGroupController.searchUsers);

// Get a specific study group by ID
router.get('/:id', protect, studyGroupController.getStudyGroupById);

// Join a study group
router.post('/:id/join', protect, studyGroupController.joinStudyGroup);

// Handle join requests (accept/reject)
router.post('/:id/handle-request', protect, studyGroupController.handleJoinRequest);

// Leave a study group
router.post('/:id/leave', protect, studyGroupController.leaveStudyGroup);

// Add a resource to a study group
router.post('/:id/resources', protect, studyGroupController.addResource);

// Invite a user to a study group
router.post('/:id/invite', protect, studyGroupController.inviteToStudyGroup);

// Invite a user to a study group by email
router.post('/:id/invite-by-email', protect, studyGroupController.inviteByEmail);

// Delete a study group (creator only)
router.delete('/:id', protect, studyGroupController.deleteStudyGroup);

module.exports = router;