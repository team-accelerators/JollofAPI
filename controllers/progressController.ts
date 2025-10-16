// src/controllers/progressController.ts
import { Request, Response } from "express";
import UserProgress from "../models/userProgress";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateSteps(recipeName: string) {
  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Return a numbered list of short steps to cook the requested recipe." },
      { role: "user", content: `Provide a numbered list of clear, short steps for cooking ${recipeName}.` },
    ],
  });
  const text = resp.choices?.[0]?.message?.content || "";
  const steps = text.split(/\d+\.\s*/).map(s => s.trim()).filter(Boolean);
  return steps;
}

export const startOrResume = async (req: Request, res: Response) => {
  try {
    const { userId, recipeId, recipeName, mode } = req.body;
    let progress = await UserProgress.findOne({ userId, recipeId });
    if (!progress) {
      const steps = recipeName ? await generateSteps(recipeName) : [];
      progress = await UserProgress.create({ userId, recipeId, steps, currentStep: 0, mode: mode || "voice" });
    } else {
      // update mode if client supplies
      if (mode) progress.mode = mode;
      progress.lastUpdated = new Date();
      await progress.save();
    }
    res.json({ progress });
  } catch (err) {
    console.error("startOrResume error:", err);
    res.status(500).json({ error: "Failed to start or resume" });
  }
};

export const toggleMode = async (req: Request, res: Response) => {
  try {
    const { userId, recipeId, mode } = req.body; // mode: 'voice'|'text'
    const progress = await UserProgress.findOneAndUpdate({ userId, recipeId }, { mode }, { new: true });
    if (!progress) return res.status(404).json({ error: "Progress not found" });
    res.json({ progress });
  } catch (err) {
    console.error("toggleMode error:", err);
    res.status(500).json({ error: "Failed to toggle mode" });
  }
};
