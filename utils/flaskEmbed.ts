import axios from "axios";
import dotenv from "dotenv";
dotenv.config()
const FLASK_EMBEDDING_URL =
  process.env.FLASK_EMBEDDING_URL || "http://flask_service:5001/embed";
const FLASK_SIMILARITY_URL =
  process.env.FLASK_SIMILARITY_URL || "http://flask_service:5001/similarity";

/**
 * Generate an embedding from Flask microservice
 */
export async function getFlaskEmbedding(text: string): Promise<number[]> {
  try {
    const response = await axios.post(FLASK_EMBEDDING_URL, { text });
    return response.data.embedding;
  } catch (error: any) {
    console.error("❌ Flask embedding service error:", error.message);
    throw new Error("Failed to get embedding from Flask service");
  }
}

/**
 * Compute cosine similarity between a user embedding and multiple recipe embeddings via Flask
 */
export async function getFlaskSimilarities(
  userEmbedding: number[],
  recipeEmbeddings: number[][]
): Promise<number[]> {
  try {
    const response = await axios.post(FLASK_SIMILARITY_URL, {
      userEmbedding,
      recipeEmbeddings,
    });
    return response.data.similarities;
  } catch (error: any) {
    console.error("❌ Flask similarity service error:", error.message);
    throw new Error("Failed to compute similarity via Flask service");
  }
}
