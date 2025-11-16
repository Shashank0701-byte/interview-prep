const express = require('express');
const router = express.Router();
const { generateRoadmap, getAvailableRoles, getRoadmapProgress } = require('../controllers/roadmapController');
const { protect } = require('../middlewares/authMiddleware');

// All routes are protected
router.use(protect);

// @route   GET /api/roadmap/roles
// @desc    Get available roles for roadmaps
// @access  Private
router.get('/roles', getAvailableRoles);

// @route   GET /api/roadmap/progress
// @desc    Get user's roadmap progress summary
// @access  Private
router.get('/progress', getRoadmapProgress);

// @route   GET /api/roadmap/:role
// @desc    Generate role-specific roadmap
// @access  Private
router.get('/:role', generateRoadmap);

module.exports = router;
