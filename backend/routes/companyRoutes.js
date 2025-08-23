const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
    getAllCompanies,
    getCompanyById,
    getCompanyQuestions,
    addCompanyQuestion,
    searchCompanies,
    getCompanyStats
} = require('../controllers/companyController');

const router = express.Router();

// Public routes
router.get('/', getAllCompanies);
router.get('/search', searchCompanies);
router.get('/:id', getCompanyById);
router.get('/:id/questions', getCompanyQuestions);
router.get('/:id/stats', getCompanyStats);

// Protected routes
router.post('/:id/questions', protect, addCompanyQuestion);

module.exports = router;
