# Environment Variables Configuration

## CAPTCHA Configuration (Task 1)

### Required Variables:
```env
# Google reCAPTCHA v3 Secret Key
# Get from: https://www.google.com/recaptcha/admin
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here

# reCAPTCHA Score Threshold (0.0 - 1.0)
# 0.5 is recommended (higher = stricter)
RECAPTCHA_SCORE_THRESHOLD=0.5
```

### How to Get reCAPTCHA Keys:
1. Visit: https://www.google.com/recaptcha/admin/create
2. Choose **reCAPTCHA v3**
3. Add your domain (use `localhost` for development)
4. Copy the **Secret Key** to `.env`
5. Copy the **Site Key** for frontend integration

---

## Email Configuration (Task 2 - Coming Next)

### Required Variables:
```env
# Gmail SMTP Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your_16_char_app_password

# Email Settings
EMAIL_FROM_NAME=Interview Prep AI
EMAIL_FROM_ADDRESS=your-email@gmail.com
```

### How to Get Gmail App Password:
1. Enable 2FA on your Google Account
2. Visit: https://myaccount.google.com/apppasswords
3. Select "Mail" and your device
4. Copy the 16-character password (no spaces)
5. Add to `.env` as `EMAIL_APP_PASSWORD`

---

## OTP Configuration (Task 3 - Coming Next)

### Required Variables:
```env
# OTP Settings
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=3
OTP_LOCKOUT_MINUTES=15
```

---

## Existing Configuration

```env
# MongoDB
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# Server
PORT=5000
BACKEND_URL=http://localhost:5000

# Frontend (for CORS)
FRONTEND_URL=http://localhost:3000
```

---

## Complete .env Template

Copy this to your `.env` file:

```env
# Database
MONGO_URI=your_mongodb_connection_string

# JWT Authentication
JWT_SECRET=your_jwt_secret_key

# Server Configuration
PORT=5000
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Google reCAPTCHA v3
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
RECAPTCHA_SCORE_THRESHOLD=0.5

# Email Configuration (Gmail SMTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your_16_char_app_password
EMAIL_FROM_NAME=Interview Prep AI
EMAIL_FROM_ADDRESS=your-email@gmail.com

# OTP Settings
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=3
OTP_LOCKOUT_MINUTES=15
```

---

## Security Notes

⚠️ **NEVER commit `.env` to Git**
✅ Always use `.env.example` for documentation
✅ Rotate secrets regularly
✅ Use different keys for development and production
