// src/config/redis.ts
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const pubClient = createClient({ url: REDIS_URL });
export const subClient = pubClient.duplicate();

export async function initRedis() {
  await pubClient.connect();
  await subClient.connect();
  console.log("✅ Redis connected");
}

export const socketAdapter = createAdapter(pubClient, subClient);
