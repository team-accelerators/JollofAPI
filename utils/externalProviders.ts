import { searchSpoonacularRecipes } from "../services/spoonacularService";

export const generateRecipesFromProviders = async (query: string, filters?: any) => {
  try {
    const spoonacularRes = await searchSpoonacularRecipes(query, filters);

    if (!spoonacularRes.length) {
      console.warn("⚠️ No recipes returned from Spoonacular.");
    }

    // Remove duplicates by title
    const uniqueRecipes = Array.from(
      new Map(spoonacularRes.map((r:any) => [r.title, r])).values()
    );

    // Limit to top 5 or whatever makes sense
    return uniqueRecipes.slice(0, 5);
  } catch (err) {
    console.error("❌ Spoonacular provider error:", err);
    return [];
  }
};
