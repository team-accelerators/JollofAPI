import mongoose, { Document, Schema, ObjectId , Types } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

interface CookingHabits {
  skillLevel: "beginner" | "intermediate" | "advanced";
  mealFrequency: "daily" | "weekly" | "monthly";
  prefersQuickMeals: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  googleId?: string;
  avatar?: string;
  isGoogleUser: boolean;

  password?: string;
  role: "admin" | "user";

  dietaryPreferences: string[];
  cookingHabits: CookingHabits;
  culturalBackground: string;

  savedRecipes: Types.ObjectId[];
  likedRecipes: Types.ObjectId[];

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

    dietaryPreferences: [{ type: String }],
    cookingHabits: {
      skillLevel: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
      },
      mealFrequency: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
      },
      prefersQuickMeals: { type: Boolean },
    },
    culturalBackground: { type: String },

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
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return resetToken;
};

export default mongoose.model<IUser>("User", UserSchema);
