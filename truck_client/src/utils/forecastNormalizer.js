/**
 * Normalizes backend forecast API payload into a clean, predictable structure.
 */
export function normalizeForecastResponse(apiResponse) {
  if (!apiResponse) return null;

  const qp = apiResponse.quick_forecast_preview || apiResponse.forecast?.quick_forecast_preview;
  const f = apiResponse.forecast || apiResponse;

  if (qp && qp.estimated_rate != null) {
    return {
      estimatedRate: Number(qp.estimated_rate),
      horizonDays: Number(qp.horizon_days || 30),
      confidence: Number(qp.confidence_percent || 88),
      trend: String(qp.trend || "Stable"),
      chartValues: Array.isArray(qp.chart_values) ? qp.chart_values : [],
      unit: qp.unit || "USD/MT",
      vesselOptimization: f.vessel_optimization || apiResponse.vessel_optimization,
      generatedAt: Date.now(),
    };
  }

  const rate = Number(f.estimatedRate ?? f.predictedRate ?? f.forecast30Day?.rate ?? 21.83);
  const isMid = String(apiResponse.query?.forecastPeriod || "").includes("90");
  const rate90 = Number(f.forecast90Day?.rate ?? f.forecast_90d ?? rate);
  const activeRate = isMid ? rate90 : rate;

  return {
    estimatedRate: activeRate,
    horizonDays: isMid ? 90 : 30,
    confidence: 87.5,
    trend: f.marketTrend || f.trend || "Stable",
    chartValues: (f.rateData || []).map(p => Number(p.projectedRate ?? p.historicalRate ?? activeRate)),
    unit: "USD/MT",
    vesselOptimization: f.vessel_optimization || apiResponse.vessel_optimization,
    generatedAt: Date.now(),
  };
}
