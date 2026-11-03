const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
    listCodingTasks,
    getCodingTask,
    getCodingAttempt,
    saveCodingAttempt,
    generateCodingTask,
    chatCodingTask,
    runCodingTask,
} = require("../controllers/codingTaskController");

const router = express.Router();

router.get("/", protect, listCodingTasks);
router.get("/:id/attempt", protect, getCodingAttempt);
router.put("/:id/attempt", protect, saveCodingAttempt);
router.post("/:id/generate", protect, generateCodingTask);
router.post("/:id/chat", protect, chatCodingTask);
router.post("/:id/run", protect, runCodingTask);
router.get("/:id", protect, getCodingTask);

module.exports = router;
