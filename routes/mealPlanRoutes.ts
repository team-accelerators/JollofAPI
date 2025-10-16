import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { generateMealPlan } from "../controllers/mealPlanController";

const router = express.Router();

/**
 * @route POST /api/mealplan/generate
 * @desc Generate personalized AI meal plan
 * @access Private
 */
router.post("/mealplan/generate", protect, generateMealPlan);

export default router;
