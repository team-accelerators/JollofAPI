import OpenAI from "openai";



const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });


/**
 * Generate a single pantry embedding by averaging all item embeddings.
 */
export const getPantryEmbedding = async (items: string[]): Promise<number[]> => {
  try {
    const text = items.join(", ");
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return embeddingResponse.data[0].embedding;
  } catch (err) {
    console.error("Embedding error:", err);
    return [];
  }
};