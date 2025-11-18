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
    unit: { type: String, required: true },
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
    description: { type: String, required: true },
  },
  { _id: false }
);

//
// 🧠 Recipe Interface (full backend model)
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

  tags: string[];
  nutritionNotes: string;

  imageUrl?: string;

  // Additions from your guide:
  costLevel: "low" | "medium" | "high";
  moodTags: string[];

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
      required: true,
    },

    category: { type: String, required: true },
    cuisine: { type: String, required: true },

    // 🍅 Full nested ingredients + instructions
    ingredients: { type: [ingredientSchema], required: true },
    instructions: { type: [instructionSchema], required: true },

    tags: [{ type: String }],
    nutritionNotes: { type: String },

    imageUrl: { type: String },

    // 💰 You did not include cost level in the UI, but the guide requires it
    costLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    // 😄 Mood tags (empty by default)
    moodTags: [{ type: String }],

    // 🔮 Vector embedding used for semantic search
    embedding: {
      type: [Number],
      default: [],
      index: "text",
    },
  },
  {
    timestamps: true,
  }
);

//
// 🔎 Text index for fallback search
//
recipeSchema.index({
  title: "text",
  description: "text",
  ingredients: "text",
  cuisine: "text",
  tags: "text",
  category: "text",
});

const Recipe = mongoose.model<IRecipe>("Recipe", recipeSchema);
export default Recipe;
