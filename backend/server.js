// ./server.js
require("dotenv").config();

// Render's network has no outbound IPv6 route. Since Node 18, DNS resolution
// order can return the AAAA (IPv6) record first ("Happy Eyeballs"), so any
// outbound connection to a dual-stack host can pick the unreachable IPv6
// address and fail with ENETUNREACH before ever trying IPv4. Force
// IPv4-first resolution app-wide for anything using Node's built-in resolver
// (Mongo driver, fetch/undici, etc). OTP email delivery no longer goes over
// raw SMTP (see utils/emailService.js) so it isn't affected either way.
require("dns").setDefaultResultOrder("ipv4first");

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

const app = express();
const server = http.createServer(app);

// Health check — registered before CORS so monitors and cron pings are never blocked
app.get("/api/health", (req, res) => res.status(200).json({ status: "ok" }));

const FRONTEND_URL = process.env.FRONTEND_URL || null;
console.log("FRONTEND_URL:", FRONTEND_URL);

/* -------------------------
   CORS
-------------------------- */
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "https://interview-prep-karo.netlify.app",
  FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // No Origin header = not a browser cross-origin request (direct nav, curl,
      // health monitors, server-to-server). CORS doesn't apply to these — let them through.
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("CORS policy: origin not allowed"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
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
app.use("/api/feedback", feedbackRoutes);

// 🧠 RAG + legacy AI endpoints
app.use("/api/ai", aiRoutes);

/* -------------------------
   HEALTH
-------------------------- */
app.get("/", (_req, res) => {
  res.json({ message: "Backend running", healthy: true, ts: Date.now() });
});

app.get("/api/health", (_req, res) =>
  res.json({ message: "OK", status: "healthy", ts: Date.now() })
);

/* -------------------------
   404
-------------------------- */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found", path: req.originalUrl });
});

/* -------------------------
   GLOBAL ERROR HANDLER (MUST BE LAST)
-------------------------- */
app.use((err, req, res, _next) => {
  console.error("🔥 Unhandled error:", err?.message || err);
  if (err?.stack) console.error(err.stack);

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.status(err?.status || 500).json({
    message: err?.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err?.stack : undefined,
  });
});

/* -------------------------
   PROCESS CRASH PREVENTION
-------------------------- */
process.on("unhandledRejection", (reason, promise) => {
  console.error("🚨 Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error?.message, error?.stack);
});

/* -------------------------
   START SERVER
-------------------------- */
const PORT = process.env.PORT || 8000;
server.listen(PORT, () =>
  console.log(`🚀 Backend running on port ${PORT}`)
);
