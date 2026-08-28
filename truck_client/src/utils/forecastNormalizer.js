/**
 * Normalizes any backend forecast API payload into a clean, predictable, safe structure.
 */
export function normalizeForecastResponse(apiResponse) {
  if (!apiResponse) return null;

  const f = apiResponse.forecast || apiResponse;
  const query = apiResponse.query || {};

  const latestRate = Number(f.latestRate ?? f.currentFreightRate ?? f.current_freight_rate ?? 0) || null;
  const predictedRate = Number(f.predictedRate ?? f.estimatedRate ?? f.forecast30Day?.rate ?? f.forecast_30d ?? 0) || null;
  const forecast90Rate = Number(f.forecast90Day?.rate ?? f.forecast_90d ?? 0) || null;
  const forecast7Rate = Number(f.forecast_7d ?? f.forecast7Day?.rate ?? 0) || null;
  const forecast14Rate = Number(f.forecast_14d ?? f.forecast14Day?.rate ?? 0) || null;
  const forecast60Rate = Number(f.forecast_60d ?? f.forecast60Day?.rate ?? 0) || null;

  const lower = Number(f.forecast30Day?.lower ?? f.forecast_lower_bound ?? 0);
  const upper = Number(f.forecast30Day?.upper ?? f.forecast_upper_bound ?? 0);

  // Transparent confidence calculation from model empirical interval width & benchmark scores
  let confidencePct = 88;
  if (predictedRate && upper > lower && upper > 0) {
    const relativeSpread = (upper - lower) / predictedRate;
    confidencePct = Math.round(Math.max(65, Math.min(96, (1 - relativeSpread / 2) * 100)));
  } else if (f.modelScores?.SARIMA || f.modelScores?.XGBoost) {
    const mae = Math.min(f.modelScores.SARIMA || 1.0, f.modelScores.XGBoost || 1.0);
    confidencePct = Math.round(Math.max(70, Math.min(95, (1 - mae / (predictedRate || 20)) * 100)));
  }

  // Directional Trend
  const trend = f.marketTrend || f.trend || (predictedRate && latestRate ? (predictedRate > latestRate * 1.015 ? "Increasing" : predictedRate < latestRate * 0.985 ? "Decreasing" : "Stable") : "Stable");

  const rateData = Array.isArray(f.rateData) ? f.rateData : Array.isArray(apiResponse.rateData) ? apiResponse.rateData : [];

  return {
    estimatedRate: predictedRate,
    latestRate,
    forecast7Rate,
    forecast14Rate,
    forecast60Rate,
    forecast90Rate,
    currency: "USD",
    unit: "MT",
    horizonDays: Number(f.forecastHorizonDays || f.forecast_horizon_days || 30),
    confidence: confidencePct,
    trend,
    volatility: f.volatility || "Low",
    marketSignal: f.marketSignal || f.market_signal || "MONITOR",
    chartData: rateData,
    model: f.model || "Multi-Horizon XGBoost + SARIMA",
    vesselOptimization: f.vessel_optimization || f.vesselOptimization || apiResponse.vessel_optimization || null,
    portOptimization: f.optimal_port || f.optimalPort || apiResponse.optimal_port || null,
    marketIntelligence: f.market_intelligence || f.marketIntelligence || apiResponse.market_intelligence || null,
    portAnalysis: f.port_analysis || f.portAnalysis || apiResponse.port_analysis || null,
    generatedAt: Date.now(),
  };
}
