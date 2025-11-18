require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");

const connectDB = require("./config/db");
const StudyRoomSocket = require("./socket/studyRoomSocket");

// MAIN ROUTES
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

const app = express();
const server = http.createServer(app);

console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

/* -------------------------
   CORS
-------------------------- */
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            process.env.FRONTEND_URL,
            "https://interview-prep-karo.netlify.app"
        ].filter(Boolean),
        credentials: true
    })
);

/* -------------------------
   DATABASE
-------------------------- */
connectDB();

/* -------------------------
   SOCKET.IO
-------------------------- */
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true
    }
});
new StudyRoomSocket(io);

/* -------------------------
   MIDDLEWARE
-------------------------- */
app.use(express.json());

/* -------------------------
   STATIC
-------------------------- */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* -------------------------
   API ROUTES
-------------------------- */
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

/* -------------------------
   🧠 RAG AI ROUTES
-------------------------- */
app.use("/api/ai", aiRoutes);

/* -------------------------
   HEALTH
-------------------------- */
app.get("/", (req, res) => {
    res.json({ message: "Backend running", healthy: true, ts: Date.now() });
});

/* -------------------------
   404
-------------------------- */
app.use((req, res) => {
    res.status(404).json({ error: "Route not found", path: req.originalUrl });
});

/* -------------------------
   START SERVER
-------------------------- */
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
