import express from "express";
import { chatHandler, forecastPreviewHandler } from "../controllers/aiController.js";

const router = express.Router();

// POST /api/ai/chat
router.post("/chat", chatHandler);

// POST /api/ai/forecast-preview
router.post("/forecast-preview", forecastPreviewHandler);

export default router;
