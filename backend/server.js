require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./config/db");

const StudyRoomSocket = require("./socket/studyRoomSocket");

// Normal backend routes
const aiRoutes = require("./routes/aiRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const questionRoutes = require("./routes/questionRoutes");
const companyRoutes = require("./routes/companyRoutes");
const aiInterviewRoutes = require("./routes/aiInterviewRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");
const learningPathRoutes = require("./routes/learningPathRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const roadmapSessionRoutes = require("./routes/roadmapSessionRoutes");
const studyRoomRoutes = require("./routes/studyRoomRoutes");
const aiInterviewCoachRoutes = require("./routes/aiInterviewCoachRoutes");
const salaryNegotiationRoutes = require("./routes/salaryNegotiationRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

const { protect } = require("./middlewares/authMiddleware");
const { generateInterviewQuestions } = require("./controllers/aiController");

// AI RAG Chat routes (Python FastAPI integration)
const chatAIRoutes = require("../ai-training/nodejs-integration/chat-routes");

const app = express();
const server = http.createServer(app);

// Logging frontend URL
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

// --- CORS CONFIG ---
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://interview-prep-karo.netlify.app",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Connect db
connectDB();

// SOCKET.IO INITIALIZATION
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://interview-prep-karo.netlify.app",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true,
  },
});
new StudyRoomSocket(io);

// Middlewares
app.use(express.json());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log("[REQUEST]", req.method, req.originalUrl);
  next();
});

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ------------------- API ROUTES -------------------
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/ai-interview", aiInterviewRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/learning-path", learningPathRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/roadmap-sessions", roadmapSessionRoutes);
app.use("/api/study-rooms", studyRoomRoutes);
app.use("/api/ai-interview-coach", aiInterviewCoachRoutes);
app.use("/api/salary-negotiation", salaryNegotiationRoutes);
app.use("/api/ai/generate-questions", protect, generateInterviewQuestions);
app.use("/api/feedback", feedbackRoutes);

// --- AI CHAT ROUTES (IMPORTANT FIX) ---
// OLD ❌ app.use("/", chatAIRoutes)
app.use("/api/ai", chatAIRoutes);

// -------------------- HEALTH ROUTES --------------------
app.get("/", (req, res) => {
  res.json({
    message: "Backend running",
    status: "healthy",
    ts: Date.now(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    message: "OK",
    status: "healthy",
    ts: Date.now(),
  });
});

// 404 Handler
app.use((req, res) => {
  console.log("404:", req.originalUrl);
  res.status(404).json({ error: "Route not found", path: req.originalUrl });
});

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} with Socket.IO`)
);
