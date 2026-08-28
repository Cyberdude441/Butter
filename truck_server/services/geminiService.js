import { GoogleGenAI } from "@google/genai";

/**
 * Builds a structured, concise context string from dashboard state for AI Co-Pilot grounding.
 */
export const buildCopilotContext = ({ forecastContext = {}, currentRoute = {}, currentOptimization = {} } = {}) => {
  const f = forecastContext || {};
  const r = currentRoute || {};
  const opt = currentOptimization || f.vessel_optimization || f.vesselOptimization || {};
  const portOpt = f.optimal_port || f.optimalPort || {};
  const portAnalysis = f.port_analysis || f.portAnalysis || {};
  const marketIntel = f.market_intelligence || f.marketIntelligence || {};

  const origin = f.origin || r.origin || "Not specified";
  const destination = f.destination || r.destination || "Not specified";
  const vesselType = f.vesselType || f.vessel_type || r.vesselType || "Panamax";
  const cargoQty = f.cargoQuantity || f.cargo_quantity || r.cargoQuantity || 75000;
  const cargoType = r.cargoType || "Dry Bulk / Coal";

  const hasForecast = Boolean(f.latestRate || f.predictedRate || f.forecast30Day?.rate || f.forecast_30d);

  if (!hasForecast) {
    return `[DASHBOARD STATE: NO ACTIVE FORECAST RUN YET]
Selected Route: ${origin} -> ${destination}
Selected Vessel: ${vesselType}
Cargo: ${cargoType} (${Number(cargoQty).toLocaleString()} MT)
Note to Assistant: The user has not executed a forecast query yet. Answer general maritime/vessel/port questions accurately and suggest running a forecast for specific rate projections.`;
  }

  const currentRate = f.latestRate || f.current_freight_rate || "N/A";
  const rate30d = f.forecast30Day?.rate || f.forecast_30d || f.predictedRate || "N/A";
  const rate90d = f.forecast90Day?.rate || f.forecast_90d || "N/A";
  const trend = f.marketTrend || f.trend || "Stable";
  const volatility = f.volatility || "Low";
  const signal = f.marketSignal || f.market_signal || "MONITOR";
  const selectedModel = f.model || "Multi-Horizon XGBoost + SARIMA";

  // Vessel Optimization
  const selVessel = opt.selected_vessel || {};
  const optVessel = opt.optimized_vessel || {};
  const comp = opt.optimization_comparison || {};
  const isVesselOptimal = opt.is_user_selection_optimal;
  const selWait = selVessel.waiting_time_days ?? "N/A";
  const optWait = optVessel.waiting_time_days ?? "N/A";
  const waitSaved = comp.waiting_time_saved_days ?? "0.0";
  const idleReduction = comp.idle_time_reduction_percent ?? "0.0";
  const selScore = selVessel.total_operational_score ?? "N/A";
  const optScore = optVessel.total_operational_score ?? "N/A";

  // Port Optimization
  const selPort = portOpt.selected_port || portAnalysis.selected_port || destination;
  const recPort = portOpt.recommended_port || destination;
  const portScore = portOpt.optimization_score ?? "N/A";
  const congLevel = portAnalysis.congestion_level || "Medium";
  const congIndex = portAnalysis.congestion_index || "35.0";
  const portDelay = portAnalysis.estimated_delay_days || "2.0";

  // Market Intelligence
  const demandStatus = marketIntel.demand_status || "Normal";
  const demandIndex = marketIntel.demand_index || "100.0";
  const supplyStatus = marketIntel.supply_status || "Balanced";
  const supplyIndex = marketIntel.vessel_supply_index || "100.0";
  const marketPressure = marketIntel.market_pressure || "Neutral";

  return `[LIVE DASHBOARD & ML FORECAST CONTEXT]
• ROUTE: ${origin} to ${destination} (Discharge Port: ${destination})
• CARGO: ${cargoType}, ${Number(cargoQty).toLocaleString()} MT
• CHARTERING SIGNAL: ${signal} | Trend: ${trend} | Volatility: ${volatility}
• FREIGHT RATES: Current: $${currentRate}/MT | 30-Day Forecast: $${rate30d}/MT | 90-Day Forecast: $${rate90d}/MT (ML Model: ${selectedModel})
• MARKET INTELLIGENCE: Demand: ${demandStatus} (${demandIndex} index) | Vessel Fleet Supply: ${supplyStatus} (${supplyIndex} index) | Pricing Pressure: ${marketPressure}

• VESSEL SELECTION & OPTIMIZATION:
  - User Selected Baseline Vessel: ${selVessel.vessel_type || vesselType} (Feasible: ${selVessel.feasible !== false ? "Yes" : "No"}, Wait: ~${selWait}d, Idle: ~${selVessel.idle_time_days ?? "N/A"}d, Score: ${selScore}/100, Utilization: ${selVessel.cargo_utilization_pct ?? "N/A"}%)
  - AI Recommended Optimal Vessel: ${optVessel.vessel_type || vesselType} (Feasible: ${optVessel.feasible !== false ? "Yes" : "No"}, Wait: ~${optWait}d, Idle: ~${optVessel.idle_time_days ?? "N/A"}d, Score: ${optScore}/100, Utilization: ${optVessel.cargo_utilization_pct ?? "N/A"}%)
  - Optimization Status: ${opt.status || (isVesselOptimal ? "YOUR SELECTION IS OPTIMAL" : "OPTIMIZATION FOUND")}
  - Waiting Time Saved: ${waitSaved} Days | Idle Time Reduction: ${idleReduction}% | Operational Score Delta: +${comp.operational_score_improvement ?? 0} pts
  - Recommendation Summary: ${opt.recommendation_summary || "Optimal operational fit."}

• PORT CONGESTION & DISCHARGE OPTIMIZATION:
  - Selected Port: ${selPort} (Congestion: ${congLevel} / Index: ${congIndex}, Estimated Wait Delay: ~${portDelay} days)
  - Recommended Discharge Port: ${recPort} (Optimization Score: ${portScore}/100, Type: ${portOpt.recommendation_type || "Keep Selected Port"})
  - Port Operational Benefit: ${portOpt.expected_operational_benefit || "Direct terminal suitability."}`;
};

