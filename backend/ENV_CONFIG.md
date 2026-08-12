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

## Email Configuration (OTP delivery)

Sent via [Resend](https://resend.com) over HTTPS. Raw Gmail SMTP was dropped —
Render's network blocks outbound SMTP ports, which made OTP delivery
unreliable regardless of DNS/IP settings.

### Required Variables:
```env
# Resend API key
RESEND_API_KEY=re_your_api_key_here

# Optional — defaults to Resend's shared onboarding@resend.dev sender if unset.
# Once you verify a custom domain in the Resend dashboard, set this instead:
EMAIL_FROM=Interview Prep AI <noreply@yourdomain.com>
```

### How to Get a Resend API Key:
1. Sign up at https://resend.com
2. Dashboard → API Keys → Create API Key
3. Add it to `.env` (and to Render's environment variables) as `RESEND_API_KEY`
4. (Optional, for production) Dashboard → Domains → verify your own domain,
   then set `EMAIL_FROM` to an address on that domain

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

# Email Configuration (Resend)
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=Interview Prep AI <noreply@yourdomain.com>

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
