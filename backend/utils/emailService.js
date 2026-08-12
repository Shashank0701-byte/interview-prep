const sgMail = require("@sendgrid/mail");

// Raw SMTP to Gmail was unreliable on Render (ENETUNREACH, then ETIMEDOUT —
// see git history on this file). Moved to Resend's HTTPS API, which worked,
// but Resend's unverified-domain sandbox only allows sending to the
// account's own email address. Domain verification would lift that, but
// this project doesn't own a domain (it's on a Netlify subdomain), so we're
// on SendGrid instead: it supports "Single Sender Verification" — verifying
// ownership of one plain email address (no domain needed) is enough to send
// to any recipient. Still HTTPS-based (port 443), so the Render SMTP-port
// block doesn't apply here either.
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Must exactly match the address verified in SendGrid under
// Settings -> Sender Authentication -> Single Sender Verification.
// SendGrid rejects sends where `from` isn't a verified sender — there's no
// shared/sandbox fallback address like Resend has, so this is required.
const FROM_ADDRESS = process.env.EMAIL_FROM;

const sendOTP = async (email, otp) => {
  if (!FROM_ADDRESS) {
    console.error("Error sending OTP email: EMAIL_FROM is not set (must match a SendGrid verified sender)");
    return false;
  }

  const message = {
    to: email,
    from: { email: FROM_ADDRESS, name: "Interview Prep AI" },
    subject: "Your Login OTP - Interview Prep AI",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4F46E5; text-align: center;">Login Verification</h2>
        <p style="font-size: 16px; color: #374151;">Hello,</p>
        <p style="font-size: 16px; color: #374151;">You requested to log in to Interview Prep AI. Please use the following One-Time Password (OTP) to complete your login:</p>
        <div style="background-color: #F3F4F6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="font-size: 36px; letter-spacing: 8px; color: #1F2937; margin: 0;">${otp}</h1>
        </div>
        <p style="font-size: 14px; color: #6B7280;">This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        <p style="font-size: 14px; color: #6B7280;">If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 14px; color: #9CA3AF; text-align: center;">Interview Prep AI Team</p>
      </div>
    `,
  };

  try {
    await sgMail.send(message);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error?.response?.body || error);
    return false;
  }
};

module.exports = { sendOTP };
