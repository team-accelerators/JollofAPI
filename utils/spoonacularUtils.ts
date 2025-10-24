import axios from "axios";

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY!;

export const searchSpoonacularRecipes = async (query: string, filters?: any) => {
  try {
    const params: any = {
      apiKey: SPOONACULAR_API_KEY,
      query,
      number: 3,
    };

    if (filters?.dietaryTags?.includes("vegan")) params.diet = "vegan";
    if (filters?.maxPrepTime) params.maxReadyTime = filters.maxPrepTime;

    const { data } = await axios.get(
      "https://api.spoonacular.com/recipes/complexSearch",
      { params }
    );

    if (!data.results || data.results.length === 0) return [];

    return data.results.map((r: any) => ({
      title: r.title,
      image: r.image,
      source: "spoonacular",
      url: `https://spoonacular.com/recipes/${r.title.replace(/\s+/g, "-")}-${r.id}`,
    }));
  } catch (error) {
    console.error("❌ Spoonacular API error:", error);
    return [];
  }
};
