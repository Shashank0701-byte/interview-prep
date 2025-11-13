"""
Smart Study Buddy - Model Evaluation Script
Evaluates trained models and generates performance reports.
"""

import json
import pandas as pd
import numpy as np
from sklearn.metrics import (
    classification_report, confusion_matrix, accuracy_score,
    precision_recall_fscore_support, roc_auc_score, roc_curve,
    mean_squared_error, mean_absolute_error, r2_score
)
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import os
import sys

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class ModelEvaluator:
    """Evaluates trained Smart Study Buddy models"""
    
    def __init__(self, models_dir: str = "../models/trained/"):
        """Initialize the evaluator"""
        self.models_dir = models_dir
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.evaluation_results = {}
        
    def load_models(self) -> None:
        """Load all trained models and preprocessors"""
        print("Loading trained models...")
        
        # Load models
        model_files = [f for f in os.listdir(self.models_dir) if f.endswith('_model.pkl')]
        for model_file in model_files:
            model_name = model_file.replace('_model.pkl', '')
            self.models[model_name] = joblib.load(os.path.join(self.models_dir, model_file))
            print(f"Loaded {model_name} model")
        
        # Load scalers
        scaler_files = [f for f in os.listdir(self.models_dir) if f.endswith('_scaler.pkl')]
        for scaler_file in scaler_files:
            scaler_name = scaler_file.replace('_scaler.pkl', '')
            self.scalers[scaler_name] = joblib.load(os.path.join(self.models_dir, scaler_file))
        
        # Load encoders
        encoder_files = [f for f in os.listdir(self.models_dir) if f.endswith('_encoder.pkl')]
        for encoder_file in encoder_files:
            encoder_name = encoder_file.replace('_encoder.pkl', '')
            self.encoders[encoder_name] = joblib.load(os.path.join(self.models_dir, encoder_file))
        
        print(f"Loaded {len(self.models)} models, {len(self.scalers)} scalers, {len(self.encoders)} encoders")
    
    def load_test_data(self, data_path: str) -> pd.DataFrame:
        """Load test data for evaluation"""
        if data_path.endswith('.csv'):
            return pd.read_csv(data_path)
        elif data_path.endswith('.json'):
            return pd.read_json(data_path)
        else:
            raise ValueError("Unsupported data format. Use CSV or JSON.")
    
    def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Prepare features for evaluation (same as training)"""
        feature_columns = [
            'session_hour', 'hour_sin', 'hour_cos', 'day_sin', 'day_cos',
            'accuracy', 'duration_minutes', 'questions_attempted', 'completion_rate',
            'streak_days', 'days_since_last_session', 'questions_per_hour',
            'session_number', 'accuracy_completion_ratio', 'session_efficiency',
            'streak_momentum', 'user_avg_accuracy', 'user_accuracy_std',
            'user_avg_duration', 'user_avg_qph'
        ]
        
        # Create missing features if they don't exist
        if 'hour_sin' not in df.columns:
            df['hour_sin'] = np.sin(2 * np.pi * df['session_hour'] / 24)
            df['hour_cos'] = np.cos(2 * np.pi * df['session_hour'] / 24)
        
        if 'day_sin' not in df.columns:
            df['day_sin'] = np.sin(2 * np.pi * df.get('day_of_week', 0) / 7)
            df['day_cos'] = np.cos(2 * np.pi * df.get('day_of_week', 0) / 7)
        
        # Create derived features
        if 'accuracy_completion_ratio' not in df.columns:
            df['accuracy_completion_ratio'] = df['accuracy'] / (df['completion_rate'] + 0.01)
        
        if 'session_efficiency' not in df.columns:
            df['session_efficiency'] = df['questions_attempted'] / df['duration_minutes']
        
        if 'streak_momentum' not in df.columns:
            streak_days = df.get('streak_days', 0)
            days_since = df.get('days_since_last_session', 1)
            df['streak_momentum'] = streak_days / (days_since + 1)
        
        # User-level features (simplified for evaluation)
        if 'user_avg_accuracy' not in df.columns:
            user_stats = df.groupby('user_id').agg({
                'accuracy': ['mean', 'std'],
                'duration_minutes': 'mean',
                'questions_per_hour': 'mean'
            })
            user_stats.columns = ['user_avg_accuracy', 'user_accuracy_std', 
                                 'user_avg_duration', 'user_avg_qph']
            user_stats = user_stats.fillna(0)
            df = df.merge(user_stats, left_on='user_id', right_index=True, how='left')
        
        # Return only the feature columns that exist
        available_features = [col for col in feature_columns if col in df.columns]
        return df[available_features]
    
    def evaluate_classification_model(self, model_name: str, X_test: pd.DataFrame, 
                                    y_test: pd.Series) -> Dict:
        """Evaluate a classification model"""
        print(f"Evaluating {model_name} classification model...")
        
        model = self.models[model_name]
        scaler = self.scalers.get(model_name)
        encoder = self.encoders.get(model_name)
        
        # Scale features
        if scaler:
            X_test_scaled = scaler.transform(X_test)
        else:
            X_test_scaled = X_test
        
        # Encode target if needed
        if encoder:
            y_test_encoded = encoder.transform(y_test)
            class_names = encoder.classes_
        else:
            y_test_encoded = y_test
            class_names = sorted(y_test.unique())
        
        # Make predictions
        y_pred = model.predict(X_test_scaled)
        y_pred_proba = model.predict_proba(X_test_scaled)
        
        # Calculate metrics
        accuracy = accuracy_score(y_test_encoded, y_pred)
        precision, recall, f1, support = precision_recall_fscore_support(
            y_test_encoded, y_pred, average='weighted'
        )
        
        # Classification report
        class_report = classification_report(
            y_test_encoded, y_pred, 
            target_names=class_names,
            output_dict=True
        )
        
        # Confusion matrix
        cm = confusion_matrix(y_test_encoded, y_pred)
        
        # ROC AUC for multiclass (if applicable)
        try:
            if len(class_names) == 2:
                roc_auc = roc_auc_score(y_test_encoded, y_pred_proba[:, 1])
            else:
                roc_auc = roc_auc_score(y_test_encoded, y_pred_proba, multi_class='ovr')
        except:
            roc_auc = None
        
        # Feature importance
        if hasattr(model, 'feature_importances_'):
            feature_importance = dict(zip(X_test.columns, model.feature_importances_))
            top_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:10]
        else:
            feature_importance = {}
            top_features = []
        
        results = {
            'model_type': 'classification',
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'roc_auc': roc_auc,
            'classification_report': class_report,
            'confusion_matrix': cm.tolist(),
            'class_names': class_names.tolist() if hasattr(class_names, 'tolist') else list(class_names),
            'feature_importance': feature_importance,
            'top_features': top_features,
            'predictions': {
                'y_true': y_test_encoded.tolist() if hasattr(y_test_encoded, 'tolist') else list(y_test_encoded),
                'y_pred': y_pred.tolist(),
                'y_pred_proba': y_pred_proba.tolist()
            }
        }
        
        print(f"{model_name} - Accuracy: {accuracy:.3f}, F1: {f1:.3f}")
        
        return results
    
    def evaluate_regression_model(self, model_name: str, X_test: pd.DataFrame, 
                                y_test: pd.Series) -> Dict:
        """Evaluate a regression model"""
        print(f"Evaluating {model_name} regression model...")
        
        model = self.models[model_name]
        scaler = self.scalers.get(model_name)
        
        # Scale features
        if scaler:
            X_test_scaled = scaler.transform(X_test)
        else:
            X_test_scaled = X_test
        
        # Make predictions
        y_pred = model.predict(X_test_scaled)
        
        # Calculate metrics
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        # Calculate additional metrics
        mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100  # Mean Absolute Percentage Error
        
        # Residual analysis
        residuals = y_test - y_pred
        residual_std = np.std(residuals)
        
        # Feature importance
        if hasattr(model, 'feature_importances_'):
            feature_importance = dict(zip(X_test.columns, model.feature_importances_))
            top_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:10]
        else:
            feature_importance = {}
            top_features = []
        
        results = {
            'model_type': 'regression',
            'r2_score': r2,
            'mse': mse,
            'rmse': rmse,
            'mae': mae,
            'mape': mape,
            'residual_std': residual_std,
            'feature_importance': feature_importance,
            'top_features': top_features,
            'predictions': {
                'y_true': y_test.tolist(),
                'y_pred': y_pred.tolist(),
                'residuals': residuals.tolist()
            }
        }
        
        print(f"{model_name} - R²: {r2:.3f}, RMSE: {rmse:.3f}")
        
        return results
    
    def evaluate_all_models(self, test_data_path: str) -> Dict:
        """Evaluate all loaded models"""
        print("Starting comprehensive model evaluation...")
        
        # Load test data
        test_data = self.load_test_data(test_data_path)
        print(f"Loaded test data: {len(test_data)} samples")
        
        # Prepare features
        X_test = self.prepare_features(test_data)
        
        results = {}
        
        # Evaluate optimal time model (classification)
        if 'optimal_time' in self.models and 'optimal_time_category' in test_data.columns:
            y_test = test_data['optimal_time_category']
            results['optimal_time'] = self.evaluate_classification_model('optimal_time', X_test, y_test)
        
        # Evaluate performance model (regression)
        if 'performance' in self.models and 'performance_score' in test_data.columns:
            y_test = test_data['performance_score']
            results['performance'] = self.evaluate_regression_model('performance', X_test, y_test)
        
        # Evaluate motivation model (classification)
        if 'motivation' in self.models and 'motivation_level' in test_data.columns:
            y_test = test_data['motivation_level']
            results['motivation'] = self.evaluate_classification_model('motivation', X_test, y_test)
        
        self.evaluation_results = results
        return results
    
    def generate_visualizations(self, output_dir: str = "../models/evaluation/") -> None:
        """Generate evaluation visualizations"""
        os.makedirs(output_dir, exist_ok=True)
        
        for model_name, results in self.evaluation_results.items():
            print(f"Generating visualizations for {model_name}...")
            
            if results['model_type'] == 'classification':
                self._plot_confusion_matrix(model_name, results, output_dir)
                self._plot_classification_metrics(model_name, results, output_dir)
                
            elif results['model_type'] == 'regression':
                self._plot_regression_results(model_name, results, output_dir)
                self._plot_residuals(model_name, results, output_dir)
            
            # Feature importance plot (for both types)
            if results['feature_importance']:
                self._plot_feature_importance(model_name, results, output_dir)
    
    def _plot_confusion_matrix(self, model_name: str, results: Dict, output_dir: str) -> None:
        """Plot confusion matrix"""
        plt.figure(figsize=(8, 6))
        
        cm = np.array(results['confusion_matrix'])
        class_names = results['class_names']
        
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=class_names, yticklabels=class_names)
        plt.title(f'{model_name.title()} Model - Confusion Matrix')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, f'{model_name}_confusion_matrix.png'), dpi=300)
        plt.close()
    
    def _plot_classification_metrics(self, model_name: str, results: Dict, output_dir: str) -> None:
        """Plot classification metrics by class"""
        class_report = results['classification_report']
        
        # Extract metrics for each class (excluding averages)
        classes = [k for k in class_report.keys() if k not in ['accuracy', 'macro avg', 'weighted avg']]
        
        metrics = ['precision', 'recall', 'f1-score']
        metric_values = {metric: [class_report[cls][metric] for cls in classes] for metric in metrics}
        
        plt.figure(figsize=(10, 6))
        
        x = np.arange(len(classes))
        width = 0.25
        
        for i, metric in enumerate(metrics):
            plt.bar(x + i * width, metric_values[metric], width, label=metric.title())
        
        plt.xlabel('Classes')
        plt.ylabel('Score')
        plt.title(f'{model_name.title()} Model - Classification Metrics by Class')
        plt.xticks(x + width, classes, rotation=45)
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, f'{model_name}_classification_metrics.png'), dpi=300)
        plt.close()
    
    def _plot_regression_results(self, model_name: str, results: Dict, output_dir: str) -> None:
        """Plot regression predictions vs actual"""
        y_true = results['predictions']['y_true']
        y_pred = results['predictions']['y_pred']
        
        plt.figure(figsize=(8, 8))
        
        plt.scatter(y_true, y_pred, alpha=0.6)
        
        # Perfect prediction line
        min_val = min(min(y_true), min(y_pred))
        max_val = max(max(y_true), max(y_pred))
        plt.plot([min_val, max_val], [min_val, max_val], 'r--', label='Perfect Prediction')
        
        plt.xlabel('True Values')
        plt.ylabel('Predicted Values')
        plt.title(f'{model_name.title()} Model - Predictions vs Actual')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        # Add R² score to plot
        r2 = results['r2_score']
        plt.text(0.05, 0.95, f'R² = {r2:.3f}', transform=plt.gca().transAxes, 
                bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))
        
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, f'{model_name}_predictions.png'), dpi=300)
        plt.close()
    
    def _plot_residuals(self, model_name: str, results: Dict, output_dir: str) -> None:
        """Plot residual analysis"""
        y_pred = results['predictions']['y_pred']
        residuals = results['predictions']['residuals']
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
        
        # Residuals vs Predicted
        ax1.scatter(y_pred, residuals, alpha=0.6)
        ax1.axhline(y=0, color='r', linestyle='--')
        ax1.set_xlabel('Predicted Values')
        ax1.set_ylabel('Residuals')
        ax1.set_title('Residuals vs Predicted')
        ax1.grid(True, alpha=0.3)
        
        # Residuals histogram
        ax2.hist(residuals, bins=30, alpha=0.7, edgecolor='black')
        ax2.set_xlabel('Residuals')
        ax2.set_ylabel('Frequency')
        ax2.set_title('Residuals Distribution')
        ax2.grid(True, alpha=0.3)
        
        plt.suptitle(f'{model_name.title()} Model - Residual Analysis')
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, f'{model_name}_residuals.png'), dpi=300)
        plt.close()
    
    def _plot_feature_importance(self, model_name: str, results: Dict, output_dir: str) -> None:
        """Plot feature importance"""
        top_features = results['top_features'][:10]  # Top 10 features
        
        if not top_features:
            return
        
        features, importances = zip(*top_features)
        
        plt.figure(figsize=(10, 6))
        
        bars = plt.barh(range(len(features)), importances)
        plt.yticks(range(len(features)), features)
        plt.xlabel('Importance')
        plt.title(f'{model_name.title()} Model - Feature Importance (Top 10)')
        plt.grid(True, alpha=0.3)
        
        # Color bars by importance
        colors = plt.cm.viridis(np.linspace(0, 1, len(bars)))
        for bar, color in zip(bars, colors):
            bar.set_color(color)
        
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, f'{model_name}_feature_importance.png'), dpi=300)
        plt.close()
    
    def generate_report(self, output_path: str = "../models/evaluation/evaluation_report.json") -> None:
        """Generate comprehensive evaluation report"""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        report = {
            'evaluation_timestamp': datetime.now().isoformat(),
            'models_evaluated': list(self.evaluation_results.keys()),
            'summary': {},
            'detailed_results': self.evaluation_results
        }
        
        # Generate summary
        for model_name, results in self.evaluation_results.items():
            if results['model_type'] == 'classification':
                report['summary'][model_name] = {
                    'type': 'classification',
                    'accuracy': results['accuracy'],
                    'f1_score': results['f1_score'],
                    'precision': results['precision'],
                    'recall': results['recall']
                }
            else:  # regression
                report['summary'][model_name] = {
                    'type': 'regression',
                    'r2_score': results['r2_score'],
                    'rmse': results['rmse'],
                    'mae': results['mae']
                }
        
        # Save report
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"Evaluation report saved to {output_path}")
        
        # Generate human-readable summary
        summary_path = output_path.replace('.json', '_summary.txt')
        self._generate_text_summary(report, summary_path)
    
    def _generate_text_summary(self, report: Dict, output_path: str) -> None:
        """Generate human-readable evaluation summary"""
        with open(output_path, 'w') as f:
            f.write("SMART STUDY BUDDY - MODEL EVALUATION REPORT\n")
            f.write("=" * 50 + "\n\n")
            
            f.write(f"Evaluation Date: {report['evaluation_timestamp']}\n")
            f.write(f"Models Evaluated: {len(report['models_evaluated'])}\n\n")
            
            for model_name, summary in report['summary'].items():
                f.write(f"{model_name.upper()} MODEL:\n")
                f.write("-" * 30 + "\n")
                
                if summary['type'] == 'classification':
                    f.write(f"  Type: Classification\n")
                    f.write(f"  Accuracy: {summary['accuracy']:.3f}\n")
                    f.write(f"  F1 Score: {summary['f1_score']:.3f}\n")
                    f.write(f"  Precision: {summary['precision']:.3f}\n")
                    f.write(f"  Recall: {summary['recall']:.3f}\n")
                else:
                    f.write(f"  Type: Regression\n")
                    f.write(f"  R² Score: {summary['r2_score']:.3f}\n")
                    f.write(f"  RMSE: {summary['rmse']:.3f}\n")
                    f.write(f"  MAE: {summary['mae']:.3f}\n")
                
                f.write("\n")
            
            # Performance interpretation
            f.write("PERFORMANCE INTERPRETATION:\n")
            f.write("-" * 30 + "\n")
            
            for model_name, summary in report['summary'].items():
                if summary['type'] == 'classification':
                    acc = summary['accuracy']
                    if acc >= 0.9:
                        performance = "Excellent"
                    elif acc >= 0.8:
                        performance = "Good"
                    elif acc >= 0.7:
                        performance = "Fair"
                    else:
                        performance = "Needs Improvement"
                else:
                    r2 = summary['r2_score']
                    if r2 >= 0.9:
                        performance = "Excellent"
                    elif r2 >= 0.7:
                        performance = "Good"
                    elif r2 >= 0.5:
                        performance = "Fair"
                    else:
                        performance = "Needs Improvement"
                
                f.write(f"  {model_name}: {performance}\n")
        
        print(f"Text summary saved to {output_path}")

def main():
    """Main evaluation function"""
    evaluator = ModelEvaluator()
    
    # Load trained models
    evaluator.load_models()
    
    # Evaluate models (using processed training data as test data for demo)
    test_data_path = "../data/processed/training_data.csv"
    
    if not os.path.exists(test_data_path):
        print(f"Test data not found at {test_data_path}")
        print("Please run data_preprocessing.py first to generate test data")
        return
    
    # Evaluate all models
    results = evaluator.evaluate_all_models(test_data_path)
    
    # Generate visualizations
    evaluator.generate_visualizations()
    
    # Generate comprehensive report
    evaluator.generate_report()
    
    print("\nModel evaluation complete!")
    print("Check the ../models/evaluation/ directory for detailed results and visualizations")

if __name__ == "__main__":
    main()
