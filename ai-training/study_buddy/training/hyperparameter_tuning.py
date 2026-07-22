"""
Smart Study Buddy - Hyperparameter Tuning
Grid search for best Random Forest parameters, plus XGBoost & Neural Network alternatives.

Run: python -m study_buddy.training.hyperparameter_tuning
"""

import json
import sys
import os
import logging
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime
import numpy as np

# Ensure the parent of study_buddy is on path (i.e., ai-training directory)
_study_buddy_parent = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if _study_buddy_parent not in sys.path:
    sys.path.insert(0, _study_buddy_parent)

from study_buddy.training.train_behavior_model import BehaviorModelTrainer
from study_buddy.config import Config

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
)
logger = logging.getLogger(__name__)


class HyperparameterTuner:
    """
    Advanced hyperparameter tuning and alternative model experimentation.

    Explores:
      - Random Forest: n_estimators, max_depth, min_samples_split, max_features
      - XGBoost: n_estimators, max_depth, learning_rate, subsample, colsample_bytree
      - Neural Network (MLP): hidden_layer_sizes, alpha, learning_rate_init
    """

    def __init__(self, config: Optional[Config] = None):
        self.config = config or Config()
        self.data_dir = Path(__file__).parent.parent / "data" / "processed"
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.trainer = BehaviorModelTrainer()

    # ----------------------------------------------------------------
    # DATA GENERATION
    # ----------------------------------------------------------------
    def _get_data(self, num_samples: int = 2000):
        """Generate or load training data and prepare feature/label sets."""
        df = self.trainer.generate_synthetic_training_data(num_samples)
        targets = {
            "optimal_time": (df["optimal_time_category"], "classifier"),
            "performance": (df["performance_score"], "regressor"),
            "motivation": (df["motivation_level"], "classifier"),
        }
        return df, targets

    def _prepare_features_safe(self, df, train_idx, val_idx):
        """Prepare features with user-level aggregates computed only on training fold."""
        import pandas as pd

        df_train = df.iloc[train_idx].copy()
        df_val = df.iloc[val_idx].copy()

        # Compute user aggregates only on training data
        user_stats_train = df_train.groupby('user_id').agg({
            'accuracy': ['mean', 'std'],
            'duration_minutes': 'mean',
            'questions_per_hour': 'mean'
        }).round(3)
        user_stats_train.columns = ['user_avg_accuracy', 'user_accuracy_std',
                                     'user_avg_duration', 'user_avg_qph']
        user_stats_train = user_stats_train.fillna(0)

        # Apply to both train and val using training-derived stats
        df_train = df_train.merge(user_stats_train, left_on='user_id', right_index=True, how='left')
        df_val = df_val.merge(user_stats_train, left_on='user_id', right_index=True, how='left')
        df_val = df_val.fillna(0)  # For users not in train fold

        # Prepare other features (non-user-level)
        for d in [df_train, df_val]:
            d['hour_sin'] = np.sin(2 * np.pi * d['session_hour'] / 24)
            d['hour_cos'] = np.cos(2 * np.pi * d['session_hour'] / 24)
            d['day_sin'] = np.sin(2 * np.pi * d['day_of_week'] / 7)
            d['day_cos'] = np.cos(2 * np.pi * d['day_of_week'] / 7)
            d['accuracy_completion_ratio'] = d['accuracy'] / (d['completion_rate'] + 0.01)
            d['session_efficiency'] = d['questions_attempted'] / d['duration_minutes']
            d['streak_momentum'] = d['streak_days'] / (d['days_since_last_session'] + 1)

        feature_columns = [
            'session_hour', 'hour_sin', 'hour_cos', 'day_sin', 'day_cos',
            'accuracy', 'duration_minutes', 'questions_attempted', 'completion_rate',
            'streak_days', 'days_since_last_session', 'questions_per_hour',
            'session_number', 'accuracy_completion_ratio', 'session_efficiency',
            'streak_momentum', 'user_avg_accuracy', 'user_accuracy_std',
            'user_avg_duration', 'user_avg_qph'
        ]

        return df_train[feature_columns].values, df_val[feature_columns].values

    # ----------------------------------------------------------------
    # RANDOM FOREST GRID SEARCH
    # ----------------------------------------------------------------
    def _rf_grid(
        self, df, y, task_type: str, param_grid: Dict[str, list]
    ) -> Dict[str, Any]:
        """Simple grid search for Random Forest using GroupKFold to prevent user leakage."""
        from sklearn.model_selection import GroupKFold
        from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
        from sklearn.preprocessing import LabelEncoder

        best_score = -np.inf
        best_params = None
        results = []

        # Encode labels for classifier
        le = None
        if task_type == "classifier":
            le = LabelEncoder()
            y_enc = le.fit_transform(y)
        else:
            y_enc = np.array(y)

        # Use GroupKFold to ensure same user doesn't appear in both train and val
        groups = df['user_id'].values
        group_kfold = GroupKFold(n_splits=3)

        for n_est in param_grid.get("n_estimators", [100]):
            for depth in param_grid.get("max_depth", [10]):
                for min_split in param_grid.get("min_samples_split", [2]):
                    for max_feat in param_grid.get("max_features", ["sqrt"]):
                        if task_type == "classifier":
                            model = RandomForestClassifier(
                                n_estimators=n_est,
                                max_depth=depth,
                                min_samples_split=min_split,
                                max_features=max_feat,
                                random_state=42,
                                n_jobs=-1,
                            )
                        else:
                            model = RandomForestRegressor(
                                n_estimators=n_est,
                                max_depth=depth,
                                min_samples_split=min_split,
                                max_features=max_feat,
                                random_state=42,
                                n_jobs=-1,
                            )

                        # Manual CV with leak-free feature preparation
                        fold_scores = []
                        for train_idx, val_idx in group_kfold.split(df, y_enc, groups):
                            X_train, X_val = self._prepare_features_safe(df, train_idx, val_idx)
                            y_train, y_val = y_enc[train_idx], y_enc[val_idx]

                            model.fit(X_train, y_train)
                            if task_type == "classifier":
                                score = model.score(X_val, y_val)
                            else:
                                from sklearn.metrics import r2_score
                                preds = model.predict(X_val)
                                score = r2_score(y_val, preds)
                            fold_scores.append(score)

                        mean_score = np.mean(fold_scores)
                        results.append({
                            "n_estimators": n_est,
                            "max_depth": depth,
                            "min_samples_split": min_split,
                            "max_features": max_feat,
                            "cv_score": round(mean_score, 4),
                        })

                        if mean_score > best_score:
                            best_score = mean_score
                            best_params = {
                                "n_estimators": n_est,
                                "max_depth": depth,
                                "min_samples_split": min_split,
                                "max_features": max_feat,
                            }

        return {
            "best_params": best_params,
            "best_cv_score": round(best_score, 4),
            "all_results": results,
            "task_type": task_type,
        }

    # ----------------------------------------------------------------
    # XGBOOST
    # ----------------------------------------------------------------
    def _train_xgboost(self, df, y, task_type: str) -> Dict[str, Any]:
        """Train and evaluate XGBoost model with group-aware splits."""
        try:
            import xgboost as xgb
        except ImportError:
            logger.warning("xgboost not installed — skipping")
            return {"status": "skipped", "error": "xgboost not available"}

        from sklearn.model_selection import GroupKFold
        from sklearn.preprocessing import LabelEncoder
        from sklearn.metrics import accuracy_score, r2_score

        le = None
        if task_type == "classifier":
            le = LabelEncoder()
            y_enc = le.fit_transform(y)
            model = xgb.XGBClassifier(
                n_estimators=200, max_depth=6, learning_rate=0.1,
                subsample=0.8, colsample_bytree=0.8, random_state=42,
                eval_metric="mlogloss", use_label_encoder=False,
            )
        else:
            y_enc = np.array(y)
            model = xgb.XGBRegressor(
                n_estimators=200, max_depth=6, learning_rate=0.1,
                subsample=0.8, colsample_bytree=0.8, random_state=42,
            )

        groups = df['user_id'].values
        group_kfold = GroupKFold(n_splits=3)

        cv_scores = []
        for train_idx, val_idx in group_kfold.split(df, y_enc, groups):
            X_train, X_val = self._prepare_features_safe(df, train_idx, val_idx)
            y_train, y_val = y_enc[train_idx], y_enc[val_idx]

            model.fit(X_train, y_train)
            preds = model.predict(X_val)

            if task_type == "classifier":
                score = accuracy_score(y_val, preds)
            else:
                score = r2_score(y_val, preds)
            cv_scores.append(score)

        return {
            "status": "success",
            "model": "xgboost",
            "test_score": round(cv_scores[-1], 4),  # Last fold score
            "cv_mean": round(np.mean(cv_scores), 4),
            "cv_std": round(np.std(cv_scores), 4),
            "task_type": task_type,
        }

    # ----------------------------------------------------------------
    # NEURAL NETWORK (MLP)
    # ----------------------------------------------------------------
    def _train_mlp(self, df, y, task_type: str) -> Dict[str, Any]:
        """Train and evaluate a simple Multi-Layer Perceptron using Pipeline to prevent scaler leakage."""
        from sklearn.neural_network import MLPClassifier, MLPRegressor
        from sklearn.model_selection import GroupKFold
        from sklearn.preprocessing import LabelEncoder, StandardScaler
        from sklearn.metrics import accuracy_score, r2_score
        from sklearn.pipeline import Pipeline

        le = None
        if task_type == "classifier":
            le = LabelEncoder()
            y_enc = le.fit_transform(y)
            base_model = MLPClassifier(
                hidden_layer_sizes=(128, 64, 32),
                activation="relu", alpha=0.001, max_iter=300,
                learning_rate_init=0.001, random_state=42, early_stopping=True,
            )
        else:
            y_enc = np.array(y)
            base_model = MLPRegressor(
                hidden_layer_sizes=(128, 64, 32),
                activation="relu", alpha=0.001, max_iter=300,
                learning_rate_init=0.001, random_state=42, early_stopping=True,
            )

        # Create pipeline to ensure scaler is fit within each fold
        pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('mlp', base_model)
        ])

        groups = df['user_id'].values
        group_kfold = GroupKFold(n_splits=3)

        cv_scores = []
        for train_idx, val_idx in group_kfold.split(df, y_enc, groups):
            X_train, X_val = self._prepare_features_safe(df, train_idx, val_idx)
            y_train, y_val = y_enc[train_idx], y_enc[val_idx]

            # Pipeline fits scaler on train and applies to both train and val
            pipeline.fit(X_train, y_train)
            preds = pipeline.predict(X_val)

            if task_type == "classifier":
                score = accuracy_score(y_val, preds)
            else:
                score = r2_score(y_val, preds)
            cv_scores.append(score)

        return {
            "status": "success",
            "model": "mlp",
            "hidden_layers": str(base_model.hidden_layer_sizes),
            "test_score": round(cv_scores[-1], 4),  # Last fold score
            "cv_mean": round(np.mean(cv_scores), 4),
            "cv_std": round(np.std(cv_scores), 4),
            "task_type": task_type,
        }

    # ----------------------------------------------------------------
    # RUN ALL
    # ----------------------------------------------------------------
    def run_grid_search(self) -> Dict[str, Any]:
        """Run complete hyperparameter exploration across all models."""
        logger.info("Generating training data...")
        df, targets = self._get_data(num_samples=2000)
        logger.info(f"Data shape: {df.shape}")

        # RF parameter grid
        rf_grid = {
            "n_estimators": [50, 100, 200],
            "max_depth": [5, 10, 15, None],
            "min_samples_split": [2, 5, 10],
            "max_features": ["sqrt", "log2"],
        }

        results = {}
        for target_name, (y_series, task_type) in targets.items():
            logger.info(f"\n--- {target_name.upper()} ({task_type}) ---")

            # RF grid
            logger.info("  RF grid search...")
            rf_result = self._rf_grid(df, y_series, task_type, rf_grid)
            results[f"{target_name}_rf"] = rf_result
            logger.info(f"    Best RF params : {rf_result['best_params']}")
            logger.info(f"    Best RF score  : {rf_result['best_cv_score']}")

            # XGBoost
            logger.info("  XGBoost...")
            xgb_result = self._train_xgboost(df, y_series, task_type)
            results[f"{target_name}_xgboost"] = xgb_result
            if xgb_result.get("status") == "success":
                logger.info(f"    Test score : {xgb_result['test_score']}")
                logger.info(f"    CV score   : {xgb_result['cv_mean']}")

            # MLP
            logger.info("  MLP...")
            mlp_result = self._train_mlp(df, y_series, task_type)
            results[f"{target_name}_mlp"] = mlp_result
            if mlp_result.get("status") == "success":
                logger.info(f"    Test score : {mlp_result['test_score']}")
                logger.info(f"    CV score   : {mlp_result['cv_mean']}")

        # Save results
        report = {
            "results": results,
            "feature_count": 20,  # Known feature count from _prepare_features_safe
            "sample_count": len(df),
            "completed_at": datetime.now().isoformat(),
        }
        report_path = self.data_dir / "hyperparameter_tuning_results.json"
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        logger.info(f"\nResults saved → {report_path}")

        # Recommendations
        logger.info("\n--- RECOMMENDATIONS ---")
        for target_name in targets:
            base_key = f"{target_name}_rf"
            if base_key in results:
                best = results[base_key]
                logger.info(
                    f"  {target_name}: use RF {best['best_params']} "
                    f"(CV={best['best_cv_score']})"
                )
            xgb_key = f"{target_name}_xgboost"
            if xgb_key in results and results[xgb_key].get("status") == "success":
                logger.info(
                    f"  {target_name}: XGBoost alternative "
                    f"(CV={results[xgb_key]['cv_mean']})"
                )

        return report


def main():
    tuner = HyperparameterTuner()
    tuner.run_grid_search()


if __name__ == "__main__":
    main()
