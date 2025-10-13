import { Server, Socket } from "socket.io";
import { RedisClientType } from "redis";
import UserProgress from "../models/UserProgress";
import ChatMessage from "../models/ChatMessage";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface RedisSession {
  userId: string;
  recipeId: string;
  mode: "voice" | "text";
  currentStep: number;
}

export function registerSocketHandlers(io: Server, redis: RedisClientType) {
  io.on("connection", (socket: Socket) => {
    const user = socket.data.user as { userId: string; username?: string };
    console.log(`🟢 Socket connected: ${socket.id} (user: ${user.userId})`);

    // =============================
    // Redis session helpers
    // =============================

    async function saveSession(data: RedisSession) {
      const key = `session:${data.userId}:${data.recipeId}`;
      const redisData = {
        userId: data.userId,
        recipeId: data.recipeId,
        mode: data.mode,
        currentStep: data.currentStep.toString(), // Redis stores strings
      };
      await redis.hSet(key, redisData);
      await redis.expire(key, 60 * 60 * 4); // 4 hours TTL
    }

    async function getSession(userId: string, recipeId: string): Promise<RedisSession | null> {
      const key = `session:${userId}:${recipeId}`;
      const session = await redis.hGetAll(key);
      if (!Object.keys(session).length) return null;

      return {
        userId: session.userId,
        recipeId: session.recipeId,
        mode: session.mode as "voice" | "text",
        currentStep: parseInt(session.currentStep || "0", 10),
      };
    }

    // =============================
    // Socket events
    // =============================

    socket.on(
      "start",
      async (payload: { recipeId: string; recipeName?: string; mode?: "voice" | "text" }) => {
        try {
          const { recipeId, recipeName, mode } = payload;
          const userId = user.userId;
          const cached = await getSession(userId, recipeId);

          let progress =
            cached || (await UserProgress.findOne({ userId, recipeId }).lean());

          if (!progress) {
            // 🧠 Generate new recipe steps via OpenAI
            const response = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: "List concise step-by-step cooking instructions." },
                { role: "user", content: `How to make ${recipeName}` },
              ],
            });

            const steps =
              response.choices?.[0]?.message?.content?.split(/\d+\.\s*/) ?? [];

            await UserProgress.create({
              userId,
              recipeId,
              steps,
              mode: mode || "voice",
            });

            progress = {
              userId,
              recipeId,
              mode: mode || "voice",
              currentStep: 0,
            };
          }

          // Save session to Redis
          await saveSession({
            userId,
            recipeId,
            mode: (progress as any).mode || "voice",
            currentStep: (progress as any).currentStep || 0,
          });

          socket.join(`${userId}:${recipeId}`);
          socket.emit("progress", progress);
        } catch (err) {
          console.error("start error", err);
          socket.emit("error", { message: "Failed to start session" });
        }
      }
    );

    socket.on("voiceCommand", async (data: { recipeId: string; command: string }) => {
      const { recipeId, command } = data;
      const userId = user.userId;
      const key = `session:${userId}:${recipeId}`;
      const session = await getSession(userId, recipeId);
      if (!session)
        return socket.emit("error", { message: "No active session found" });

      const progress = await UserProgress.findOne({ userId, recipeId });
      const cmd = command.toLowerCase();

      if (cmd.includes("next")) {
        progress.currentStep++;
        await progress.save();
        session.currentStep = progress.currentStep;
        await saveSession(session);
      } else if (cmd.includes("repeat")) {
        // do nothing, repeat current step
      } else if (cmd.includes("previous")) {
        progress.currentStep = Math.max(0, progress.currentStep - 1);
        await progress.save();
        session.currentStep = progress.currentStep;
        await saveSession(session);
      }

      const step = progress.steps[progress.currentStep] || "🎉 Done cooking!";
      io.to(`${userId}:${recipeId}`).emit("instruction", { step });
    });

    socket.on("chatMessage", async (data: { recipeId: string; message: string }) => {
      const { recipeId, message } = data;
      const userId = user.userId;

      // Save chat
      await ChatMessage.create({
        userId,
        recipeId,
        message,
        fromUser: true,
      });

      // AI reply
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a friendly cooking assistant." },
          { role: "user", content: message },
        ],
      });

      const reply = aiResponse.choices[0].message?.content || "Got it!";
      await ChatMessage.create({
        userId,
        recipeId,
        message: reply,
        fromUser: false,
      });

      socket.emit("chatReply", { message: reply });
    });

    socket.on("disconnect", () => {
      console.log(`🔴 Socket disconnected: ${socket.id}`);
    });
  });
}
