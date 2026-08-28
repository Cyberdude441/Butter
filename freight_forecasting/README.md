# Bulk Freight Rate Forecasting & Port Optimization ML Engine

An end-to-end Machine Learning forecasting, market intelligence, port congestion analysis, delay estimation, and optimal discharge port recommendation system.

---

## 1. Overview
The system predicts future dry bulk ocean freight rates (USD/MT) across 5 primary forecasting horizons:
- **7 Days** ($T+7$)
- **14 Days** ($T+14$)
- **30 Days** ($T+30$)
- **60 Days** ($T+60$)
- **90 Days** ($T+90$)

It layers a multi-horizon forecasting core with an operational decision support and port optimization suite:
1. **Multi-Horizon ML Forecasting**: Dynamic auto-selection between SARIMA and Multi-Horizon XGBoost based on walk-forward out-of-sample validation metrics.
2. **Market Intelligence Engine**: Quantile-calibrated indicators for cargo demand, fleet supply tightness, demand/supply ratios, and market pricing pressure.
3. **Port Congestion & Delay Engine**: Port-specific congestion index and vessel-calibrated operational waiting times (pilotage, queueing, and berthing).
4. **Port Optimization & Alternative Ranking**: Evaluates physical berth compatibility (draft, LOA, beam, DWT), voyage transit efficiency, congestion scores, delay impacts, and operational risk.

---

## 2. Input Features & Data Sources

| Feature Category | Variables | Data Type / Source |
| :--- | :--- | :--- |
| **Route & Categoricals** | `origin_port`, `destination_port`, `vessel_type`, `season` | Real / Baltic Exchange Specs |
| **Commodity & Macro** | `bunker_price` (VLSFO), `coal_price` (Newcastle), `oil_price` (Brent), `usd_inr` | Real / World Bank & Singapore Benchmark |
| **Market Indicators** | `cargo_demand_index`, `vessel_supply_index`, `port_congestion_index` | Calibrated / Sagar Unnati Port Benchmark |
| **Voyage Routing** | `route_distance` (nautical miles), `estimated_sailing_days` | Haversine + Marine Circuity Factors |

---

## 3. Market Intelligence Engine (`market_intelligence.py`)

Derives real-time market regimes based on historical feature distributions:
- **Demand Index**:
  - `High`: $> 102.5$
  - `Low`: $< 97.5$
  - `Normal`: $97.5 - 102.5$
- **Vessel Supply Index**:
  - `Tight`: $< 98.0$ (constrained fleet availability)
  - `Excess`: $> 102.5$ (oversupplied tonnage)
  - `Balanced`: $98.0 - 102.5$
- **Demand-Supply Ratio & Market Pressure**:
  - `Upward`: Ratio $> 1.02$
  - `Downward`: Ratio $< 0.98$
  - `Neutral`: $0.98 - 1.02$

---

## 4. Port Congestion & Delay Engine (`port_optimizer.py`)

Calculates operational waiting times (days) using observed/calibrated congestion metrics and vessel characteristics:

$$\text{Estimated Delay (Days)} = \text{Base Delay} + \left(\frac{\text{Congestion Index}}{100} \times 3.5\right) + \text{Vessel Factor}$$

- **Vessel Factor**: Capesize ($+0.6\text{d}$ for deep-draft tidal window), Panamax ($+0.3\text{d}$), Supramax/Handysize ($0.0\text{d}$).
- **Congestion Level**: `Low` ($< 35$), `Medium` ($35 - 55$), `High` ($> 55$).
- **Delay Level**: `Low` ($\le 2.2\text{d}$), `Medium` ($2.2 - 3.8\text{d}$), `High` ($> 3.8\text{d}$).

---

## 5. Port Optimization & Multi-Factor Ranking

Evaluates all candidate East Coast India discharge ports (*Paradip, Visakhapatnam, Gangavaram, Gopalpur, Dhamra, Haldia, Sagar/Sandheads*):

$$\text{Port Optimization Score} = \sum (w_i \times S_i)$$

### Configurable Weights (`config.py`):
```python
PORT_OPTIMIZATION_WEIGHTS = {
    "congestion": 0.25,          # Lower port congestion index
    "delay": 0.25,               # Shorter operational turnaround delay
    "route_economics": 0.25,     # Voyage distance and freight rate efficiency
    "vessel_suitability": 0.15,  # Berth draft clearance vs vessel draft limit
    "risk": 0.10,                # Lock gate constraints / weather exposure
}
```

### Recommendation Logic:
- If selected port is top-ranked $\rightarrow$ `Keep Selected Port`
- If an alternative port provides lower congestion and turnaround savings $\rightarrow$ `Consider Alternative Port` with quantified delay savings (`expected_delay_difference_days` and `expected_operational_benefit`).

---

## 6. API Endpoints

### FastAPI ML Backend
```bash
uvicorn freight_forecasting.api.main:app --host 0.0.0.0 --port 8000
```

### POST `/predict`
**Request Payload:**
```json
{
  "origin": "Australia",
  "destination": "Paradip",
  "vessel_type": "Panamax",
  "forecast_horizon": 30,
  "cargo_quantity": 75000
}
```

**Response Payload:**
```json
{
  "origin": "Newcastle (Port of Newcastle), Australia",
  "destination": "Paradip, India",
  "vessel_type": "Panamax",
  "current_freight_rate": 21.74,
  "predicted_freight_rate": 21.83,
  "forecast_horizon_days": 30,
  "forecast_30d": 21.83,
  "forecast_90d": 20.00,
  "forecast_lower_bound": 21.21,
  "forecast_upper_bound": 22.45,
  "trend": "Stable",
  "volatility": "Low",
  "market_signal": "MONITOR",
  "selected_model": "SARIMA",
  "market_intelligence": {
    "demand_index": 100.1,
    "demand_status": "Normal",
    "vessel_supply_index": 100.4,
    "supply_status": "Balanced",
    "demand_supply_ratio": 1.0,
    "market_pressure": "Neutral"
  },
  "port_analysis": {
    "selected_port": "Paradip",
    "congestion_index": 38.5,
    "congestion_level": "Medium",
    "estimated_delay_days": 2.6,
    "delay_level": "Medium",
    "data_source_status": "calibrated_proxy"
  },
  "optimal_port": {
    "recommended_port": "Paradip",
    "selected_port": "Paradip",
    "recommendation_type": "Keep Selected Port",
    "optimization_score": 88.5,
    "estimated_delay_days": 2.6,
    "congestion_level": "Medium",
    "expected_operational_benefit": "Direct discharge berth with lowest total voyage turnaround",
    "ranked_alternatives": [ ... ]
  }
}
```
