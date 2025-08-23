const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
    getDashboardOverview,
    getCandidateInsights,
    getCandidateProfile,
    getCompanyAnalytics
} = require('../controllers/recruiterController');

const router = express.Router();

// All routes are protected
router.use(protect);

// Get recruiter dashboard overview
router.get('/dashboard', getDashboardOverview);

// Get candidate insights and performance
router.get('/candidates', getCandidateInsights);

// Get detailed candidate profile
router.get('/candidates/:candidateId', getCandidateProfile);

// Get company analytics and insights
router.get('/analytics', getCompanyAnalytics);

module.exports = router;
