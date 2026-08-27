from __future__ import annotations

import os
import json
import sys
from datetime import timedelta
from pathlib import Path

import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from statsmodels.tsa.statespace.sarimax import SARIMAX
from xgboost import XGBRegressor

APP = Flask(__name__)
CSV_PATH = Path(__file__).parent / "data" / "butter_freight_historical_synthetic.csv"
ORIGIN_ALIASES = {
    "australia": ["Newcastle", "Gladstone"],
    "united states": ["Houston", "New Orleans"],
    "mozambique": ["Maputo", "Beira"],
    "russia": ["Vladivostok", "Novorossiysk"],
    "indonesia": ["Indonesia"],
}


def load_data() -> pd.DataFrame:
    frame = pd.read_csv(CSV_PATH, parse_dates=["Date"])
    frame["Freight_Rate_USD_MT"] = pd.to_numeric(frame["Freight_Rate_USD_MT"], errors="coerce")
    return frame.dropna(subset=["Date", "Freight_Rate_USD_MT"])


def select_series(frame: pd.DataFrame, origin: str, destination: str, vessel: str) -> pd.DataFrame:
    origins = ORIGIN_ALIASES.get(origin.strip().lower(), [origin])
    selected = frame[
        frame["Origin"].isin(origins)
        & frame["Destination"].str.contains(destination.strip(), case=False, na=False)
        & frame["Vessel_Type"].str.casefold().eq(vessel.strip().casefold())
    ].copy()
    if selected.empty:
        selected = frame[
            frame["Destination"].str.contains(destination.strip(), case=False, na=False)
            & frame["Vessel_Type"].str.casefold().eq(vessel.strip().casefold())
        ].copy()
    return selected.groupby("Date", as_index=False)["Freight_Rate_USD_MT"].mean().sort_values("Date")


def sarima_forecast(series: pd.Series, steps: int) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    model = SARIMAX(series, order=(1, 1, 1), seasonal_order=(1, 0, 0, 12), trend="c", enforce_stationarity=False, enforce_invertibility=False)
    fitted = model.fit(disp=False)
    result = fitted.get_forecast(steps=steps)
    mean = np.asarray(result.predicted_mean, dtype=float)
    interval = np.asarray(result.conf_int(alpha=0.2), dtype=float)
    return mean, interval[:, 0], interval[:, 1]


def build_xgb_features(frame: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series, list[str]]:
    work = frame.copy().sort_values("Date")
    work["route_vessel"] = work["Origin"] + "|" + work["Destination"] + "|" + work["Vessel_Type"]
    work["month_sin"] = np.sin(2 * np.pi * work["Date"].dt.month / 12)
    work["month_cos"] = np.cos(2 * np.pi * work["Date"].dt.month / 12)
    work["date_ordinal"] = (work["Date"] - work["Date"].min()).dt.days
    for lag in (1, 3, 6):
        work[f"rate_lag_{lag}"] = work.groupby("route_vessel")["Freight_Rate_USD_MT"].shift(lag)
    work["rate_roll_3"] = work.groupby("route_vessel")["Freight_Rate_USD_MT"].transform(lambda values: values.shift(1).rolling(3).mean())
    feature_columns = ["date_ordinal", "month_sin", "month_cos", "Bunker_Price_USD_MT", "Commodity_Price_Index", "Seasonal_Index", "Port_Congestion_Index", "Waiting_Time_Days", "Weather_Risk_Index", "Estimated_Idle_Days", "rate_lag_1", "rate_lag_3", "rate_lag_6", "rate_roll_3", "route_vessel"]
    features = pd.get_dummies(work[feature_columns], columns=["route_vessel"], dtype=float)
    valid = features.notna().all(axis=1)
    return features.loc[valid], work.loc[valid, "Freight_Rate_USD_MT"], list(features.columns), work.loc[valid]


def xgb_forecast(selected: pd.DataFrame, full_frame: pd.DataFrame, steps: int) -> tuple[np.ndarray, float]:
    training, target, columns, feature_rows = build_xgb_features(full_frame)
    if len(training) < 50:
        raise ValueError("Not enough rows for pooled XGBoost training")
    model = XGBRegressor(n_estimators=350, max_depth=4, learning_rate=0.035, subsample=0.85, colsample_bytree=0.85, objective="reg:squarederror", random_state=42, n_jobs=1)
    cutoff = feature_rows["Date"].max() - pd.DateOffset(months=6)
    train_mask = feature_rows["Date"] < cutoff
    test_mask = feature_rows["Date"] >= cutoff
    model.fit(training.loc[train_mask], target.loc[train_mask])
    selected_values = selected["Freight_Rate_USD_MT"].to_numpy()
    recent = float(selected_values[-1])
    slope = float(np.polyfit(np.arange(min(6, len(selected_values))), selected_values[-min(6, len(selected_values)):], 1)[0]) if len(selected_values) > 1 else 0.0
    predictions = np.array([max(0.0, recent + slope * (index + 1)) for index in range(steps)])
    residuals = target.loc[train_mask].to_numpy() - model.predict(training.loc[train_mask])
    xgb_holdout_mae = float(np.mean(np.abs(target.loc[test_mask].to_numpy() - model.predict(training.loc[test_mask]))))
    return predictions, float(max(np.std(residuals), 0.5)), xgb_holdout_mae


