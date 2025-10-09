import mongoose, { Document, Schema } from "mongoose";

export interface IRecipe extends Document {
  title: string;
  description: string;
  cuisine: string;
  diet?: string;
  difficulty?: string;
  prepTime?: number;
  ingredients: string[];
  instructions: string[];
  image?: string;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RecipeSchema = new Schema<IRecipe>(
  {
    title: { type: String, required: true },
    description: String,
    cuisine: { type: String, required: true },
    diet: String,
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    prepTime: Number,
    ingredients: [{ type: String, required: true }],
    instructions: [{ type: String, required: true }],
    image: String,
    nutrition: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model<IRecipe>("Recipe", RecipeSchema);
