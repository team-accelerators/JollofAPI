import express from "express";
import passport from "passport";
import "../config/passport"; // ensure GoogleStrategy is registered
import {
  register,
  loginUser,
  requestPasswordReset,
  resetPassword,
  logoutUser,
  googleCallback, // added from Google OAuth controller
} from "../controllers/authController";
import { protect, adminOnly } from "../middlewares/authMiddleware";

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register new user with onboarding details
 * @access Public
 */
router.post("/register", register);

/**
 * @route POST /api/auth/login
 * @desc Login and get JWT in HttpOnly cookie
 * @access Public
 */
router.post("/login", loginUser);

/**
 * @route GET /api/auth/google
 * @desc Initiate Google OAuth login flow
 * @access Public
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

/**
 * @route GET /api/auth/google/callback
 * @desc Google OAuth callback - handle Google login/register
 * @access Public
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  googleCallback
);

/**
 * @route POST /api/auth/reset-password
 * @desc Request password reset link
 * @access Public
 */
router.post("/reset-password", requestPasswordReset);

/**
 * @route POST /api/auth/reset/:token
 * @desc Reset password with valid token
 * @access Public
 */
router.post("/reset/:token", resetPassword);

/**
 * @route POST /api/auth/logout
 * @desc Clear authentication cookie
 * @access Private
 */
router.post("/logout", protect, logoutUser);

/**
 * @route GET /api/auth/admin
 * @desc Example admin-only route
 * @access Admin
 */
router.get("/admin", protect, adminOnly, (req, res) => {
  res.json({ message: "Admin access granted." });
});

export default router;
