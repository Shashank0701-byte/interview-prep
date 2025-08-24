const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const { protect } = require('../middlewares/authMiddleware');

// Forum routes
// Create a new forum
router.post('/', protect, forumController.createForum);

// Get all forums (with filtering options)
router.get('/', protect, forumController.getAllForums);

// Get a specific forum by ID with its posts
router.get('/:id', protect, forumController.getForumById);

// Create a new post in a forum
router.post('/:id/posts', protect, forumController.createPost);

// Update a forum (creator only)
router.put('/:id', protect, forumController.updateForum);

// Delete a forum (creator only)
router.delete('/:id', protect, forumController.deleteForum);

// Post routes
// Get a specific post with its comments
router.get('/posts/:postId', protect, forumController.getPostWithComments);

// Add a comment to a post
router.post('/posts/:postId/comments', protect, forumController.addComment);

// Upvote a post
router.post('/posts/:postId/upvote', protect, forumController.upvotePost);

// Update a post (author only)
router.put('/posts/:postId', protect, forumController.updatePost);

// Delete a post (author only)
router.delete('/posts/:postId', protect, forumController.deletePost);

// Get user's posts
router.get('/user/posts', protect, forumController.getUserPosts);

module.exports = router;