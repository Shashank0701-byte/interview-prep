"""
Smart Study Buddy - Enhanced Training Pipeline
Combines data preprocessing → ML model training → RAG indexing into a single orchestrated pipeline.

Run: python -m study_buddy.training.enhance_training_pipeline
"""

import json
import sys
import os
import logging
from pathlib import Path
from typing import Optional
from datetime import datetime

# Ensure the parent of study_buddy is on path (i.e., ai-training directory)
_study_buddy_parent = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if _study_buddy_parent not in sys.path:
    sys.path.insert(0, _study_buddy_parent)

from study_buddy.training.train_behavior_model import BehaviorModelTrainer
from study_buddy.training.train_rag_pipeline import RAGPipelineTrainer
from study_buddy.training.data_preprocessing import DataPreprocessor
from study_buddy.config import Config

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
)
logger = logging.getLogger(__name__)


class EnhancedTrainingPipeline:
    """
    End-to-end training pipeline that orchestrates:
      1. Data preprocessing & augmentation
      2. ML behaviour model training (optimal time, performance, motivation)
      3. Hyperparameter tuning (delegated)
      4. RAG pipeline training (embeddings + vector index + verification)
    """

    def __init__(self, config: Optional[Config] = None):
        self.config = config or Config()
        self.results_dir = Path(__file__).parent.parent / "data" / "processed"
        self.results_dir.mkdir(parents=True, exist_ok=True)
        self.timeline = {}

    # ----------------------------------------------------------------
    # STEP 1: DATA PREPROCESSING
    # ----------------------------------------------------------------
    def run_data_preprocessing(self) -> dict:
        """Prepare and validate all training data sources."""
        logger.info("=" * 50)
        logger.info("STEP 1/4: Data Preprocessing")
        logger.info("=" * 50)

        t0 = datetime.now()
        try:
            preprocessor = DataPreprocessor()
            # Collect all .txt/.json, chunk, save enhanced training data
            rag_trainer = RAGPipelineTrainer(self.config)
            docs = rag_trainer.collect_all_documents()
            chunks = rag_trainer.chunk_documents(docs, chunk_size=1000, overlap=200)

            # Save preprocessed data
            preprocessed_path = self.results_dir / "preprocessed_training_data.json"
            with open(preprocessed_path, "w", encoding="utf-8") as f:
                json.dump(chunks, f, indent=2, ensure_ascii=False)

            elapsed = (datetime.now() - t0).total_seconds()
            self.timeline["data_preprocessing"] = elapsed
            logger.info(f"✓ Preprocessed {len(chunks)} chunks from {len(docs)} documents ({elapsed:.1f}s)")
            return {"status": "success", "documents": len(docs), "chunks": len(chunks)}
        except Exception as e:
            logger.error(f"✗ Data preprocessing failed: {e}")
            return {"status": "failed", "error": str(e)}

    # ----------------------------------------------------------------
    # STEP 2: ML BEHAVIOUR MODEL TRAINING
    # ----------------------------------------------------------------
    def run_behavior_model_training(self) -> dict:
        """Train all ML behaviour prediction models."""
        logger.info("=" * 50)
        logger.info("STEP 2/4: Behaviour Model Training")
        logger.info("=" * 50)

        t0 = datetime.now()
        try:
            trainer = BehaviorModelTrainer()
            results = trainer.train_all_models(num_samples=2000)

            elapsed = (datetime.now() - t0).total_seconds()
            self.timeline["behavior_model_training"] = elapsed

            summary = {}
            for model_name, metrics in results.items():
                acc = metrics.get("test_accuracy") or metrics.get("test_r2", 0)
                summary[model_name] = {
                    "metric": round(acc, 4),
                    "cv_mean": round(metrics.get("cv_mean", 0), 4),
                }
                logger.info(f"  {model_name:20s}  score={acc:.4f}  cv={metrics.get('cv_mean', 0):.4f}")

            logger.info(f"✓ Behaviour models trained ({elapsed:.1f}s)")
            return {"status": "success", "models": summary}
        except Exception as e:
            logger.error(f"✗ Behaviour model training failed: {e}")
            return {"status": "failed", "error": str(e)}

    # ----------------------------------------------------------------
    # STEP 3: HYPERPARAMETER TUNING (lighweight)
    # ----------------------------------------------------------------
    def run_hyperparameter_tuning(self) -> dict:
        """Run hyperparameter tuning on the behaviour models."""
        logger.info("=" * 50)
        logger.info("STEP 3/4: Hyperparameter Tuning")
        logger.info("=" * 50)

        t0 = datetime.now()
        try:
            # We import and run the hyperparameter tuning module
            from study_buddy.training.hyperparameter_tuning import HyperparameterTuner
            tuner = HyperparameterTuner()
            tuning_results = tuner.run_grid_search()
            elapsed = (datetime.now() - t0).total_seconds()
            self.timeline["hyperparameter_tuning"] = elapsed
            logger.info(f"✓ Hyperparameter tuning complete ({elapsed:.1f}s)")
            return {"status": "success", "results": tuning_results}
        except ImportError:
            logger.warning("hyperparameter_tuning module not available — skipping")
            return {"status": "skipped"}
        except Exception as e:
            logger.error(f"✗ Hyperparameter tuning failed: {e}")
            return {"status": "failed", "error": str(e)}

    # ----------------------------------------------------------------
    # STEP 4: RAG PIPELINE TRAINING
    # ----------------------------------------------------------------
    def run_rag_pipeline_training(self) -> dict:
        """Build the RAG vector index and verify retrieval quality."""
        logger.info("=" * 50)
        logger.info("STEP 4/4: RAG Pipeline Training")
        logger.info("=" * 50)

        t0 = datetime.now()
        try:
            rag_trainer = RAGPipelineTrainer(self.config)
            result = rag_trainer.run_full_pipeline(
                chunk_size=1000, overlap=200, verify=True
            )
            elapsed = (datetime.now() - t0).total_seconds()
            self.timeline["rag_pipeline_training"] = elapsed
            logger.info(f"✓ RAG pipeline trained ({elapsed:.1f}s)")
            return result
        except Exception as e:
            logger.error(f"✗ RAG pipeline training failed: {e}")
            return {"status": "failed", "error": str(e)}

    # ----------------------------------------------------------------
    # FULL PIPELINE ORCHESTRATION
    # ----------------------------------------------------------------
    def run_full_pipeline(self, skip_tuning: bool = False) -> dict:
        """Execute all 4 stages of the enhanced training pipeline."""
        logger.info("\n" + "=" * 60)
        logger.info("ENHANCED TRAINING PIPELINE — START")
        logger.info("=" * 60)

        steps = [
            self.run_data_preprocessing,
            self.run_behavior_model_training,
            self.run_hyperparameter_tuning,
            self.run_rag_pipeline_training,
        ]

        pipeline_results = {}
        for i, step_fn in enumerate(steps, 1):
            if skip_tuning and "hyperparameter" in step_fn.__name__:
                logger.info(f"Step {i}/4: Skipping hyperparameter tuning (skip_tuning=True)")
                pipeline_results["hyperparameter_tuning"] = {"status": "skipped"}
                continue
            pipeline_results[step_fn.__name__] = step_fn()
            if pipeline_results[step_fn.__name__].get("status") == "failed":
                logger.error(f"Pipeline aborting at step {i} due to failure.")
                break

        # Build final report
        report = {
            "pipeline_status": "completed",
            "steps": {k.replace("run_", ""): v for k, v in pipeline_results.items()},
            "timeline_seconds": self.timeline,
            "total_duration_seconds": sum(self.timeline.values()),
            "completed_at": datetime.now().isoformat(),
        }

        report_path = self.results_dir / "enhanced_pipeline_report.json"
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        logger.info("\n" + "=" * 60)
        logger.info("ENHANCED TRAINING PIPELINE — COMPLETE")
        logger.info(f"  Total duration : {report['total_duration_seconds']:.1f}s")
        logger.info(f"  Report         : {report_path}")
        logger.info("=" * 60)

        return report


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Enhanced Training Pipeline")
    parser.add_argument("--skip-tuning", action="store_true", help="Skip hyperparameter tuning step")
    args = parser.parse_args()

    pipeline = EnhancedTrainingPipeline()
    pipeline.run_full_pipeline(skip_tuning=args.skip_tuning)


if __name__ == "__main__":
    main()
