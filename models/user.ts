import mongoose, { Document, Model, Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Interface for CookingHabits
interface CookingHabits {
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  mealFrequency: 'daily' | 'weekly' | 'monthly';
  prefersQuickMeals: boolean;
}


interface IUserModel extends Model<IUser> {}


// User Document Interface
export interface IUser extends Document {
  name: string;
  email: string;
  googleId?: string;
  avatar?: string;
  isGoogleUser: boolean;

  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

  password?: string;

  dietaryPreferences: string[];
  cookingHabits: CookingHabits;
  culturalBackground: string;

  savedRecipes: Types.ObjectId[];
  likedRecipes: Types.ObjectId[];
    // 👇 Add these method declarations
  matchPassword(entered: string): Promise<boolean>;
  createPasswordResetToken(): string;

}

// Schema definition
const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },

  googleId: { type: String, unique: true, sparse: true },
  avatar: { type: String },
  isGoogleUser: { type: Boolean, default: false },

  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date },

  password: { type: String }, // Not required for Google users

  dietaryPreferences: [{ type: String }],
  cookingHabits: {
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    mealFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
    },
    prefersQuickMeals: { type: Boolean },
  },
  culturalBackground: { type: String },

  savedRecipes: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }],
  likedRecipes: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }],
});

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

const User = mongoose.model<IUser, IUserModel>("User", UserSchema);
export default User;
