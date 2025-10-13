import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import { startOrResume, toggleMode } from "../controllers/progressController";

const router = Router();

/**
 * @route POST /api/progress/start
 * @desc Start or resume a recipe’s progress for the logged-in user
 * @access Private
 * @body recipeId {string} - The recipe being followed
 * @body mode {string} - Interaction mode ("voice" or "text")
 */
router.post("/progress/start", protect, startOrResume);

/**
 * @route POST /api/progress/toggle-mode
 * @desc Toggle between voice and text mode for the current session
 * @access Private
 * @body recipeId {string} - The recipe being followed
 */
router.post("/progress/toggle-mode", protect, toggleMode);

export default router;
