import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/upload"; // Cloudinary + Multer setup
import {
  getPantryItems,
  addPantryItem,
  updatePantryItem,
  deletePantryItem,
  suggestRecipesFromPantry
} from "../controllers/pantryController";

const router = express.Router();


/**
 * @route GET /api/pantry
 * @desc Get all pantry items for the logged-in user
 * @route POST /api/pantry
 * @desc Add a new pantry item manually
 * @access Private
 */
router
  .route("/")
  .get(protect, getPantryItems)
  .post(protect, addPantryItem);

/**
 * @route PUT /api/pantry/:id
 * @desc Update pantry item (e.g. quantity, name, etc.)
 * @route DELETE /api/pantry/:id
 * @desc Delete a specific pantry item
 * @access Private
 */
router
  .route("/:id")
  .put(protect, updatePantryItem)
  .delete(protect, deletePantryItem);

/**
 * @route   GET /api/pantry/suggested
 * @desc    Suggest recipes based on pantry contents
 * @access  Private
 */
router.get("/suggestions", protect, suggestRecipesFromPantry);
export default router;
