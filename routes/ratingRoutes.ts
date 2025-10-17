import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { rateItem, getAverageRating } from "../controllers/ratingController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Manage user ratings and reviews for recipes or vendors
 */

/**
 * @swagger
 * /ratings:
 *   post:
 *     summary: Rate or review an item (recipe or vendor)
 *     description: Allows a logged-in user to submit or update their rating and review for a specific target (e.g., a recipe or vendor).
 *     tags: [Ratings]
 */
router.post("/", protect, rateItem);

/**
 * @swagger
 * /ratings/{targetType}/{targetId}:
 *   get:
 *     summary: Get average rating for a specific target
 *     description: Retrieves the average rating and total number of ratings for a given recipe or vendor.
 */
router.get("/:targetType/:targetId", getAverageRating);

export default router;
