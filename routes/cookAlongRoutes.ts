import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { createCookAlong, getCookAlongs, joinCookAlong } from "../controllers/cookAlongController";

const router = express.Router();

router.post("/", protect, createCookAlong);
router.get("/", getCookAlongs);
router.post("/:id/join", protect, joinCookAlong);

export default router;
