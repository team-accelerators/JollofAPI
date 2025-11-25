import express from "express";
import {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  myRecipe,
  generateRecipe,
  uploadIngredientImage
} from "../controllers/recipeControllers";
import { protect, adminOnly } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/upload";
import {authorize} from "../middlewares/roleMiddleware"
import {authLimiter} from '../middlewares/rateLimiter'

const router = express.Router();


/**
 * @route GET /api/recipes/my-recipe
 * @desc Get AI-personalized recipe recommendations based on user profile
 * @access Private
 * @query {string} userId - The ID of the user
 * @returns {object[]} Top recommended recipes
 */
router.get("/my-recipe", protect, myRecipe);

/**
 * @route POST /api/recipes/generate-recipe
 * @desc Match input ingredients to similar recipes using AI embeddings
 * @access Public
 * @body {string} inputText - User's ingredient list (e.g., "tomato, rice, onion")
 * @body {object} filters - Optional filters (dietaryTags, costLevel, etc.)
 * @returns {object[]} Top 3 AI-matched recipes
 */
router.post("/generate-recipe", authLimiter, protect, uploadIngredientImage,  generateRecipe);

/**
 * @route POST /api/recipes
 * @desc Create a new recipe (with AI embedding and Cloudinary image upload)
 * @access Private (Admin only)

 */
router.post("/", protect, authorize("admin", "staff"), upload.single("image"), createRecipe);

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


export default router;
