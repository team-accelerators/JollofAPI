import { Request, Response } from "express";
import User from "../models/user";
import UserPreference from "../models/userPreference";
import mongoose from "mongoose";
/**
 * @desc    Get logged-in user profile (with preferences)
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    const user = await User.findById(userId)
      .populate("preferences")
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @desc    Update user profile and preferences
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { name, avatar, preferences } = req.body;

    const user = await User.findById(userId).populate("preferences");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // --- Update basic user fields ---
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    // --- Update or create preferences ---
    if (preferences) {
      if (user.preferences) {
        // Update existing preferences
        await UserPreference.findByIdAndUpdate(
          user.preferences,
          { $set: preferences },
          { new: true, runValidators: true }
        );
      } else {
        // Create new preferences
        const newPref = await UserPreference.create({
          ...preferences,
          user: user._id,
        });
        user.preferences = newPref._id  as mongoose.Types.ObjectId;// ✅ Fixed: no optional chaining
      }
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .populate("preferences")
      .select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};


 
 /**
 * @desc    Get Get authorized User 
 * @route   GET /api/users/me
 * @access  Private/Admin
 */
export const  getAuthUser = async (req:Request,  res:Response) => {

  if (!req.user){
   return res.status(401).json({ success: false, message:`No User Found`})
  }
console.log(`my ${req.user}`)
 return  res.status(200).json({ success: true, message:`Welcome ${req.user}`, user: req.user })

  }


/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users/all
 * @access  Private/Admin
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find()
      .populate("preferences")
      .select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};
