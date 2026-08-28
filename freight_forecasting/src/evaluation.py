"""Evaluation module: Time-Series Walk-Forward Chronological Validation."""
from __future__ import annotations
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any
from sklearn.metrics import mean_absolute_error, mean_squared_error


def calculate_mape(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Calculate Mean Absolute Percentage Error (MAPE) in %."""
    y_t = np.asarray(y_true, dtype=float)
    y_p = np.asarray(y_pred, dtype=float)
    mask = y_t > 0.01
    if not np.any(mask):
        return 0.0
    return float(np.mean(np.abs((y_t[mask] - y_p[mask]) / y_t[mask])) * 100.0)


def evaluate_predictions(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """Compute MAE, RMSE, and MAPE."""
    y_t = np.asarray(y_true, dtype=float)
    y_p = np.asarray(y_pred, dtype=float)
    mae = float(mean_absolute_error(y_t, y_p))
    rmse = float(np.sqrt(mean_squared_error(y_t, y_p)))
    mape = calculate_mape(y_t, y_p)
    return {
        "MAE": round(mae, 4),
        "RMSE": round(rmse, 4),
        "MAPE": round(mape, 2),
    }


def walk_forward_validation_xgb(
    df: pd.DataFrame,
    feature_cols: List[str],
    horizons: List[int] = [7, 14, 30, 60, 90],
    n_splits: int = 5,
    test_size_days: int = 90,
) -> Dict[str, Any]:
    """Perform strictly chronological walk-forward validation for XGBoost."""
    from xgboost import XGBRegressor
    
    df_sorted = df.sort_values("date").reset_index(drop=True)
    total_dates = df_sorted["date"].drop_duplicates().sort_values().reset_index(drop=True)
    n_dates = len(total_dates)
    
    results_by_horizon: Dict[int, List[Dict[str, float]]] = {h: [] for h in horizons}
    
    for split_idx in range(n_splits, 0, -1):
        cutoff_idx = n_dates - (split_idx * test_size_days)
        if cutoff_idx < test_size_days * 2:
            continue
        cutoff_date = total_dates.iloc[cutoff_idx]
        test_end_date = total_dates.iloc[min(cutoff_idx + test_size_days, n_dates - 1)]
        
        train_mask = df_sorted["date"] < cutoff_date
        test_mask = (df_sorted["date"] >= cutoff_date) & (df_sorted["date"] <= test_end_date)
        
        train_df = df_sorted[train_mask]
        test_df = df_sorted[test_mask]
        
        if len(train_df) == 0 or len(test_df) == 0:
            continue
            
        X_train = train_df[feature_cols].fillna(0)
        X_test = test_df[feature_cols].fillna(0)
        
        for h in horizons:
            target_col = f"freight_rate_{h}d"
            if target_col not in df_sorted.columns:
                continue
            y_train = train_df[target_col].dropna()
            valid_train = X_train.index.intersection(y_train.index)
            
            y_test = test_df[target_col].dropna()
            valid_test = X_test.index.intersection(y_test.index)
            
            if len(valid_train) < 30 or len(valid_test) < 10:
                continue
                
            model = XGBRegressor(
                n_estimators=200,
                max_depth=4,
                learning_rate=0.04,
                subsample=0.85,
                colsample_bytree=0.85,
                objective="reg:squarederror",
                random_state=42,
                n_jobs=-1,
            )
            model.fit(X_train.loc[valid_train], y_train.loc[valid_train])
            y_pred = model.predict(X_test.loc[valid_test])
            
            metrics = evaluate_predictions(y_test.loc[valid_test].values, y_pred)
            results_by_horizon[h].append(metrics)
            
    # Aggregate summary metrics
    summary: Dict[int, Dict[str, float]] = {}
    for h in horizons:
        folds = results_by_horizon[h]
        if folds:
            summary[h] = {
                "MAE": round(float(np.mean([f["MAE"] for f in folds])), 4),
                "RMSE": round(float(np.mean([f["RMSE"] for f in folds])), 4),
                "MAPE": round(float(np.mean([f["MAPE"] for f in folds])), 2),
            }
        else:
            raise RuntimeError(
                f"XGBoost walk-forward validation produced no valid "
                f"folds for the {h}-day horizon."
            )
            
    return summary


def walk_forward_validation_sarima(
    df: pd.DataFrame,
    horizons: List[int] = [7, 14, 30, 60, 90],
    n_routes_sample: int = 5,
) -> Dict[str, Any]:
    """Perform walk-forward validation for SARIMA baseline across representative routes."""
    from .models.sarima_model import SarimaModel
    
    group_cols = ["origin_port", "destination_port", "vessel_type"]
    routes = df[group_cols].drop_duplicates().head(n_routes_sample)
    
    horizon_errors: Dict[int, List[Dict[str, float]]] = {h: [] for h in horizons}
    
    for _, r in routes.iterrows():
        mask = (
            (df["origin_port"] == r["origin_port"]) &
            (df["destination_port"] == r["destination_port"]) &
            (df["vessel_type"] == r["vessel_type"])
        )
        series = df[mask].sort_values("date").set_index("date")["historical_freight_rate"].dropna()
        if len(series) < 180:
            continue
            
        train_series = series.iloc[:-90]
        test_series = series.iloc[-90:]
        
        sarima = SarimaModel(order=(1, 1, 1), seasonal_order=(1, 0, 0, 12))
        try:
            sarima.fit(train_series)
            preds, _, _ = sarima.forecast(steps=90)
            
            for h in horizons:
                if h <= len(test_series):
                    y_t = test_series.iloc[:h].values
                    y_p = preds[:h]
                    metrics = evaluate_predictions(y_t, y_p)
                    horizon_errors[h].append(metrics)
        except Exception:
            continue
            
    summary: Dict[int, Dict[str, float]] = {}
    for h in horizons:
        folds = horizon_errors[h]
        if folds:
            summary[h] = {
                "MAE": round(float(np.mean([f["MAE"] for f in folds])), 4),
                "RMSE": round(float(np.mean([f["RMSE"] for f in folds])), 4),
                "MAPE": round(float(np.mean([f["MAPE"] for f in folds])), 2),
            }
        else:
            raise RuntimeError(
                f"SARIMA walk-forward validation produced no valid "
                f"results for the {h}-day horizon."
            )
            
    return summary
