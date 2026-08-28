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

        if pct_change_30 >= TREND_THRESHOLD_PERCENT or (pct_change_30 > 0 and pct_change_90 >= (TREND_THRESHOLD_PERCENT * 1.5)):
            return "Increasing"
        elif pct_change_30 <= -TREND_THRESHOLD_PERCENT or (pct_change_30 < 0 and pct_change_90 <= -(TREND_THRESHOLD_PERCENT * 1.5)):
            return "Decreasing"
        elif pct_change_90 >= (TREND_THRESHOLD_PERCENT * 2.0):
            return "Increasing"
        elif pct_change_90 <= -(TREND_THRESHOLD_PERCENT * 2.0):
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
        f_30 = float(forecasts.get("forecast_30d", {}).get("rate", current_rate))
        f_90 = float(forecasts.get("forecast_90d", {}).get("rate", current_rate))

        pct_30 = round(((f_30 - current_rate) / max(current_rate, 1e-6)) * 100.0, 1)
        pct_90 = round(((f_90 - current_rate) / max(current_rate, 1e-6)) * 100.0, 1)

        if trend == "Decreasing":
            signal = "WAIT"
            if f_30 < current_rate:
                reason = (
                    f"Forecast indicates decreasing freight rates (projected drop from ${current_rate:.2f} "
                    f"to ${f_30:.2f}/MT, -{abs(pct_30)}% in 30 days). Delaying fixtures or fixing index-linked contracts may lower charter expenditure."
                )
            else:
                reason = (
                    f"Forecast indicates softening medium-term rates (projected decline to ${f_90:.2f}/MT, "
                    f"-{abs(pct_90)}% in 90 days). Consider short-term spot fixtures or waiting for lower forward rates."
                )
            strategy = "Postpone long-term fixtures; utilize short spot voyages or index-linked charter rates."

        elif trend == "Increasing":
            signal = "CHARTER NOW"
            if f_30 > current_rate:
                reason = (
                    f"Freight rates are expected to rise (projected increase from ${current_rate:.2f} "
                    f"to ${f_30:.2f}/MT, +{pct_30}% in 30 days and ${f_90:.2f}/MT in 90 days). Locking in charter contracts now mitigates escalation risk."
                )
            else:
                reason = (
                    f"Freight rates are expected to firm up to ${f_90:.2f}/MT (+{pct_90}% in 90 days). "
                    "Securing tonnage early protects against medium-term rate escalations."
                )
            strategy = "Lock in forward freight agreements (FFAs) or fix period time-charter vessels immediately."

        else:
            if volatility == "High":
                signal = "MONITOR / SPLIT-BOOK"
                reason = (
                    f"Rates are steady near ${f_30:.2f}/MT but market volatility is High. "
                    "Stagger charter fixtures across 2-3 tranches to average out price shocks."
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

    @classmethod
    def generate_comprehensive_summary(
        cls,
        current_rate: float,
        forecast_rate: float,
        horizon_days: int,
        trend: str,
        volatility: str,
        market_intel: Dict[str, Any],
        port_analysis: Dict[str, Any],
        optimal_port: Dict[str, Any],
    ) -> str:
        """Create an integrated, deterministic market summary combining ML forecast, market dynamics, and port optimization."""
        p_name = port_analysis.get("selected_port", "Discharge Port")
        cong_level = port_analysis.get("congestion_level", "Medium")
        delay_days = port_analysis.get("estimated_delay_days", 2.0)
        demand_status = market_intel.get("demand_status", "Normal")
        supply_status = market_intel.get("supply_status", "Balanced")
        pressure = market_intel.get("market_pressure", "Neutral")
        rec_port = optimal_port.get("recommended_port", p_name)
        rec_type = optimal_port.get("recommendation_type", "Keep Selected Port")

        # Rate statement
        if trend == "Increasing":
            rate_stmt = f"Freight rates are projected to increase from ${current_rate:.2f}/MT to ${forecast_rate:.2f}/MT over the next {horizon_days} days."
        elif trend == "Decreasing":
            rate_stmt = f"Freight rates are projected to soften from ${current_rate:.2f}/MT to ${forecast_rate:.2f}/MT over the next {horizon_days} days."
        else:
            rate_stmt = f"Freight rates are expected to remain steady near ${forecast_rate:.2f}/MT (current: ${current_rate:.2f}/MT) over the next {horizon_days} days."

        # Market driver statement
        market_stmt = f"Market demand is {demand_status} and vessel fleet supply is {supply_status}, exerting {pressure.lower()} pricing pressure."

        # Port statement
        port_stmt = f"{p_name} currently experiences {cong_level} congestion with an estimated operational delay of ~{delay_days} days."

        # Recommendation statement
        if rec_type == "Keep Selected Port" or rec_port == p_name:
            opt_stmt = f"{p_name} remains the optimal discharge terminal with direct berth compatibility and balanced turnaround."
        else:
            opt_stmt = f"Routing to {rec_port} is recommended to reduce estimated vessel waiting time by ~{optimal_port.get('expected_delay_difference_days', 0.5)} days."

        return f"{rate_stmt} {market_stmt} {port_stmt} {opt_stmt}"
