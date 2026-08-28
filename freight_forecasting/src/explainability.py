"""Model Explainability module using feature attributions & SHAP."""
from __future__ import annotations
from typing import Dict, List, Any, Tuple
import numpy as np
import pandas as pd


class ForecastExplainer:
    """Explains freight rate predictions through feature importance and market factor contributions."""

    HUMAN_READABLE_FACTORS = {
        "bunker_price": "Bunker Fuel Cost",
        "bunker_lag_1": "Recent Bunker Trend",
        "bunker_lag_7": "Weekly Bunker Shift",
        "coal_price": "Thermal Coal Market Price",
        "coal_lag_1": "Recent Coal Price Level",
        "coal_lag_7": "Weekly Coal Shift",
        "demand_index": "Cargo Demand Index",
        "vessel_supply_index": "Vessel Fleet Availability",
        "demand_supply_ratio": "Demand/Supply Tightness",
        "port_congestion_index": "Port Congestion & Waiting Times",
        "congestion_lag_7": "Weekly Port Bottleneck Trend",
        "route_distance": "Voyage Nautical Distance",
        "season_enc": "Seasonal Trading Cycle",
        "month_sin": "Calendar Seasonality",
        "freight_lag_1": "Previous Day Freight Rate",
        "freight_lag_7": "7-Day Freight Momentum",
        "freight_lag_30": "30-Day Base Freight Level",
        "rolling_mean_30": "30-Day Moving Average",
        "rolling_std_30": "Historical Freight Volatility",
        "usd_inr": "USD/INR FX Rate",
        "oil_price": "Brent Crude Benchmark",
    }

    @classmethod
    def explain_prediction(
        cls,
        feature_row: pd.Series,
        baseline_means: pd.Series,
        feature_importances: Dict[str, float],
        top_k: int = 5,
    ) -> List[Dict[str, Any]]:
        """Generate human-readable drivers explaining why freight rate changed."""
        drivers = []
        for feat, imp in feature_importances.items():
            if feat not in feature_row or feat not in baseline_means:
                continue
            val = float(feature_row[feat])
            base_val = float(baseline_means[feat])
            
            diff = val - base_val
            direction = "Upward Pressure" if diff > 0 else "Downward Relief"
            arrow = "[UP]" if diff > 0 else "[DOWN]"
            
            label = cls.HUMAN_READABLE_FACTORS.get(feat, feat.replace("_", " ").title())
            drivers.append({
                "feature": feat,
                "factor": label,
                "importance": round(imp, 4),
                "current_value": round(val, 2),
                "baseline_value": round(base_val, 2),
                "direction": direction,
                "arrow": arrow,
                "explanation": f"{label} ({arrow} vs avg): Contributing {direction.lower()} based on market weight {round(imp * 100, 1)}%.",
            })
            if len(drivers) >= top_k:
                break
        return drivers
