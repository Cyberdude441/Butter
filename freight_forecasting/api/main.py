"""FastAPI Backend Application for Bulk Freight Rate Forecasting."""
from __future__ import annotations
import os
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from ..src.forecast import FreightForecaster
from ..src.config import ORIGIN_ALIASES, DESTINATION_ALIASES, VESSEL_TYPES, DATA_STATUS_INFO

app = FastAPI(
    title="AI Bulk Freight Rate Prediction API",
    description="Production ML Backend predicting dry bulk freight rates, trends, volatility, and charter market signals.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global forecaster instance
FORECASTER = FreightForecaster()


class ForecastQuery(BaseModel):
    origin: str = Field("Australia", description="Origin country or loading port")
    destination: str = Field("Paradip", description="Destination discharge port")
    vessel_type: Optional[str] = Field("Panamax", description="Vessel classification (Handysize, Supramax, Panamax, Capesize)")
    vesselType: Optional[str] = Field(None, description="Alias for vessel_type for frontend compatibility")
    forecast_horizon: Optional[int] = Field(30, description="Primary forecast horizon in days (7, 14, 30, 60, 90)")
    cargo_quantity: Optional[float] = Field(None, description="Cargo quantity in MT (for vessel feasibility check)")
    cargoQuantity: Optional[float] = Field(None, description="Alias for cargo_quantity")


class ForecastResponse(BaseModel):
    origin: str
    destination: str
    vessel_type: str
    as_of_date: str
    current_freight_rate: float
    predicted_freight_rate: float
    forecast_horizon_days: int
    forecast_7d: Optional[float]
    forecast_14d: Optional[float]
    forecast_30d: Optional[float]
    forecast_60d: Optional[float]
    forecast_90d: Optional[float]
    forecast_details: Dict[str, Any]
    forecast_lower_bound: Optional[float]
    forecast_upper_bound: Optional[float]
    confidence_interval: str
    trend: str
    volatility: str
    market_signal: str
    reason: str
    charter_strategy: str
    selected_model: str
    benchmark_models: Dict[str, Any]
    top_drivers: List[Dict[str, Any]]
    rateData: List[Dict[str, Any]]
    data_status: Dict[str, str]


@app.get("/")
def root():
    return {
        "service": "AI Bulk Freight Forecasting Engine",
        "status": "online",
        "version": "1.0.0",
        "endpoints": ["/predict", "/forecast", "/metrics", "/routes", "/health"],
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "models_loaded": FORECASTER.xgb_models is not None,
        "dataset_records": len(FORECASTER.dataset) if FORECASTER.dataset is not None else 0,
        "data_status": DATA_STATUS_INFO,
    }


@app.get("/routes")
def get_available_routes():
    """List valid origins, destinations, and vessel types supported by the system."""
    return {
        "origins": list(ORIGIN_ALIASES.keys()),
        "destinations": list(DESTINATION_ALIASES.keys()),
        "vessel_types": VESSEL_TYPES,
    }


@app.get("/metrics")
def get_model_metrics():
    """Return walk-forward validation comparison metrics (SARIMA vs XGBoost)."""
    return FORECASTER.comparison_metrics


@app.post("/predict", response_model=ForecastResponse)
@app.post("/forecast", response_model=ForecastResponse)
def predict_freight_rate(query: ForecastQuery):
    """Predict future freight rates and generate decision support signals."""
    try:
        vessel = query.vesselType or query.vessel_type or "Panamax"
        horizon = query.forecast_horizon or 30
        
        result = FORECASTER.predict(
            origin=query.origin,
            destination=query.destination,
            vessel_type=vessel,
            forecast_horizon=horizon,
        )
        return result
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))
