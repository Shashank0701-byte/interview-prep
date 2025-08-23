const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
    createLearningPath,
    getLearningPath,
    updateSkillProgress,
    getSkillRecommendations,
    completeLearningItem
} = require('../controllers/learningPathController');

const router = express.Router();

// All routes are protected
router.use(protect);

// Create or update learning path
router.post('/create', createLearningPath);

// Get user's learning path
router.get('/', getLearningPath);

// Update skill progress
router.put('/skill/:skillName', updateSkillProgress);

// Get skill recommendations
router.get('/recommendations', getSkillRecommendations);

// Complete a learning item (resource or practice)
router.put('/complete-item', completeLearningItem);

module.exports = router;
