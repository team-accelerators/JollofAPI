import axios from "axios";

const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID!;
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY!;

export const searchEdamamRecipes = async (query: string, filters?: any) => {
  try {
    const params: any = {
      q: query,
      app_id: EDAMAM_APP_ID,
      app_key: EDAMAM_APP_KEY,
      type: "public",
    };

    if (filters?.dietaryTags?.includes("vegan")) params.health = "vegan";
    if (filters?.dietaryTags?.includes("vegetarian")) params.health = "vegetarian";
    if (filters?.maxPrepTime) params.time = `1-${filters.maxPrepTime}`;

    const { data } = await axios.get("https://api.edamam.com/api/recipes/v2", {
      params,
    });

    if (!data.hits || data.hits.length === 0) return [];

    return data.hits.map((hit: any) => ({
      title: hit.recipe.label,
      image: hit.recipe.image,
      url: hit.recipe.url,
      source: "edamam",
      cuisine: hit.recipe.cuisineType?.[0] || "N/A",
      ingredients: hit.recipe.ingredientLines,
      calories: hit.recipe.calories,
    }));
  } catch (error) {
    console.error("❌ Edamam API error:", error);
    return [];
  }
};
