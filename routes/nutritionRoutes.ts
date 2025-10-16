import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { analyzeNutrition } from "../controllers/nutritionController";

const router = express.Router();

/**
 * @route POST /api/nutrition/analyze
 * @desc Analyze ingredients and return nutrition + allergen info
 * @access Private
 */
router.post("/nutrition/analyze", protect, analyzeNutrition);

export default router;
