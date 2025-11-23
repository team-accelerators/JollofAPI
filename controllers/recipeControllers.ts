import multer from "multer";
import { Request, Response } from "express";
import Recipe, { IRecipe } from "../models/recipe";

import User from "../models/auth";



import {getFastapiEmbedding, getFastapiSimilarities} from '../services/fastapiService'

import { generateRecipesFromProviders } from "../utils/externalProviders"; // 🔥 Combined Spoonacular + Edamam logic

 import { cosineSimilarity } from "fast-cosine-similarity";
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
  console.log("Incoming form-data:", req.body);

  try {
    const {
      title,
      description,
      servings,
      prepTime,
      cookTime,
      difficulty,
      category,
      cuisine,
      ingredients,
      instructions,
      tags,
      moodTags,
      costLevel,
      nutrition,
      imageUrl, // ⬅️ frontend sends imageUrl
    } = req.body;

    // ----------- Parse JSON fields ----------- //
    let ingredientsParsed = [];
    let instructionsParsed = [];
    let tagsParsed = [];
    let moodTagsParsed = [];
    let nutritionParsed = [];

    try {
      ingredientsParsed = JSON.parse(ingredients || "[]");
      instructionsParsed = JSON.parse(instructions || "[]");
      tagsParsed = JSON.parse(tags || "[]");
      moodTagsParsed = JSON.parse(moodTags || "[]");
      nutritionParsed = JSON.parse(nutrition || "[]");
    } catch (err) {
      console.error("JSON parse error:", err);
    }

    // ----------- Safe Defaults ------------ //
    const safeTitle = (title || "Untitled Recipe").trim();
    const safeDescription = (description || "").trim();
    const safeServings = Number(servings) > 0 ? Number(servings) : 1;
    const safePrepTime = Number(prepTime) >= 0 ? Number(prepTime) : 0;
    const safeCookTime = Number(cookTime) >= 0 ? Number(cookTime) : 0;

    const safeDifficulty = ["Easy", "Medium", "Hard"].includes(difficulty)
      ? difficulty
      : "Medium";

    const safeCategory = (category || "Other").trim();
    const safeCuisine = (cuisine || "Other").trim();
    const safeCostLevel = ["low", "medium", "high"].includes(costLevel)
      ? costLevel
      : "medium";

    // ----------- Ingredients ------------ //
    const safeIngredients = (Array.isArray(ingredientsParsed) ? ingredientsParsed : []).map(
      (ing, index) => ({
        id: ing.id || `${Date.now()}-${index}`,
        name: ing.name?.trim(),
        amount: ing.amount?.trim(),
        unit: ing.unit?.trim(),
      })
    ).filter((i) => i.name && i.amount && i.unit);

    // ----------- Instructions ------------ //
    const safeInstructions = (Array.isArray(instructionsParsed) ? instructionsParsed : []).map(
      (inst, index) => ({
        id: inst.id || `${Date.now()}-inst-${index}`,
        step: index + 1,
        description: inst.description?.trim(),
      })
    ).filter((i) => i.description);

    // ----------- Tags ------------ //
    const safeTags = Array.isArray(tagsParsed)
      ? tagsParsed.filter(Boolean)
      : [];

    const safeMoodTags = Array.isArray(moodTagsParsed)
      ? moodTagsParsed.filter(Boolean)
      : [];

    // ----------- Nutrition ------------ //
    const safeNutrition = Array.isArray(nutritionParsed)
      ? nutritionParsed.map((n) => ({
          id: n.id || Date.now().toString(),
          calories: Number(n.calories) || 0,
          protein: Number(n.protein) || 0,
          fat: Number(n.fat) || 0,
          carbohydrates: Number(n.carbohydrates) || 0,
          fiber: Number(n.fiber) || 0,
          richIn: Array.isArray(n.richIn) ? n.richIn : [],
          notes: n.notes || "",
        }))
      : [];

    // ----------- Embedding Text ------------ //
    const textToEmbed = `${safeTitle} ${safeIngredients
      .map((i) => i.name)
      .join(", ")} ${safeCuisine} ${safeTags.join(", ")}`;

    const embedding = await getFastapiEmbedding(textToEmbed);

    // ----------- Create Recipe Document ------------ //
    const newRecipe = new Recipe({
      title: safeTitle,
      description: safeDescription,
      servings: safeServings,
      prepTime: safePrepTime,
      cookTime: safeCookTime,
      difficulty: safeDifficulty,
      category: safeCategory,
      cuisine: safeCuisine,

      ingredients: safeIngredients,
      instructions: safeInstructions,

      tags: safeTags,
      moodTags: safeMoodTags,
      costLevel: safeCostLevel,

      nutrition: safeNutrition, // ⬅️ NEW
      imageUrl,                // ⬅️ from Cloudinary
      embedding,
     
    });

    await newRecipe.save();

    res.status(201).json({
      success: true,
      message: "Recipe created successfully",
      data: newRecipe,
    });
  } catch (err) {
    console.error("Create recipe failed:", err);
    res.status(500).json({
      error: "Failed to create recipe",
      message: err
    });
  }
};

