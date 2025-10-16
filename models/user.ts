import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface IUser extends Document {
  name: string;
  email: string;
  googleId?: string;
  avatar?: string;
  isGoogleUser: boolean;
  password?: string;
  role: "admin" | "user";
  preferences?: mongoose.Types.ObjectId;
  savedRecipes: mongoose.Types.ObjectId[];
  likedRecipes: mongoose.Types.ObjectId[];
  passwordResetToken?: string;
  passwordResetExpires?: Date;

  matchPassword(entered: string): Promise<boolean>;
  createPasswordResetToken(): string;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    googleId: { type: String, unique: true, sparse: true },
    avatar: { type: String },
    isGoogleUser: { type: Boolean, default: false },
    password: { type: String, select: false },
    role: { type: String, enum: ["admin", "user"], default: "user" },

    // Relationship
    preferences: { type: Schema.Types.ObjectId, ref: "UserPreference" },

    savedRecipes: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],
    likedRecipes: [{ type: Schema.Types.ObjectId, ref: "Recipe" }],

    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  { timestamps: true }
);

// Hash password before save
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
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return resetToken;
};

export default mongoose.model<IUser>("User", UserSchema);
