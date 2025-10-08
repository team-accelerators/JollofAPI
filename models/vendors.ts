import mongoose, { Schema, Document } from "mongoose";

export interface IVendor extends Document {
  name: string;
  placeId: string;
  address: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  phone?: string;
  website?: string;
  openingHours?: string[];
  rating?: number;
  userRatingsTotal?: number;
  cuisine?: string[];
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema = new Schema<IVendor>(
  {
    name: { type: String, required: true },
    placeId: { type: String, required: true, unique: true },
    address: { type: String },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    phone: String,
    website: String,
    openingHours: [String],
    rating: Number,
    userRatingsTotal: Number,
    cuisine: [String],
    image: String,
  },
  { timestamps: true }
);

VendorSchema.index({ location: "2dsphere" });

export default mongoose.model<IVendor>("Vendor", VendorSchema);
