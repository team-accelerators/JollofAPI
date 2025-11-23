import Joi from "joi";

// 🍽 Ingredient Schema
const ingredientSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  amount: Joi.string().required(),
  unit: Joi.string().required(),
});

// 👨‍🍳 Instruction Schema
const instructionSchema = Joi.object({
  id: Joi.string().required(),
  step: Joi.number().integer().min(1).required(),
  description: Joi.string().required(),
});

// 🥗 Nutrition Schema
const nutritionSchema = Joi.object({
  id: Joi.string().required(),
  calories: Joi.number().min(0).required(),

  protein: Joi.number().min(0).optional(),
  fat: Joi.number().min(0).optional(),
  carbohydrates: Joi.number().min(0).optional(),
  fiber: Joi.number().min(0).optional(),

  richIn: Joi.array().items(Joi.string()).default([]),
  notes: Joi.string().allow("").optional(),
});

// 😄 Mood Tags
const MOOD_TAGS = [
  "comforting",
  "light",
  "indulgent",
  "energizing",
  "romantic",
  "festive",
  "cozy",
  "quick",
  "healthy",
  "rainy-day",
];

// 🧪 Main Recipe Schema
export const createRecipeSchema = Joi.object({
  title: Joi.string().min(1).required(),
  description: Joi.string().min(1).required(),

  servings: Joi.number().integer().min(1).required(),
  prepTime: Joi.number().integer().min(0).required(),
  cookTime: Joi.number().integer().min(0).required(),

  difficulty: Joi.string().valid("Easy", "Medium", "Hard").required(),

  category: Joi.string().required(),
  cuisine: Joi.string().required(),

  ingredients: Joi.array().items(ingredientSchema).required(),
  instructions: Joi.array().items(instructionSchema).required(),
  nutrition: Joi.array().items(nutritionSchema).required(),

  tags: Joi.array().items(Joi.string()).default([]),
  moodTags: Joi.array().items(Joi.string().valid(...MOOD_TAGS)).default([]),

  costLevel: Joi.string().valid("low", "medium", "high").default("medium"),

  imageUrl: Joi.string().uri().optional(),

  // embedding is generated internally
  embedding: Joi.any().forbidden(),
});
