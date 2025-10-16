import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import { postMessage, getHistory } from "../controllers/chatController";

const router = Router();

/**
 * @route POST /api/chat/message
 * @desc Send a message (user or AI). Persists chat history and generates AI responses.
 * @access Private
 * @body userId {string} - The user’s ID
 * @body recipeId {string} - The related recipe (optional)
 * @body content {string} - Message text
 */
router.post("/chat/message", protect, postMessage);

/**
 * @route GET /api/chat/history/:userId/:recipeId
 * @desc Retrieve chat history between the user and assistant for a given recipe
 * @param userId {string} - The user’s ID
 * @param recipeId {string} - The recipe ID (optional)
 * @access Private
 */
router.get("/chat/history/:userId/:recipeId", protect, getHistory);

export default router;
