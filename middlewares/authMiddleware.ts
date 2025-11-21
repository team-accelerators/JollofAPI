//@ts-nocheck
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import User from "../models/auth";

interface DecodedToken {
  id: string;
  role?: string;
  iat: number;
  exp: number;
}

/**
 * Protect middleware – validates access token (JWT)
 * Checks Authorization header or HttpOnly cookie
 */
export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Try from header first
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  // Then check cookies
  else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized: No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // attach user to request
    next();
  } catch (err: any) {
    console.error("JWT Auth Error:", err.message);

    // Handle token expiration gracefully
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
});

/**
 * Admin-only middleware
 */
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Admins only" });
  }
};
