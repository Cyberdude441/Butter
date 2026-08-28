import express from "express";
import { chatHandler } from "../controllers/aiController.js";

const router = express.Router();

// POST /api/ai/chat
router.post("/chat", chatHandler);

export default router;
