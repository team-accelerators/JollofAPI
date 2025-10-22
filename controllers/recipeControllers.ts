import multer from "multer";
import { Request, Response } from "express";
import Recipe from "../models/recipe";

import User from "../models/user";
import { getOpenAIEmbedding } from "../utils/embedding";
import { cosineSimilarity } from "../utils/cosine";
import { generateRecipesFromOpenAI } from '../utils/openaiRecipes';


import {
  detectIngredientsWithGoogleVision,
  analyzeImageWithOpenAI,
} from "../utils/visionUtils";

// 🧠 In-memory upload (no files written to disk)
// 🧠 Allow multiple image uploads
const upload = multer({ dest: "uploads/" });
export const uploadIngredientImage = upload.array("images", 5); // up to 5 images


/**
 * @desc Create a new recipe with AI embedding
 * @route POST /api/recipes
 * @access Private
 */
export const createRecipe = async (req: Request, res: Response) => {
  try {
    const {
      title,
      ingredients,
      instructions,
      cuisine,
      dietaryTags,
      prepTime,
      costLevel,
      moodTags,
    } = req.body;

    // Cloudinary image from middleware
    const imageUrl = (req.file as any)?.path;

    const textToEmbed = `${title} ${ingredients.join(", ")} ${cuisine} ${dietaryTags.join(", ")}`;
    const embedding = await getOpenAIEmbedding(textToEmbed);

    const newRecipe = new Recipe({
      title,
      ingredients,
      instructions,
      cuisine,
      dietaryTags,
      prepTime,
      costLevel,
      moodTags,
      imageUrl,
      embedding,
    });

    await newRecipe.save();
    res.status(201).json({ success: true, data: newRecipe });
  } catch (err) {
    console.error("Create recipe failed:", err);
    res.status(500).json({ error: "Failed to create recipe" });
  }
};
/**
 * @desc Personalized Recipe Feed (“For You”)
 * @route GET /api/recipes/foryou?userId=<id>
 * @access Private
 */
export const getForYouRecipes = async (req: Request, res: Response) => {
  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId in query" });
  }

  try {
    // Fetch user with linked preferences
    const user = await User.findById(userId).populate("preferences");
    if (!user) return res.status(404).json({ error: "User not found" });

    const prefs = user.preferences as any;

    // --- Construct profile context ---
    const preferenceTextParts = [
      ...(prefs?.dietaryPreferences || []),
      prefs?.dietaryMode,
      prefs?.culturalBackground,
      prefs?.cookingHabits?.skillLevel,
      prefs?.cookingHabits?.prefersQuickMeals ? "quick meals" : "",
      prefs?.cookingHabits?.mealFrequency,
      prefs?.fitnessGoals?.goalType,
      prefs?.allergens?.length ? `Avoids: ${prefs.allergens.join(", ")}` : "",
    ].filter(Boolean);

    const userProfileText = preferenceTextParts.join(", ");

    // --- Generate embedding for the user's preference profile ---
    const userEmbedding = await getOpenAIEmbedding(userProfileText);

    // --- Retrieve recipes with existing embeddings ---
    const recipes = await Recipe.find({ embedding: { $exists: true } });

    // --- Compute cosine similarity between user and each recipe ---
    const scored = recipes.map((recipe) => {
      const similarity = cosineSimilarity(userEmbedding, recipe.embedding || []);
      return { recipe, similarity };
    });

    // --- Return top 20 recipes ---
    const topRecipes = scored
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 20)
      .map((r) => r.recipe);

    res.json({
      success: true,
      count: topRecipes.length,
      recommendations: topRecipes,
    });
  } catch (err) {
    console.error("Error generating personalized recipes:", err);
    res.status(500).json({ error: "Failed to fetch personalized recipe feed" });
  }
};


/**
 * @desc Match ingredients to best-fitting recipes using AI
 * @route POST /api/recipes/ai/match
 * @access Public
 */
export const matchIngredientsToRecipes = async (req: Request, res: Response) => {
  try {
    const { inputText, filters } = req.body;
    const file = (req as any).file;

    let combinedText = inputText || "";

    // 🖼️ If user uploaded an image, analyze it
    if (file) {
      console.log("🧾 Image uploaded:", file.originalname);

      // 1️⃣ Detect ingredients via Google Vision
      const googleIngredients = await detectIngredientsWithGoogleVision(file.buffer);

      // 2️⃣ Enhance with OpenAI Vision (GPT-4o)
      const openaiDetected = await analyzeImageWithOpenAI(file.buffer);

      const detectedIngredients = Array.from(
        new Set([...googleIngredients, ...openaiDetected])
      );

      console.log("🍅 Detected ingredients:", detectedIngredients);

      combinedText += " " + detectedIngredients.join(" ");
    }

    if (!combinedText || typeof combinedText !== "string") {
      return res.status(400).json({ error: "Missing or invalid input text or image" });
    }

    // 🧠 Generate user embedding
    const userEmbedding = await getOpenAIEmbedding(combinedText);

    // 🧮 Apply optional filters
    const query: any = { embedding: { $exists: true } };
    if (filters?.costLevel) query.costLevel = filters.costLevel;
    if (filters?.dietaryTags?.length) query.dietaryTags = { $all: filters.dietaryTags };
    if (filters?.maxPrepTime) query.prepTime = { $lte: filters.maxPrepTime };
    if (filters?.cuisine) query.cuisine = filters.cuisine;
    if (filters?.moodTags?.length) query.moodTags = { $all: filters.moodTags };

    const recipes = await Recipe.find(query);

    // 🧩 Compute similarity
    const scored = recipes.map((recipe) => ({
      recipe,
      similarity: cosineSimilarity(userEmbedding, recipe.embedding || []),
    }));

    const topRecipes = scored
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
      .map((r) => r.recipe);

    if (topRecipes.length > 0) {
      return res.json({ source: "internal", recipes: topRecipes });
    }

    // 🧠 Fallback — use OpenAI recipe generation
    const generatedRecipes = await generateRecipesFromOpenAI(combinedText, filters);
    return res.json({ source: "openai", recipes: generatedRecipes });
  } catch (err) {
    console.error("❌ Ingredient matching failed:", err);
    res.status(500).json({ error: "Failed to match ingredients" });
  }
};


/**
 * @desc Get all recipes
 * @route GET /api/recipes
 * @access Public
 */
export const getAllRecipes = async (req: Request, res: Response) => {
  try {
    const recipes = await Recipe.find().populate("ingredients.ingredient");
    res.status(200).json({ success: true, count: recipes.length, data: recipes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Get recipe by ID
 * @route GET /api/recipes/:id
 * @access Public
 */
export const getRecipeById = async (req: Request, res: Response) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate("ingredients.ingredient");
    if (!recipe) return res.status(404).json({ success: false, message: "Recipe not found" });
    res.status(200).json({ success: true, data: recipe });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update recipe
 * @route PUT /api/recipes/:id
 * @access Private
 */
export const updateRecipe = async (req: Request, res: Response) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!recipe) return res.status(404).json({ success: false, message: "Recipe not found" });
    res.status(200).json({ success: true, message: "Recipe updated", data: recipe });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Delete recipe
 * @route DELETE /api/recipes/:id
 * @access Private
 */
export const deleteRecipe = async (req: Request, res: Response) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: "Recipe not found" });
    res.status(200).json({ success: true, message: "Recipe deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

