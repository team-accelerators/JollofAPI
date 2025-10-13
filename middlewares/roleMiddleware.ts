import { Request, Response, NextFunction } from "express";
import User from "../models/user";

/**
 * Restrict access based on user role
 * Usage: router.post('/', protect, authorize('admin'), controllerFn)
 */
export const authorize =
  (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?._id;
      if (!userId) return res.status(401).json({ message: "Not authenticated" });

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden: insufficient permissions" });
      }

      next();
    } catch (error) {
      console.error("Role check failed:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
