/**
 * Compute cosine similarity between two numeric vectors.
 */
export const cosineSimilarity = (a: number[], b: number[]): number => {
  if (!a?.length || !b?.length) return 0;

  const dot = a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val ** 2, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val ** 2, 0));

  return normA && normB ? dot / (normA * normB) : 0;
};
