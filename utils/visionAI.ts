import OpenAI from "openai";

/**
 * VisionAI utility
 * - Uses OpenAI Vision API to detect pantry items in an image.
 * - Automatically categorizes each item (e.g. dairy, fruit, grain).
 * - Estimates expiry date based on category.
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface PantryItemResult {
  name: string;
  category: string;
  expiryDate: Date;
}

/**
 * Estimate expiry date based on item category/type.
 */
const estimateExpiryDate = (category: string): Date => {
  const now = new Date();
  const categoryDays: Record<string, number> = {
    dairy: 7,
    vegetable: 5,
    fruit: 7,
    grain: 180,
    canned: 365,
    meat: 3,
    seafood: 2,
    bakery: 3,
    condiment: 180,
    other: 30,
  };

  const days = categoryDays[category.toLowerCase()] || 30;
  return new Date(now.setDate(now.getDate() + days));
};

/**
 * Process pantry image and extract structured AI insights.
 * @param imageUrl Cloudinary image URL
 * @returns Array of recognized items with category & expiryDate
 */
export const visionAi = async (imageUrl: string): Promise<PantryItemResult[]> => {
  try {
    const prompt = `
      You are a kitchen inventory assistant.
      Analyze the image and return a JSON array of food items detected.
      For each item, include:
      - "name" (e.g. tomato, milk, rice)
      - "category" (dairy, fruit, vegetable, meat, seafood, grain, canned, bakery, condiment, or other)
      Example output:
      [
        { "name": "tomato", "category": "vegetable" },
        { "name": "milk", "category": "dairy" }
      ]
    `;

    const result = await openai.chat.completions.create({
      model:  "gpt-4o",
      messages: [
        { role: "system", content: prompt },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this pantry image" },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      temperature: 0.4,
    });

    const responseText = result.choices[0].message?.content || "[]";
    let detectedItems: { name: string; category: string }[] = [];

    try {
      detectedItems = JSON.parse(responseText);
    } catch {
      console.warn("AI did not return valid JSON, parsing fallback triggered.");
      detectedItems = [];
    }

    const enrichedItems: PantryItemResult[] = detectedItems.map((item) => ({
      ...item,
      expiryDate: estimateExpiryDate(item.category),
    }));

    return enrichedItems;
  } catch (err) {
    console.error("Vision AI Error:", err);
    return [];
  }
};