const SYSTEM_INSTRUCTION = `You are "Freight AI Co-Pilot", an expert maritime freight analytics and vessel chartering assistant for dry bulk cargo shipping to India's East Coast ports.

Your core expertise:
- Dry bulk shipping (Capesize, Panamax, Supramax, Handysize carriers, DWT capacities, draft/LOA/beam constraints, geared vs gearless, bunker fuel consumption).
- Indian East Coast ports: Paradip, Visakhapatnam, Gangavaram, Gopalpur, Dhamra, Haldia, Sagar/Sandheads.
- Key global bulk loading origins: Australia (Newcastle, Gladstone), USA (Hampton Roads, Baltimore), Mozambique (Nacala), Russia (Vostochny, Ust-Luga), Indonesia (Taboneo Anchorage).
- Freight rate forecasting, market intelligence (demand regimes, vessel supply tightness, pricing pressure), and chartering timing signals (CHARTER NOW, MONITOR, WAIT).
- Port congestion, draft restrictions, queue delays, demurrage exposure, and turnaround times.
- AI-assisted vessel optimization and waiting/idle time reduction calculations.

STRICT OPERATIONAL RULES:
1. Ground your answers directly in the provided [LIVE DASHBOARD & ML FORECAST CONTEXT].
2. When the user asks about rates, trends, port wait times, or vessel optimization, use the actual numbers from the context.
3. If no forecast has been run yet, provide expert maritime domain knowledge and suggest running a forecast for their specific route.
4. Clearly distinguish between model-derived figures and operational advice.
5. Keep explanations concise, professional, grounded, structured with bullet points where helpful, and decision-oriented.
6. Do not fabricate rates or data that are not in the context.`;

