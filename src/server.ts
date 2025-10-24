import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import cors, { CorsOptions } from "cors";
import path from "path";
import authRoutes from "../routes/authRoutes";
import chatRoutes from "../routes/chatRoutes";
import pantryRoutes from "../routes/pantryRoutes";
import vendorRoutes from "../routes/vendorRoutes";
import recipeRoutes from "../routes/recipeRoutes";
import progressRoutes from '../routes/progressRoutes'
import mealPlanRoutes from "../routes/mealPlanRoutes";
import nutritionRoutes from "../routes/nutritionRoutes";
import communityRoutes from "../routes/communityRoutes";
import cookAlongRoutes from "../routes/cookAlongRoutes";
import ratingRoutes from "../routes/ratingRoutes";
import userRoutes from "../routes/userRoutes";
import gamificationRoutes from "../routes/gamificationRoutes";

import { protect } from "../middlewares/authMiddleware";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
// ✅ Middleware: parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
   process.env!.FRONTEND_URL_dev, // Example frontend running locally
  process.env!.FRONTEND_URL_prod, //  production frontend
].filter(Boolean) as string[]; // remove undefined and ensure type

// Define CORS options
export const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "PUT", "POST", "DELETE"],
};

// Apply CORS middleware
app.use(cors(corsOptions));

// app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

app.get("/api/me", protect, (req, res) => {
  res.json({ user: req.user });
});

app.use("/swagger", express.static(path.join(__dirname, "../docs/swagger")));

// Home route
app.get('/', (req, res) => {
  res.send('👋 Welcome to JollofAI API');
});

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat",  chatRoutes);
app.use("/api/pantry",  pantryRoutes);
app.use("/api/vendors",  vendorRoutes);
app.use("/api/recipes",  recipeRoutes);
app.use('/api/progress',  progressRoutes)
app.use("/api/meal-plans",  mealPlanRoutes);
app.use("/api/nutrition",  nutritionRoutes);
app.use("/api/community",  communityRoutes);
app.use("/api/cook-along",  cookAlongRoutes);
app.use("/api/ratings",  ratingRoutes); 
app.use("/api/gamification",  gamificationRoutes);

export default app;



