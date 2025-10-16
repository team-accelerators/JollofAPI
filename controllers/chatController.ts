// src/controllers/chatController.ts
import { Request, Response } from "express";
import ChatMessage from "../models/chatMessage";
import UserProgress from "../models/userProgress";
import OpenAI from "openai";

import dotenv from "dotenv";
dotenv.config();

// create OpenAI client                     
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/chat/message
export const postMessage = async (req: Request, res: Response) => {
  try {
    const { userId, recipeId, message } = req.body;
    if (!message) return res.status(400).json({ error: "message required" });

    // store user message
    await ChatMessage.create({ userId, recipeId, from: "user", content: message });

    // Basic application logic: if recipe progress exists and user asks for step control, handle; else call OpenAI for assistant reply
    const progress = await UserProgress.findOne({ userId, recipeId });

    // example: simple keywords for next/pause/repeat
    const cmd = message.toLowerCase();
    if (progress && cmd.includes("next")) {
      progress.currentStep = Math.min(progress.steps.length - 1, progress.currentStep + 1);
      await progress.save();
      const instruction = progress.steps[progress.currentStep] || "All steps completed!";
      await ChatMessage.create({ userId, recipeId, from: "assistant", content: instruction });
      return res.json({ reply: instruction });
    }

    // fallback: ask OpenAI to produce a helpful assistant message (short)
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful cooking assistant. Keep replies concise." },
        { role: "user", content: message },
      ],
    });

    const aiReply = response.choices?.[0]?.message?.content || "Sorry, I couldn't answer that.";
    await ChatMessage.create({ userId, recipeId, from: "assistant", content: aiReply });
    res.json({ reply: aiReply });
  } catch (err) {
    console.error("postMessage error:", err);
    res.status(500).json({ error: "Chat failed" });
  }
};

// GET /api/chat/history/:userId/:recipeId
export const getHistory = async (req: Request, res: Response) => {
  try {
    const { userId, recipeId } = req.params;
    const messages = await ChatMessage.find({ userId, recipeId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};
