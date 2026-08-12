const { BrevoClient } = require("@getbrevo/brevo");

// Raw SMTP to Gmail was unreliable on Render (ENETUNREACH, then ETIMEDOUT —
// see git history on this file), so OTP delivery moved to an HTTPS-based
// transactional email API. Resend worked but its sandbox mode requires a
// verified domain to send to anyone but the account owner, and this project
// doesn't own one. SendGrid supports domain-free single sender verification,
// but its Twilio-linked signup got stuck in an account-state error before
// signup could even complete. Brevo also supports single sender
// verification (no domain needed) without that friction.
const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

// Must match the address verified in Brevo under
// Settings -> Senders, Domains & Dedicated IPs -> Senders.
// Brevo rejects sends where `sender` isn't verified — there's no
// shared/sandbox fallback address, so this is required, not optional.
const FROM_ADDRESS = process.env.EMAIL_FROM;

const sendOTP = async (email, otp) => {
  if (!FROM_ADDRESS) {
    console.error("Error sending OTP email: EMAIL_FROM is not set (must match a Brevo verified sender)");
    return false;
  }

  try {
    await brevo.transactionalEmails.sendTransacEmail({
      subject: "Your Login OTP - Interview Prep AI",
      sender: { name: "Interview Prep AI", email: FROM_ADDRESS },
      to: [{ email }],
      htmlContent: `
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
    });

    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error?.body || error?.message || error);
    return false;
  }
};

module.exports = { sendOTP };
