import { Request, Response } from "express";

import crypto from "crypto";
import User from "../models/user";
import { generateToken } from "../utils/generateToken";


/**
 * @desc User Registration (Onboarding)
 */
export const signup = async (req: Request, res: Response) => {
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

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already registered." });

    const newUser = new User({
      name,
      email,
      password,
      dietaryPreferences,
      cookingHabits: { skillLevel, mealFrequency, prefersQuickMeals },
      culturalBackground,
    });

    await newUser.save();

    const token = generateToken(res, newUser);
    res.status(201).json({
      message: "User created and onboarded.",
      user: newUser,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
};

/**
 * @desc Login User
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user?.matchPassword(password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = generateToken(res, user);
    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * @desc Forgot Password
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // In real app, send via email
    res.status(200).json({
      message: "Reset token generated",
      resetToken,
    });
  } catch (error) {
    res.status(500).json({ error: "Error generating reset token" });
  }
};

/**
 * @desc Reset Password
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ error: "Token invalid or expired" });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: "Password reset failed" });
  }
};

/**
 * @desc Google OAuth Success Handler
 */
export const googleAuthCallback = async (req: Request, res: Response) => {
  if (!req.user) return res.redirect("/login?error=GoogleAuthFailed");

  const user = req.user as any;
  const token = generateToken(res, user);

  res.redirect(`${process.env.CLIENT_URL}/dashboard?token=${token}`);
};

/**
 * @desc Logout
 */
export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};
