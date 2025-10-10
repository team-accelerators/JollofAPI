import express from "express";
import { RequestHandler } from "express";
import passport from "passport";
import "../config/passport";
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getUser
} from "../controllers/authController";
import { authLimiter } from "../middlewares/rateLimiter";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.post("/forgot-password", authLimiter, forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.get("/me", protect, getUser as unknown as RequestHandler);


router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  (req, res) => {
    const { token } = req.user as any;
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect(`${process.env.FRONTEND_URL}/auth-success`);
  }
);

export default router;
