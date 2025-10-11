import mongoose, { Schema, Document, Types } from 'mongoose';

// Recipe Document Interface
export interface IRecipe extends Document {
  title: string;
  ingredients: string[];
  instructions: string;
  cuisine: string;
  dietaryTags: string[]; // e.g., ['vegan', 'gluten-free']
  prepTime: number;      // in minutes
  costLevel: 'low' | 'medium' | 'high';
  moodTags: string[];    // e.g., ['Comfort Food', 'Healthy Boost']
  imageUrl?: string;
  embedding?: number[];  // OpenAI vector
}

const recipeSchema = new Schema<IRecipe>({
  title: { type: String, required: true },
  ingredients: [{ type: String, required: true }],
  instructions: { type: String, required: true },

  cuisine: { type: String, required: true },
  dietaryTags: [{ type: String }],

  prepTime: { type: Number, required: true },
  costLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true,
  },

  moodTags: [{ type: String }],
  imageUrl: { type: String },

  embedding: [{ type: Number }],
});

const Recipe = mongoose.model<IRecipe>('Recipe', recipeSchema);
export default Recipe;
