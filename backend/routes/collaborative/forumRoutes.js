const express = require('express');
const router = express.Router();
const forumController = require('../../controllers/collaborative/forumController');
const { protect } = require('../../middlewares/authMiddleware');

// Get forum categories - These specific routes must come before routes with path parameters
router.get('/categories', protect, forumController.getForumCategories);

// Get popular tags
router.get('/tags/popular', protect, forumController.getPopularTags);

// Get user's forum activity
router.get('/user/activity', protect, forumController.getUserForumActivity);

// Create a new forum
router.post('/', protect, forumController.createForum);

// Get all forums with optional filtering
router.get('/', protect, forumController.getAllForums);

// Get a specific forum by ID
router.get('/:id', protect, forumController.getForumById);

// Update a forum
router.put('/:id', protect, forumController.updateForum);

// Delete a forum
router.delete('/:id', protect, forumController.deleteForum);

// Create a new post in a forum
router.post('/:id/posts', protect, forumController.createPost);

// Create a reply to a post
router.post('/:forumId/posts/:postId/replies', protect, forumController.createReply);

// Update a post
router.put('/:forumId/posts/:postId', protect, forumController.updatePost);

// Delete a post
router.delete('/:forumId/posts/:postId', protect, forumController.deletePost);

// Upvote or remove upvote from a post
router.post('/:forumId/posts/:postId/upvote', protect, forumController.toggleUpvote);

module.exports = router;