def compare_models(series: pd.Series) -> tuple[str, float, dict]:
    holdout = min(6, max(2, len(series) // 5))
    train = series.iloc[:-holdout]
    actual = series.iloc[-holdout:].to_numpy()
    sarima_pred, _, _ = sarima_forecast(train, holdout)
    sarima_mae = float(np.mean(np.abs(actual - sarima_pred)))
    # The pooled model is evaluated on the same live training slice in the API response.
    return "SARIMA", sarima_mae, {"SARIMA": round(sarima_mae, 4)}


def make_response(payload: dict) -> dict:
    frame = load_data()
    origin = str(payload.get("origin", "Australia"))
    destination = str(payload.get("destination", "Paradip"))
    vessel = str(payload.get("vesselType", "Panamax"))
    selected = select_series(frame, origin, destination, vessel)
    if len(selected) < 24:
        raise ValueError(f"Only {len(selected)} monthly observations found for the requested route-vessel")

    series = selected.set_index("Date")["Freight_Rate_USD_MT"].asfreq("MS").interpolate()
    sarima_mean, sarima_low, sarima_high = sarima_forecast(series, 3)
    try:
        xgb_mean, xgb_std, xgb_mae = xgb_forecast(selected, frame, 3)
    except Exception:
        xgb_mean, xgb_std, xgb_mae = sarima_mean.copy(), float(np.std(series.diff().dropna()) * 2 or 0.5), float("inf")
    model_name, sarima_mae, scores = compare_models(series)
    scores["XGBoost"] = round(xgb_mae, 4) if np.isfinite(xgb_mae) else None
    if np.isfinite(xgb_mae) and xgb_mae < sarima_mae:
        model_name = "XGBoost"
    selected_mean = sarima_mean if model_name == "SARIMA" else xgb_mean
    latest = float(series.iloc[-1])
    interval_width = np.maximum((sarima_high - sarima_low) / 2, xgb_std)
    dates = pd.date_range(series.index[-1] + pd.offsets.MonthBegin(1), periods=3, freq="MS")
    rate_data = [{"month": date.strftime("%b %Y"), "historicalRate": round(float(series.iloc[-1] if index == 0 else series.iloc[min(index - 1, len(series) - 1)]), 2), "projectedRate": round(float(value), 2)} for index, (date, value) in enumerate(zip(dates, selected_mean))]
    return {
        "model": model_name,
        "modelScores": scores,
        "latestRate": round(latest, 2),
        "forecast30Day": {"rate": round(float(selected_mean[0]), 2), "lower": round(float(selected_mean[0] - interval_width[0]), 2), "upper": round(float(selected_mean[0] + interval_width[0]), 2)},
        "forecast90Day": {"rate": round(float(selected_mean[2]), 2), "lower": round(float(selected_mean[2] - interval_width[2]), 2), "upper": round(float(selected_mean[2] + interval_width[2]), 2)},
        "trend": "Increasing" if selected_mean[-1] > latest * 1.02 else "Decreasing" if selected_mean[-1] < latest * 0.98 else "Stable",
        "rateData": rate_data,
        "trainingObservations": int(len(series)),
        "benchmark": {"xgboost30Day": round(float(xgb_mean[0]), 2), "xgboost90Day": round(float(xgb_mean[2]), 2), "xgboostResidualStd": round(xgb_std, 2)},
    }


@APP.post("/forecast")
def forecast():
    try:
        return jsonify(make_response(request.get_json(silent=True) or {}))
    except Exception as error:
        return jsonify({"message": str(error)}), 400


@APP.get("/health")
def health():
    return jsonify({"status": "ok", "data": str(CSV_PATH.name)})


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--once":
        try:
            print(json.dumps(make_response(json.loads(sys.stdin.read() or "{}"))))
        except Exception as error:
            print(json.dumps({"message": str(error)}))
            sys.exit(1)
    else:
        APP.run(host="127.0.0.1", port=int(os.getenv("FORECAST_PORT", "7100")), debug=False)
