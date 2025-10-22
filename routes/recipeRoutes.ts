import express from "express";
import {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  getForYouRecipes,
  matchIngredientsToRecipes,
  uploadIngredientImage
} from "../controllers/recipeControllers";
import { protect, adminOnly } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/upload";

const router = express.Router();

/**
 * @route POST /api/recipes
 * @desc Create a new recipe (with AI embedding and Cloudinary image upload)
 * @access Private (Admin only)
 * @param {string} title - Recipe title
 * @param {string[]} ingredients - List of ingredients
 * @param {string[]} instructions - Cooking instructions
 * @param {string} cuisine - Cuisine type
 * @param {string[]} dietaryTags - Dietary preferences (vegan, keto, etc.)
 * @param {number} prepTime - Preparation time in minutes
 * @param {string} costLevel - Cost level (low, medium, high)
 * @param {string[]} moodTags - Tags like "comfort", "party", etc.
 * @param {file} image - Image file uploaded via Cloudinary
 * @returns {object} The created recipe document
 */
router.post("/", protect, adminOnly, upload.single("image"), createRecipe);

/**
 * @route GET /api/recipes
 * @desc Get all recipes
 * @access Public
 * @returns {object[]} List of all recipes
 */
router.get("/", getAllRecipes);

/**
 * @route GET /api/recipes/:id
 * @desc Get a recipe by its ID
 * @access Public
 * @param {string} id - Recipe MongoDB ObjectId
 * @returns {object} The recipe document
 */
router.get("/:id", getRecipeById);

/**
 * @route PUT /api/recipes/:id
 * @desc Update a recipe by its ID
 * @access Private (Admin only)
 * @param {string} id - Recipe MongoDB ObjectId
 * @returns {object} Updated recipe document
 */
router.put("/:id", protect, adminOnly, updateRecipe);

/**
 * @route DELETE /api/recipes/:id
 * @desc Delete a recipe by its ID
 * @access Private (Admin only)
 * @param {string} id - Recipe MongoDB ObjectId
 * @returns {string} Success message
 */
router.delete("/:id", protect, adminOnly, deleteRecipe);

/**
 * @route GET /api/recipes/foryou
 * @desc Get AI-personalized recipe recommendations based on user profile
 * @access Private
 * @query {string} userId - The ID of the user
 * @returns {object[]} Top recommended recipes
 */
router.get("/foryou", protect, getForYouRecipes);

/**
 * @route POST /api/recipes/match-ingredients
 * @desc Match input ingredients to similar recipes using AI embeddings
 * @access Public
 * @body {string} inputText - User's ingredient list (e.g., "tomato, rice, onion")
 * @body {object} filters - Optional filters (dietaryTags, costLevel, etc.)
 * @returns {object[]} Top 3 AI-matched recipes
 */
router.post("/match-ingredients", protect, uploadIngredientImage,  matchIngredientsToRecipes);

export default router;
