import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  avatar?: string;
  isGoogleUser: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  role: "user" | "admin";
  preferences?: {
    dietaryMode?: string;
    allergies?: string[];
  };
  matchPassword(entered: string): Promise<boolean>;
  createPasswordResetToken(): string;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    googleId: { type: String, unique: true, sparse: true },
    avatar: String,
    isGoogleUser: { type: Boolean, default: false },

    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date },

    role: { type: String, enum: ["user", "admin"], default: "user" },

    preferences: {
      dietaryMode: {
        type: String,
        enum: ["vegan", "vegetarian", "keto", "halal", "none"],
        default: "none",
      },
      allergies: [String],
    },
  },
  { timestamps: true }
);

UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  if (this.password) this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (entered: string) {
  return bcrypt.compare(entered, this.password || "");
};

UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  return resetToken;
};

export default mongoose.model<IUser>("User", UserSchema);
