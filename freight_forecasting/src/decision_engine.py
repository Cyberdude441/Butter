"""Decision Support Engine for Freight Chartering."""
from __future__ import annotations
from typing import Dict, Any, Tuple
from .config import TREND_THRESHOLD_PERCENT, VOLATILITY_LOW_PCT, VOLATILITY_HIGH_PCT


class DecisionEngine:
    """Evaluates forecasts to yield trend classification, volatility regime, and market-entry signals."""

    @staticmethod
    def classify_trend(current_rate: float, forecast_30d: float, forecast_90d: float) -> str:
        """Classify freight trend as Increasing, Decreasing, or Stable."""
        if current_rate <= 0:
            return "Stable"
            
        pct_change_30 = ((forecast_30d - current_rate) / current_rate) * 100.0
        pct_change_90 = ((forecast_90d - current_rate) / current_rate) * 100.0
        
        if pct_change_30 >= TREND_THRESHOLD_PERCENT or pct_change_90 >= (TREND_THRESHOLD_PERCENT * 1.5):
            return "Increasing"
        elif pct_change_30 <= -TREND_THRESHOLD_PERCENT or pct_change_90 <= -(TREND_THRESHOLD_PERCENT * 1.5):
            return "Decreasing"
        else:
            return "Stable"

    @staticmethod
    def classify_volatility(recent_std: float, current_rate: float, interval_width: float) -> str:
        """Classify market/forecast volatility as Low, Medium, or High."""
        if current_rate <= 0:
            return "Medium"
            
        rel_std = recent_std / current_rate
        rel_interval = interval_width / current_rate
        
        composite_vol = (rel_std * 0.5) + (rel_interval * 0.5)
        
        if composite_vol < VOLATILITY_LOW_PCT:
            return "Low"
        elif composite_vol > VOLATILITY_HIGH_PCT:
            return "High"
        else:
            return "Medium"

    @classmethod
    def generate_market_signal(
        cls,
        current_rate: float,
        forecasts: Dict[str, Dict[str, float]],
        trend: str,
        volatility: str,
    ) -> Tuple[str, str, str]:
        """Generate tactical decision recommendation: WAIT, CHARTER NOW, or MONITOR."""
        f_7 = forecasts.get("forecast_7d", {}).get("rate", current_rate)
        f_14 = forecasts.get("forecast_14d", {}).get("rate", current_rate)
        f_30 = forecasts.get("forecast_30d", {}).get("rate", current_rate)
        f_90 = forecasts.get("forecast_90d", {}).get("rate", current_rate)
        
        diff_30 = f_30 - current_rate
        diff_90 = f_90 - current_rate
        
        if trend == "Decreasing":
            signal = "WAIT"
            reason = (
                f"Forecast indicates decreasing freight rates (projected drop from ${current_rate:.2f} "
                f"to ${f_30:.2f}/MT in 30 days). Delaying fixtures or using index-linked contracts may lower charter expenditure."
            )
            strategy = "Postpone spot bookings where feasible; request index-linked or short-term spot fixtures."
        elif trend == "Increasing":
            signal = "CHARTER NOW"
            reason = (
                f"Freight rates are expected to increase (projected rise from ${current_rate:.2f} "
                f"to ${f_30:.2f}/MT in 30 days and ${f_90:.2f}/MT in 90 days). Locking in long-term charter contracts now mitigates freight escalation risk."
            )
            strategy = "Lock in forward freight agreements (FFAs) or fix period time-charter vessels immediately."
        else:
            if volatility == "High":
                signal = "MONITOR / SPLIT-BOOK"
                reason = (
                    f"Rates are relatively stable (${f_30:.2f}/MT) but market volatility is High. "
                    "Stagger charter commitments across 2-3 fixture tranches to average out price shocks."
                )
                strategy = "Split cargo volumes into tranches; avoid 100% single-fixture exposure."
            else:
                signal = "MONITOR"
                reason = (
                    f"Freight rates are steady (around ${current_rate:.2f} to ${f_30:.2f}/MT) with {volatility.lower()} volatility. "
                    "Normal chartering schedules are recommended."
                )
                strategy = "Execute standard spot fixtures according to berth readiness."
                
        return signal, reason, strategy
