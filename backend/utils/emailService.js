const { Resend } = require("resend");

// Raw SMTP to Gmail was unreliable on Render: connections to smtp.gmail.com
// either hit ENETUNREACH (no outbound IPv6 route) or, once forced to IPv4,
// ETIMEDOUT (Render's network blocks outbound SMTP ports outright — a common
// anti-spam-relay restriction on hosting platforms). Resend delivers over
// HTTPS (port 443), which sidesteps that whole class of problem.
const resend = new Resend(process.env.RESEND_API_KEY);

// Resend's shared onboarding@resend.dev sender works without verifying a
// custom domain — good enough to ship with. Once a domain is verified in the
// Resend dashboard, set EMAIL_FROM to something like
// "Interview Prep AI <noreply@yourdomain.com>" for better deliverability/branding.
const FROM_ADDRESS = process.env.EMAIL_FROM || "Interview Prep AI <onboarding@resend.dev>";

const sendOTP = async (email, otp) => {
  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
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
    });

    if (error) {
      console.error("Error sending OTP email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
};

module.exports = { sendOTP };
