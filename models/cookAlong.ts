import mongoose from "mongoose";

const CookAlongSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe", required: true },
    scheduledAt: { type: Date, required: true },
    hostUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isLive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.CookAlong ||
  mongoose.model("CookAlong", CookAlongSchema);
