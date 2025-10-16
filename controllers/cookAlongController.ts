
//@ts-nocheck

import { Request, Response } from "express";
import CookAlong from "../models/cookAlong";
import Recipe from "../models/recipe";

/**
 * @desc Create a new Cook-Along event
 * @route POST /api/cookalongs
 * @access Private
 */
export const createCookAlong = async (req: Request, res: Response) => {
  try {
    const { title, recipeId, scheduledAt } = req.body;

    if (!title || !recipeId || !scheduledAt) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const cookAlong = await CookAlong.create({
      title,
      recipeId,
      scheduledAt,
      hostUser: req.user._id,
    });

    res.status(201).json({ success: true, cookAlong });
  } catch (error: any) {
    console.error("Create Cook-Along error:", error);
    res.status(500).json({ error: "Failed to create cook-along" });
  }
};

/**
 * @desc Get all upcoming Cook-Along sessions (public)
 * @route GET /api/cookalongs
 * @access Public
 */
export const getCookAlongs = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const cookAlongs = await CookAlong.find({ scheduledAt: { $gte: now } })
      .populate("recipeId", "title imageUrl")
      .populate("hostUser", "name email")
      .sort({ scheduledAt: 1 });

    res.json({ success: true, data: cookAlongs });
  } catch (error: any) {
    console.error("Fetch Cook-Alongs error:", error);
    res.status(500).json({ error: "Failed to fetch cook-alongs" });
  }
};

/**
 * @desc Join a Cook-Along session
 * @route POST /api/cookalongs/:id/join
 * @access Private
 */
export const joinCookAlong = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cookAlong = await CookAlong.findById(id);

    if (!cookAlong) {
      return res.status(404).json({ error: "Cook-along not found" });
    }

    // Prevent duplicate participation
    if (cookAlong.participants.includes(req.user._id)) {
      return res.status(400).json({ message: "Already joined this cook-along" });
    }

    cookAlong.participants.push(req.user._id);
    await cookAlong.save();

    res.json({
      success: true,
      message: "Joined cook-along successfully",
      cookAlong,
    });
  } catch (error: any) {
    console.error("Join Cook-Along error:", error);
    res.status(500).json({ error: "Failed to join cook-along" });
  }
};

/**
 * @desc Start or stop a live Cook-Along session (Admin or Host only)
 * @route PATCH /api/cookalongs/:id/live
 * @access Private (host/admin)
 */
export const toggleLiveStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cookAlong = await CookAlong.findById(id);

    if (!cookAlong) return res.status(404).json({ error: "Cook-along not found" });

    // Only host or admin can toggle
    if (
      cookAlong.hostUser.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    cookAlong.isLive = !cookAlong.isLive;
    await cookAlong.save();

    res.json({
      success: true,
      message: cookAlong.isLive
        ? "Cook-along is now live!"
        : "Cook-along ended.",
      cookAlong,
    });
  } catch (error: any) {
    console.error("Toggle Live error:", error);
    res.status(500).json({ error: "Failed to update live status" });
  }
};
