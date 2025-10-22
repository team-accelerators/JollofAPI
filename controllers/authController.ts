//@ts-nocheck
import { Request, Response } from "express";
import { Types } from "mongoose";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import User from "../models/user";
import UserPreference from "../models/userPreference";
import { sendResetEmail } from "../utils/sendEmail";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES = (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];

/** Helper to generate JWT token */

const generateToken = (id: string, role: string) => {
  const payload = { id, role };
  const options: SignOptions = { expiresIn: JWT_EXPIRES };
  return jwt.sign(payload, JWT_SECRET, options);
}
/** Helper to send JWT as HttpOnly cookie */
const sendCookie = (res: Response, token: string) => {
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * @route POST /api/auth/register
 * @desc Register user with onboarding info
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password });

    // Create linked preferences
    const preferences = await UserPreference.create({
      user: user._id,
      dietaryPreferences: [],
      cookingHabits: { skillLevel: "beginner", mealFrequency: "daily", prefersQuickMeals: true },
    });

    user.preferences = preferences._id;
    await user.save();

    // const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    const token = generateToken((user._id as Types.ObjectId).toString(), user.role);
    sendCookie(res, token);

    res.status(201).json({
      success: true,
      message: "Signup successful!",
      user: await User.findById(user._id).populate("preferences"),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
};

/**
 * @route POST /api/auth/login
 * @desc Authenticate user via email/password
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.password)
      return res.status(500).json({ error: "Password not found in user record" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken((user._id as Types.ObjectId).toString(), user.role);
    sendCookie(res, token);

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * @route GET /api/auth/google/callback
 * @desc Google OAuth callback (handled by Passport)
 */
export const googleCallback = async (req: Request, res: Response) => {
  try {
    const { user, token } = req.user as any;

    sendCookie(res, token);

    res.status(200).json({
      success: true,
      message: "Google login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Google OAuth Error:", err);
    res.status(500).json({ success: false, message: "Google authentication failed" });
  }
};

/**
 * @route POST /api/auth/reset-password
 * @desc Send password reset email
 */
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "No user found with that email" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendResetEmail(user.email, resetUrl);

    res.json({ message: "Password reset link sent" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ error: "Email could not be sent" });
  }
};

/**
 * @route POST /api/auth/reset/:token
 * @desc Reset password using valid token
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ error: "Invalid or expired token" });

    user.password = await bcrypt.hash(req.body.password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: "Password successfully reset" });
  } catch (err) {
    console.error("Reset Password Save Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * @route POST /api/auth/logout
 * @desc Logout user by clearing JWT cookie
 */
export const logoutUser = async (_req: Request, res: Response) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({ message: "Logged out successfully" });
};
