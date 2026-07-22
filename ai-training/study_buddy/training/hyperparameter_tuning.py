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
        X, feature_info = self.trainer.prepare_features(df)
        targets = {
            "optimal_time": (df["optimal_time_category"], "classifier"),
            "performance": (df["performance_score"], "regressor"),
            "motivation": (df["motivation_level"], "classifier"),
        }
        return X, targets, feature_info

    # ----------------------------------------------------------------
    # RANDOM FOREST GRID SEARCH
    # ----------------------------------------------------------------
    def _rf_grid(
        self, X, y, task_type: str, param_grid: Dict[str, list]
    ) -> Dict[str, Any]:
        """Simple grid search for Random Forest."""
        from sklearn.model_selection import cross_val_score
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
            y_enc = y

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
                            scoring = "accuracy"
                        else:
                            model = RandomForestRegressor(
                                n_estimators=n_est,
                                max_depth=depth,
                                min_samples_split=min_split,
                                max_features=max_feat,
                                random_state=42,
                                n_jobs=-1,
                            )
                            scoring = "r2"

                        scores = cross_val_score(model, X, y_enc, cv=3, scoring=scoring)
                        mean_score = scores.mean()
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
    def _train_xgboost(self, X, y, task_type: str) -> Dict[str, Any]:
        """Train and evaluate XGBoost model."""
        try:
            import xgboost as xgb
        except ImportError:
            logger.warning("xgboost not installed — skipping")
            return {"status": "skipped", "error": "xgboost not available"}

        from sklearn.model_selection import cross_val_score, train_test_split
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
            scoring = "accuracy"
        else:
            y_enc = y
            model = xgb.XGBRegressor(
                n_estimators=200, max_depth=6, learning_rate=0.1,
                subsample=0.8, colsample_bytree=0.8, random_state=42,
            )
            scoring = "r2"

        X_train, X_test, y_train, y_test = train_test_split(
            X, y_enc, test_size=0.2, random_state=42,
        )
        model.fit(X_train, y_train)
        preds = model.predict(X_test)

        if task_type == "classifier":
            metric = accuracy_score(y_test, preds)
        else:
            metric = r2_score(y_test, preds)

        cv_scores = cross_val_score(model, X, y_enc, cv=3, scoring=scoring)

        return {
            "status": "success",
            "model": "xgboost",
            "test_score": round(metric, 4),
            "cv_mean": round(cv_scores.mean(), 4),
            "cv_std": round(cv_scores.std(), 4),
            "task_type": task_type,
        }

    # ----------------------------------------------------------------
    # NEURAL NETWORK (MLP)
    # ----------------------------------------------------------------
    def _train_mlp(self, X, y, task_type: str) -> Dict[str, Any]:
        """Train and evaluate a simple Multi-Layer Perceptron."""
        from sklearn.neural_network import MLPClassifier, MLPRegressor
        from sklearn.model_selection import cross_val_score, train_test_split
        from sklearn.preprocessing import LabelEncoder, StandardScaler
        from sklearn.metrics import accuracy_score, r2_score

        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        le = None
        if task_type == "classifier":
            le = LabelEncoder()
            y_enc = le.fit_transform(y)
            model = MLPClassifier(
                hidden_layer_sizes=(128, 64, 32),
                activation="relu", alpha=0.001, max_iter=300,
                learning_rate_init=0.001, random_state=42, early_stopping=True,
            )
            scoring = "accuracy"
        else:
            y_enc = y
            model = MLPRegressor(
                hidden_layer_sizes=(128, 64, 32),
                activation="relu", alpha=0.001, max_iter=300,
                learning_rate_init=0.001, random_state=42, early_stopping=True,
            )
            scoring = "r2"

        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y_enc, test_size=0.2, random_state=42,
        )
        model.fit(X_train, y_train)
        preds = model.predict(X_test)

        if task_type == "classifier":
            metric = accuracy_score(y_test, preds)
        else:
            metric = r2_score(y_test, preds)

        cv_scores = cross_val_score(model, X_scaled, y_enc, cv=3, scoring=scoring)

        return {
            "status": "success",
            "model": "mlp",
            "hidden_layers": str(model.hidden_layer_sizes),
            "test_score": round(metric, 4),
            "cv_mean": round(cv_scores.mean(), 4),
            "cv_std": round(cv_scores.std(), 4),
            "task_type": task_type,
        }

    # ----------------------------------------------------------------
    # RUN ALL
    # ----------------------------------------------------------------
    def run_grid_search(self) -> Dict[str, Any]:
        """Run complete hyperparameter exploration across all models."""
        logger.info("Generating training data...")
        X, targets, feature_info = self._get_data(num_samples=2000)
        logger.info(f"Feature matrix: {X.shape}")

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
            rf_result = self._rf_grid(X, y_series, task_type, rf_grid)
            results[f"{target_name}_rf"] = rf_result
            logger.info(f"    Best RF params : {rf_result['best_params']}")
            logger.info(f"    Best RF score  : {rf_result['best_cv_score']}")

            # XGBoost
            logger.info("  XGBoost...")
            xgb_result = self._train_xgboost(X, y_series, task_type)
            results[f"{target_name}_xgboost"] = xgb_result
            if xgb_result.get("status") == "success":
                logger.info(f"    Test score : {xgb_result['test_score']}")
                logger.info(f"    CV score   : {xgb_result['cv_mean']}")

            # MLP
            logger.info("  MLP...")
            mlp_result = self._train_mlp(X, y_series, task_type)
            results[f"{target_name}_mlp"] = mlp_result
            if mlp_result.get("status") == "success":
                logger.info(f"    Test score : {mlp_result['test_score']}")
                logger.info(f"    CV score   : {mlp_result['cv_mean']}")

        # Save results
        report = {
            "results": results,
            "feature_count": X.shape[1],
            "sample_count": len(X),
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
