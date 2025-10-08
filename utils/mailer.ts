import nodemailer from "nodemailer";

interface MailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export const sendEmail = async ({ to, subject, html, text }: MailOptions) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"JollofAI" <noreply@jollofai.com>',
    to,
    subject,
    text,
    html,
  });
};
