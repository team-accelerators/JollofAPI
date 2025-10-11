import express from "express";
import {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  getForYouRecipes,
  matchIngredientsToRecipes,
} from "../controllers/recipeControllers";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

/**
 * ==============================
 * 📦 CRUD ROUTES
 * ==============================
 */
router.post("/", protect, createRecipe);        // Create new recipe
router.get("/", getAllRecipes);                 // Get all recipes
router.get("/:id", getRecipeById);              // Get single recipe by ID
router.put("/:id", protect, updateRecipe);      // Update recipe
router.delete("/:id", protect, deleteRecipe);   // Delete recipe

/**
 * ==============================
 * 🤖 AI-POWERED ROUTES
 * ==============================
 */
router.get("/foryou", protect, getForYouRecipes);        // Personalized feed
router.post("/ai/match", matchIngredientsToRecipes);     // Ingredient-to-recipe match

export default router;
