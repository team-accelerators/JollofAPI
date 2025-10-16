// import { Request, Response } from "express";
// import UserPreference from "../models/userPreference";
// import User from "../models/user";

// /**
//  * @route PUT /api/user/preferences
//  * @desc Create or update user preferences
//  * @access Private
//  */
// export const updatePreferences = async (req: Request, res: Response) => {
//   try {
//     const userId = (req as any).user.id;
//     const {
//       dietaryPreferences,
//       cookingHabits,
//       culturalBackground,
//       fitnessGoals,
//       allergens,
//       dietaryMode,
//     } = req.body;

//     // Find or create user preference
//     let preferences = await UserPreference.findOne({ user: userId });

//     if (!preferences) {
//       preferences = await UserPreference.create({
//         user: userId,
//         dietaryPreferences,
//         cookingHabits,
//         culturalBackground,
//         fitnessGoals,
//         allergens,
//         dietaryMode,
//       });

//       // Link preference to user
//       await User.findByIdAndUpdate(userId, { preferences: preferences._id });
//     } else {
//       // Update existing preference
//       preferences.set({
//         dietaryPreferences,
//         cookingHabits,
//         culturalBackground,
//         fitnessGoals,
//         allergens,
//         dietaryMode,
//       });
//       await preferences.save();
//     }

//     res.status(200).json({ message: "Preferences updated successfully", preferences });
//   } catch (error) {
//     console.error("Preferences Update Error:", error);
//     res.status(500).json({ error: "Server error updating preferences" });
//   }
// };
