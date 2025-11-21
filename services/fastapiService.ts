import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// FastAPI endpoints (identical to the Flask ones)
const FASTAPI_EMBEDDING_URL =
  process.env.FASTAPI_EMBEDDING_URL || "http://127.0.0.1:8000/embed";

const FASTAPI_SIMILARITY_URL =
  process.env.FASTAPI_SIMILARITY_URL || "http://127.0.0.1:8000/similarity";

/**
 * Generate an embedding from the FastAPI microservice
 */
export async function getFastapiEmbedding(text: string): Promise<number[]> {
  try {
    const response = await axios.post(FASTAPI_EMBEDDING_URL, { text });
    return response.data.embedding;
  } catch (error: any) {
    console.error("❌ FastAPI embedding service error:", error.message);
    throw new Error("Failed to get embedding from FastAPI service");
  }
}

/**
 * Compute cosine similarity via FastAPI between user embedding and recipe embeddings
 */
export async function getFastapiSimilarities(
  userEmbedding: number[],
  recipeEmbeddings: number[][]
): Promise<number[]> {
  try {
    const response = await axios.post(FASTAPI_SIMILARITY_URL, {
      userEmbedding,
      recipeEmbeddings,
    });
    return response.data.similarities;
  } catch (error: any) {
    console.error("❌ FastAPI similarity service error:", error.message);
    throw new Error("Failed to compute similarity via FastAPI service");
  }
}
