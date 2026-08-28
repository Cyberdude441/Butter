from __future__ import annotations

import os
import json
import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pandas as pd
from freight_forecasting.src.forecast import FreightForecaster
from freight_forecasting.src.config import parse_forecast_horizon

FORECASTER = FreightForecaster()


def make_response(payload: dict) -> dict:
    origin = str(payload.get("origin") or "Australia")
    destination = str(payload.get("destination") or "Paradip")
    vessel = str(payload.get("vesselType") or payload.get("vessel_type") or "Panamax")
    horizon = parse_forecast_horizon(payload.get("forecastPeriod") or payload.get("forecast_horizon") or 30)

    res = FORECASTER.predict(
        origin=origin,
        destination=destination,
        vessel_type=vessel,
        forecast_horizon=horizon,
    )

    f30 = res.get("forecast_details", {}).get("forecast_30d", {})
    f90 = res.get("forecast_details", {}).get("forecast_90d", {})

    return {
        "model": res["selected_model"],
        "modelScores": {
            "SARIMA": res["benchmark_models"]["SARIMA"]["validation_mae"],
            "XGBoost": res["benchmark_models"]["XGBoost"]["validation_mae"],
        },
        "latestRate": res["current_freight_rate"],
        "forecast30Day": {
            "rate": f30.get("rate", res["predicted_freight_rate"]),
            "lower": f30.get("lower", res["predicted_freight_rate"] * 0.95),
            "upper": f30.get("upper", res["predicted_freight_rate"] * 1.05),
        },
        "forecast90Day": {
            "rate": f90.get("rate", res["forecast_90d"]),
            "lower": f90.get("lower", res["forecast_90d"] * 0.95),
            "upper": f90.get("upper", res["forecast_90d"] * 1.05),
        },
        "trend": res["trend"],
        "volatility": res["volatility"],
        "marketSignal": res["market_signal"],
        "market_signal": res["market_signal"],
        "reason": res["reason"],
        "charterAdvice": res["reason"],
        "rateData": res["rateData"],
        "topDrivers": res["top_drivers"],
        "dataStatus": res["data_status"],
        "trainingObservations": len(FORECASTER.dataset) if FORECASTER.dataset is not None else 25000,
        "benchmark": {
            "xgboost30Day": f30.get("rate"),
            "xgboost90Day": f90.get("rate"),
            "xgboostResidualStd": f30.get("std", 0.5),
        },
    }


def run_app():
    from flask import Flask, jsonify, request
    app = Flask(__name__)

    @app.post("/forecast")
    def forecast():
        try:
            return jsonify(make_response(request.get_json(silent=True) or {}))
        except Exception as error:
            return jsonify({"message": str(error)}), 400

    @app.get("/health")
    def health():
        return jsonify({
            "status": "ok",
            "model": "FreightForecaster (Multi-Horizon XGBoost + SARIMA)",
        })

    app.run(host="127.0.0.1", port=int(os.getenv("FORECAST_PORT", "7100")), debug=False)


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--once":
        try:
            raw_input = sys.stdin.read() or "{}"
            payload = json.loads(raw_input)
            output = make_response(payload)
            print(json.dumps(output))
        except Exception as error:
            print(json.dumps({"message": str(error)}))
            sys.exit(1)
    else:
        run_app()
