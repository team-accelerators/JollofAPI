import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import User from "../models/user";

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Protect middleware — verifies JWT and attaches user to request
 */
export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Allow either Authorization Bearer token or cookie
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

/**
 * Admin-only middleware — requires role = admin
 */
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin") {
    return next();
  } else {
    res.status(403);
    throw new Error("Access denied: Admins only");
  }
};
