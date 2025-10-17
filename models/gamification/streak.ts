import mongoose, { Schema, Document } from "mongoose";

export interface IStreak extends Document {
  user: mongoose.Types.ObjectId;
  days: number;
  lastCookedAt: Date;
}

const streakSchema = new Schema<IStreak>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  days: { type: Number, default: 0 },
  lastCookedAt: { type: Date, default: null },
});

export default mongoose.model<IStreak>("Streak", streakSchema);