/**
 * @desc Personalized Recipe Feed (“For You”)
 * @route GET /api/recipes/my-recipe?userId=<id>
 * @access Private
 */
export const myRecipe = async (req: Request, res: Response) => {
  console.log(req.query.userId)
  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId in query", message: "Missing userId in query"  });
  }

  try {
    // Fetch user with linked preferences
    const user = await User.findById(userId).populate("preferences");
    if (!user) return res.status(404).json({ error: "User not found", message: "User not found" });

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
    const userEmbedding = await getFastapiEmbedding(userProfileText);

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
    
      console.log(topRecipes)
    res.json({
      success: true,
      message:"My recipes returned successfully",
      count: topRecipes.length,
      recommendations: topRecipes,
    });
  } catch (err) {
    console.error("Error generating personalized recipes:", err);
    res.status(500).json({ error: "Failed to fetch personalized recipe feed", message:"Failed to fetch personalized recipe feed" });
  }
};


/**
 * @desc Match ingredients to best-fitting recipes using AI
 * @route POST /api/recipes/ai/match
 * @access Public
 */
const EMBEDDING_PROVIDER = process.env.EMBEDDING_PROVIDER || "local"; // "fastapi" | "local"

export const generateRecipe = async (req: Request, res: Response) => {
  try {
    const { inputText, filters } = req.body;
    const files = (req as any).files as Express.Multer.File[] | undefined;

    let combinedText = inputText?.trim() ?? "";

    // If image(s) are uploaded, detect ingredients
    if (files && files.length > 0) {
      const allDetected: string[] = [];
      for (const file of files) {
        try {
          const google = await detectIngredientsWithGoogleVision(file.buffer);
          const openai = await analyzeImageWithOpenAI(file.buffer);
          allDetected.push(...google, ...openai);
        } catch (visionErr) {
          console.warn("🥽 Vision error for a file:", file.originalname, visionErr);
        }
      }
      const unique = Array.from(new Set(allDetected));
      if (unique.length > 0) {
        combinedText += " " + unique.join(" ");
      }
    }

    if (!combinedText) {
      return res.status(400).json({
        error: "Missing or invalid input: provide text or image to generate recipes",
         message: "Missing or invalid input: provide text or image to generate recipes",
      });
    }

    console.log("🚀 Generating embedding via FastAPI");
    const userEmbedding = await getFastapiEmbedding(combinedText);

    // Validate embedding
    if (!Array.isArray(userEmbedding) || userEmbedding.length === 0) {
      console.error("❌ Invalid embedding returned from FastAPI:", userEmbedding);
      // Fallback to external recipes (Spoonacular only)
      const fallbackRecipes = await generateRecipesFromProviders(combinedText, filters);
      return res.json({
        message:"recipe generated successfully!",
        source: "external",
        provider: "spoonacular",
        recipes: fallbackRecipes,
      });
    }

    // Build query to pull recipes from DB
    const query: any = { embedding: { $exists: true, $ne: [] } };
    if (filters?.costLevel) query.costLevel = filters.costLevel;
    if (filters?.dietaryTags?.length) query.dietaryTags = { $all: filters.dietaryTags };
    if (filters?.maxPrepTime) query.prepTime = { $lte: filters.maxPrepTime };
    if (filters?.cuisine) query.cuisine = filters.cuisine;
    if (filters?.moodTags?.length) query.moodTags = { $all: filters.moodTags };

    const recipes: IRecipe[] = await Recipe.find(query);
    const validRecipes = recipes.filter(r => Array.isArray(r.embedding) && r.embedding.length > 0);

    if (validRecipes.length === 0) {
      console.warn("⚠️ No internal recipes with embeddings found");
      const fallbackRecipes = await generateRecipesFromProviders(combinedText, filters);
      return res.json({
        message:"Fallback recipes generated!",
        source: "external",
        provider: "spoonacular",
        recipes: fallbackRecipes,
      });
    }

    console.log("🧮 Computing similarities via FastAPI");
    const recipeEmbeddings = validRecipes.map(r => r.embedding!);
    const similarities = await getFastapiSimilarities(userEmbedding, recipeEmbeddings);

    const scored = validRecipes.map((recipe, idx) => ({
      recipe,
      similarity: similarities[idx] ?? 0,
    }));

    const topRecipes = scored
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
      .map(r => ({
        ...r.recipe.toObject(),
        similarity: r.similarity,
      }));

    return res.json({
      message:"recipe generated successfully",
      source: "internal",
      provider: "fastapi",
      recipes: topRecipes,
    });
  } catch (error) {
    console.error("❌ Error in generateRecipe:", error);
    return res.status(500).json({
      error: "Internal server error during recipe generation",
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
    res.status(200).json({ success: true, message:"get all recipes successfull!", count: recipes.length, data: recipes });
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
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: "Recipe not found" });
    console.log(recipe)
    res.status(200).json({ success: true, data: recipe , message:"Recipe found!"});
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

