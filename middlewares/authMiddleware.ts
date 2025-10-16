//@ts-nocheck
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/user";

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    req.user = user; // ✅ Now recognized as IUser
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
 
  if (req.user && req?.user?.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Access denied: Admins only");
  }
};
