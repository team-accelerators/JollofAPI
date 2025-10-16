import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const getOpenAICompletion = async (prompt: string) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: "You are a nutrition planner AI." },
               { role: "user", content: prompt }],
    temperature: 0.7,
  });

  try {
    return JSON.parse(response.choices[0].message.content || "{}");
  } catch {
    return { text: response.choices[0].message.content };
  }
};
