import express from "express";
import {
  updateStreak,
  getChallenges,
  joinChallenge,
  getBadges,
} from "../controllers/gamificationController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Gamification
 *   description: Cooking streaks, challenges, and badges
 */

/**
 * @swagger
 * /api/gamification/streak:
 *   post:
 *     summary: Update or maintain user's cooking streak
 *     tags: [Gamification]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Streak updated successfully
 */
router.post("/streak", protect, updateStreak);

/**
 * @swagger
 * /api/gamification/challenges:
 *   get:
 *     summary: Get all challenges
 *     tags: [Gamification]
 *     responses:
 *       200:
 *         description: List of challenges
 */
router.get("/challenges", getChallenges);

/**
 * @swagger
 * /api/gamification/challenges/{id}/join:
 *   post:
 *     summary: Join a challenge
 *     tags: [Gamification]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Challenge ID
 *     responses:
 *       200:
 *         description: Joined challenge successfully
 */
router.post("/challenges/:id/join", protect, joinChallenge);

/**
 * @swagger
 * /api/gamification/badges:
 *   get:
 *     summary: Get all available badges
 *     tags: [Gamification]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: List of badges
 */
router.get("/badges", protect, getBadges);

export default router;
