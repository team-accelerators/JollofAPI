import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import cors, { CorsOptions } from "cors";
import path from "path";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import bodyParser from "body-parser";

import authRoutes from "../routes/authRoutes";
import chatRoutes from "../routes/chatRoutes";
import pantryRoutes from "../routes/pantryRoutes";
import vendorRoutes from "../routes/vendorRoutes";
import recipeRoutes from "../routes/recipeRoutes";
import progressRoutes from '../routes/progressRoutes';
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

// -------------------------------------
// 1. Compression, Logging
// -------------------------------------
app.use(compression());
app.use(morgan("common"));

// -------------------------------------
// 2. CORS 
// -------------------------------------
const corsOptions: CorsOptions = {
  origin: process.env.CLIENT_URL,           
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

//Handle all OPTIONS requests globally
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL);
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    return res.sendStatus(200);
  }
  next();
});

// -------------------------------------
// 3. Add manual credentials header for Safari
// -------------------------------------
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// -------------------------------------
// 4. Security Middleware (Helmet must come AFTER CORS)
// -------------------------------------
app.use(
  helmet.crossOriginResourcePolicy({
    policy: "cross-origin",
  })
);

// -------------------------------------
// 5. Body Parsers (clean, no duplicates)
// -------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

// -------------------------------------
// 6. Cookies
// -------------------------------------
app.use(cookieParser());

// -------------------------------------
// 7. Test route
// -------------------------------------
app.get("/api/me", protect, (req, res) => {
  res.json({ user: req.user });
});

// -------------------------------------
// 8. Home page
// -------------------------------------
app.get("/", (req, res) => {
  res.send("👋 Welcome to JollofAI API");
});

// -------------------------------------
// 9. Routes
// -------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/pantry", pantryRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/meal-plans", mealPlanRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/cook-along", cookAlongRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/gamification", gamificationRoutes);

// -------------------------------------
// 10. Static files (Swagger)
// -------------------------------------
app.use("/swagger", express.static(path.join(__dirname, "../docs/swagger")));

// -------------------------------------
// 11. Mongo connection
// -------------------------------------
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

export default app;
