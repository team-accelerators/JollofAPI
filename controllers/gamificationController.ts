//@ts-nocheck
import { Request, Response } from "express";
import Streak from "../models/gamification/streak";
import Badge from "../models/gamification/badge";
import Challenge from "../models/gamification/challenge";

/**
 * @desc Update or maintain user's cooking streak
 * @route POST /api/gamification/streak
 * @access Private
 */
export const updateStreak = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    let streak = await Streak.findOne({ user: userId });
    const today = new Date();

    if (!streak) {
      streak = await Streak.create({ user: userId, days: 1, lastCookedAt: today });
    } else {
      const lastCooked = streak.lastCookedAt;
      const diffDays = Math.floor((today.getTime() - lastCooked.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) streak.days += 1; // continued streak
      else if (diffDays > 1) streak.days = 1; // reset streak

      streak.lastCookedAt = today;
      await streak.save();
    }

    res.status(200).json({ success: true, streak });
  } catch (err: any) {
    res.status(500).json({ message: "Failed to update streak", error: err.message });
  }
};

/**
 * @desc Get available challenges
 * @route GET /api/gamification/challenges
 * @access Public
 */
export const getChallenges = async (_req: Request, res: Response) => {
  try {
    const challenges = await Challenge.find();
    res.json({ success: true, challenges });
  } catch (err: any) {
    res.status(500).json({ message: "Failed to fetch challenges", error: err.message });
  }
};

/**
 * @desc Join a challenge
 * @route POST /api/gamification/challenges/:id/join
 * @access Private
 */
export const joinChallenge = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) return res.status(404).json({ message: "Challenge not found" });

    if (!challenge.participants.includes(userId)) {
      challenge.participants.push(userId);
      await challenge.save();
    }

    res.json({ success: true, message: "Joined challenge", challenge });
  } catch (err: any) {
    res.status(500).json({ message: "Failed to join challenge", error: err.message });
  }
};

/**
 * @desc Get user badges
 * @route GET /api/gamification/badges
 * @access Private
 */
export const getBadges = async (_req: Request, res: Response) => {
  try {
    const badges = await Badge.find();
    res.json({ success: true, badges });
  } catch (err: any) {
    res.status(500).json({ message: "Failed to fetch badges", error: err.message });
  }
};
