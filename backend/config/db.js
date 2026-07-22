const mongoose = require('mongoose');

/**
 * Connect to MongoDB with retry logic.
 * Does NOT crash the server if MongoDB is unreachable —
 * the server starts anyway and routes that need DB will fail gracefully.
 */
const connectDB = async (retries = 3, delay = 3000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 5000, // 5s timeout per attempt
                heartbeatFrequencyMS: 10000,
            });
            console.log("✅ MongoDB Connected");
            return;
        } catch (err) {
            console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed:`, err.message);
            if (attempt < retries) {
                console.log(`⏳ Retrying in ${delay / 1000}s...`);
                await new Promise((r) => setTimeout(r, delay));
            } else {
                console.error("🔥 All MongoDB connection attempts failed. Starting server without DB...");
                // Do NOT exit — let the server run, routes will return 503s
            }
        }
    }
};

module.exports = connectDB;
