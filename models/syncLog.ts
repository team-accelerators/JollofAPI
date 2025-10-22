import mongoose, { Schema, Document } from "mongoose";

export interface ISyncLog extends Document {
  source: string;
  lat: number;
  lng: number;
  count: number;
  success: boolean;
  message?: string;
  createdAt: Date;
}

const SyncLogSchema = new Schema<ISyncLog>(
  {
    source: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    count: { type: Number, default: 0 },
    success: { type: Boolean, default: false },
    message: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<ISyncLog>("SyncLog", SyncLogSchema);
