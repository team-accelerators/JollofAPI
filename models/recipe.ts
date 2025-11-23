import mongoose, { Schema, Document } from "mongoose";

//
// 🍽 Ingredient Subdocument
//
export interface IIngredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

const ingredientSchema = new Schema<IIngredient>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    amount: { type: String, required: true },
    unit: { type: String, required: true }
  },
  { _id: false }
);

//
// 👨‍🍳 Instruction Subdocument
//
export interface IInstruction {
  id: string;
  step: number;
  description: string;
}

const instructionSchema = new Schema<IInstruction>(
  {
    id: { type: String, required: true },
    step: { type: Number, required: true },
    description: { type: String, required: true }
  },
  { _id: false }
);

//
// 🥗  Nutrition Subdocument
//
export interface INutrition {
  id: string;
  calories: number;

  protein?: number;
  fat?: number;
  carbohydrates?: number;
  fiber?: number;

  richIn?: string[];
  notes?: string;
}

const nutritionSchema = new Schema<INutrition>(
  {
    id: { type: String, required: true },
    calories: { type: Number },

    protein: { type: Number },
    fat: { type: Number },
    carbohydrates: { type: Number },
    fiber: { type: Number },

    richIn: { type: [String], default: [] },

    notes: { type: String }
  },
  { _id: false }
);

//
// 😄 Mood Tag Type
//
export type MoodTag =
  | "comforting"
  | "light"
  | "indulgent"
  | "energizing"
  | "romantic"
  | "festive"
  | "cozy"
  | "quick"
  | "healthy"
  | "rainy-day";

const MOOD_TAGS: MoodTag[] = [
  "comforting",
  "light",
  "indulgent",
  "energizing",
  "romantic",
  "festive",
  "cozy",
  "quick",
  "healthy",
  "rainy-day"
];

//
// 🧠 Recipe Interface
//
export interface IRecipe extends Document {
  title: string;
  description: string;

  servings: number;
  prepTime: number;
  cookTime: number;

  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  cuisine: string;

  ingredients: IIngredient[];
  instructions: IInstruction[];
  nutrition: INutrition[];

  imageUrl?: string;

  costLevel: "low" | "medium" | "high";
  moodTags: MoodTag[];

  embedding?: number[];
  similarity?: number;

  createdAt?: Date;
  updatedAt?: Date;
}

//
// 📘 Recipe Schema
//
const recipeSchema = new Schema<IRecipe>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    servings: { type: Number, required: true },
    prepTime: { type: Number, required: true },
    cookTime: { type: Number, required: true },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true
    },

    category: { type: String, required: true },
    cuisine: { type: String, required: true },

    ingredients: { type: [ingredientSchema], required: true },
    instructions: { type: [instructionSchema], required: true },

    nutrition: { type: [nutritionSchema], required: true },

    imageUrl: { type: String },

    costLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },

    moodTags: [
      {
        type: String,
        enum: MOOD_TAGS,
        default: []
      }
    ],

    embedding: {
      type: [Number],
      default: [],
      index: "text"
    }
  },
  {
    timestamps: true
  }
);

recipeSchema.index({
  title: "text",
  description: "text",
  ingredients: "text",
  cuisine: "text",
  tags: "text",
  category: "text"
});

const Recipe = mongoose.model<IRecipe>("Recipe", recipeSchema);
export default Recipe;
