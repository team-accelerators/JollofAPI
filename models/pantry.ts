import mongoose, { Schema, Document } from "mongoose";

export interface IPantryItem extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  category?: string; // e.g. dairy, vegetable, grain, etc.
  imageUrl?: string;
  quantity?: number;
  expiryDate?: Date; // auto-estimated expiry based on category
  embedding?: number[];
  createdAt?: Date;
  updatedAt?: Date;
}

const pantrySchema = new Schema<IPantryItem>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "dairy",
        "vegetable",
        "fruit",
        "grain",
        "protein",
        "canned",
        "spice",
        "beverage",
        "bakery",
        "other",
      ],
      default: "other",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    quantity: {
      type: Number,
      default: 1,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    embedding: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPantryItem>("PantryItem", pantrySchema);
