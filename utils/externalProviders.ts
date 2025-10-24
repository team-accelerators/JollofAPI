import { searchSpoonacularRecipes } from "./spoonacularUtils";
import { searchEdamamRecipes } from "./edamamUtils";

export const generateRecipesFromProviders = async (query: string, filters?: any) => {
  try {
    const [spoonacular, edamam] = await Promise.allSettled([
      searchSpoonacularRecipes(query, filters),
      searchEdamamRecipes(query, filters),
    ]);

    const combined = [
      ...(spoonacular.status === "fulfilled" ? spoonacular.value : []),
      ...(edamam.status === "fulfilled" ? edamam.value : []),
    ];

    if (!combined.length) {
      console.warn("⚠️ No recipes returned from Spoonacular or Edamam.");
    }

    // Remove duplicates by title
    const uniqueRecipes = Array.from(
      new Map(combined.map((r) => [r.title, r])).values()
    );

    return uniqueRecipes.slice(0, 5); // Limit to top 5
  } catch (err) {
    console.error("❌ Combined provider error:", err);
    return [];
  }
};
