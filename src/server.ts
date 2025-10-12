import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "../routes/authRoutes";
import { protect } from "../middlewares/authMiddleware";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

app.get("/api/me", protect, (req, res) => {
  res.json({ user: req.user });
});



// Home route
app.get('/', (req, res) => {
  res.send('👋 Welcome to JollofAI API');
});

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

app.use("/api/auth", authRoutes);

export default app;



