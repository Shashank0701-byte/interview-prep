require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
// const { connect } = require("http2");
const connectDB = require("./config/db");
const aiRoutes = require("./routes/aiRoutes");
const analyticsRoutes = require('./routes/analyticsRoutes');
const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const questionRoutes = require("./routes/questionRoutes");
const companyRoutes = require("./routes/companyRoutes");
const aiInterviewRoutes = require("./routes/aiInterviewRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");
const learningPathRoutes = require("./routes/learningPathRoutes");
const {protect} = require("./middlewares/authMiddleware");
const { generateInterviewQuestions, generateConceptExplanation } = require("./controllers/aiController");
const feedbackRoutes = require('./routes/feedbackRoutes');
const app = express();

// Middleware to handle CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

connectDB()

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/questions", questionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/ai-interview", aiInterviewRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/learning-path", learningPathRoutes);
app.use("/api/ai/generate-questions", protect, generateInterviewQuestions);
app.use('/api/feedback', feedbackRoutes);
app.use("/api/ai", aiRoutes);

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {}));

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`server running on port ${PORT}`));