const express = require('express');
const multer = require('multer');
const { getPracticeFeedback } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Configure multer for in-memory file storage
const upload = multer({ storage: multer.memoryStorage() });

// This route will accept a form-data payload with an 'audio' file
router.post('/practice-feedback', protect, upload.single('audio'), getPracticeFeedback);

module.exports = router;