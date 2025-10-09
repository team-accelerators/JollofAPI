import { Request, Response } from "express";
import Recipe from "../models/recipe";

// 🔹 Create new recipe
export const createRecipe = async (req: Request, res: Response) => {
  try {
    const recipe = await Recipe.create({ ...req.body, createdBy: req.user?._id });
    res.status(201).json({ success: true, recipe });    
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Get all recipes or search
export const getRecipes = async (req: Request, res: Response) => {
  try {
    const { name, cuisine, diet, ingredients, page = 1, limit = 20 } = req.query;
    const filter: any = {};

    if (name) filter.title = { $regex: new RegExp(name.toString(), "i") };
    if (cuisine) filter.cuisine = cuisine;
    if (diet) filter.diet = diet;

    // 🔍 Search by ingredient(s)
    if (ingredients) {
      const ingList = (ingredients as string).split(",").map((i) => i.trim());
      filter.ingredients = { $all: ingList };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const recipes = await Recipe.find(filter).skip(skip).limit(Number(limit));
    const total = await Recipe.countDocuments(filter);

    res.status(200).json({ success: true, total, page, pageSize: recipes.length, recipes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Get recipe by ID
export const getRecipeById = async (req: Request, res: Response) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: "Recipe not found" });
    res.status(200).json({ success: true, recipe });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Update recipe
export const updateRecipe = async (req: Request, res: Response) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!recipe) return res.status(404).json({ success: false, message: "Recipe not found" });
    res.status(200).json({ success: true, recipe });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Delete recipe
export const deleteRecipe = async (req: Request, res: Response) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: "Recipe not found" });
    res.status(200).json({ success: true, message: "Recipe deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
