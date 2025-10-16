import { Request, Response } from "express";
import User from "../models/user";
import UserPreference from "../models/userPreference";
import { getOpenAICompletion } from "../utils/openaiHelper"; // custom utility for AI responses

/**
 * @route GET /api/mealplan/:userId
 * @desc Generate AI meal plan based on user preferences and goals
 */
export const generateMealPlan = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate("preferences");
    if (!user) return res.status(404).json({ error: "User not found" });

    const prefs = await UserPreference.findOne({ user: user._id });
    if (!prefs)
      return res
        .status(404)
        .json({ error: "User preferences not found" });

    const profileSummary = `
      User: ${user.name}.
      Dietary mode: ${prefs.dietaryMode || "none"}.
      Skill level: ${prefs.cookingHabits?.skillLevel || "beginner"}.
      Meal frequency: ${prefs.cookingHabits?.mealFrequency || "daily"}.
      Prefers quick meals: ${prefs.cookingHabits?.prefersQuickMeals ? "yes" : "no"}.
      Cultural background: ${prefs.culturalBackground || "unspecified"}.
      Fitness goal: ${prefs.fitnessGoals?.goalType || "maintenance"}.
      Target daily calories: ${prefs.fitnessGoals?.dailyCalories || "not set"}.
      Avoid allergens: ${(prefs.allergens?.length ? prefs.allergens.join(", ") : "none")}.
      Dietary preferences: ${(prefs.dietaryPreferences?.length ? prefs.dietaryPreferences.join(", ") : "none")}.
    `;

    // AI prompt for meal planning
    const prompt = `
      Generate a personalized weekly meal plan based on the following user profile:
      ${profileSummary}
      
      Format response as JSON:
      {
        "weekSummary": "string",
        "dailyMeals": [
          {
            "day": "Monday",
            "meals": [
              { "type": "Breakfast", "name": "string", "calories": number },
              { "type": "Lunch", "name": "string", "calories": number },
              { "type": "Dinner", "name": "string", "calories": number }
            ]
          }
        ]
      }
    `;

    const aiResponse = await getOpenAICompletion(prompt);

    res.json({
      success: true,
      user: user.name,
      preferences: prefs,
      mealPlan: aiResponse,
    });
  } catch (err) {
    console.error("Meal Plan Error:", err);
    res.status(500).json({ error: "Failed to generate AI meal plan" });
  }
};
