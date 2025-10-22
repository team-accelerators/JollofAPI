import vision from "@google-cloud/vision";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, // Path to your service account JSON
});

// 🧠 Google Vision API — works directly with image buffer
export const detectIngredientsWithGoogleVision = async (imageBuffer: Buffer): Promise<string[]> => {
  try {
    const [result] = await visionClient.labelDetection({ image: { content: imageBuffer } });
    const labels = result.labelAnnotations || [];

    // ✅ Type-safe mapping
    return labels
      .filter((l) => l.score && l.score > 0.7 && l.description) // ensure description exists
      .map((l) => l.description!.toLowerCase()) // non-null assertion since we filtered it
      .filter(Boolean);
  } catch (err) {
    console.error("Google Vision failed:", err);
    return [];
  }
};
// 🧠 OpenAI Vision (GPT-4o)
export const analyzeImageWithOpenAI = async (imageBuffer: Buffer): Promise<string[]> => {
  try {
    const base64Image = imageBuffer.toString("base64");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "List all visible ingredients in this image as plain words.",
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
          ],
        },
      ],
    });

    const text = response.choices[0].message?.content ?? "";
    return text
      .split(/,|\n|and/)
      .map((i) => i.trim().toLowerCase())
      .filter(Boolean);
  } catch (err) {
    console.error("OpenAI Vision failed:", err);
    return [];
  }
};
