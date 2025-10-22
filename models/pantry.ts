import mongoose, { Schema, Document } from "mongoose";

export interface IPantryItem extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  category?: string;
  imageUrl?: string;
  quantity?: number;
  unit?: string;
  expiryDate?: Date;
  lowStockThreshold?: number;
  addedDate?: Date;
  embedding?: number[];
  createdAt?: Date;
  updatedAt?: Date;
}

const pantrySchema = new Schema<IPantryItem>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
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
    imageUrl: { type: String, default: "" },
    quantity: { type: Number, default: 1 },
    unit: { type: String, default: "pieces" },
    expiryDate: { type: Date },
    lowStockThreshold: { type: Number, default: 5 },
    embedding: { type: [Number], default: [] },
    addedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IPantryItem>("PantryItem", pantrySchema);
