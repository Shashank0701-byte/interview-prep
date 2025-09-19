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
    origin: [
      "http://localhost:5173", 
      "http://localhost:5174", 
      "http://localhost:5175", 
      "http://localhost:5176", 
      "http://localhost:3000", 
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://127.0.0.1:5175",
      "http://127.0.0.1:5176"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

connectDB()

// Middleware
app.use(express.json());

// Debugging middleware - logs all requests but doesn't interfere with routing
app.use((req, res, next) => {
    console.log('Request received for:', req.method, req.originalUrl);
    next();
});

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {}));

// Debug route to test API connectivity
app.get('/api/test', (req, res) => {
    console.log('Test API endpoint hit');
    res.status(200).json({ message: 'API is working' });
});

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

// This 404 handler should only run after all other routes have been checked
app.use((req, res) => {
    console.log('No route found for:', req.originalUrl);
    res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`server running on port ${PORT}`));