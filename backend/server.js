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
    credentials: true
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

// Collaborative feature routes
const studyGroupRoutes = require('./routes/collaborative/studyGroupRoutes');
const forumRoutes = require('./routes/collaborative/forumRoutes');
const mentorshipRoutes = require('./routes/collaborative/mentorshipRoutes');
const peerReviewRoutes = require('./routes/collaborative/peerReviewRoutes');

// Register collaborative routes
app.use('/api/collaborative/study-groups', studyGroupRoutes);
app.use('/api/collaborative/forums', forumRoutes);
app.use('/api/collaborative/mentorships', mentorshipRoutes);
app.use('/api/collaborative/peer-reviews', peerReviewRoutes);

// Debug route to test API connectivity
app.get('/api/test', (req, res) => {
    console.log('Test API endpoint hit');
    res.status(200).json({ message: 'API is working' });
});

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {}));

// Debugging middleware - logs all requests but doesn't interfere with routing
app.use((req, res, next) => {
    console.log('Request received for:', req.originalUrl);
    next();
});

// This 404 handler should only run after all other routes have been checked
app.use((req, res) => {
    console.log('No route found for:', req.originalUrl);
    res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`server running on port ${PORT}`));