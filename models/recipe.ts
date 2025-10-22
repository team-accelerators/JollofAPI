import mongoose, { Schema, Document } from "mongoose";

// 🍳 Recipe Interface
export interface IRecipe extends Document {
  title: string;
  ingredients: string[];
  instructions: string;
  cuisine: string;
  dietaryTags: string[]; // e.g., ['vegan', 'gluten-free']
  prepTime: number;      // in minutes
  costLevel: "low" | "medium" | "high";
  moodTags: string[];    // e.g., ['Comfort Food', 'Healthy Boost']
  imageUrl?: string;
  embedding?: number[];  // OpenAI vector
  similarity?: number;   // computed during pantry matching (not stored)
  createdAt?: Date;
  updatedAt?: Date;
}

// 🧠 Recipe Schema
const recipeSchema = new Schema<IRecipe>(
  {
    title: { type: String, required: true },
    ingredients: [{ type: String, required: true }],
    instructions: { type: String, required: true },

    cuisine: { type: String, required: true },
    dietaryTags: [{ type: String }],

    prepTime: { type: Number, required: true },
    costLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },

    moodTags: [{ type: String }],
    imageUrl: { type: String },

    // 🔮 OpenAI vector for similarity search
    embedding: {
      type: [Number],
      default: [],
      index: "text", // helps in semantic search queries (optional)
    },
  },
  {
    timestamps: true,
  }
);

// ⚙️ Add index for text-based search fallback
recipeSchema.index({
  title: "text",
  ingredients: "text",
  cuisine: "text",
  dietaryTags: "text",
  moodTags: "text",
});

const Recipe = mongoose.model<IRecipe>("Recipe", recipeSchema);
export default Recipe;
