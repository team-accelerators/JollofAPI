import express from "express";
import {authLimiter} from '../middlewares/rateLimiter'


import {
  register,
  loginUser,
  forgotPasswordRequest,
  resetPassword,
  logoutUser,
  googleAuth,
  googleAuthCallback,
  refreshToken,
  getAuthUser // added from Google OAuth controller
} from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";
import {authorize} from "../middlewares/roleMiddleware"
const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register new user with onboarding details
 * @access Public
 */
router.post("/register", authLimiter, register);

/**
 * @route POST /api/auth/login
 * @desc Login and get JWT in HttpOnly cookie
 * @access Public
 */
router.post("/login", authLimiter, loginUser);

/**
 * @route GET /api/auth/google
 * @desc Initiate Google OAuth login flow
 * @access Public
 */
router.get('/google',  googleAuth )


/**
 * @route GET /api/auth/google/callback
 * @desc Google OAuth callback - handle Google login/register
 * @access Public
 */
router.get('/google/callback', googleAuthCallback  )

/**
 * @route POST /api/auth/reset-password
 * @desc Request password reset link
 * @access Public
 */
router.post("/reset-password", forgotPasswordRequest);

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
router.get("/admin", protect, authorize('admin'), (req, res) => {
  res.json({ message: "Admin access granted." });
});



/**
 * @route GET /api/auth/refresh
 * @desc Example admin-only route
 * @access Admin
 */
router.get("/refresh", refreshToken);

/**
 * @route GET /api/auth/current-user
 * @desc Example admin-only route
 * @access Admin
 */
router.get('/me', protect,  getAuthUser  )

export default router;
