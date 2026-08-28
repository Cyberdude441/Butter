"""Market Intelligence Engine for Bulk Freight Forecasting."""
from __future__ import annotations
from typing import Dict, Any, Optional
import pandas as pd
import numpy as np
from .config import (
    DEMAND_HIGH_THRESH,
    DEMAND_LOW_THRESH,
    SUPPLY_TIGHT_THRESH,
    SUPPLY_EXCESS_THRESH,
    DEMAND_SUPPLY_UPWARD,
    DEMAND_SUPPLY_DOWNWARD,
    CONGESTION_LOW_THRESH,
    CONGESTION_HIGH_THRESH,
)


class MarketIntelligence:
    """Derives current market indicators, supply-demand pressure, and congestion regimes."""

    @classmethod
    def analyze_market(cls, route_df: pd.DataFrame, full_df: Optional[pd.DataFrame] = None) -> Dict[str, Any]:
        """Extract latest market conditions and classify market pressure based on actual dataset."""
        df = route_df if not route_df.empty else full_df
        if df is None or df.empty:
            return {
                "demand_index": 100.0,
                "demand_status": "Normal",
                "vessel_supply_index": 100.0,
                "supply_status": "Balanced",
                "demand_supply_ratio": 1.0,
                "market_pressure": "Neutral",
                "port_congestion_index": 35.0,
                "congestion_level": "Medium",
            }

        latest_row = df.sort_values("date").iloc[-1]

        # 1. Demand Index
        demand_val = float(latest_row.get("cargo_demand_index") or latest_row.get("demand_index") or 100.0)
        if demand_val > DEMAND_HIGH_THRESH:
            demand_status = "High"
        elif demand_val < DEMAND_LOW_THRESH:
            demand_status = "Low"
        else:
            demand_status = "Normal"

        # 2. Vessel Supply Index
        supply_val = float(latest_row.get("vessel_supply_index") or 100.0)
        if supply_val < SUPPLY_TIGHT_THRESH:
            supply_status = "Tight"
        elif supply_val > SUPPLY_EXCESS_THRESH:
            supply_status = "Excess"
        else:
            supply_status = "Balanced"

        # 3. Demand / Supply Ratio & Market Pressure
        ratio = round(demand_val / max(supply_val, 1e-6), 2)
        if ratio > DEMAND_SUPPLY_UPWARD:
            market_pressure = "Upward"
        elif ratio < DEMAND_SUPPLY_DOWNWARD:
            market_pressure = "Downward"
        else:
            market_pressure = "Neutral"

        # 4. Port Congestion Index
        cong_val = float(latest_row.get("port_congestion_index") or 35.0)
        if cong_val < CONGESTION_LOW_THRESH:
            congestion_level = "Low"
        elif cong_val > CONGESTION_HIGH_THRESH:
            congestion_level = "High"
        else:
            congestion_level = "Medium"

        return {
            "demand_index": round(demand_val, 2),
            "demand_status": demand_status,
            "vessel_supply_index": round(supply_val, 2),
            "supply_status": supply_status,
            "demand_supply_ratio": ratio,
            "market_pressure": market_pressure,
            "port_congestion_index": round(cong_val, 2),
            "congestion_level": congestion_level,
        }
