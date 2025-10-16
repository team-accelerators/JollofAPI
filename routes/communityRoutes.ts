import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { createPost, getPosts, toggleLike } from "../controllers/communityController";

const router = express.Router();

router.post("/", protect, createPost);
router.get("/", getPosts);
router.post("/:id/like", protect, toggleLike);

export default router;
