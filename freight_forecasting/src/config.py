"""Configuration and constants for Freight Forecasting."""
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
VISUALIZATIONS_DIR = BASE_DIR / "visualizations"

MODELS_DIR.mkdir(parents=True, exist_ok=True)
VISUALIZATIONS_DIR.mkdir(parents=True, exist_ok=True)

# Datasets
ML_DATASET_PATH = DATA_DIR / "freight_ml_dataset.csv"
PORTS_PATH = DATA_DIR / "ports.csv"
ROUTES_PATH = DATA_DIR / "routes.csv"
VESSELS_PATH = DATA_DIR / "vessels.csv"
BUNKER_PATH = DATA_DIR / "bunker_prices.csv"
COMMODITY_PATH = DATA_DIR / "commodity_prices.csv"
ECONOMIC_PATH = DATA_DIR / "economic_indicators.csv"
CONGESTION_PATH = DATA_DIR / "port_congestion.csv"

# Prediction Horizons (in days)
HORIZONS = [7, 14, 30, 60, 90]
DEFAULT_HORIZON = 30

# Feature definitions
CATEGORICAL_FEATURES = [
    "origin_port",
    "destination_port",
    "vessel_type",
    "season",
]

NUMERICAL_FEATURES = [
    "historical_freight_rate",
    "bunker_price",
    "coal_price",
    "demand_index",
    "vessel_supply_index",
    "port_congestion_index",
    "route_distance",
    "usd_inr",
    "oil_price",
]

TIME_SERIES_LAG_DAYS = [1, 7, 14, 30]
ROLLING_WINDOWS = [7, 14, 30]

# Decision Engine Thresholds
TREND_THRESHOLD_PERCENT = 1.5   # % rate change for Increasing / Decreasing
VOLATILITY_LOW_PCT = 0.05        # <5% relative std = Low
VOLATILITY_HIGH_PCT = 0.12       # >12% relative std = High

# Aliases
ORIGIN_ALIASES = {
    "australia": ["Newcastle (Port of Newcastle), Australia", "Gladstone, Australia"],
    "united states": ["Hampton Roads/Norfolk, USA", "Baltimore, USA"],
    "usa": ["Hampton Roads/Norfolk, USA", "Baltimore, USA"],
    "us": ["Hampton Roads/Norfolk, USA", "Baltimore, USA"],
    "indonesia": ["Taboneo Anchorage (S. Kalimantan), Indonesia"],
    "mozambique": ["Nacala, Mozambique"],
    "russia": ["Vostochny, Russia", "Ust-Luga, Russia"],
}

DESTINATION_ALIASES = {
    "paradip": "Paradip, India",
    "visakhapatnam": "Visakhapatnam, India",
    "vizag": "Visakhapatnam, India",
    "gangavaram": "Gangavaram, India",
    "gopalpur": "Gopalpur, India",
    "dhamra": "Dhamra, India",
    "sagar": "Sagar/Sandheads Anchorage, India",
    "sandheads": "Sagar/Sandheads Anchorage, India",
    "sagar/sandheads": "Sagar/Sandheads Anchorage, India",
    "sagar sandheads": "Sagar/Sandheads Anchorage, India",
    "sagar-sandheads": "Sagar/Sandheads Anchorage, India",
    "haldia": "Haldia, India",
}

VESSEL_TYPES = ["Handysize", "Supramax", "Panamax", "Capesize"]


def parse_forecast_horizon(val: object) -> int:
    """Parse integer days from various user input formats (e.g. 'Next 30 Days', 'short-term', 30)."""
    if isinstance(val, (int, float)):
        int_val = int(val)
        return int_val if int_val in HORIZONS else 30
    s = str(val).strip().lower()
    if "7" in s:
        return 7
    if "14" in s:
        return 14
    if "90" in s or "mid" in s or "long" in s or "3 month" in s:
        return 90
    if "60" in s:
        return 60
    if "30" in s or "short" in s or "1 month" in s:
        return 30
    return 30


DATA_STATUS_INFO = {
    "freight_rates": "PROXY / CALIBRATED HISTORICAL",
    "bunker_prices": "REAL / BENCHMARK SINGAPORE VLSFO",
    "coal_prices": "REAL / WORLD BANK NEWCASTLE BENCHMARK",
    "congestion": "PROXY / SAGAR UNNATI CALIBRATED",
    "vessels": "REAL / BALTIC EXCHANGE STANDARD REFERENCE SPECS",
    "routes": "REAL / NAUTICAL DISTANCES WITH CIRCUITY FACTORS",
}

