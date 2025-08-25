const express = require('express');
const router = express.Router();
const studyGroupController = require('../../controllers/collaborative/studyGroupController');
const { protect } = require('../../middlewares/authMiddleware');

// Create a new study group
router.post('/', protect, studyGroupController.createStudyGroup);

// Get all study groups with optional filtering
router.get('/', protect, studyGroupController.getAllStudyGroups);

// Get a specific study group by ID
router.get('/:id', protect, studyGroupController.getStudyGroupById);

// Update a study group
router.put('/:id', protect, studyGroupController.updateStudyGroup);

// Delete a study group
router.delete('/:id', protect, studyGroupController.deleteStudyGroup);

// Join a study group
router.post('/:id/join', protect, studyGroupController.joinStudyGroup);

// Leave a study group
router.post('/:id/leave', protect, studyGroupController.leaveStudyGroup);

// Request to join a private study group
router.post('/:id/request', protect, studyGroupController.requestToJoin);

// Respond to a join request
router.post('/:id/respond-request/:requestId', protect, studyGroupController.respondToJoinRequest);

// Add a resource to a study group
router.post('/:id/resources', protect, studyGroupController.addResource);

// Remove a resource from a study group
router.delete('/:id/resources/:resourceId', protect, studyGroupController.removeResource);

// Add a message to a study group
router.post('/:id/messages', protect, studyGroupController.addMessage);

// Get all messages for a study group
router.get('/:id/messages', protect, studyGroupController.getMessages);

// Invite a user to a study group
router.post('/:id/invite', protect, studyGroupController.inviteUser);

// Respond to a study group invitation
router.post('/invitations/:invitationId/respond', protect, studyGroupController.respondToInvitation);

// Get study groups created by the current user
router.get('/user/created', protect, studyGroupController.getUserCreatedGroups);

// Get study groups joined by the current user
router.get('/user/joined', protect, studyGroupController.getUserJoinedGroups);

// Get study group invitations for the current user
router.get('/user/invitations', protect, studyGroupController.getUserInvitations);

module.exports = router;