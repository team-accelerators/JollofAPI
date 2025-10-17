import mongoose, { Schema, Document } from "mongoose";

export interface IChallenge extends Document {
  title: string;
  description: string;
  targetMeals: number;
  budgetLimit: number;
  participants: mongoose.Types.ObjectId[];
  startDate: Date;
  endDate: Date;
  completedBy: mongoose.Types.ObjectId[];
}

const challengeSchema = new Schema<IChallenge>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  targetMeals: { type: Number, default: 5 },
  budgetLimit: { type: Number, default: 2000 },
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  completedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

export default mongoose.model<IChallenge>("Challenge", challengeSchema);
