
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import forecastRoutes from "./routes/forecast.js";

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(serverDirectory, ".env") });

const PORT = process.env.PORT || 7000;

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/forecast", forecastRoutes);

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