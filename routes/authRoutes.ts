import express from "express";
import {
  registerUser,
  loginUser,
  googleAuth,
  requestPasswordReset,
  resetPassword,
  logoutUser,
} from "../controllers/authController";
import { protect, adminOnly } from "../middlewares/authMiddleware";

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register new user with onboarding details
 * @access Public
 */
router.post("/register", registerUser);

/**
 * @route POST /api/auth/login
 * @desc Login and get JWT in HttpOnly cookie
 * @access Public
 */
router.post("/login", loginUser);

/**
 * @route POST /api/auth/google
 * @desc Login or register user via Google OAuth
 * @access Public
 */
router.post("/google", googleAuth);

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
