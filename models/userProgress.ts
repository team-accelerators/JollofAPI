
import mongoose from "mongoose";

const ProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  recipeId: { type: String, required: true, index: true },
  steps: { type: [String], default: [] },
  currentStep: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now },
  mode: { type: String, enum: ["voice", "text"], default: "voice" }, // mode persisted
  handsFree: { type: Boolean, default: true },
  timerEnabled: { type: Boolean, default: false },
});

ProgressSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

export default mongoose.models.UserProgress ||
  mongoose.model("UserProgress", ProgressSchema);
