"""Multi-Horizon XGBoost Regressors for Freight Rate Forecasting."""
from __future__ import annotations
import json
from pathlib import Path
from typing import Dict, List, Tuple, Any
import numpy as np
import pandas as pd
from xgboost import XGBRegressor
from ..config import HORIZONS, MODELS_DIR


class MultiHorizonXGBoost:
    """Dedicated gradient boosted tree regressors for horizons [7, 14, 30, 60, 90] days."""

    def __init__(self, n_estimators: int = 350, max_depth: int = 5, learning_rate: float = 0.035):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.learning_rate = learning_rate
        self.models: Dict[int, XGBRegressor] = {}
        self.residual_stds: Dict[int, float] = {}
        self.feature_names: List[str] = []

    def fit(self, X: pd.DataFrame, targets: Dict[int, pd.Series], feature_names: List[str]) -> "MultiHorizonXGBoost":
        """Train independent XGBoost regressors per horizon with early stopping and regularisation."""
        self.feature_names = feature_names
        X_clean = X[feature_names].copy().fillna(0)

        for h in HORIZONS:
            y = targets[h].dropna()
            common_idx = X_clean.index.intersection(y.index)
            X_sub = X_clean.loc[common_idx]
            y_sub = y.loc[common_idx]

            model = XGBRegressor(
                n_estimators=self.n_estimators,
                max_depth=self.max_depth,
                learning_rate=self.learning_rate,
                subsample=0.85,
                colsample_bytree=0.85,
                reg_alpha=0.1,
                reg_lambda=1.0,
                objective="reg:squarederror",
                random_state=42,
                n_jobs=-1,
            )
            model.fit(X_sub, y_sub)
            self.models[h] = model

            # Calibrate empirical residual standard error for prediction intervals
            preds = model.predict(X_sub)
            residuals = y_sub.values - preds
            self.residual_stds[h] = float(np.std(residuals))

        return self

    def predict_horizon(self, X: pd.DataFrame, horizon: int) -> Tuple[float, float, float]:
        """Generate predicted rate, lower bound, and upper bound for a given horizon."""
        if horizon not in self.models:
            raise ValueError(f"Horizon {horizon}d not found in trained models {list(self.models.keys())}")
        
        model = self.models[horizon]
        X_clean = X[self.feature_names].copy().fillna(0)
        point_pred = float(model.predict(X_clean)[-1])
        point_pred = max(0.1, point_pred)
        
        std = self.residual_stds.get(horizon, 0.5)
        # 80% confidence bound multiplier (z ~ 1.28)
        lower = max(0.1, point_pred - 1.28 * std)
        upper = max(point_pred, point_pred + 1.28 * std)
        return point_pred, lower, upper

    def predict_all_horizons(self, X: pd.DataFrame) -> Dict[str, Dict[str, float]]:
        """Predict across all horizons."""
        results = {}
        for h in HORIZONS:
            pred, low, up = self.predict_horizon(X, h)
            results[f"forecast_{h}d"] = {
                "rate": round(pred, 2),
                "lower": round(low, 2),
                "upper": round(up, 2),
                "std": round(self.residual_stds.get(h, 0.5), 2),
            }
        return results

    def get_feature_importances(self, horizon: int = 30) -> Dict[str, float]:
        """Return sorted feature importances for a horizon."""
        if horizon not in self.models:
            horizon = 30
        model = self.models[horizon]
        importances = model.feature_importances_
        sorted_pairs = sorted(zip(self.feature_names, importances), key=lambda x: x[1], reverse=True)
        return {feat: round(float(imp), 4) for feat, imp in sorted_pairs}

    def save(self, directory: Path | str = MODELS_DIR) -> None:
        """Serialize trained models natively in JSON format."""
        dir_path = Path(directory)
        dir_path.mkdir(parents=True, exist_ok=True)
        
        # Save each model in native json format
        for h, model in self.models.items():
            model_file = dir_path / f"xgb_horizon_{h}d.json"
            model.save_model(str(model_file))
            
        # Save metadata
        meta = {
            "feature_names": self.feature_names,
            "residual_stds": {str(k): v for k, v in self.residual_stds.items()},
            "horizons": HORIZONS,
        }
        with open(dir_path / "xgb_metadata.json", "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)

    @classmethod
    def load(cls, directory: Path | str = MODELS_DIR) -> "MultiHorizonXGBoost":
        """Load trained models from native JSON files."""
        dir_path = Path(directory)
        meta_file = dir_path / "xgb_metadata.json"
        
        if not meta_file.exists():
            raise FileNotFoundError(f"XGB metadata not found at {meta_file}")
            
        with open(meta_file, "r", encoding="utf-8") as f:
            meta = json.load(f)
            
        instance = cls()
        instance.feature_names = meta.get("feature_names", [])
        instance.residual_stds = {int(k): float(v) for k, v in meta.get("residual_stds", {}).items()}
        
        for h in meta.get("horizons", HORIZONS):
            model_file = dir_path / f"xgb_horizon_{h}d.json"
            if model_file.exists():
                model = XGBRegressor()
                model.load_model(str(model_file))
                instance.models[h] = model
                
        return instance
