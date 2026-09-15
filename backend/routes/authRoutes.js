const express = require("express");
const { registerUser, loginUser, getUserProfile, verifyLoginOtp } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const { verifyCaptcha } = require("../middlewares/captchaMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

// ================================
// Auth Routes
// ================================
router.post("/register", registerUser);
router.post("/login", verifyCaptcha, loginUser);
router.post("/verify-otp", verifyLoginOtp);
router.get("/profile", protect, getUserProfile);

// ================================
// Upload Image Route
// ================================
router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const streamifier = require('streamifier');
  const cloudinary = require('../config/cloudinary');

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: "interview_prep/profiles" },
    (error, result) => {
      if (error) {
        console.error("Cloudinary upload error:", error);
        return res.status(500).json({ message: "Upload failed" });
      }
      return res.status(200).json({ imageUrl: result.secure_url });
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
});

module.exports = router;
