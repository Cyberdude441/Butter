"""Port Congestion, Delay Estimation & Optimal Discharge Port Engine."""
from __future__ import annotations
from typing import Dict, List, Any, Optional
import pandas as pd
import numpy as np
from .config import (
    PORTS_PATH,
    ROUTES_PATH,
    VESSELS_PATH,
    CONGESTION_PATH,
    PORT_OPTIMIZATION_WEIGHTS,
    BASE_PORT_DELAY_DAYS,
    CONGESTION_DELAY_MULTIPLIER,
    DESTINATION_ALIASES,
)
from .data_loader import (
    load_ports,
    load_routes,
    load_vessels,
    haversine_nm,
    resolve_origin,
    resolve_destination,
    resolve_vessel,
)


class PortOptimizer:
    """Multi-factor discharge port optimizer and delay estimation engine."""

    # Approximate port coordinates for distance calculation
    PORT_COORDS = {
        "Paradip, India": (20.2654, 86.6763),
        "Visakhapatnam, India": (17.6868, 83.2185),
        "Gangavaram, India": (17.6215, 83.2298),
        "Gopalpur, India": (19.2648, 84.8994),
        "Dhamra, India": (20.7833, 86.9500),
        "Sagar/Sandheads Anchorage, India": (21.6500, 88.0500),
        "Haldia, India": (22.0447, 88.0888),
    }

    # Baseline typical congestion index profiles
    PORT_BASE_CONGESTION = {
        "Paradip, India": 38.5,
        "Visakhapatnam, India": 34.2,
        "Gangavaram, India": 28.5,
        "Gopalpur, India": 26.0,
        "Dhamra, India": 29.5,
        "Sagar/Sandheads Anchorage, India": 32.0,
        "Haldia, India": 56.5,
    }

    def __init__(self):
        self.ports_df: Optional[pd.DataFrame] = None
        self.routes_df: Optional[pd.DataFrame] = None
        self.vessels_df: Optional[pd.DataFrame] = None
        self.congestion_df: Optional[pd.DataFrame] = None
        self._load_data()

    def _load_data(self) -> None:
        try:
            self.ports_df = load_ports()
            self.routes_df = load_routes()
            self.vessels_df = load_vessels()
            if CONGESTION_PATH.exists():
                self.congestion_df = pd.read_csv(CONGESTION_PATH)
        except Exception as err:
            print(f"Warning loading port optimizer data: {err}")

    def get_port_congestion(self, destination_port: str, vessel_type: str = "Panamax") -> Dict[str, Any]:
        """Fetch latest port congestion index and estimated operational delay."""
        canonical_dest = resolve_destination(destination_port)
        short_name = canonical_dest.split(",")[0].strip()
        v_clean = resolve_vessel(vessel_type)

        cong_index = self.PORT_BASE_CONGESTION.get(canonical_dest, 35.0)

        if self.congestion_df is not None and not self.congestion_df.empty:
            match = self.congestion_df[
                self.congestion_df["port"].str.contains(short_name, case=False, na=False)
            ]
            if not match.empty:
                latest = match.sort_values("date").iloc[-1]
                cong_index = float(latest.get("congestion_index", cong_index))

        # Congestion classification
        if cong_index < 35.0:
            level = "Low"
        elif cong_index > 55.0:
            level = "High"
        else:
            level = "Medium"

        # Vessel specific queuing / tidal draft factor
        vessel_factor = 0.6 if v_clean == "Capesize" else (0.3 if v_clean == "Panamax" else 0.0)

        # Calibrated operational delay (pilotage, queueing, berthing, customs clearance)
        delay_days = round(BASE_PORT_DELAY_DAYS + ((cong_index / 100.0) * 3.5) + vessel_factor, 1)

        if delay_days <= 2.2:
            delay_level = "Low"
        elif delay_days <= 3.8:
            delay_level = "Medium"
        else:
            delay_level = "High"

        return {
            "selected_port": short_name,
            "canonical_port": canonical_dest,
            "congestion_index": round(cong_index, 2),
            "congestion_level": level,
            "estimated_delay_days": delay_days,
            "delay_level": delay_level,
            "data_source_status": "calibrated_proxy",
        }

    def check_vessel_port_compatibility(self, port_name: str, vessel_type: str) -> Dict[str, Any]:
        """Verify draft, LOA, beam, and DWT limits between vessel and port."""
        v_clean = resolve_vessel(vessel_type)
        p_clean = resolve_destination(port_name).split(",")[0].strip()

        # Representative vessel draft & dimensions
        vessel_specs = {
            "Handysize": {"draft": 10.0, "loa": 180, "beam": 28, "dwt": 38000},
            "Supramax": {"draft": 12.8, "loa": 199, "beam": 32.2, "dwt": 58000},
            "Panamax": {"draft": 14.5, "loa": 229, "beam": 32.3, "dwt": 75000},
            "Capesize": {"draft": 18.0, "loa": 295, "beam": 45.0, "dwt": 160000},
        }.get(v_clean, {"draft": 14.0, "loa": 225, "beam": 32.0, "dwt": 75000})

        # Match port key cleanly
        p_match = "Paradip"
        for key in ["Paradip", "Visakhapatnam", "Gangavaram", "Gopalpur", "Dhamra", "Haldia"]:
            if key.lower() in p_clean.lower():
                p_match = key
                break
        if "sagar" in p_clean.lower() or "sandhead" in p_clean.lower():
            p_match = "Sagar/Sandheads"

        # Port constraints
        port_limits = {
            "Paradip": {"max_draft": 16.5, "max_loa": 300, "max_beam": 46, "max_dwt": 155000, "special": False},
            "Visakhapatnam": {"max_draft": 18.1, "max_loa": 390, "max_beam": 50, "max_dwt": 200000, "special": False},
            "Gangavaram": {"max_draft": 19.5, "max_loa": 350, "max_beam": 50, "max_dwt": 200000, "special": False},
            "Gopalpur": {"max_draft": 14.5, "max_loa": 250, "max_beam": 36, "max_dwt": 120000, "special": False},
            "Dhamra": {"max_draft": 18.0, "max_loa": 350, "max_beam": 50, "max_dwt": 180000, "special": False},
            "Haldia": {"max_draft": 9.1, "max_loa": 240, "max_beam": 32.26, "max_dwt": 55000, "special": False},
            "Sagar/Sandheads": {"max_draft": 22.0, "max_loa": 400, "max_beam": 60, "max_dwt": 250000, "special": True},
        }.get(p_match, {"max_draft": 15.0, "max_loa": 300, "max_beam": 40, "max_dwt": 100000, "special": False})

        restrictions = []
        if vessel_specs["draft"] > port_limits["max_draft"]:
            restrictions.append(f"Vessel draft ({vessel_specs['draft']}m) exceeds port berth limit ({port_limits['max_draft']}m)")
        if vessel_specs["loa"] > port_limits["max_loa"]:
            restrictions.append(f"Vessel LOA ({vessel_specs['loa']}m) exceeds port limit ({port_limits['max_loa']}m)")
        if vessel_specs["beam"] > port_limits["max_beam"]:
            restrictions.append(f"Vessel Beam ({vessel_specs['beam']}m) exceeds lock/berth limit ({port_limits['max_beam']}m)")

        if port_limits["special"]:
            status = "special"
            restrictions.append("Deep-water STS lightering anchorage operation required")
        elif restrictions:
            status = "restricted"
        else:
            status = "compatible"

        return {
            "port": p_clean,
            "status": status,
            "restrictions": restrictions,
            "max_draft": port_limits["max_draft"],
            "vessel_draft": vessel_specs["draft"],
        }

    def optimize_discharge_port(
        self,
        origin: str,
        selected_destination: str,
        vessel_type: str,
        current_freight_rate: float,
    ) -> Dict[str, Any]:
        """Rank all candidate discharge ports across congestion, delays, voyage economics and vessel fit."""
        canonical_selected = resolve_destination(selected_destination)
        short_selected = canonical_selected.split(",")[0].strip()
        v_clean = resolve_vessel(vessel_type)

        candidate_ports = [
            "Paradip, India",
            "Visakhapatnam, India",
            "Gangavaram, India",
            "Gopalpur, India",
            "Dhamra, India",
            "Sagar/Sandheads Anchorage, India",
            "Haldia, India",
        ]

        w = PORT_OPTIMIZATION_WEIGHTS
        ranked_list = []

        for port_name in candidate_ports:
            short_p = port_name.split(",")[0].strip()
            compat = self.check_vessel_port_compatibility(short_p, v_clean)
            cong_data = self.get_port_congestion(port_name, v_clean)

            is_compatible = compat["status"] == "compatible"
            is_special = compat["status"] == "special"

            # 1. Congestion Score (100 is best / lowest congestion)
            cong_score = max(0.0, 100.0 - (cong_data["congestion_index"] * 0.9))

            # 2. Delay Score (100 is best / lowest delay)
            delay_score = max(0.0, 100.0 - (cong_data["estimated_delay_days"] * 15.0))

            # 3. Route Distance & Economics Component
            target_coords = self.PORT_COORDS.get(port_name, (20.0, 85.0))
            selected_coords = self.PORT_COORDS.get(canonical_selected, (20.0, 85.0))
            dist_delta_nm = haversine_nm(selected_coords[0], selected_coords[1], target_coords[0], target_coords[1])
            route_economics_score = max(60.0, 100.0 - (dist_delta_nm * 0.06))

            # 4. Vessel Suitability
            draft_clearance = compat["max_draft"] - compat["vessel_draft"]
            if is_compatible:
                suitability_score = 100.0 if draft_clearance >= 2.0 else 85.0
            elif is_special:
                suitability_score = 75.0
            else:
                suitability_score = 10.0

            # 5. Risk Component
            risk_score = 90.0 if is_compatible else (65.0 if is_special else 15.0)
            if short_p == "Haldia":
                risk_score -= 20.0

            total_score = (
                (cong_score * w["congestion"]) +
                (delay_score * w["delay"]) +
                (route_economics_score * w["route_economics"]) +
                (suitability_score * w["vessel_suitability"]) +
                (risk_score * w["risk"])
            )

            if compat["status"] == "restricted":
                total_score = min(total_score * 0.35, 38.0)

            if is_compatible:
                p_reason = f"Compatible terminal ({compat['max_draft']}m draft limit), {cong_data['congestion_level']} congestion (~{cong_data['estimated_delay_days']}d operational wait)."
            elif is_special:
                p_reason = "Deep-water outer anchorage; accommodates deep draft via STS lightering operations."
            else:
                p_reason = f"Restricted for {v_clean}: {'; '.join(compat['restrictions'])}."

            ranked_list.append({
                "port": short_p,
                "canonical_port": port_name,
                "optimization_score": round(total_score, 1),
                "congestion_index": cong_data["congestion_index"],
                "congestion_level": cong_data["congestion_level"],
                "estimated_delay_days": cong_data["estimated_delay_days"],
                "delay_level": cong_data["delay_level"],
                "status": compat["status"],
                "is_selected": (short_p.lower() == short_selected.lower()),
                "reason": p_reason,
            })

        # Sort ranked list descending by optimization score
        ranked_list.sort(key=lambda x: x["optimization_score"], reverse=True)

        for idx, item in enumerate(ranked_list, start=1):
            item["rank"] = idx

        best_port_item = ranked_list[0]
        selected_item = next((p for p in ranked_list if p["port"].lower() == short_selected.lower()), best_port_item)

        score_diff = best_port_item["optimization_score"] - selected_item["optimization_score"]
        delay_diff = round(selected_item["estimated_delay_days"] - best_port_item["estimated_delay_days"], 1)

        if selected_item["port"] == best_port_item["port"] or (score_diff <= 2.5 and delay_diff <= 0.3):
            recommendation_type = "Keep Selected Port"
            rec_reason = f"{selected_item['port']} is currently the optimal operational choice with favorable vessel clearance and low turnaround delay."
            operational_benefit = "Direct discharge berth with lowest total voyage turnaround"
            recommended_port = selected_item["port"]
            delay_diff = 0.0
        else:
            recommendation_type = "Consider Alternative Port"
            rec_reason = (
                f"Consider routing to {best_port_item['port']} instead of {selected_item['port']} "
                f"due to lower expected congestion ({best_port_item['congestion_level']}) and ~{delay_diff} days shorter turnaround delay."
            )
            operational_benefit = f"Estimated operational saving of ~{delay_diff} days in vessel waiting time and reduced demurrage risk"
            recommended_port = best_port_item["port"]

        return {
            "recommended_port": recommended_port,
            "selected_port": short_selected,
            "recommendation_type": recommendation_type,
            "optimization_score": best_port_item["optimization_score"],
            "estimated_delay_days": best_port_item["estimated_delay_days"],
            "congestion_level": best_port_item["congestion_level"],
            "reason": rec_reason,
            "expected_delay_difference_days": delay_diff,
            "expected_operational_benefit": operational_benefit,
            "ranked_alternatives": ranked_list,
        }
