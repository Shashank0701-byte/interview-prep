const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000, // 10s — don't hang forever
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: `"Interview Prep AI" <${process.env.SMTP_USER}>`,
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
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("OTP email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
};

module.exports = { sendOTP };
