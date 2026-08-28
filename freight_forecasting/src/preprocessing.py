"""Data Preprocessing pipeline for Freight Forecasting."""
from __future__ import annotations
import joblib
from pathlib import Path
from typing import Tuple, Dict, Any
import numpy as np
import pandas as pd
from sklearn.preprocessing import OrdinalEncoder, RobustScaler
from .config import CATEGORICAL_FEATURES, NUMERICAL_FEATURES, MODELS_DIR


class DataPreprocessor:
    """End-to-end preprocessing pipeline for freight data without leakage."""
    
    def __init__(self):
        self.cat_encoder = OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1)
        self.num_scaler = RobustScaler()
        self.cat_columns = CATEGORICAL_FEATURES.copy()
        self.num_columns = NUMERICAL_FEATURES.copy()
        self.is_fitted = False
        
    def clean_raw_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Handle missing values, duplicates, invalid records, and sort chronologically."""
        df = df.copy()
        df["date"] = pd.to_datetime(df["date"])
        
        # Sort chronologically by series grouping
        group_cols = ["origin_port", "destination_port", "vessel_type"]
        df = df.sort_values(group_cols + ["date"]).reset_index(drop=True)
        
        # Drop duplicates on key
        df = df.drop_duplicates(subset=group_cols + ["date"]).reset_index(drop=True)
        
        # Numeric conversions & sanity caps
        for col in self.num_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")
                # STRICTLY PAST-ONLY IMPUTATION:
                # forward-fill within each route/vessel series.
                # Backfill would use future observations and cause leakage.
                df[col] = df.groupby(group_cols)[col].ffill()
                
        # Remove impossible/negative values
        if "historical_freight_rate" in df.columns:
            df = df[df["historical_freight_rate"] > 0]
            
        return df.reset_index(drop=True)

    def fit(self, df: pd.DataFrame) -> "DataPreprocessor":
        """Fit encoders and scalers strictly on training data."""
        cleaned = self.clean_raw_data(df)
        available_cats = [c for c in self.cat_columns if c in cleaned.columns]
        available_nums = [c for c in self.num_columns if c in cleaned.columns]
        
        if available_cats:
            self.cat_encoder.fit(cleaned[available_cats])
        if available_nums:
            self.num_scaler.fit(cleaned[available_nums])
            
        self.is_fitted = True
        return self

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Transform features using fitted parameters."""
        if not self.is_fitted:
            raise ValueError("Preprocessor has not been fitted yet.")
        cleaned = self.clean_raw_data(df)
        transformed = cleaned.copy()
        
        available_cats = [c for c in self.cat_columns if c in transformed.columns]
        available_nums = [c for c in self.num_columns if c in transformed.columns]
        
        if available_cats:
            encoded_cats = self.cat_encoder.transform(transformed[available_cats])
            for idx, col in enumerate(available_cats):
                transformed[f"{col}_enc"] = encoded_cats[:, idx]
                
        if available_nums:
            scaled_nums = self.num_scaler.transform(transformed[available_nums])
            for idx, col in enumerate(available_nums):
                transformed[f"{col}_scaled"] = scaled_nums[:, idx]
                
        return transformed

    def fit_transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Fit and transform in a single pass."""
        return self.fit(df).transform(df)

    def save(self, path: Path | str = MODELS_DIR / "preprocessing_pipeline.joblib") -> None:
        """Serialize fitted pipeline."""
        joblib.dump(self, path)

    @classmethod
    def load(cls, path: Path | str = MODELS_DIR / "preprocessing_pipeline.joblib") -> "DataPreprocessor":
        """Load serialized pipeline."""
        return joblib.load(path)
