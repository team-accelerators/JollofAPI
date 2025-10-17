import mongoose, { Schema, Document } from "mongoose";

export interface IBadge extends Document {
  name: string;
  description: string;
  icon: string;
  criteria: string;
}

const badgeSchema = new Schema<IBadge>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  criteria: { type: String, required: true },
});

export default mongoose.model<IBadge>("Badge", badgeSchema);
