import { Request, Response } from "express";
import PantryItem from "../models/pantry";

import mongoose from "mongoose";

import Recipe, { IRecipe } from "../models/recipe";
import { cosineSimilarity } from "../utils/math";
import { getPantryEmbedding } from "../utils/pantryEmbedding";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * @desc Get all pantry items for a user
 * @route GET /api/pantry
 * @access Private
 */
export const getPantryItems = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id; // from auth middleware
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const items = await PantryItem.find({ user: userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("Error fetching pantry items:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc Add new pantry item
 * @route POST /api/pantry
 * @access Private
 */
export const addPantryItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { name, quantity, unit, category, expiryDate, lowStockThreshold } = req.body;

    if (!name) return res.status(400).json({ message: "Name is required" });

    const newItem = await PantryItem.create({
      user: userId,
      name,
      category,
      quantity,
      expiryDate,
      imageUrl: "",
      embedding: [],
      lowStockThreshold,
      unit,
    });

    res.status(201).json(newItem);
  } catch (err) {
    console.error("Error adding pantry item:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc Update pantry item quantity or other fields
 * @route PUT /api/pantry/:id
 * @access Private
 */
export const updatePantryItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const itemId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const item = await PantryItem.findOne({ _id: itemId, user: userId });
    if (!item) return res.status(404).json({ message: "Item not found" });

    Object.assign(item, req.body);
    await item.save();

    res.json(item);
  } catch (err) {
    console.error("Error updating pantry item:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc Delete pantry item
 * @route DELETE /api/pantry/:id
 * @access Private
 */
export const deletePantryItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const itemId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const item = await PantryItem.findOneAndDelete({ _id: itemId, user: userId });
    if (!item) return res.status(404).json({ message: "Item not found" });

    res.json({ message: "Item deleted" });
  } catch (err) {
    console.error("Error deleting pantry item:", err);
    res.status(500).json({ message: "Server error" });
  }
};




/**
 * 🔎 Helper: Generate AI shopping advice based on pantry & recipe
 */
const getMissingIngredientAdvice = async (
  pantryList: string,
  recipeIngredients: string[]
): Promise<string> => {
  try {
    const prompt = `
      Pantry: ${pantryList}
      Recipe Ingredients: ${recipeIngredients.join(", ")}
      Identify which ingredients are missing and suggest a short shopping list.
      Return a concise, friendly description (2 sentences max).
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful kitchen assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
    });

    return (
      completion.choices[0].message?.content?.trim() ||
      "No missing ingredients found!"
    );
  } catch (err) {
    console.error("❌ Missing ingredient analysis failed:", err);
    return "Unable to analyze missing ingredients.";
  }
};

/**
 * 🧠 Suggest recipes based on the user’s pantry items
 * @route GET /api/pantry/suggested
 * @access Private
 */
export const suggestRecipesFromPantry = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;

    // 🧺 1️⃣ Get pantry items
    const pantryItems = await PantryItem.find({ user: userId });
    if (!pantryItems.length) {
      return res.status(200).json({
        message: "No pantry items found.",
        data: [],
      });
    }

    const pantryList = pantryItems.map((i) => i.name).join(", ");

    // 🧩 2️⃣ Compute pantry embedding
    const pantryEmbedding = await getPantryEmbedding(
      pantryItems.map((i) => i.name)
    );

    if (!pantryEmbedding?.length) {
      return res.status(500).json({ error: "Failed to compute pantry embedding" });
    }

    // 🍳 3️⃣ Find all recipes with embeddings
    const recipes = await Recipe.find({
      embedding: { $exists: true, $ne: [] },
    }).lean<IRecipe[]>();

    // 🧮 4️⃣ Compute similarity scores
    const scoredRecipes = recipes
      .filter((r) => Array.isArray(r.embedding) && r.embedding.length > 0)
      .map((recipe) => {
        const similarity = cosineSimilarity(pantryEmbedding, recipe.embedding!);
        return { ...recipe, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5); // top 5 recipes

    // 🧠 5️⃣ Enrich results with AI missing ingredient advice
    const topRecipesWithAdvice = await Promise.all(
      scoredRecipes.map(async (recipe) => {
        const advice = await getMissingIngredientAdvice(
          pantryList,
          recipe.ingredients
        );
        return { ...recipe, advice };
      })
    );

    // ✅ 6️⃣ Send response
    return res.status(200).json({
      message: "Suggested recipes based on your pantry",
      count: topRecipesWithAdvice.length,
      data: topRecipesWithAdvice,
    });
  } catch (error: any) {
    console.error("❌ Error suggesting recipes:", error);
    return res.status(500).json({
      error: "Failed to suggest recipes.",
      details: error.message,
    });
  }
};