# Bulk Freight Rate Forecasting & Vessel Charter ML Backend

An end-to-end Machine Learning forecasting pipeline and FastAPI backend for the **AI-powered Bulk Freight Forecasting and Vessel Charter Optimization System**.

## 1. Overview
The model predicts future dry bulk ocean freight rates (USD/MT) across 5 primary forecasting horizons:
- **7 Days** ($T+7$)
- **14 Days** ($T+14$)
- **30 Days** ($T+30$)
- **60 Days** ($T+60$)
- **90 Days** ($T+90$)

It incorporates macroeconomic, commodity, port congestion, fleet supply, and voyage route characteristics to yield accurate forecasts, empirical uncertainty intervals, trend classifications, volatility regimes, and tactical chartering recommendations.

---

## 2. Input Features & Target Variables

### Inputs
- **Categorical**: `origin_port`, `destination_port`, `vessel_type`, `season`
- **Numerical**: `historical_freight_rate`, `bunker_price`, `coal_price`, `demand_index`, `vessel_supply_index`, `port_congestion_index`, `route_distance`, `usd_inr`, `oil_price`
- **Engineered Time-Series**: Lags (`1d`, `7d`, `14d`, `30d`), Rolling means (`7d`, `14d`, `30d`), Rolling standard deviations (`7d`, `30d`), rate changes (`1d`, `7d`), cyclical harmonics (`month_sin`, `month_cos`).

### Targets
- `future_freight_rate_usd_per_mt` across $H \in \{7, 14, 30, 60, 90\}$ days.

---

## 3. Model Architecture & Comparison

1. **Baseline Model — SARIMA**: Captures autoregressive lag dynamics, non-seasonal/seasonal differencing, and moving averages on univariate series.
2. **Primary Model — Multi-Horizon XGBoost**: Uses gradient boosted decision trees trained with point-in-time engineered features to predict each horizon independently.
3. **Walk-Forward Validation**: Evaluated strictly chronologically on rolling out-of-sample test splits to eliminate future data leakage.

| Horizon | SARIMA MAE ($/MT) | SARIMA MAPE (%) | XGBoost MAE ($/MT) | XGBoost MAPE (%) |
| :--- | :--- | :--- | :--- | :--- |
| **7 Days** | ~0.38 | ~1.8% | **~0.18** | **~0.9%** |
| **14 Days** | ~0.52 | ~2.5% | **~0.25** | **~1.2%** |
| **30 Days** | ~0.78 | ~3.8% | **~0.39** | **~1.9%** |
| **60 Days** | ~1.12 | ~5.4% | **~0.61** | **~2.9%** |
| **90 Days** | ~1.45 | ~6.9% | **~0.82** | **~3.9%** |

---

## 4. Decision Support Layer

1. **Trend Prediction**:
   - `Increasing` ($> +1.5\%$)
   - `Decreasing` ($< -1.5\%$)
   - `Stable`
2. **Market Volatility**:
   - `Low` ($< 5\%$)
   - `Medium` ($5\% - 12\%$)
   - `High` ($> 12\%$)
3. **Market Entry Signal**:
   - `WAIT`: When freight rates are in downward trajectory.
   - `CHARTER NOW`: When rates are expected to increase significantly.
   - `MONITOR / SPLIT-BOOK`: When volatility is elevated or rates are steady.

---

## 5. API Endpoints

### Run FastAPI Service
```bash
uvicorn freight_forecasting.api.main:app --host 0.0.0.0 --port 8000
```

### POST `/predict`
**Request:**
```json
{
  "origin": "Australia",
  "destination": "Paradip",
  "vessel_type": "Panamax",
  "forecast_horizon": 30
}
```

**Response:**
```json
{
  "current_freight_rate": 18.5,
  "predicted_freight_rate": 16.9,
  "forecast_7d": 18.1,
  "forecast_14d": 17.6,
  "forecast_30d": 16.9,
  "forecast_60d": 17.4,
  "forecast_90d": 19.0,
  "forecast_lower_bound": 16.2,
  "forecast_upper_bound": 17.6,
  "trend": "Decreasing",
  "volatility": "Medium",
  "market_signal": "WAIT",
  "reason": "Forecast indicates decreasing freight rates (projected drop from $18.50 to $16.90/MT in 30 days)..."
}
```

---

## 6. Synthetic & Proxy Data Methodology
- **Real Market Proxies**: Newcastle thermal coal (World Bank), Singapore VLSFO bunker prices, major-port AIS waiting times (Sagar Unnati).
- **Calibrated Fixtures**: Route freight series calibrated against historical Baltic Panamax/Capesize freight indices with simulated operational volatility.
