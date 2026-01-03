const express = require("express");
const { registerUser, loginUser, getUserProfile } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

// ================================
// Auth Routes
// ================================
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);

// ================================
// Upload Image Route
// ================================
router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  /**
   * Determine the backend URL.
   * 
   * For Render (production):
   *    - MUST use process.env.BACKEND_URL
   * 
   * For Local Development:
   *    - Fall back to req.protocol://host
   */
  let backendUrl = process.env.BACKEND_URL;

  // If running locally OR missing env var → fallback
  if (!backendUrl) {
    backendUrl = `${req.protocol}://${req.get("host")}`;
  }

  // Ensure no trailing slash in BACKEND_URL
  backendUrl = backendUrl.replace(/\/$/, "");

  // Build the public image URL
  const imageUrl = `${backendUrl}/uploads/${req.file.filename}`;

  return res.status(200).json({ imageUrl });
});

module.exports = router;
