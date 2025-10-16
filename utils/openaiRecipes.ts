import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string;
  cuisine?: string;
  dietaryTags?: string[];
  moodTags?: string[];
  prepTime?: number;
  costLevel?: 'low' | 'medium' | 'high';
}

export const generateRecipesFromOpenAI = async (
  ingredientsText: string,
  filters?: any
): Promise<Recipe[]> => {
  const systemPrompt = `
You are an AI chef. Based on ingredients and optional filters like dietary tags, cuisine, mood, or prep time, generate up to 3 simple recipe suggestions. Use this format:

[
  {
    "title": "Recipe Title",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "instructions": "Step-by-step instructions...",
    "cuisine": "Indian",
    "dietaryTags": ["vegan"],
    "moodTags": ["Comfort Food"],
    "prepTime": 25,
    "costLevel": "low"
  }
]
`;

  const userPrompt = `I have: ${ingredientsText}
Filters: ${JSON.stringify(filters || {})}
Give me up to 3 recipes in JSON format.`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const content = response.data.choices[0].message.content;

  try {
    const recipes = JSON.parse(content);
    return Array.isArray(recipes) ? recipes.slice(0, 3) : [];
  } catch (err) {
    console.error('Failed to parse OpenAI response:', content);
    return [];
  }
};
