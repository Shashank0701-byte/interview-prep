"""
Smart Study Buddy - Behavior Model Training Script
Trains machine learning models to predict user behavior patterns.
"""

import json
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, mean_squared_error, r2_score
import joblib
import datetime
from typing import Dict, List, Tuple, Any
import os
import sys

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.behavior_analyzer import BehaviorAnalyzer, StudyTimePreference, MotivationPattern

class BehaviorModelTrainer:
    """Trains ML models for behavior prediction"""
    
    def __init__(self, config_path: str = None):
        """Initialize the trainer"""
        self.config = self._load_config(config_path)
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        
    def _load_config(self, config_path: str) -> Dict:
        """Load training configuration"""
        if config_path is None:
            config_path = "../config/study_buddy_config.json"
        
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {"training": {"test_size": 0.2, "random_state": 42}}
    
    def generate_synthetic_training_data(self, num_samples: int = 1000) -> pd.DataFrame:
        """
        Generate synthetic training data for behavior patterns
        In production, this would use real user data
        """
        np.random.seed(42)
        
        data = []
        
        for i in range(num_samples):
            # Generate user session data
            user_id = f"user_{i % 200}"  # 200 unique users
            
            # Time preferences (simulate different user types)
            user_type = np.random.choice(['morning', 'afternoon', 'evening', 'night'], 
                                       p=[0.3, 0.25, 0.35, 0.1])
            
            # Generate sessions based on user type
            if user_type == 'morning':
                session_hours = np.random.choice(range(6, 12), size=np.random.randint(3, 8))
                base_performance = 0.8
            elif user_type == 'afternoon':
                session_hours = np.random.choice(range(12, 17), size=np.random.randint(2, 6))
                base_performance = 0.7
            elif user_type == 'evening':
                session_hours = np.random.choice(range(17, 22), size=np.random.randint(3, 7))
                base_performance = 0.75
            else:  # night
                session_hours = np.random.choice(range(22, 24), size=np.random.randint(2, 5))
                base_performance = 0.85
            
            for hour in session_hours:
                # Add noise to performance based on time preference
                time_performance_multiplier = 1.0
                if user_type == 'morning' and 6 <= hour <= 10:
                    time_performance_multiplier = 1.2
                elif user_type == 'afternoon' and 13 <= hour <= 16:
                    time_performance_multiplier = 1.15
                elif user_type == 'evening' and 18 <= hour <= 21:
                    time_performance_multiplier = 1.1
                elif user_type == 'night' and hour >= 22:
                    time_performance_multiplier = 1.25
                else:
                    time_performance_multiplier = 0.9  # Non-optimal time
                
                # Generate session metrics
                accuracy = min(1.0, max(0.0, 
                    base_performance * time_performance_multiplier + np.random.normal(0, 0.1)))
                
                duration = max(5, np.random.normal(30, 10))  # Minutes
                questions_attempted = max(1, int(np.random.normal(15, 5)))
                completion_rate = min(1.0, max(0.3, accuracy + np.random.normal(0, 0.05)))
                
                # Motivation indicators
                streak_days = max(0, int(np.random.exponential(5)))
                days_since_last = max(0, int(np.random.exponential(2)))
                
                # Learning velocity indicators
                questions_per_hour = questions_attempted / (duration / 60)
                
                data.append({
                    'user_id': user_id,
                    'session_hour': hour,
                    'accuracy': accuracy,
                    'duration_minutes': duration,
                    'questions_attempted': questions_attempted,
                    'completion_rate': completion_rate,
                    'streak_days': streak_days,
                    'days_since_last_session': days_since_last,
                    'questions_per_hour': questions_per_hour,
                    'day_of_week': np.random.randint(0, 7),
                    'session_number': np.random.randint(1, 50),
                    
                    # Target variables
                    'optimal_time_category': user_type,
                    'performance_score': accuracy * 0.6 + completion_rate * 0.4,
                    'motivation_level': self._calculate_motivation_level(
                        accuracy, streak_days, days_since_last, completion_rate),
                    'learning_velocity': self._calculate_learning_velocity(
                        questions_per_hour, accuracy)
                })
        
        return pd.DataFrame(data)
    
    def _calculate_motivation_level(self, accuracy: float, streak: int, 
                                  days_since: int, completion: float) -> str:
        """Calculate motivation level for training data"""
        score = accuracy * 0.4 + (min(streak, 10) / 10) * 0.3 + completion * 0.3
        score -= (days_since / 7) * 0.2  # Penalize long breaks
        
        if score >= 0.8:
            return 'very_high'
        elif score >= 0.6:
            return 'high'
        elif score >= 0.4:
            return 'moderate'
        elif score >= 0.2:
            return 'low'
        else:
            return 'very_low'
    
    def _calculate_learning_velocity(self, qph: float, accuracy: float) -> str:
        """Calculate learning velocity for training data"""
        if qph > 15 and accuracy > 0.75:
            return 'fast'
        elif qph < 8 or accuracy < 0.5:
            return 'slow'
        else:
            return 'moderate'
    
    def prepare_features(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict]:
        """
        Prepare features for training
        
        Returns:
            Tuple of (feature_dataframe, feature_info)
        """
        feature_df = df.copy()
        feature_info = {}
        
        # Time-based features
        feature_df['hour_sin'] = np.sin(2 * np.pi * feature_df['session_hour'] / 24)
        feature_df['hour_cos'] = np.cos(2 * np.pi * feature_df['session_hour'] / 24)
        feature_df['day_sin'] = np.sin(2 * np.pi * feature_df['day_of_week'] / 7)
        feature_df['day_cos'] = np.cos(2 * np.pi * feature_df['day_of_week'] / 7)
        
        # Derived features
        feature_df['accuracy_completion_ratio'] = feature_df['accuracy'] / (feature_df['completion_rate'] + 0.01)
        feature_df['session_efficiency'] = feature_df['questions_attempted'] / feature_df['duration_minutes']
        feature_df['streak_momentum'] = feature_df['streak_days'] / (feature_df['days_since_last_session'] + 1)
        
        # User-level aggregations (simplified - in practice, calculate from historical data)
        user_stats = feature_df.groupby('user_id').agg({
            'accuracy': ['mean', 'std'],
            'duration_minutes': 'mean',
            'questions_per_hour': 'mean'
        }).round(3)
        
        user_stats.columns = ['user_avg_accuracy', 'user_accuracy_std', 
                             'user_avg_duration', 'user_avg_qph']
        user_stats = user_stats.fillna(0)
        
        feature_df = feature_df.merge(user_stats, left_on='user_id', right_index=True, how='left')
        
        # Select features for training
        feature_columns = [
            'session_hour', 'hour_sin', 'hour_cos', 'day_sin', 'day_cos',
            'accuracy', 'duration_minutes', 'questions_attempted', 'completion_rate',
            'streak_days', 'days_since_last_session', 'questions_per_hour',
            'session_number', 'accuracy_completion_ratio', 'session_efficiency',
            'streak_momentum', 'user_avg_accuracy', 'user_accuracy_std',
            'user_avg_duration', 'user_avg_qph'
        ]
        
        feature_info = {
            'feature_columns': feature_columns,
            'categorical_features': [],
            'numerical_features': feature_columns
        }
        
        return feature_df[feature_columns], feature_info
    
    def train_optimal_time_model(self, df: pd.DataFrame) -> Dict:
        """Train model to predict optimal study time"""
        print("Training optimal study time prediction model...")
        
        X, feature_info = self.prepare_features(df)
        y = df['optimal_time_category']
        
        # Encode target variable
        le = LabelEncoder()
        y_encoded = le.fit_transform(y)
        self.encoders['optimal_time'] = le
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
        )
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        self.scalers['optimal_time'] = scaler
        
        # Train model
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            class_weight='balanced'
        )
        
        model.fit(X_train_scaled, y_train)
        self.models['optimal_time'] = model
        
        # Evaluate
        train_score = model.score(X_train_scaled, y_train)
        test_score = model.score(X_test_scaled, y_test)
        
        # Cross-validation
        cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5)
        
        # Feature importance
        feature_importance = dict(zip(feature_info['feature_columns'], model.feature_importances_))
        
        results = {
            'model_type': 'optimal_time_prediction',
            'train_accuracy': train_score,
            'test_accuracy': test_score,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'feature_importance': feature_importance,
            'classes': le.classes_.tolist()
        }
        
        print(f"Optimal Time Model - Test Accuracy: {test_score:.3f}")
        print(f"Cross-validation: {cv_scores.mean():.3f} (+/- {cv_scores.std() * 2:.3f})")
        
        return results
    
    def train_performance_model(self, df: pd.DataFrame) -> Dict:
        """Train model to predict performance score"""
        print("Training performance prediction model...")
        
        X, feature_info = self.prepare_features(df)
        y = df['performance_score']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        self.scalers['performance'] = scaler
        
        # Train model
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        
        model.fit(X_train_scaled, y_train)
        self.models['performance'] = model
        
        # Evaluate
        train_pred = model.predict(X_train_scaled)
        test_pred = model.predict(X_test_scaled)
        
        train_r2 = r2_score(y_train, train_pred)
        test_r2 = r2_score(y_test, test_pred)
        test_rmse = np.sqrt(mean_squared_error(y_test, test_pred))
        
        # Cross-validation
        cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='r2')
        
        # Feature importance
        feature_importance = dict(zip(feature_info['feature_columns'], model.feature_importances_))
        
        results = {
            'model_type': 'performance_prediction',
            'train_r2': train_r2,
            'test_r2': test_r2,
            'test_rmse': test_rmse,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'feature_importance': feature_importance
        }
        
        print(f"Performance Model - Test R²: {test_r2:.3f}, RMSE: {test_rmse:.3f}")
        print(f"Cross-validation R²: {cv_scores.mean():.3f} (+/- {cv_scores.std() * 2:.3f})")
        
        return results
    
    def train_motivation_model(self, df: pd.DataFrame) -> Dict:
        """Train model to predict motivation level"""
        print("Training motivation prediction model...")
        
        X, feature_info = self.prepare_features(df)
        y = df['motivation_level']
        
        # Encode target variable
        le = LabelEncoder()
        y_encoded = le.fit_transform(y)
        self.encoders['motivation'] = le
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
        )
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        self.scalers['motivation'] = scaler
        
        # Train model
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=8,
            random_state=42,
            class_weight='balanced'
        )
        
        model.fit(X_train_scaled, y_train)
        self.models['motivation'] = model
        
        # Evaluate
        train_score = model.score(X_train_scaled, y_train)
        test_score = model.score(X_test_scaled, y_test)
        
        # Cross-validation
        cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5)
        
        # Feature importance
        feature_importance = dict(zip(feature_info['feature_columns'], model.feature_importances_))
        
        results = {
            'model_type': 'motivation_prediction',
            'train_accuracy': train_score,
            'test_accuracy': test_score,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'feature_importance': feature_importance,
            'classes': le.classes_.tolist()
        }
        
        print(f"Motivation Model - Test Accuracy: {test_score:.3f}")
        print(f"Cross-validation: {cv_scores.mean():.3f} (+/- {cv_scores.std() * 2:.3f})")
        
        return results
    
    def save_models(self, output_dir: str = "../models/trained/") -> None:
        """Save trained models and preprocessors"""
        os.makedirs(output_dir, exist_ok=True)
        
        # Save models
        for model_name, model in self.models.items():
            joblib.dump(model, os.path.join(output_dir, f"{model_name}_model.pkl"))
        
        # Save scalers
        for scaler_name, scaler in self.scalers.items():
            joblib.dump(scaler, os.path.join(output_dir, f"{scaler_name}_scaler.pkl"))
        
        # Save encoders
        for encoder_name, encoder in self.encoders.items():
            joblib.dump(encoder, os.path.join(output_dir, f"{encoder_name}_encoder.pkl"))
        
        print(f"Models saved to {output_dir}")
    
    def train_all_models(self, num_samples: int = 1000) -> Dict:
        """Train all behavior prediction models"""
        print("Starting Smart Study Buddy model training...")
        print(f"Generating {num_samples} synthetic training samples...")
        
        # Generate training data
        df = self.generate_synthetic_training_data(num_samples)
        print(f"Generated dataset shape: {df.shape}")
        
        # Train models
        results = {}
        
        results['optimal_time'] = self.train_optimal_time_model(df)
        results['performance'] = self.train_performance_model(df)
        results['motivation'] = self.train_motivation_model(df)
        
        # Save models
        self.save_models()
        
        # Save training results
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        results_file = f"../models/trained/training_results_{timestamp}.json"
        
        with open(results_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"Training complete! Results saved to {results_file}")
        
        return results

def main():
    """Main training function"""
    trainer = BehaviorModelTrainer()
    
    # Train all models
    results = trainer.train_all_models(num_samples=2000)
    
    # Print summary
    print("\n" + "="*50)
    print("TRAINING SUMMARY")
    print("="*50)
    
    for model_type, result in results.items():
        print(f"\n{model_type.upper()} MODEL:")
        if 'test_accuracy' in result:
            print(f"  Test Accuracy: {result['test_accuracy']:.3f}")
        if 'test_r2' in result:
            print(f"  Test R²: {result['test_r2']:.3f}")
        print(f"  CV Score: {result['cv_mean']:.3f} (+/- {result['cv_std'] * 2:.3f})")
        
        # Top 3 important features
        top_features = sorted(result['feature_importance'].items(), 
                            key=lambda x: x[1], reverse=True)[:3]
        print(f"  Top Features: {', '.join([f[0] for f in top_features])}")

if __name__ == "__main__":
    main()
