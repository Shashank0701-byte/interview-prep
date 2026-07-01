const axios = require("axios");

/**
 * Middleware to verify Google reCAPTCHA v3 token
 * 
 * @desc    Validates reCAPTCHA token from client
 * @usage   Add to routes that need bot protection
 * @expects req.body.captchaToken - The reCAPTCHA token from frontend
 */
const verifyCaptcha = async (req, res, next) => {
    try {
        // Skip CAPTCHA in development mode
        if (process.env.NODE_ENV !== 'production') {
            console.log("⏭️ CAPTCHA skipped (development mode)");
            return next();
        }

        const { captchaToken } = req.body;

        // Check if captcha token is provided
        if (!captchaToken) {
            return res.status(400).json({
                message: "CAPTCHA verification required",
                code: "CAPTCHA_MISSING"
            });
        }

        // Verify with Google reCAPTCHA API
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;

        if (!secretKey) {
            console.error("❌ RECAPTCHA_SECRET_KEY not configured in environment variables");
            return res.status(500).json({
                message: "CAPTCHA verification not configured",
                code: "CAPTCHA_CONFIG_ERROR"
            });
        }

        const verificationUrl = `https://www.google.com/recaptcha/api/siteverify`;

        const response = await axios.post(verificationUrl, null, {
            params: {
                secret: secretKey,
                response: captchaToken,
                remoteip: req.ip || req.connection.remoteAddress
            }
        });

        const { success, score, action } = response.data;

        // reCAPTCHA v3 returns a score (0.0 - 1.0)
        // 1.0 is very likely a good interaction, 0.0 is very likely a bot
        const SCORE_THRESHOLD = parseFloat(process.env.RECAPTCHA_SCORE_THRESHOLD) || 0.5;

        if (!success) {
            console.warn("⚠️ CAPTCHA verification failed:", response.data);
            return res.status(400).json({
                message: "CAPTCHA verification failed. Please try again.",
                code: "CAPTCHA_FAILED"
            });
        }

        if (score < SCORE_THRESHOLD) {
            console.warn(`⚠️ Low CAPTCHA score: ${score} (threshold: ${SCORE_THRESHOLD})`);
            return res.status(403).json({
                message: "Suspicious activity detected. Please try again later.",
                code: "CAPTCHA_LOW_SCORE",
                score: score
            });
        }

        // Log successful verification (optional, for monitoring)
        console.log(`✅ CAPTCHA verified - Score: ${score}, Action: ${action}`);

        // Attach score to request for potential use in controllers
        req.captchaScore = score;
        req.captchaAction = action;

        next();
    } catch (error) {
        console.error("❌ CAPTCHA verification error:", error.message);

        // Don't block user if Google's service is down
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            console.warn("⚠️ CAPTCHA service unavailable, allowing request");
            return next();
        }

        return res.status(500).json({
            message: "CAPTCHA verification error. Please try again.",
            code: "CAPTCHA_ERROR",
            error: error.message
        });
    }
};

module.exports = { verifyCaptcha };
