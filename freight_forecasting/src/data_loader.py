"""Data loading and schema normalization module."""
from __future__ import annotations
import math
from pathlib import Path
from typing import Optional
import pandas as pd
from .config import (
    ML_DATASET_PATH,
    PORTS_PATH,
    ROUTES_PATH,
    VESSELS_PATH,
    ORIGIN_ALIASES,
    DESTINATION_ALIASES,
)


def haversine_nm(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance between coordinates in nautical miles."""
    r_km = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    km = r_km * c
    return km * 0.539957  # Convert km to Nautical Miles


def resolve_origin(origin: str, default_origin: str = "Newcastle (Port of Newcastle), Australia") -> list[str]:
    """Map user input string to canonical origin port names."""
    if not origin:
        return [default_origin]
    key = origin.strip().lower()
    if key in ORIGIN_ALIASES:
        return ORIGIN_ALIASES[key]
    for k, aliases in ORIGIN_ALIASES.items():
        if k in key:
            return aliases
    return [origin.strip()]


def resolve_destination(dest: str, default_dest: str = "Paradip, India") -> str:
    """Map user input string to canonical destination port name."""
    if not dest:
        return default_dest
    key = dest.strip().lower()
    if key in DESTINATION_ALIASES:
        return DESTINATION_ALIASES[key]
    for k, canonical in DESTINATION_ALIASES.items():
        if k in key:
            return canonical
    return dest.strip()


def resolve_vessel(vessel: str, default_vessel: str = "Panamax") -> str:
    """Normalize vessel type."""
    if not vessel:
        return default_vessel
    v_clean = vessel.strip().casefold()
    mapping = {
        "handysize": "Handysize",
        "supramax": "Supramax",
        "panamax": "Panamax",
        "capesize": "Capesize",
    }
    return mapping.get(v_clean, default_vessel)


def load_freight_dataset(path: Optional[Path] = None) -> pd.DataFrame:
    """Load the primary freight ML dataset with standard column names."""
    file_path = path or ML_DATASET_PATH
    df = pd.read_csv(file_path, parse_dates=["date"])
    
    # Standardize column naming if necessary
    rename_dict = {
        "freight_rate_usd_per_mt": "historical_freight_rate",
        "bunker_price_usd_per_mt": "bunker_price",
        "coal_price_usd_per_mt": "coal_price",
        "cargo_demand_index": "demand_index",
        "route_distance_nm": "route_distance",
        "crude_oil_price": "oil_price",
    }
    for old_col, new_col in rename_dict.items():
        if old_col in df.columns and new_col not in df.columns:
            df[new_col] = df[old_col]
            
    df = df.sort_values(["origin_port", "destination_port", "vessel_type", "date"]).reset_index(drop=True)
    return df


def load_ports(path: Optional[Path] = None) -> pd.DataFrame:
    """Load port catalog."""
    return pd.read_csv(path or PORTS_PATH)


def load_routes(path: Optional[Path] = None) -> pd.DataFrame:
    """Load routes catalog."""
    return pd.read_csv(path or ROUTES_PATH)


def load_vessels(path: Optional[Path] = None) -> pd.DataFrame:
    """Load vessel catalog."""
    return pd.read_csv(path or VESSELS_PATH)
