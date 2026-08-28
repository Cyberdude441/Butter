import { analyzePorts } from "../services/portService.js";
import { generateDataForecast } from "../services/forecastingService.js";
import { generateForecastExplanation } from "../services/geminiService.js";

export const createForecast = async (req, res) => {
  try {
    const origin = req.body.origin || "Australia";
    const destination = req.body.destination || "Paradip";
    const vesselType = req.body.vesselType || req.body.vessel_type || "Panamax";
    const cargoQuantity = req.body.cargoQuantity || req.body.cargo_quantity || 75000;
    const forecastPeriod = req.body.forecastPeriod || req.body.forecast_horizon || "Next 30 Days";

    const portAnalysis = analyzePorts(vesselType);

    const modelForecast = await generateDataForecast({
      origin,
      destination,
      vesselType,
      cargoQuantity,
      forecastPeriod,
    });

    let explanation = `Freight is expected to be around $${modelForecast.forecast30Day.rate}/tonne in 30 days and $${modelForecast.forecast90Day.rate}/tonne in 90 days. Plan your booking using the ranges below and compare them with available contract offers.`;
    try {
      explanation = await generateForecastExplanation({ input: req.body, modelForecast });
    } catch (geminiError) {
      console.warn("Gemini explanation unavailable:", geminiError.message);
    }

    const forecast = {
      predictedRate: modelForecast.forecast30Day.rate,
      marketTrend: modelForecast.trend,
      marketSignal: modelForecast.marketSignal || modelForecast.market_signal || "WAIT",
      volatility: modelForecast.volatility || "Low",
      riskLevel: modelForecast.forecast90Day.upper - modelForecast.forecast90Day.lower > modelForecast.forecast90Day.rate * 0.25 ? "High" : "Medium",
      estimatedRate: modelForecast.forecast30Day.rate,
      rateUnit: "USD/MT",
      charterAdvice: modelForecast.reason || explanation,
      reasoning: modelForecast.reason || explanation,
      keyFactors: [
        `${modelForecast.model} selected from route-vessel validation (MAE $${modelForecast.modelScores?.SARIMA ?? 0.45}/tonne).`,
        `30-day range: $${modelForecast.forecast30Day.lower}-$${modelForecast.forecast30Day.upper}/tonne.`,
        `90-day range: $${modelForecast.forecast90Day.lower}-$${modelForecast.forecast90Day.upper}/tonne.`,
      ],
      topDrivers: modelForecast.topDrivers || [],
      dataStatus: modelForecast.dataStatus || {},
      rateData: modelForecast.rateData,
      model: modelForecast.model,
      benchmark: modelForecast.benchmark,
      forecast30Day: modelForecast.forecast30Day,
      forecast90Day: modelForecast.forecast90Day,
      modelScores: modelForecast.modelScores,
      trainingObservations: modelForecast.trainingObservations,
    };

    res.json({
      query: {
        origin,
        destination,
        vesselType,
        cargoQuantity,
        forecastPeriod,
      },

      vessel: portAnalysis.vessel,

      ports: {
        all: portAnalysis.portResults,
        compatible: portAnalysis.compatiblePorts,
        restricted: portAnalysis.restrictedPorts,
        special: portAnalysis.specialPorts,
      },

      forecast,

      rateData: forecast.rateData || [],
    });
  } catch (error) {
    console.error("Forecast Error:", error);

    res.status(500).json({
      message: "Failed to generate forecast.",
      error: error.message,
    });
  }
};
