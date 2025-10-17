import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { socketAdapter, pubClient } from "../config/redis";
import { registerSocketHandlers } from "./socketController";
import  { corsOptions } from '../src/server';
export async function initSocket(server: any) {
  const io = new Server(server, {
    cors:corsOptions,
    transports: ["websocket", 'polling']
  });

 
  // Apply Redis adapter (for scaling)
  io.adapter(socketAdapter);

  // JWT authentication middleware
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error("No token provided"));

      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as { userId: string; username?: string };

      if (!payload?.userId) return next(new Error("Invalid token payload"));
      socket.data.user = payload;
      next();
    } catch (err) {
      console.error("❌ Socket auth error:", err);
      next(new Error("Authentication failed"));
    }
  });

  // Register all socket event handlers
  registerSocketHandlers(io, pubClient as any); // use `as any` to handle module-typed Redis

  console.log("✅ Socket.IO initialized with Redis adapter");

  return io;
}