/**
 * Uses Gemini API to analyze the full forecast & optimization context and generate
 * a strictly structured Quick Forecast Preview JSON.
 */
export const generateAIForecastPreview = async (context = {}) => {
  const origin = context.origin || "Australia";
  const destination = context.destination || "Paradip";
  const cargoType = context.cargo_type || "Thermal Coal";
  const cargoQuantity = Number(context.cargo_quantity || 75000);
  const selectedVessel = context.selected_vessel || "Panamax";
  const optimizedVessel = context.optimized_vessel || selectedVessel;
  const horizonDays = Number(context.horizon_days || 30);

  const forecast = context.forecast || {};
  const currentRate = Number(forecast.current_rate ?? 21.0);
  const predictedRate = Number(forecast.predicted_rate ?? (currentRate || 21.83));
  const forecastSeries = Array.isArray(forecast.forecast_series) && forecast.forecast_series.length > 0
    ? forecast.forecast_series
    : [currentRate * 0.95, currentRate * 0.98, currentRate, (currentRate + predictedRate) / 2, predictedRate];
  const model = forecast.model || "Multi-Horizon XGBoost + SARIMA";
  const validationError = Number(forecast.validation_error || 0.45);

  const marketIntel = context.market_intelligence || {};
  const demand = marketIntel.demand || "Normal";
  const supply = marketIntel.supply || "Balanced";
  const pricingPressure = marketIntel.pricing_pressure || "Neutral";

  const vesselOpt = context.vessel_optimization || {};
  const waitingSaved = Number(vesselOpt.waiting_time_saved_days || 0.0);
  const idleReduction = Number(vesselOpt.idle_time_reduction_percent || 0.0);

  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback builder if Gemini is unavailable
  const fallbackPreview = () => {
    let trend = "Stable";
    if (predictedRate > currentRate * 1.015) trend = "Increasing";
    else if (predictedRate < currentRate * 0.985) trend = "Decreasing";

    let conf = Math.round(Math.max(70, Math.min(96, (1 - validationError / (predictedRate || 20)) * 100)) * 10) / 10;
    const cleanSeries = forecastSeries.slice(-5).map(v => Number(Number(v).toFixed(2)));

    return {
      estimated_rate: Number(predictedRate.toFixed(2)),
      unit: "USD/MT",
      horizon_days: horizonDays,
      confidence_percent: conf,
      trend,
      chart_values: cleanSeries,
      summary: `Freight rate projected at $${predictedRate.toFixed(2)}/MT for ${horizonDays}-day horizon with ${trend.toLowerCase()} momentum.`
    };
  };

  if (!apiKey || apiKey.includes("your_") || apiKey.length < 15) {
    return fallbackPreview();
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are generating a compact freight forecast preview for the dashboard.

Use the supplied application context as the source of truth:
- Route: ${origin} to ${destination}
- Cargo: ${cargoType}, ${cargoQuantity.toLocaleString()} MT
- Vessel Class: User Selected ${selectedVessel} (AI Optimized Alternative: ${optimizedVessel})
- Forecast Horizon: ${horizonDays} Days
- Freight Rates: Current: $${currentRate.toFixed(2)}/MT | ML Model Predicted: $${predictedRate.toFixed(2)}/MT
- Historical & Projected Timeline Series: [${forecastSeries.map(v => Number(v).toFixed(2)).join(", ")}]
- ML Model: ${model} (Validation MAE: $${validationError.toFixed(2)}/MT)
- Market Intelligence: Demand: ${demand} | Fleet Supply: ${supply} | Pricing Pressure: ${pricingPressure}
- Vessel Optimization: Waiting Time Saved: ${waitingSaved}d | Idle Reduction: ${idleReduction}%

Rules for JSON generation:
1. For estimated_rate: Use the model predicted rate ($${predictedRate.toFixed(2)}). Do not invent a disconnected number.
2. For unit: Always "USD/MT".
3. For horizon_days: Use ${horizonDays}.
4. For trend: Must be "Increasing", "Stable", or "Decreasing" based on predicted rate versus current rate and market context.
5. For chart_values: Provide an array of exactly 5 numbers reflecting the 5 sequential timeline points from current to forecast.
6. For confidence_percent: Estimate a realistic confidence percentage between 70 and 96 based on model quality (MAE $${validationError.toFixed(2)}), signal agreement, and data completeness.
7. For summary: A concise 1-2 sentence operational summary.

Return ONLY a valid JSON object with these exact keys:
{
  "estimated_rate": number,
  "unit": "USD/MT",
  "horizon_days": number,
  "confidence_percent": number,
  "trend": "Increasing" | "Stable" | "Decreasing",
  "chart_values": [number, number, number, number, number],
  "summary": string
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const responseText = response.text || "";
    const cleaned = responseText.replace(/^```json\s*/, "").replace(/```\s*$/, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      estimated_rate: Number(parsed.estimated_rate ?? predictedRate),
      unit: parsed.unit || "USD/MT",
      horizon_days: Number(parsed.horizon_days ?? horizonDays),
      confidence_percent: Number(parsed.confidence_percent ?? 88),
      trend: parsed.trend || "Stable",
      chart_values: Array.isArray(parsed.chart_values) && parsed.chart_values.length >= 5
        ? parsed.chart_values.slice(-5).map(v => Number(Number(v).toFixed(2)))
        : forecastSeries.slice(-5).map(v => Number(Number(v).toFixed(2))),
      summary: parsed.summary || `Projected at $${predictedRate.toFixed(2)}/MT for ${horizonDays}-day horizon.`
    };
  } catch (err) {
    console.warn("Gemini forecast preview generation error, falling back to ML context:", err.message);
    return fallbackPreview();
  }
};

/**
 * Executes a conversational turn with Gemini using @google/genai SDK.
 */
export const chatWithCopilot = async ({
  message,
  conversationHistory = [],
  forecastContext = {},
  currentRoute = {},
  currentOptimization = {},
}) => {
  if (!message || typeof message !== "string" || !message.trim()) {
    throw new Error("A valid message is required.");
  }

  const contextText = buildCopilotContext({
    forecastContext,
    currentRoute,
    currentOptimization,
  });

  const apiKey = process.env.GEMINI_API_KEY;

  const boundedHistory = (Array.isArray(conversationHistory) ? conversationHistory : [])
    .slice(-8)
    .map((msg) => ({
      role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
      text: String(msg.text || msg.content || "").trim(),
    }))
    .filter((msg) => msg.text.length > 0);

  const suggestions = generateContextualSuggestions({
    forecastContext,
    currentOptimization,
    message,
  });

  if (!apiKey || apiKey.includes("your_") || apiKey.length < 15) {
    return {
      success: true,
      answer: generateRuleBasedFallbackAnswer(message, contextText, forecastContext, currentOptimization),
      sources: ["Local Freight ML Pipeline", "Port Congestion Engine", "Vessel Optimizer"],
      suggestions,
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const contents = [
      {
        role: "user",
        parts: [{ text: `System Context & Current Live Dashboard Data:\n${contextText}\n\nPlease acknowledge and assist the user with this data.` }],
      },
      {
        role: "model",
        parts: [{ text: "Understood. I am Freight AI Co-Pilot, fully grounded in your active route, freight forecast, vessel optimization, and port analysis." }],
      },
    ];

    for (const hist of boundedHistory) {
      contents.push({
        role: hist.role,
        parts: [{ text: hist.text }],
      });
    }

    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.25,
      },
    });

    const answer = response.text || "I have analyzed your freight query based on current operational data.";

    return {
      success: true,
      answer: answer.trim(),
      sources: [
        "Freight Forecaster (XGBoost + SARIMA)",
        "Port Optimizer & Sagar Unnati Calibrated Congestion",
        "Vessel Optimization Engine",
      ],
      suggestions,
    };
  } catch (error) {
    console.error("Gemini API Error in chatWithCopilot:", error.message || error);
    return {
      success: true,
      answer: generateRuleBasedFallbackAnswer(message, contextText, forecastContext, currentOptimization),
      sources: ["Freight ML Pipeline", "Port Congestion Engine", "Vessel Optimizer"],
      suggestions,
    };
  }
};

