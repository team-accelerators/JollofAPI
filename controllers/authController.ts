
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import User from "../models/auth";
import UserPreference from "../models/userPreference";
import { sendResetEmail } from "../utils/sendResetEmail";
import passport from "../config/passport"
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const JWT_EXPIRES = (process.env.JWT_EXPIRES_IN || "15m") as jwt.SignOptions["expiresIn"];
const REFRESH_EXPIRES = "7d"; // refresh token lifespan

/** ----------------- HELPERS ----------------- **/

const generateAccessToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
};

const generateRefreshToken = (id: string) => {
  return jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
};

/** Send both tokens as cookies */
const sendAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/** ----------------- REGISTER ----------------- **/
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password });

    const preferences = await UserPreference.create({
      user: user._id,
      dietaryPreferences: [],
      cookingHabits: {
        skillLevel: "beginner",
        mealFrequency: "daily",
        prefersQuickMeals: true,
      },
    });

    user.preferences = preferences._id;
    await user.save();

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());
    sendAuthCookies(res, accessToken, refreshToken);

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

/** ----------------- LOGIN ----------------- **/
export const loginUser = async (req: Request, res: Response) => {
  try {
    console.log(req.body)
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.password) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());
    sendAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/** ----------------- REFRESH TOKEN ----------------- **/
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: "No refresh token" });

    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ messgae: "User not found" });

    const newAccessToken = generateAccessToken(user._id.toString(), user.role);
    sendAuthCookies(res, newAccessToken, token); // keep refreshToken same

    res.status(200).json({ success: true, message:"refreshtoken valid!" });
  } catch (err) {
    console.error("Refresh Token Error:", err);
    res.status(403).json({ messgage: "Invalid or expired refresh token" });
  }
};

/** ----------------- LOGOUT ----------------- **/
export const logoutUser = async (_req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
  res.json({ message: "Logged out successfully" });
};

/** ----------------- PASSWORD RESET ----------------- **/
export const forgotPasswordRequest = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "No user found with that email" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendResetEmail(user.email, resetUrl);

    res.json({ message: "Password reset link sent" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Email could not be sent" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(req.body.password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: "Password successfully reset" });
  } catch (err) {
    console.error("Reset Password Save Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




// GET /auth/google
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
   session: false, // Important for JWT
})

/**
 * @route GET /api/auth/google/callback
 * @desc Google OAuth callback (handled by Passport)
 */

export const googleAuthCallback = (req:Request, res:Response, next:NextFunction) => {
  passport.authenticate('google', { session: true }, (err, user) => {

    if (err || !user){
    console.log(err)
    return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth`);
    }

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());
    sendAuthCookies(res, accessToken, refreshToken);
   
    return res.redirect(`${process.env.CLIENT_URL!}`);

  })(req, res, next);
};

/**
 * @route GET /api/auth/me/
 * @desc Get current user
 */

export const  getAuthUser = async (req:Request,  res:Response) => {

  if (!req.user){
   return res.json({ success: false, message:`No User Found`})
  }
console.log(`my ${req.user}`)
 return  res.status(200).json({ success: true, message:`Welcome ${req.user}`, user: req.user })

  }
  
