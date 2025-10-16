import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true }, // recipeId or vendorId
    targetType: { type: String, enum: ["recipe", "vendor"], required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    review: { type: String },
  },
  { timestamps: true }
);

RatingSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });

export default mongoose.models.Rating ||
  mongoose.model("Rating", RatingSchema);
