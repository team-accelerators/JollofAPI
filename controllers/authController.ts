import { Request, Response } from "express";
import { Types } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user";
import { sendResetEmail } from "../utils/sendEmail";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES = "7d";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

/** Helper to generate JWT token */
const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
};

/** Helper to send JWT as HttpOnly cookie */
const sendCookie = (res: Response, token: string) => {
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * @route POST /api/auth/register
 * @desc Register user with onboarding info
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      dietaryPreferences,
      skillLevel,
      mealFrequency,
      prefersQuickMeals,
      culturalBackground,
    } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      dietaryPreferences,
      cookingHabits: { skillLevel, mealFrequency, prefersQuickMeals },
      culturalBackground,
      role: "user",
    });

    const token = generateToken((newUser._id as Types.ObjectId).toString(), newUser.role);
    sendCookie(res, token);

    res.status(201).json({ message: "User registered", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * @route POST /api/auth/login
 * @desc Authenticate user
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(404).json({ error: "User not found" });
    
    if (!user.password) {
  return res.status(500).json({ error: "Password not found in user record" });
}
    const match = await bcrypt.compare(password, user.password );
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken((user._id as Types.ObjectId).toString(), user.role);
    sendCookie(res, token);

    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * @route POST /api/auth/google
 * @desc Google OAuth login/register
 */
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { tokenId } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.email) return res.status(400).json({ error: "Invalid Google token" });

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        password: "",
        role: "user",
      });
    }

    const token = generateToken((user._id as Types.ObjectId).toString(), user.role);
    sendCookie(res, token);

    res.json({ message: "Google login successful", user });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Google authentication failed" });
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
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendResetEmail(user.email, resetUrl);

    res.json({ message: "Password reset link sent" });
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * @route POST /api/auth/logout
 * @desc Logout user by clearing cookie
 */
export const logoutUser = async (_req: Request, res: Response) => {
  res.clearCookie("jwt");
  res.json({ message: "Logged out successfully" });
};