const generateContextualSuggestions = ({ forecastContext = {}, currentOptimization = {}, message = "" }) => {
  const vOpt = currentOptimization || forecastContext?.vessel_optimization;
  const isOptimal = vOpt?.is_user_selection_optimal;
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes("vessel") || lowerMsg.includes("supramax") || lowerMsg.includes("panamax")) {
    return ["How much waiting time is saved?", "Should I charter now or wait?", "Compare port alternatives", "Explain cargo utilization"];
  }

  if (lowerMsg.includes("port") || lowerMsg.includes("gangavaram") || lowerMsg.includes("paradip")) {
    return ["What is the estimated delay at Paradip?", "Why was Gangavaram recommended?", "Which vessel has the lowest wait time?", "Should I charter now?"];
  }

  if (isOptimal === false) {
    return [
      "Why is the recommended vessel better?",
      "How much waiting time can I save?",
      "Should I charter now or wait?",
      "Compare alternative ports",
    ];
  }

  return [
    "Why this vessel?",
    "Should I charter now?",
    "Compare vessel options",
    "Why this port?",
    "How much time can I save?",
  ];
};

const generateRuleBasedFallbackAnswer = (question, contextText, forecastContext, currentOptimization) => {
  const q = question.toLowerCase();
  const f = forecastContext || {};
  const opt = currentOptimization || f.vessel_optimization || {};
  const selV = opt.selected_vessel || {};
  const optV = opt.optimized_vessel || {};
  const comp = opt.optimization_comparison || {};
  const portOpt = f.optimal_port || {};
  const portAnalysis = f.port_analysis || {};

  const hasForecast = Boolean(f.latestRate || f.predictedRate || f.forecast30Day?.rate);

  if (!hasForecast) {
    return `### Freight AI Co-Pilot Overview
Please run a forecast query for your route on the dashboard.`;
  }

  if (q.includes("vessel") || q.includes("supramax") || q.includes("panamax") || q.includes("why")) {
    if (opt.is_user_selection_optimal) {
      return `### Vessel Evaluation Analysis
Your selected **${selV.vessel_type || "Panamax"}** is the optimal vessel class (Score: **${selV.total_operational_score || 88}/100**).`;
    } else {
      return `### AI Vessel Optimization Finding
The system recommends **${optV.vessel_type || "Supramax"}** (Score: **${optV.total_operational_score || 91.2}/100**) over your selected **${selV.vessel_type || "Panamax"}** (Score: **${selV.total_operational_score || 78.5}/100**).
- **Waiting Time Saved:** Saves **${comp.waiting_time_saved_days || 1.4} days**.
- **Idle Reduction:** **${comp.idle_time_reduction_percent || 35.3}%**.`;
    }
  }

  return `### Maritime Intelligence Analysis
- **Route:** ${f.origin || "Australia"} → ${f.destination || "Paradip"}
- **Rate:** $${f.forecast30Day?.rate || f.predictedRate || 21.8}/MT (${f.marketTrend || "Stable"})
- **Recommendation:** **${optV.vessel_type || "Supramax"}**`;
};

export const generateForecastExplanation = async ({ input, modelForecast }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes("your_") || apiKey.length < 15) {
    return `Freight is projected at $${modelForecast.forecast30Day?.rate || 21.8}/MT in 30 days.`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Explain this bulk freight forecast for a logistics manager:
Route: ${input.origin} to ${input.destination}; vessel: ${input.vesselType}; cargo: ${input.cargoQuantity} MT;
Forecast model: ${JSON.stringify(modelForecast)}`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return result.text.trim();
  } catch (err) {
    return `Freight is projected at $${modelForecast.forecast30Day?.rate || 21.8}/MT.`;
  }
};
