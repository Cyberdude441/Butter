"""AI/ML-Assisted Vessel Selection & Multi-Factor Optimization Engine."""
from __future__ import annotations
import math
from typing import Dict, List, Any, Optional, Tuple
import pandas as pd
import numpy as np
from .config import (
    VESSEL_OPTIMIZATION_WEIGHTS,
    BASE_PORT_DELAY_DAYS,
    DESTINATION_ALIASES,
)
from .data_loader import (
    load_ports,
    load_vessels,
    resolve_origin,
    resolve_destination,
    resolve_vessel,
)


class VesselOptimizer:
    """Evaluates and ranks all dry bulk vessel classes against user selection, cargo size, port constraints, and ML forecasts."""

    # Reference standard vessel parameters
    VESSEL_SPECS = {
        "Handysize": {
            "vessel_type": "Handysize",
            "dwt": 38000,
            "typical_dwt": 38000,
            "max_draft": 10.5,
            "typical_draft": 10.0,
            "loa": 180,
            "beam": 28.0,
            "speed_knots": 13.0,
            "daily_bunker_mt": 17.0,
            "base_waiting_days": 1.5,
            "description": "Geared handysize bulk carrier with flexible port access and low draft requirements.",
        },
        "Supramax": {
            "vessel_type": "Supramax",
            "dwt": 58000,
            "typical_dwt": 58000,
            "max_draft": 13.0,
            "typical_draft": 12.5,
            "loa": 199,
            "beam": 32.2,
            "speed_knots": 14.0,
            "daily_bunker_mt": 26.0,
            "base_waiting_days": 1.9,
            "description": "Mid-sized geared bulk carrier with high cargo agility and moderate draft.",
        },
        "Panamax": {
            "vessel_type": "Panamax",
            "dwt": 76000,
            "typical_dwt": 76000,
            "max_draft": 14.5,
            "typical_draft": 14.0,
            "loa": 229,
            "beam": 32.3,
            "speed_knots": 14.0,
            "daily_bunker_mt": 32.0,
            "base_waiting_days": 2.5,
            "description": "Standard gearless coal carrier optimized for major deep-draft terminals.",
        },
        "Capesize": {
            "vessel_type": "Capesize",
            "dwt": 180000,
            "typical_dwt": 180000,
            "max_draft": 18.2,
            "typical_draft": 18.0,
            "loa": 295,
            "beam": 45.0,
            "speed_knots": 14.0,
            "daily_bunker_mt": 52.0,
            "base_waiting_days": 3.4,
            "description": "Heavy gearless bulk carrier requiring deep-water berths and specialized unloaders.",
        },
    }

    # Port physical restrictions
    PORT_RESTRICTIONS = {
        "Paradip": {"max_draft": 16.5, "max_loa": 300, "max_beam": 46, "max_dwt": 155000, "special": False},
        "Visakhapatnam": {"max_draft": 18.1, "max_loa": 390, "max_beam": 50, "max_dwt": 200000, "special": False},
        "Gangavaram": {"max_draft": 19.5, "max_loa": 350, "max_beam": 50, "max_dwt": 200000, "special": False},
        "Gopalpur": {"max_draft": 14.5, "max_loa": 250, "max_beam": 36, "max_dwt": 120000, "special": False},
        "Dhamra": {"max_draft": 18.0, "max_loa": 350, "max_beam": 50, "max_dwt": 180000, "special": False},
        "Haldia": {"max_draft": 9.1, "max_loa": 240, "max_beam": 32.26, "max_dwt": 55000, "special": False},
        "Sagar/Sandheads": {"max_draft": 22.0, "max_loa": 400, "max_beam": 60, "max_dwt": 250000, "special": True},
        # Origins
        "Newcastle": {"max_draft": 16.5, "max_loa": 300, "max_beam": 50, "max_dwt": 180000, "special": False},
        "Gladstone": {"max_draft": 17.5, "max_loa": 320, "max_beam": 55, "max_dwt": 220000, "special": False},
        "Hampton Roads": {"max_draft": 16.8, "max_loa": 330, "max_beam": 50, "max_dwt": 200000, "special": False},
        "Baltimore": {"max_draft": 15.2, "max_loa": 300, "max_beam": 45, "max_dwt": 150000, "special": False},
        "Taboneo": {"max_draft": 20.0, "max_loa": 350, "max_beam": 60, "max_dwt": 200000, "special": False},
        "Nacala": {"max_draft": 19.0, "max_loa": 350, "max_beam": 55, "max_dwt": 200000, "special": False},
        "Vostochny": {"max_draft": 16.5, "max_loa": 300, "max_beam": 50, "max_dwt": 180000, "special": False},
        "Ust-Luga": {"max_draft": 13.7, "max_loa": 250, "max_beam": 40, "max_dwt": 100000, "special": False},
    }

    def __init__(self, weights: Optional[Dict[str, float]] = None):
        self.weights = weights or VESSEL_OPTIMIZATION_WEIGHTS

    def _match_port_limits(self, port_name: str) -> Dict[str, Any]:
        """Resolve port name to restriction dictionary."""
        p_clean = str(port_name).lower()
        if "sagar" in p_clean or "sandhead" in p_clean:
            return self.PORT_RESTRICTIONS["Sagar/Sandheads"]

        for key, limits in self.PORT_RESTRICTIONS.items():
            if key.lower() in p_clean:
                return limits

        return {"max_draft": 15.0, "max_loa": 300, "max_beam": 45, "max_dwt": 100000, "special": False}

    def check_vessel_port_feasibility(self, port_name: str, vessel_type: str) -> Tuple[bool, List[str], float]:
        """Check whether a vessel meets draft, LOA, beam, and DWT limits at a port."""
        v_clean = resolve_vessel(vessel_type)
        specs = self.VESSEL_SPECS.get(v_clean, self.VESSEL_SPECS["Panamax"])
        limits = self._match_port_limits(port_name)

        if limits.get("special", False):
            return True, ["Deep-water anchorage / STS lightering operation"], 85.0

        violations = []
        if specs["typical_draft"] > limits["max_draft"]:
            violations.append(f"Vessel draft ({specs['typical_draft']}m) exceeds port limit ({limits['max_draft']}m)")
        if specs["loa"] > limits["max_loa"]:
            violations.append(f"Vessel LOA ({specs['loa']}m) exceeds port limit ({limits['max_loa']}m)")
        if specs["beam"] > limits["max_beam"]:
            violations.append(f"Vessel beam ({specs['beam']}m) exceeds port limit ({limits['max_beam']}m)")
        if specs["dwt"] > limits["max_dwt"]:
            violations.append(f"Vessel DWT ({specs['dwt']:,} MT) exceeds port limit ({limits['max_dwt']:,} MT)")

        is_feasible = len(violations) == 0

        # Score port compatibility
        if not is_feasible:
            score = 0.0
        else:
            draft_margin = limits["max_draft"] - specs["typical_draft"]
            score = min(100.0, 75.0 + draft_margin * 8.0)

        return is_feasible, violations, score

    def evaluate_vessel_class(
        self,
        vessel_type: str,
        origin: str,
        destination: str,
        cargo_quantity: float,
        forecast_freight_rate: float,
        congestion_index: float = 35.0,
    ) -> Dict[str, Any]:
        """Evaluate a single vessel class across economics, feasibility, waiting time, utilization, and risk."""
        v_clean = resolve_vessel(vessel_type)
        specs = self.VESSEL_SPECS.get(v_clean, self.VESSEL_SPECS["Panamax"])
        v_dwt = specs["dwt"]

        # 1. Port Feasibility Checks (Origin and Destination)
        orig_feasible, orig_violations, orig_score = self.check_vessel_port_feasibility(origin, v_clean)
        dest_feasible, dest_violations, dest_score = self.check_vessel_port_feasibility(destination, v_clean)
        is_feasible = orig_feasible and dest_feasible
        all_violations = orig_violations + dest_violations

        port_compat_score = (orig_score + dest_score) / 2.0 if is_feasible else 0.0

        # 2. Cargo Utilization & Voyages Required
        cargo_qty = max(1000.0, float(cargo_quantity))
        effective_capacity = v_dwt * 0.95
        voyages_required = max(1, math.ceil(cargo_qty / effective_capacity))
        total_lift_capacity = voyages_required * v_dwt
        cargo_utilization_pct = min(100.0, round((cargo_qty / total_lift_capacity) * 100.0, 1))

        # Cargo score rewards 1 voyage with high utilization; penalizes multiple voyages or severe underfill
        if voyages_required == 1:
            if cargo_utilization_pct >= 85.0:
                cargo_score = 95.0 + (cargo_utilization_pct - 85.0) / 3.0
            else:
                # Underutilization penalty (e.g. 40k cargo on 180k Capesize)
                cargo_score = max(20.0, cargo_utilization_pct * 0.9)
        else:
            # Multi-voyage penalty (e.g. 150k cargo on 38k Handysize requiring 4 voyages)
            cargo_score = max(25.0, 80.0 - (voyages_required - 1) * 18.0)

        # 3. Port Waiting Time & Operational Delay
        # Draft penalty factor for larger vessels at tidal windows
        draft_penalty = 0.8 if v_clean == "Capesize" else (0.3 if v_clean == "Panamax" else 0.0)
        waiting_time_days = round(
            specs["base_waiting_days"] + (congestion_index / 100.0) * 2.6 + draft_penalty, 1
        )
        # Idle time includes waiting time + turnaround queues for all required voyages
        idle_time_days = round(
            waiting_time_days * 1.25 + (voyages_required - 1) * 2.2, 1
        )

        # Waiting / Idle Efficiency Score (0-100)
        waiting_score = max(15.0, min(100.0, 100.0 - (waiting_time_days - 1.2) * 20.0))

        # 4. Market Economics
        rate = max(5.0, float(forecast_freight_rate))
        total_freight_cost = round(rate * cargo_qty, 2)

        # Economics Score: Higher score for lower total cost / freight rate
        # Baseline normal rate ~ $20/MT
        economics_score = max(20.0, min(100.0, 100.0 - (rate - 12.0) * 2.5))

        # 5. Market Forecast Advantage & Operational Risk
        forecast_adv_score = 80.0
        risk_score = 85.0 if is_feasible else 10.0
        if v_clean == "Capesize":
            risk_score -= 15.0 # Higher demurrage rate and draught risk
        elif v_clean == "Panamax":
            risk_score -= 5.0

        # 6. Composite Vessel Optimization Score
        if not is_feasible:
            total_score = 15.0
            status_text = "Not Feasible"
        else:
            w = self.weights
            total_score = (
                w.get("economics", 0.25) * economics_score
                + w.get("port_compatibility", 0.20) * port_compat_score
                + w.get("waiting_idle_efficiency", 0.20) * waiting_score
                + w.get("cargo_utilization", 0.15) * cargo_score
                + w.get("market_forecast_advantage", 0.10) * forecast_adv_score
                + w.get("operational_risk", 0.10) * risk_score
            )
            total_score = round(min(100.0, max(20.0, total_score)), 1)
            status_text = "Compatible"

        # Rationale notes
        notes = []
        if not is_feasible:
            notes.append("; ".join(all_violations))
        else:
            if voyages_required == 1 and cargo_utilization_pct >= 90.0:
                notes.append(f"Single-voyage high capacity utilization ({cargo_utilization_pct}%)")
            elif voyages_required > 1:
                notes.append(f"Requires {voyages_required} consecutive voyages for {cargo_qty:,.0f} MT cargo")

            if waiting_time_days <= 2.2:
                notes.append("Low congestion and minimal operational berth wait")
            elif waiting_time_days >= 3.5:
                notes.append(f"Elevated queuing and draft window wait (~{waiting_time_days}d)")

            if v_clean in ["Handysize", "Supramax"]:
                notes.append("High berth agility with geared cargo gear capability")

        return {
            "vessel_type": v_clean,
            "feasible": is_feasible,
            "feasibility_status": status_text,
            "infeasibility_reasons": all_violations,
            "optimization_score": total_score,
            "waiting_time_days": waiting_time_days if is_feasible else None,
            "idle_time_days": idle_time_days if is_feasible else None,
            "forecast_freight_rate": round(rate, 2),
            "total_voyage_cost": total_freight_cost,
            "cargo_utilization_pct": cargo_utilization_pct,
            "voyages_required": voyages_required,
            "dwt": v_dwt,
            "typical_draft": specs["typical_draft"],
            "loa": specs["loa"],
            "beam": specs["beam"],
            "notes": ". ".join(notes) if notes else "Standard operational parameters",
        }

    def optimize_vessel_selection(
        self,
        origin: str,
        destination: str,
        selected_vessel: str,
        cargo_quantity: float,
        horizon_days: int,
        rate_by_vessel: Dict[str, float],
        congestion_index: float = 35.0,
    ) -> Dict[str, Any]:
        """Evaluate all 4 vessel classes, rank them, and compare user selection with AI recommended optimal."""
        user_vessel_clean = resolve_vessel(selected_vessel)
        all_classes = ["Handysize", "Supramax", "Panamax", "Capesize"]

        evaluations: List[Dict[str, Any]] = []
        for v_class in all_classes:
            v_rate = rate_by_vessel.get(v_class, rate_by_vessel.get(user_vessel_clean, 21.0))
            # Sensible fallback scale if specific vessel rate not directly forecasted
            if v_rate <= 0 or not np.isfinite(v_rate):
                base_r = rate_by_vessel.get(user_vessel_clean, 21.0)
                v_rate = {
                    "Handysize": base_r * 0.92,
                    "Supramax": base_r * 0.96,
                    "Panamax": base_r * 1.0,
                    "Capesize": base_r * 0.94,
                }.get(v_class, base_r)

            eval_res = self.evaluate_vessel_class(
                vessel_type=v_class,
                origin=origin,
                destination=destination,
                cargo_quantity=cargo_quantity,
                forecast_freight_rate=v_rate,
                congestion_index=congestion_index,
            )
            evaluations.append(eval_res)

        # Separate feasible vs infeasible
        feasible_evals = [e for e in evaluations if e["feasible"]]
        infeasible_evals = [e for e in evaluations if not e["feasible"]]

        # Sort feasible by score descending
        feasible_evals.sort(key=lambda x: x["optimization_score"], reverse=True)
        infeasible_evals.sort(key=lambda x: x["optimization_score"], reverse=True)

        # Ranked alternatives list
        ranked_vessels = []
        current_rank = 1
        for e in feasible_evals + infeasible_evals:
            e_copy = dict(e)
            e_copy["rank"] = current_rank
            e_copy["is_selected"] = (e["vessel_type"] == user_vessel_clean)
            ranked_vessels.append(e_copy)
            current_rank += 1

        # Determine AI recommended optimal vessel
        if feasible_evals:
            top_eval = feasible_evals[0]
        else:
            top_eval = evaluations[0]

        opt_vessel_type = top_eval["vessel_type"]
        for r in ranked_vessels:
            r["is_recommended"] = (r["vessel_type"] == opt_vessel_type)

        # Get selected vessel evaluation
        selected_eval = next((e for e in evaluations if e["vessel_type"] == user_vessel_clean), evaluations[0])

        is_user_optimal = (user_vessel_clean == opt_vessel_type) and selected_eval["feasible"]

        # Calculate time & cost savings
        sel_wait = selected_eval.get("waiting_time_days") or 4.0
        opt_wait = top_eval.get("waiting_time_days") or 2.5
        waiting_time_saved = round(max(0.0, sel_wait - opt_wait), 1)

        sel_idle = selected_eval.get("idle_time_days") or 5.0
        opt_idle = top_eval.get("idle_time_days") or 3.0
        if sel_idle > 0:
            idle_reduction_pct = round(max(0.0, ((sel_idle - opt_idle) / sel_idle) * 100.0), 1)
        else:
            idle_reduction_pct = 0.0

        score_improvement = round(max(0.0, top_eval["optimization_score"] - selected_eval["optimization_score"]), 1)
        cost_diff_usd = round(top_eval["total_voyage_cost"] - selected_eval["total_voyage_cost"], 2)
        if selected_eval["total_voyage_cost"] > 0:
            cost_diff_pct = round((cost_diff_usd / selected_eval["total_voyage_cost"]) * 100.0, 1)
        else:
            cost_diff_pct = 0.0

        # Recommendation Reasons
        rec_reasons = []
        if is_user_optimal:
            status_title = "YOUR SELECTION IS OPTIMAL"
            summary_reason = (
                f"{user_vessel_clean} provides the best balance of cargo utilization "
                f"({selected_eval['cargo_utilization_pct']}%), forecast economics, port compatibility, "
                f"and operational waiting time (~{selected_eval['waiting_time_days']} days)."
            )
            rec_reasons.append("Optimal cargo parcel utilization for requested tonnage")
            rec_reasons.append("Full draft and physical berth clearance at both terminals")
            rec_reasons.append("Lowest overall voyage turnaround and queueing delay")
        else:
            status_title = "OPTIMIZATION FOUND"
            summary_reason = (
                f"{opt_vessel_type} is recommended over {user_vessel_clean} because it provides "
                f"superior berth clearance, lower congestion-related waiting time (~{opt_wait}d vs ~{sel_wait}d), "
                f"and improved operational efficiency (+{score_improvement} pts)."
            )
            if not selected_eval["feasible"]:
                rec_reasons.append(f"{user_vessel_clean} is restricted at destination/origin berth limits")
            if waiting_time_saved > 0:
                rec_reasons.append(f"Reduces estimated port waiting time by ~{waiting_time_saved} days ({idle_reduction_pct}% idle time reduction)")
            if top_eval["cargo_utilization_pct"] >= 90.0:
                rec_reasons.append(f"Achieves {top_eval['cargo_utilization_pct']}% single-voyage cargo utilization")
            rec_reasons.append(f"Higher composite operational score ({top_eval['optimization_score']}/100 vs {selected_eval['optimization_score']}/100)")

        return {
            "is_user_selection_optimal": is_user_optimal,
            "status": status_title,
            "selected_vessel": {
                "vessel_type": user_vessel_clean,
                "feasible": selected_eval["feasible"],
                "feasibility_status": selected_eval["feasibility_status"],
                "infeasibility_reasons": selected_eval["infeasibility_reasons"],
                "waiting_time_days": selected_eval["waiting_time_days"],
                "idle_time_days": selected_eval["idle_time_days"],
                "total_operational_score": selected_eval["optimization_score"],
                "forecast_freight_rate": selected_eval["forecast_freight_rate"],
                "total_voyage_cost": selected_eval["total_voyage_cost"],
                "cargo_utilization_pct": selected_eval["cargo_utilization_pct"],
                "voyages_required": selected_eval["voyages_required"],
            },
            "optimized_vessel": {
                "vessel_type": opt_vessel_type,
                "feasible": top_eval["feasible"],
                "feasibility_status": top_eval["feasibility_status"],
                "waiting_time_days": top_eval["waiting_time_days"],
                "idle_time_days": top_eval["idle_time_days"],
                "total_operational_score": top_eval["optimization_score"],
                "forecast_freight_rate": top_eval["forecast_freight_rate"],
                "total_voyage_cost": top_eval["total_voyage_cost"],
                "cargo_utilization_pct": top_eval["cargo_utilization_pct"],
                "voyages_required": top_eval["voyages_required"],
                "recommendation_reasons": rec_reasons,
            },
            "optimization_comparison": {
                "waiting_time_saved_days": waiting_time_saved,
                "idle_time_reduction_percent": idle_reduction_pct,
                "operational_score_improvement": score_improvement,
                "cost_difference_usd": cost_diff_usd,
                "cost_difference_pct": cost_diff_pct,
            },
            "vessel_rankings": ranked_vessels,
            "recommendation_summary": summary_reason,
        }
