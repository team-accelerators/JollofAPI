import nodemailer from "nodemailer";

export const sendResetEmail = async (to: string, resetUrl: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
    from: `"JollofAI Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <a href="${resetUrl}"
          style="background-color:#f97316;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;">
          Reset Password
        </a>
        <p>If you didn’t request this, you can safely ignore this email.</p>
        <br/>
        <p>— The JollofAI Team</p>
      </div>
    `,
  };

  await transporter.sendMail(message);
};
