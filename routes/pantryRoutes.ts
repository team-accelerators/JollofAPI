import express from "express";
import { protect } from "../middlewares/authMiddleware";
import {
  uploadPantryImage,
  getUserPantry,
  deletePantryItem,
} from "../controllers/pantryController";
import { upload } from "../middlewares/upload"; // Cloudinary + Multer setup

const router = express.Router();

/**
 * @route POST /api/pantry/upload
 * @desc Upload pantry image, detect items with AI, and save them
 * @access Private
 */
router.post("/upload", protect, upload.single("image"), uploadPantryImage);

/**
 * @route GET /api/pantry
 * @desc Get all pantry items for the logged-in user
 * @access Private
 */
router.get("/pantry", protect, getUserPantry);

/**
 * @route DELETE /api/pantry/:id
 * @desc Delete a specific pantry item
 * @access Private
 */
router.delete("/:id", protect, deletePantryItem);

export default router;
