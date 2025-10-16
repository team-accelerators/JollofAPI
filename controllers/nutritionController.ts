import { Request, Response } from "express";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Analyze nutritional composition of a recipe or pantry item
 */
export const analyzeNutrition = async (req: Request, res: Response) => {
  try {
    const { ingredients, servingSize } = req.body;
    if (!ingredients || !ingredients.length)
      return res.status(400).json({ message: "Ingredients required" });

    const prompt = `
    Given these ingredients: ${ingredients.join(", ")}
    Estimate per-serving calories, macros (carbs, protein, fat),
    and list possible allergens (nuts, dairy, gluten, etc.).
    Return concise JSON with {calories, macros, allergens}.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.3,
    });

    const result = completion.choices[0].message?.content;
    res.json({ nutrition: JSON.parse(result || "{}") });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Nutrition analysis failed" });
  }
};
