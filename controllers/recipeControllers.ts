import { Request, Response } from "express";
import Recipe from "../models/recipe";
import UserModel from "../models/user";
import { getOpenAIEmbedding } from "../utils/embedding";
import { cosineSimilarity } from "../utils/cosine";

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
      imageUrl,
    } = req.body;

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
    res.status(201).json(newRecipe);
  } catch (err) {
    console.error(err);
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

  if (!userId) return res.status(400).json({ error: "Missing userId in query" });

  try {
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const userProfileText = `
      ${user.dietaryPreferences.join(", ")},
      ${user.culturalBackground},
      ${user.cookingHabits?.skillLevel},
      ${user.cookingHabits?.prefersQuickMeals ? "quick meals" : ""},
      ${user.cookingHabits?.mealFrequency}
    `.trim();

    const userEmbedding = await getOpenAIEmbedding(userProfileText);
    const recipes = await Recipe.find({ embedding: { $exists: true } });

    const scored = recipes.map((recipe) => {
      const similarity = cosineSimilarity(userEmbedding, recipe.embedding || []);
      return { recipe, similarity };
    });

    const topRecipes = scored
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 20)
      .map((r) => r.recipe);

    res.json(topRecipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch personalized feed" });
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

    if (!inputText || typeof inputText !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid inputText' });
    }

    const userEmbedding = await getOpenAIEmbedding(inputText);

    const query: any = {
      embedding: { $exists: true },
    };

    // Filters
    if (filters?.costLevel) {
      query.costLevel = filters.costLevel;
    }

    if (filters?.dietaryTags && Array.isArray(filters.dietaryTags)) {
      query.dietaryTags = { $all: filters.dietaryTags };
    }

    if (filters?.maxPrepTime) {
      query.prepTime = { $lte: filters.maxPrepTime };
    }

    if (filters?.cuisine) {
      query.cuisine = filters.cuisine;
    }

    if (filters?.moodTags && Array.isArray(filters.moodTags)) {
      query.moodTags = { $all: filters.moodTags };
    }

    const recipes = await Recipe.find(query);

    const scored = recipes.map((recipe) => {
      const similarity = cosineSimilarity(userEmbedding, recipe.embedding || []);
      return { recipe, similarity };
    });

    const topRecipes = scored
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
      .map((r) => r.recipe);

    res.json(topRecipes);
  } catch (err) {
    console.error('Ingredient matching failed:', err);
    res.status(500).json({ error: 'Failed to match ingredients' });
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
