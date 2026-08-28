"""Feature engineering module for time-series freight rate forecasting."""
from __future__ import annotations
import numpy as np
import pandas as pd
from typing import List, Tuple
from .config import TIME_SERIES_LAG_DAYS, ROLLING_WINDOWS, HORIZONS


class FeatureEngineer:
    """Constructs point-in-time features strictly using historical observations."""

    @staticmethod
    def add_calendar_features(df: pd.DataFrame) -> pd.DataFrame:
        """Extract month, quarter, week of year, and cyclical harmonic features."""
        df = df.copy()
        dates = pd.to_datetime(df["date"])
        df["month"] = dates.dt.month
        df["quarter"] = dates.dt.quarter
        df["week_of_year"] = dates.dt.isocalendar().week.astype(int)
        df["day_of_week"] = dates.dt.dayofweek
        
        # Cyclical sine/cosine encodings
        df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12.0)
        df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12.0)
        df["week_sin"] = np.sin(2 * np.pi * df["week_of_year"] / 52.0)
        df["week_cos"] = np.cos(2 * np.pi * df["week_of_year"] / 52.0)
        
        # Map season if missing
        if "season" not in df.columns:
            season_map = {12: "Winter", 1: "Winter", 2: "Winter",
                          3: "Spring", 4: "Spring", 5: "Spring",
                          6: "Summer", 7: "Summer", 8: "Summer",
                          9: "Autumn", 10: "Autumn", 11: "Autumn"}
            df["season"] = df["month"].map(season_map)
            
        return df

    @staticmethod
    def add_time_series_features(df: pd.DataFrame) -> pd.DataFrame:
        """Add lagged rates, rolling statistics, momentum differences strictly per route."""
        df = df.copy()
        group_cols = ["origin_port", "destination_port", "vessel_type"]
        df = df.sort_values(group_cols + ["date"]).reset_index(drop=True)
        
        rate_col = "historical_freight_rate"
        
        # 1. Historical Freight Lags
        for lag in TIME_SERIES_LAG_DAYS:
            df[f"freight_lag_{lag}"] = df.groupby(group_cols)[rate_col].shift(lag)
            
        # 2. Rolling Means & Standard Deviations
        for window in ROLLING_WINDOWS:
            # Shift 1 to prevent current-step leakage into rolling metrics
            df[f"rolling_mean_{window}"] = df.groupby(group_cols)[rate_col].transform(
                lambda s: s.shift(1).rolling(window, min_periods=max(2, window // 3)).mean()
            )
            df[f"rolling_std_{window}"] = df.groupby(group_cols)[rate_col].transform(
                lambda s: s.shift(1).rolling(window, min_periods=max(2, window // 3)).std()
            )
            
        # 3. Rate Changes (Momentum)
        df["freight_change_1d"] = df[rate_col].shift(1) - df[rate_col].shift(2)
        df["freight_change_7d"] = df[rate_col].shift(1) - df[rate_col].shift(8)
        
        # 4. Market Exogenous Lags & Ratios
        if "bunker_price" in df.columns:
            df["bunker_lag_1"] = df.groupby(group_cols)["bunker_price"].shift(1)
            df["bunker_lag_7"] = df.groupby(group_cols)["bunker_price"].shift(7)
            df["bunker_change_7d"] = df["bunker_lag_1"] - df["bunker_lag_7"]
            
        if "coal_price" in df.columns:
            df["coal_lag_1"] = df.groupby(group_cols)["coal_price"].shift(1)
            df["coal_lag_7"] = df.groupby(group_cols)["coal_price"].shift(7)
            
        if "cargo_demand_index" in df.columns and "vessel_supply_index" in df.columns:
            df["demand_supply_ratio"] = df["cargo_demand_index"] / (df["vessel_supply_index"] + 1e-6)
        elif "demand_index" in df.columns and "vessel_supply_index" in df.columns:
            df["demand_supply_ratio"] = df["demand_index"] / (df["vessel_supply_index"] + 1e-6)
            
        if "port_congestion_index" in df.columns:
            df["congestion_lag_7"] = df.groupby(group_cols)["port_congestion_index"].shift(7)
            
        return df

    @staticmethod
    def create_forecasting_targets(df: pd.DataFrame) -> pd.DataFrame:
        """Create forward-looking target variables for training."""
        df = df.copy()
        group_cols = ["origin_port", "destination_port", "vessel_type"]
        rate_col = "historical_freight_rate"
        
        for h in HORIZONS:
            target_col = f"freight_rate_{h}d"
            alt_target = f"future_freight_rate_{h}d"
            if alt_target in df.columns:
                df[target_col] = df[alt_target]
            else:
                df[target_col] = df.groupby(group_cols)[rate_col].shift(-h)
                
        return df

    def transform(self, df: pd.DataFrame, is_training: bool = True) -> pd.DataFrame:
        """Run complete feature engineering pipeline."""
        df_cal = self.add_calendar_features(df)
        df_ts = self.add_time_series_features(df_cal)
        if is_training:
            df_full = self.create_forecasting_targets(df_ts)
            return df_full
        return df_ts

    @staticmethod
    def get_feature_columns() -> List[str]:
        """Return canonical model input feature column names."""
        return [
            "month_sin", "month_cos", "week_sin", "week_cos",
            "freight_lag_1", "freight_lag_7", "freight_lag_14", "freight_lag_30",
            "rolling_mean_7", "rolling_mean_14", "rolling_mean_30",
            "rolling_std_7", "rolling_std_30",
            "freight_change_1d", "freight_change_7d",
            "bunker_price", "bunker_lag_1", "bunker_lag_7",
            "coal_price", "coal_lag_1", "coal_lag_7",
            "demand_index", "vessel_supply_index", "demand_supply_ratio",
            "port_congestion_index", "congestion_lag_7",
            "route_distance", "usd_inr", "oil_price",
            "origin_port_enc", "destination_port_enc", "vessel_type_enc", "season_enc",
        ]
