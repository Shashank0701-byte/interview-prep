/**
 * CAPTCHA Middleware Test Guide
 * 
 * This file documents how to test the CAPTCHA integration
 */

// ============================================
// BACKEND TESTING
// ============================================

/**
 * Test 1: Login WITHOUT CAPTCHA token
 * Expected: 400 error with "CAPTCHA verification required"
 */
const testWithoutCaptcha = {
    method: "POST",
    url: "http://localhost:5000/api/auth/login",
    body: {
        email: "test@example.com",
        password: "password123"
        // Missing: captchaToken
    },
    expectedResponse: {
        status: 400,
        message: "CAPTCHA verification required",
        code: "CAPTCHA_MISSING"
    }
};

/**
 * Test 2: Login WITH INVALID CAPTCHA token
 * Expected: 400 error with "CAPTCHA verification failed"
 */
const testWithInvalidCaptcha = {
    method: "POST",
    url: "http://localhost:5000/api/auth/login",
    body: {
        email: "test@example.com",
        password: "password123",
        captchaToken: "invalid_token_12345"
    },
    expectedResponse: {
        status: 400,
        message: "CAPTCHA verification failed. Please try again.",
        code: "CAPTCHA_FAILED"
    }
};

/**
 * Test 3: Login WITH VALID CAPTCHA token
 * Expected: Normal login flow (200 or 401 based on credentials)
 * 
 * Note: You need a real reCAPTCHA token from the frontend
 */
const testWithValidCaptcha = {
    method: "POST",
    url: "http://localhost:5000/api/auth/login",
    body: {
        email: "test@example.com",
        password: "password123",
        captchaToken: "REAL_TOKEN_FROM_FRONTEND"
    },
    expectedResponse: {
        status: 200, // or 401 if credentials are wrong
        // Normal login response
    }
};

// ============================================
// CURL COMMANDS FOR MANUAL TESTING
// ============================================

/**
 * Test without CAPTCHA:
 * 
 * curl -X POST http://localhost:5000/api/auth/login \
 *   -H "Content-Type: application/json" \
 *   -d '{"email":"test@example.com","password":"test123"}'
 * 
 * Expected: {"message":"CAPTCHA verification required","code":"CAPTCHA_MISSING"}
 */

/**
 * Test with invalid CAPTCHA:
 * 
 * curl -X POST http://localhost:5000/api/auth/login \
 *   -H "Content-Type: application/json" \
 *   -d '{"email":"test@example.com","password":"test123","captchaToken":"fake"}'
 * 
 * Expected: {"message":"CAPTCHA verification failed. Please try again.","code":"CAPTCHA_FAILED"}
 */

// ============================================
// ENVIRONMENT SETUP CHECKLIST
// ============================================

/**
 * Before testing, ensure:
 * 
 * 1. ✅ RECAPTCHA_SECRET_KEY is set in .env
 * 2. ✅ RECAPTCHA_SCORE_THRESHOLD is set (default: 0.5)
 * 3. ✅ Backend server is running (npm run dev)
 * 4. ✅ MongoDB is connected
 * 
 * Get keys from: https://www.google.com/recaptcha/admin
 */

// ============================================
// FRONTEND INTEGRATION (Next Task)
// ============================================

/**
 * Frontend will need to:
 * 
 * 1. Load reCAPTCHA v3 script
 * 2. Execute reCAPTCHA on login form submit
 * 3. Send token with login request
 * 
 * Example:
 * 
 * grecaptcha.ready(() => {
 *   grecaptcha.execute('SITE_KEY', {action: 'login'})
 *     .then(token => {
 *       // Send token with login request
 *       fetch('/api/auth/login', {
 *         method: 'POST',
 *         body: JSON.stringify({
 *           email,
 *           password,
 *           captchaToken: token
 *         })
 *       });
 *     });
 * });
 */

module.exports = {
    testWithoutCaptcha,
    testWithInvalidCaptcha,
    testWithValidCaptcha
};
