import { Request, Response } from "express";
import crypto from "crypto";
import User from "../models/user";
import { createSendToken } from "../utils/generateToken";
import { sendEmail } from "../utils/mailer";
import { AuthRequest } from "../middlewares/authMiddleware";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "Email in use" });

  const user = await User.create({ name, email, password });
  const token = createSendToken(res, user);
  res.status(201).json({ message: "Registered", token });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: "Invalid credentials" });

  const token = createSendToken(res, user);
  res.json({ message: "Logged in", token });
};

export const logout = (req: Request, res: Response) => {
  res.cookie("jwt", "logout", { httpOnly: true, maxAge: 1000 });
  res.json({ message: "Logged out" });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "No user found" });

  const token = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`;
  await sendEmail({
    to: email,
    subject: "Password Reset",
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
  });

  res.json({ message: "Reset email sent" });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;
  const hashed = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+password");

  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  const jwtToken = createSendToken(res, user);
  res.json({ message: "Password reset", token: jwtToken });
};


export const getUser = async (req:AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};