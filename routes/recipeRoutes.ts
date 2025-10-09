import express from "express";
import {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
} from "../controllers/recipeControllers";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

// Public routes
router.get("/", getRecipes);
router.get("/:id", getRecipeById);

// Protected routes
router.post("/", protect, createRecipe);
router.put("/:id", protect, updateRecipe);
router.delete("/:id", protect, deleteRecipe);

export default router;
