import express from "express";
import { createForecast } from "../controllers/forecastController.js";
import requireAuth from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", requireAuth, createForecast);

export default router;