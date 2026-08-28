import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load truck_server/.env before importing routes/services
dotenv.config({ path: path.join(__dirname, ".env") });

console.log("==========================================");
console.log("Backend process startup directory:", __dirname);
console.log(".env file path:", path.join(__dirname, ".env"));
console.log("Gemini API key configured:", Boolean(process.env.GEMINI_API_KEY));
console.log("==========================================");

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import forecastRoutes from "./routes/forecast.js";
import aiRoutes from "./routes/ai.js";

const PORT = process.env.PORT || 7000;

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/forecast", forecastRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Intelligent Freight Forecasting Server");
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Keep event loop active in background environments
setInterval(() => {}, 60000);

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
