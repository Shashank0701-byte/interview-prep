const express = require("express");
const router = express.Router();
const {
    createRoadmapSession,
    getPhaseRoadmapSessions,
    getMyRoadmapSessions,
    getRoadmapSessionById,
    deleteRoadmapSession,
    updateRoadmapSessionRating,
    updateRoadmapSessionProgress,
} = require("../controllers/roadmapSessionController");
const { protect } = require("../middlewares/authMiddleware");

// @desc    Create a new roadmap session
// @route   POST /api/roadmap-sessions/create
// @access  Private
router.post("/create", protect, createRoadmapSession);

// @desc    Get roadmap sessions for a specific phase
// @route   GET /api/roadmap-sessions/phase/:role/:phaseId
// @access  Private
router.get("/phase/:role/:phaseId", protect, getPhaseRoadmapSessions);

// @desc    Get all user's roadmap sessions
// @route   GET /api/roadmap-sessions/my-sessions
// @access  Private
router.get("/my-sessions", protect, getMyRoadmapSessions);

// @desc    Get roadmap session by ID
// @route   GET /api/roadmap-sessions/:id
// @access  Private
router.get("/:id", protect, getRoadmapSessionById);

// @desc    Delete roadmap session
// @route   DELETE /api/roadmap-sessions/:id
// @access  Private
router.delete("/:id", protect, deleteRoadmapSession);

// @desc    Update roadmap session rating
// @route   PUT /api/roadmap-sessions/:id/rating
// @access  Private
router.put("/:id/rating", protect, updateRoadmapSessionRating);

// @desc    Update roadmap session progress
// @route   PUT /api/roadmap-sessions/:id/progress
// @access  Private
router.put("/:id/progress", protect, updateRoadmapSessionProgress);

module.exports = router;
