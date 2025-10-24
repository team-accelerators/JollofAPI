import multer from "multer";
import { Request, Response } from "express";
import Recipe, { IRecipe } from "../models/recipe";

import User from "../models/user";
import { getOpenAIEmbedding } from "../utils/embedding";
import { cosineSimilarity } from "../utils/cosine";
import { generateRecipesFromOpenAI } from '../utils/openaiRecipes';
import { getFlaskEmbedding, getFlaskSimilarities } from "../utils/flaskEmbed";
import { generateRecipesFromProviders } from "../utils/externalProviders"; // 🔥 Combined Spoonacular + Edamam logic


import {
  detectIngredientsWithGoogleVision,
  analyzeImageWithOpenAI,
} from "../utils/visionUtils";

// 🧠 In-memory upload (no files written to disk)
// 🧠 Allow multiple image uploads
const upload = multer({ dest: "uploads/" });

// 🕒 Helper to cap API calls
const withTimeout = <T>(
  promise: Promise<T>,
  ms: number,
  fallback: T
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
};
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
const EMBEDDING_PROVIDER = process.env.EMBEDDING_PROVIDER || "local"; // "flask" | "local"

export const matchIngredientsToRecipes = async (req: Request, res: Response) => {
  try {
    const { inputText, filters, provider } = req.body;
    const file = (req as any).file;
    let combinedText = inputText || "";

    // 🖼️ Analyze uploaded image if present
    if (file) {
      console.log("🧾 Image uploaded:", file.originalname);

      const googleIngredients = await detectIngredientsWithGoogleVision(file.buffer);
      const openaiDetected = await analyzeImageWithOpenAI(file.buffer);

      const detectedIngredients = Array.from(
        new Set([...googleIngredients, ...openaiDetected])
      );

      console.log("🍅 Detected ingredients:", detectedIngredients);
      combinedText += " " + detectedIngredients.join(" ");
    }

    if (!combinedText.trim()) {
      return res
        .status(400)
        .json({ error: "Missing or invalid input text or image" });
    }

    const selectedProvider = provider || EMBEDDING_PROVIDER;
    console.log(`🚀 Using embedding provider: ${selectedProvider}`);

    // 🧠 Generate embedding (try Flask, fallback to OpenAI)
    let userEmbedding: number[] | null = null;
    try {
      if (selectedProvider === "flask") {
        userEmbedding = await getFlaskEmbedding(combinedText);
      } else {
        userEmbedding = await getOpenAIEmbedding(combinedText);
      }
    } catch (err) {
      console.error("❌ Embedding generation failed:", err);

      // 🚨 Fallback to OpenAI if Flask fails
      if (selectedProvider === "flask") {
        try {
          console.log("🔄 Falling back to OpenAI embedding...");
          userEmbedding = await getOpenAIEmbedding(combinedText);
        } catch (fallbackErr) {
          console.error("❌ Fallback embedding failed:", fallbackErr);
          userEmbedding = null;
        }
      }
    }

    // If embedding totally fails, skip to external providers
    if (!userEmbedding) {
      console.warn("⚠️ No valid embedding — switching to external recipe providers.");
      const fallbackRecipes = await generateRecipesFromProviders(combinedText, filters);
      return res.json({
        source: "external-fallback",
        provider: "spoonacular+edamam",
        recipes: fallbackRecipes,
      });
    }

    // 🧮 Apply optional filters
    const query: any = { embedding: { $exists: true } };
    if (filters?.costLevel) query.costLevel = filters.costLevel;
    if (filters?.dietaryTags?.length) query.dietaryTags = { $all: filters.dietaryTags };
    if (filters?.maxPrepTime) query.prepTime = { $lte: filters.maxPrepTime };
    if (filters?.cuisine) query.cuisine = filters.cuisine;
    if (filters?.moodTags?.length) query.moodTags = { $all: filters.moodTags };

    const recipes: IRecipe[] = await Recipe.find(query);
    const validRecipes = recipes.filter(
      (r) => Array.isArray(r.embedding) && r.embedding.length > 0
    );

    if (!validRecipes.length) {
      console.warn("⚠️ No recipes with valid embeddings found in DB.");
      const generatedRecipes = await generateRecipesFromProviders(combinedText, filters);
      return res.json({
        source: "external",
        provider: "spoonacular+edamam",
        recipes: generatedRecipes,
      });
    }

    // 🧮 Compute similarities
    let scored: { recipe: IRecipe; similarity: number }[] = [];
    if (selectedProvider === "flask") {
      try {
        const recipeEmbeddings = validRecipes.map((r) => r.embedding!);
        const similarities = await getFlaskSimilarities(userEmbedding, recipeEmbeddings);
        scored = validRecipes.map((recipe, i) => ({
          recipe,
          similarity: similarities[i],
        }));
      } catch (err) {
        console.error("⚠️ Flask similarity failed, using local cosine:", err);
        scored = validRecipes.map((recipe) => ({
          recipe,
          similarity: cosineSimilarity(userEmbedding!, recipe.embedding || []),
        }));
      }
    } else {
      scored = validRecipes.map((recipe) => ({
        recipe,
        similarity: cosineSimilarity(userEmbedding!, recipe.embedding || []),
      }));
    }

    // 🏆 Sort and return best matches
    const topRecipes = scored
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
      .map((r) => ({
        ...r.recipe.toObject(),
        similarity: r.similarity,
      }));

    // ✅ Return best results or fallback to external providers
    if (topRecipes.length > 0) {
      return res.json({
        source: "internal",
        provider: selectedProvider,
        recipes: topRecipes,
      });
    }

    console.log("⚠️ No internal matches — generating recipes externally...");
    const fallback = await generateRecipesFromProviders(combinedText, filters);
    return res.json({
      source: "external-fallback",
      provider: "spoonacular+edamam",
      recipes: fallback,
    });
  } catch (error) {
    console.error("❌ Ingredient matching failed:", error);
    return res.status(500).json({
      error: "Internal server error during recipe matching",
      details: error instanceof Error ? error.message : error,
    });
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

