"""SARIMA Baseline Model for Freight Forecasting."""
from __future__ import annotations
import warnings
import numpy as np
import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX
from typing import Tuple, Dict, Any

warnings.filterwarnings("ignore")


class SarimaModel:
    """Traditional statistical time-series model capturing trend, seasonality & autocorrelation."""

    def __init__(self, order: Tuple[int, int, int] = (1, 1, 1), seasonal_order: Tuple[int, int, int, int] = (1, 0, 0, 12)):
        self.order = order
        self.seasonal_order = seasonal_order
        self.fitted_model = None
        self.last_series = None

    def fit(self, series: pd.Series) -> "SarimaModel":
        """Fit SARIMAX on historical price series."""
        clean_series = series.dropna().astype(float)
        self.last_series = clean_series
        try:
            model = SARIMAX(
                clean_series,
                order=self.order,
                seasonal_order=self.seasonal_order,
                enforce_stationarity=False,
                enforce_invertibility=False,
            )
            self.fitted_model = model.fit(disp=False, maxiter=100)
        except Exception:
            # Fallback to simpler AR(1) specification
            model = SARIMAX(clean_series, order=(1, 1, 0), enforce_stationarity=False)
            self.fitted_model = model.fit(disp=False)
        return self

    def forecast(self, steps: int = 90, alpha: float = 0.1) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Generate point forecasts and (1-alpha) confidence intervals."""
        if self.fitted_model is None:
            raise ValueError("SARIMA model must be fitted before forecasting.")
        result = self.fitted_model.get_forecast(steps=steps)
        pred_mean = np.maximum(0.1, np.asarray(result.predicted_mean, dtype=float))
        conf_int = np.asarray(result.conf_int(alpha=alpha), dtype=float)
        lower = np.maximum(0.1, conf_int[:, 0])
        upper = np.maximum(pred_mean, conf_int[:, 1])
        return pred_mean, lower, upper
