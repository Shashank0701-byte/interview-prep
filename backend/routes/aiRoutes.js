const express = require('express');
const multer = require('multer');
const { getPracticeFeedback, generateFollowUpQuestion } = require('../controllers/aiController');
// console.log("handleFollowUp:", handleFollowUp);
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Configure multer for in-memory file storage
const upload = multer({ storage: multer.memoryStorage() });

// This route will accept a form-data payload with an 'audio' file
router.post('/practice-feedback', protect, upload.single('audio'), getPracticeFeedback);

router.post('/follow-up', protect, generateFollowUpQuestion);
module.exports = router;