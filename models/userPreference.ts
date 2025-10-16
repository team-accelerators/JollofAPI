import mongoose, { Schema, Document } from "mongoose";

export interface IUserPreference extends Document {
  user: mongoose.Types.ObjectId;
  dietaryPreferences: string[];
  cookingHabits: {
    skillLevel: "beginner" | "intermediate" | "advanced";
    mealFrequency: "daily" | "weekly" | "monthly";
    prefersQuickMeals: boolean;
  };
  culturalBackground?: string;
  fitnessGoals?: {
    goalType: "weight_loss" | "muscle_gain" | "maintenance";
    dailyCalories?: number;
  };
  allergens?: string[];
  calorieTarget?:string;
  dietaryMode?: "vegetarian" | "vegan" | "keto" | "halal" | "pescatarian";
}

const UserPreferenceSchema = new Schema<IUserPreference>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dietaryPreferences: [String],
    cookingHabits: {
      skillLevel: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
      mealFrequency: { type: String, enum: ["daily", "weekly", "monthly"], default: "daily" },
      prefersQuickMeals: { type: Boolean, default: true },
    },
    culturalBackground: String,
    fitnessGoals: {
      goalType: { type: String, enum: ["weight_loss", "muscle_gain", "maintenance"], default: "maintenance" },
      dailyCalories: Number,
    },
    allergens: [String],
    calorieTarget:String,
    dietaryMode: {
      type: String,
      enum: ["vegetarian", "vegan", "keto", "halal", "pescatarian"],
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUserPreference>("UserPreference", UserPreferenceSchema);
