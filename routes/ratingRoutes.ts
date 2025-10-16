import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { rateItem, getAverageRating } from "../controllers/ratingController";

const router = express.Router();

router.post("/", protect, rateItem);
router.get("/:targetType/:targetId", getAverageRating);

export default router;
