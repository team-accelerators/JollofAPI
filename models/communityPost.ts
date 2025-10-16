import mongoose from "mongoose";

const CommunityPostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String },
    category: { type: String, enum: ["recipe", "hack", "story"], default: "recipe" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.CommunityPost ||
  mongoose.model("CommunityPost", CommunityPostSchema);
