import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/**
 * Determines category (e.g. dairy, vegetable) and expiry days for a pantry item.
 */
export const categorizeAndEstimateExpiry = async (
  itemName: string
): Promise<{ category: string; expiryDays: number }> => {
  try {
    // Quick local mapping for common items
    const quickMap: Record<string, { category: string; expiryDays: number }> = {
      milk: { category: "dairy", expiryDays: 7 },
      tomato: { category: "vegetable", expiryDays: 5 },
      rice: { category: "grain", expiryDays: 180 },
      bread: { category: "bakery", expiryDays: 3 },
      chicken: { category: "protein", expiryDays: 3 },
      egg: { category: "protein", expiryDays: 14 },
      onion: { category: "vegetable", expiryDays: 30 },
      apple: { category: "fruit", expiryDays: 20 },
    };

    const lower = itemName.toLowerCase();
    if (quickMap[lower]) return quickMap[lower];

    // If not in quick map, fallback to AI reasoning
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Classify the food item "${itemName}" into a pantry category (like dairy, vegetable, fruit, grain, protein, canned, spice, beverage, or other)
          and estimate its typical shelf life in days. Return result in JSON like:
          {"category":"<category>","expiryDays":<number>}`,
        },
      ],
    });

    const text = response.choices[0].message.content || "{}";
    const parsed = JSON.parse(text);

    return {
      category: parsed.category || "other",
      expiryDays: parsed.expiryDays || 30,
    };
  } catch (err) {
    console.error("AI categorization failed:", err);
    return { category: "other", expiryDays: 30 };
  }
};
