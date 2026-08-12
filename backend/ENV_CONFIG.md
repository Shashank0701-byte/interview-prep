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

Sent via [Brevo](https://brevo.com) over HTTPS. Raw Gmail SMTP was dropped —
Render's network blocks outbound SMTP ports, which made delivery unreliable
regardless of DNS/IP settings. Resend worked but requires a verified domain
to send to anyone but the account owner, and this project doesn't own one.
SendGrid supports domain-free single sender verification, but its
Twilio-linked signup hit an account-state error before signup could even
complete. Brevo also supports single sender verification (confirming
ownership of one plain email address, no domain required) without that
friction.

### Required Variables:
```env
# Brevo API key
BREVO_API_KEY=your_api_key_here

# Must exactly match the address verified in Brevo (see below).
# Brevo rejects sends from any address that isn't a verified sender —
# there's no shared/sandbox fallback, so this is required, not optional.
EMAIL_FROM=your-verified-address@example.com
```

### How to Set Up Brevo:
1. Sign up at https://brevo.com
2. Settings → Senders, Domains & Dedicated IPs → **Senders** → Add a Sender
3. Enter any email address you have access to and confirm the code/link
   Brevo sends to that inbox
4. Settings → SMTP & API → API Keys → Generate a new API key
5. Add both to `.env` (and to Render's environment variables):
   `BREVO_API_KEY` and `EMAIL_FROM` (the exact address you verified in step 3)

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

# Email Configuration (Brevo)
BREVO_API_KEY=your_api_key_here
EMAIL_FROM=your-verified-address@example.com

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
