import axios from 'axios';
import dotenv from 'dotenv';


dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key in environment variables.');
}

interface OpenAIEmbeddingResponse {
  data: {
    object: string;
    index: number;
    embedding: number[];
  }[];
}

export const getOpenAIEmbedding = async (inputText: string): Promise<number[]> => {
  try {
    const response = await axios.post<OpenAIEmbeddingResponse>(
      'https://api.openai.com/v1/embeddings',
      {
        input: inputText,
        model: 'text-embedding-3-small',
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data[0].embedding;
  } catch (error: any) {
    console.error('OpenAI embedding error:', error.response?.data || error.message);
    throw new Error('Failed to get OpenAI embedding');
  }
};


