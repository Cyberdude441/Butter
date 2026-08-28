import { chatWithCopilot, generateAIForecastPreview } from "../services/geminiService.js";

export const chatHandler = async (req, res) => {
  try {
    const {
      message,
      conversationHistory = [],
      forecastContext = {},
      currentRoute = {},
      currentOptimization = {},
    } = req.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "A message string is required.",
      });
    }

    const result = await chatWithCopilot({
      message: message.trim(),
      conversationHistory,
      forecastContext,
      currentRoute,
      currentOptimization,
    });

    return res.json({
      success: true,
      answer: result.answer,
      sources: result.sources || [],
      suggestions: result.suggestions || [],
    });
  } catch (error) {
    console.error("AI Controller Error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "AI Co-Pilot is temporarily unavailable. Please try again.",
    });
  }
};

export const forecastPreviewHandler = async (req, res) => {
  try {
    const context = req.body || {};
    const preview = await generateAIForecastPreview(context);

    return res.json({
      success: true,
      ...preview,
    });
  } catch (error) {
    console.error("AI Forecast Preview Error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate AI forecast preview.",
    });
  }
};
