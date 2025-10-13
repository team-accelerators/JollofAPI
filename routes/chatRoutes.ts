import { Router } from "express";
import { postMessage, getHistory } from "../controllers/chatController";
const router = Router();

router.post("/message", postMessage);
router.get("/history/:userId/:recipeId", getHistory);

export default router;
