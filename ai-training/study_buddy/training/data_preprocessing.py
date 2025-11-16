"""
Smart Study Buddy - Data Preprocessing Pipeline
Processes raw user data for training behavior prediction models.
"""

import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import os
import sys

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class DataPreprocessor:
    """Preprocesses raw user data for model training"""
    
    def __init__(self, config_path: str = None):
        """Initialize the preprocessor"""
        self.config = self._load_config(config_path)
        
    def _load_config(self, config_path: str) -> Dict:
        """Load preprocessing configuration"""
        if config_path is None:
            config_path = "../config/study_buddy_config.json"
        
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {
                "data_processing": {
                    "min_sessions_per_user": 3,
                    "max_session_duration_hours": 4,
                    "outlier_threshold_std": 3
                }
            }
    
    def load_raw_user_data(self, data_source: str) -> pd.DataFrame:
        """
        Load raw user data from various sources
        
        Args:
            data_source: Path to data file or database connection string
        
        Returns:
            DataFrame with raw user session data
        """
        # In production, this would connect to your actual database
        # For now, we'll create a sample dataset structure
        
        if data_source.endswith('.json'):
            with open(data_source, 'r') as f:
                data = json.load(f)
            return pd.DataFrame(data)
        elif data_source.endswith('.csv'):
            return pd.read_csv(data_source)
        else:
            # Generate sample data for demonstration
            return self._generate_sample_raw_data()
    
    def _generate_sample_raw_data(self) -> pd.DataFrame:
        """Generate sample raw data that mimics real user sessions"""
        np.random.seed(42)
        
        # Simulate 50 users with varying patterns
        users = [f"user_{i:03d}" for i in range(50)]
        sessions = []
        
        for user_id in users:
            # Each user has different characteristics
            user_seed = hash(user_id) % 1000
            np.random.seed(user_seed)
            
            # User characteristics
            preferred_times = np.random.choice(['morning', 'afternoon', 'evening', 'night'])
            consistency_level = np.random.uniform(0.3, 0.9)  # How consistent the user is
            skill_level = np.random.uniform(0.4, 0.9)  # Base skill level
            motivation_trend = np.random.choice(['increasing', 'stable', 'decreasing'])
            
            # Generate sessions over 60 days
            start_date = datetime.now() - timedelta(days=60)
            
            for day in range(60):
                current_date = start_date + timedelta(days=day)
                
                # Probability of having a session (based on consistency)
                if np.random.random() < consistency_level:
                    # Determine session time based on preference
                    if preferred_times == 'morning':
                        hour = np.random.choice(range(7, 12), p=[0.1, 0.2, 0.3, 0.25, 0.15])
                    elif preferred_times == 'afternoon':
                        hour = np.random.choice(range(13, 17), p=[0.2, 0.3, 0.3, 0.2])
                    elif preferred_times == 'evening':
                        hour = np.random.choice(range(18, 22), p=[0.15, 0.25, 0.35, 0.25])
                    else:  # night
                        hour = np.random.choice(range(22, 24), p=[0.6, 0.4])
                    
                    session_start = current_date.replace(hour=hour, minute=np.random.randint(0, 60))
                    
                    # Session duration (influenced by time preference and motivation)
                    base_duration = 30  # minutes
                    if preferred_times in ['morning', 'night']:
                        base_duration = 45  # These users tend to have longer sessions
                    
                    duration = max(5, np.random.normal(base_duration, 15))
                    
                    # Performance metrics (influenced by time preference and skill)
                    time_multiplier = 1.0
                    if (preferred_times == 'morning' and 7 <= hour <= 11) or \
                       (preferred_times == 'afternoon' and 13 <= hour <= 16) or \
                       (preferred_times == 'evening' and 18 <= hour <= 21) or \
                       (preferred_times == 'night' and hour >= 22):
                        time_multiplier = 1.2  # Optimal time bonus
                    else:
                        time_multiplier = 0.85  # Non-optimal time penalty
                    
                    # Apply motivation trend
                    day_factor = day / 60  # Progress through 60 days
                    if motivation_trend == 'increasing':
                        motivation_multiplier = 0.8 + (0.4 * day_factor)
                    elif motivation_trend == 'decreasing':
                        motivation_multiplier = 1.2 - (0.4 * day_factor)
                    else:  # stable
                        motivation_multiplier = 1.0 + np.random.normal(0, 0.1)
                    
                    # Calculate session metrics
                    base_accuracy = skill_level * time_multiplier * motivation_multiplier
                    accuracy = max(0.0, min(1.0, base_accuracy + np.random.normal(0, 0.1)))
                    
                    questions_attempted = max(1, int(np.random.normal(duration / 3, 5)))
                    questions_correct = int(questions_attempted * accuracy)
                    
                    completion_rate = min(1.0, accuracy + np.random.normal(0, 0.05))
                    completion_rate = max(0.3, completion_rate)
                    
                    # Topics (simulate different areas of study)
                    topics = ['arrays', 'strings', 'trees', 'graphs', 'dynamic_programming', 
                             'sorting', 'searching', 'recursion', 'backtracking', 'greedy']
                    session_topics = np.random.choice(topics, size=np.random.randint(1, 4), replace=False)
                    
                    # Difficulty progression
                    if day < 20:
                        difficulty = np.random.choice(['easy', 'medium'], p=[0.7, 0.3])
                    elif day < 40:
                        difficulty = np.random.choice(['easy', 'medium', 'hard'], p=[0.3, 0.5, 0.2])
                    else:
                        difficulty = np.random.choice(['easy', 'medium', 'hard'], p=[0.2, 0.4, 0.4])
                    
                    sessions.append({
                        'user_id': user_id,
                        'session_id': f"{user_id}_session_{len(sessions)}",
                        'start_time': session_start.isoformat(),
                        'end_time': (session_start + timedelta(minutes=duration)).isoformat(),
                        'duration_minutes': duration,
                        'questions_attempted': questions_attempted,
                        'questions_correct': questions_correct,
                        'accuracy': accuracy,
                        'completion_rate': completion_rate,
                        'topics_covered': list(session_topics),
                        'difficulty_level': difficulty,
                        'session_type': np.random.choice(['practice', 'review', 'assessment'], p=[0.6, 0.3, 0.1]),
                        'day_of_week': current_date.weekday(),
                        'is_weekend': current_date.weekday() >= 5,
                        
                        # User characteristics (for analysis)
                        'user_preferred_time': preferred_times,
                        'user_consistency': consistency_level,
                        'user_skill_level': skill_level,
                        'user_motivation_trend': motivation_trend
                    })
        
        return pd.DataFrame(sessions)
    
    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean and validate the raw data
        
        Args:
            df: Raw data DataFrame
        
        Returns:
            Cleaned DataFrame
        """
        print(f"Starting data cleaning. Initial shape: {df.shape}")
        
        # Convert datetime columns
        df['start_time'] = pd.to_datetime(df['start_time'])
        df['end_time'] = pd.to_datetime(df['end_time'])
        
        # Remove invalid sessions
        initial_count = len(df)
        
        # Remove sessions with invalid durations
        df = df[df['duration_minutes'] > 0]
        df = df[df['duration_minutes'] <= self.config.get('data_processing', {}).get('max_session_duration_hours', 4) * 60]
        
        # Remove sessions with invalid accuracy
        df = df[(df['accuracy'] >= 0) & (df['accuracy'] <= 1)]
        
        # Remove sessions with invalid completion rates
        df = df[(df['completion_rate'] >= 0) & (df['completion_rate'] <= 1)]
        
        # Remove sessions with no questions
        df = df[df['questions_attempted'] > 0]
        
        # Ensure questions_correct <= questions_attempted
        df['questions_correct'] = np.minimum(df['questions_correct'], df['questions_attempted'])
        
        print(f"Removed {initial_count - len(df)} invalid sessions")
        
        # Remove outliers
        df = self._remove_outliers(df)
        
        # Filter users with minimum sessions
        min_sessions = self.config.get('data_processing', {}).get('min_sessions_per_user', 3)
        user_session_counts = df['user_id'].value_counts()
        valid_users = user_session_counts[user_session_counts >= min_sessions].index
        df = df[df['user_id'].isin(valid_users)]
        
        print(f"Final cleaned data shape: {df.shape}")
        print(f"Users with sufficient data: {len(valid_users)}")
        
        return df
    
    def _remove_outliers(self, df: pd.DataFrame) -> pd.DataFrame:
        """Remove statistical outliers from the data"""
        outlier_threshold = self.config.get('data_processing', {}).get('outlier_threshold_std', 3)
        
        numerical_columns = ['duration_minutes', 'questions_attempted', 'accuracy', 'completion_rate']
        
        for col in numerical_columns:
            if col in df.columns:
                mean = df[col].mean()
                std = df[col].std()
                
                # Remove values more than N standard deviations from mean
                lower_bound = mean - (outlier_threshold * std)
                upper_bound = mean + (outlier_threshold * std)
                
                before_count = len(df)
                df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]
                removed = before_count - len(df)
                
                if removed > 0:
                    print(f"Removed {removed} outliers from {col}")
        
        return df
    
    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create engineered features for model training
        
        Args:
            df: Cleaned data DataFrame
        
        Returns:
            DataFrame with engineered features
        """
        print("Engineering features...")
        
        # Time-based features
        df['session_hour'] = df['start_time'].dt.hour
        df['session_minute'] = df['start_time'].dt.minute
        df['day_of_week'] = df['start_time'].dt.dayofweek
        df['is_weekend'] = df['day_of_week'] >= 5
        df['month'] = df['start_time'].dt.month
        df['day_of_month'] = df['start_time'].dt.day
        
        # Cyclical encoding for time features
        df['hour_sin'] = np.sin(2 * np.pi * df['session_hour'] / 24)
        df['hour_cos'] = np.cos(2 * np.pi * df['session_hour'] / 24)
        df['day_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
        df['day_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7)
        df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
        df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
        
        # Performance features
        df['questions_per_minute'] = df['questions_attempted'] / df['duration_minutes']
        df['correct_per_minute'] = df['questions_correct'] / df['duration_minutes']
        df['efficiency_score'] = df['accuracy'] * df['completion_rate']
        df['speed_accuracy_ratio'] = df['questions_per_minute'] * df['accuracy']
        
        # Session sequence features
        df = df.sort_values(['user_id', 'start_time'])
        df['session_number'] = df.groupby('user_id').cumcount() + 1
        df['days_since_start'] = (df['start_time'] - df.groupby('user_id')['start_time'].transform('min')).dt.days
        
        # Time between sessions
        df['time_since_last_session'] = df.groupby('user_id')['start_time'].diff().dt.total_seconds() / 3600  # hours
        df['time_since_last_session'] = df['time_since_last_session'].fillna(0)
        
        # Rolling statistics (last 5 sessions)
        rolling_window = 5
        for col in ['accuracy', 'duration_minutes', 'questions_attempted', 'completion_rate']:
            df[f'{col}_rolling_mean'] = df.groupby('user_id')[col].rolling(window=rolling_window, min_periods=1).mean().reset_index(0, drop=True)
            df[f'{col}_rolling_std'] = df.groupby('user_id')[col].rolling(window=rolling_window, min_periods=1).std().reset_index(0, drop=True).fillna(0)
        
        # Trend features (improvement over time)
        df['accuracy_trend'] = df.groupby('user_id')['accuracy'].pct_change(periods=3).fillna(0)
        df['duration_trend'] = df.groupby('user_id')['duration_minutes'].pct_change(periods=3).fillna(0)
        
        # Streak features
        df['consecutive_sessions'] = df.groupby('user_id').apply(
            lambda x: self._calculate_consecutive_sessions(x)
        ).reset_index(level=0, drop=True)
        
        # Topic diversity
        df['num_topics_per_session'] = df['topics_covered'].apply(len)
        
        # User-level aggregated features
        user_stats = df.groupby('user_id').agg({
            'accuracy': ['mean', 'std', 'min', 'max'],
            'duration_minutes': ['mean', 'std'],
            'questions_attempted': ['mean', 'sum'],
            'session_number': 'max',
            'num_topics_per_session': 'mean'
        }).round(4)
        
        # Flatten column names
        user_stats.columns = ['_'.join(col).strip() for col in user_stats.columns]
        user_stats = user_stats.add_prefix('user_')
        user_stats = user_stats.fillna(0)
        
        # Merge user stats back to main dataframe
        df = df.merge(user_stats, left_on='user_id', right_index=True, how='left')
        
        print(f"Feature engineering complete. New shape: {df.shape}")
        
        return df
    
    def _calculate_consecutive_sessions(self, user_sessions: pd.DataFrame) -> pd.Series:
        """Calculate consecutive session streaks for a user"""
        sessions = user_sessions.sort_values('start_time')
        
        # Calculate days between sessions
        days_diff = sessions['start_time'].diff().dt.days.fillna(0)
        
        # A streak breaks if more than 2 days between sessions
        streak_breaks = (days_diff > 2).cumsum()
        
        # Count consecutive sessions in each streak
        consecutive_counts = sessions.groupby(streak_breaks).cumcount() + 1
        
        return consecutive_counts
    
    def create_target_variables(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create target variables for different prediction tasks
        
        Args:
            df: DataFrame with engineered features
        
        Returns:
            DataFrame with target variables
        """
        print("Creating target variables...")
        
        # 1. Optimal time prediction (based on performance at different hours)
        user_time_performance = df.groupby(['user_id', 'session_hour'])['efficiency_score'].mean().reset_index()
        user_optimal_time = user_time_performance.loc[user_time_performance.groupby('user_id')['efficiency_score'].idxmax()]
        
        # Map hours to time categories
        def hour_to_category(hour):
            if 6 <= hour < 12:
                return 'morning'
            elif 12 <= hour < 17:
                return 'afternoon'
            elif 17 <= hour < 22:
                return 'evening'
            else:
                return 'night'
        
        user_optimal_time['optimal_time_category'] = user_optimal_time['session_hour'].apply(hour_to_category)
        optimal_time_map = dict(zip(user_optimal_time['user_id'], user_optimal_time['optimal_time_category']))
        df['optimal_time_category'] = df['user_id'].map(optimal_time_map)
        
        # 2. Performance score (composite metric)
        df['performance_score'] = (
            df['accuracy'] * 0.4 + 
            df['completion_rate'] * 0.3 + 
            df['efficiency_score'] * 0.3
        )
        
        # 3. Motivation level (based on consistency and performance trends)
        df['motivation_level'] = df.apply(self._calculate_motivation_level, axis=1)
        
        # 4. Learning velocity category
        df['learning_velocity'] = df.apply(self._calculate_learning_velocity, axis=1)
        
        # 5. Difficulty readiness (can user handle harder questions)
        df['difficulty_readiness'] = df.apply(self._calculate_difficulty_readiness, axis=1)
        
        print("Target variables created successfully")
        
        return df
    
    def _calculate_motivation_level(self, row) -> str:
        """Calculate motivation level for a session"""
        # Factors: accuracy, consistency (time since last), completion rate, trend
        accuracy_score = row['accuracy']
        consistency_score = max(0, 1 - (row['time_since_last_session'] / 48))  # Penalize gaps > 48h
        completion_score = row['completion_rate']
        trend_score = max(0, row['accuracy_trend'] + 1) / 2  # Normalize trend to 0-1
        
        motivation_score = (
            accuracy_score * 0.3 + 
            consistency_score * 0.3 + 
            completion_score * 0.2 + 
            trend_score * 0.2
        )
        
        if motivation_score >= 0.8:
            return 'very_high'
        elif motivation_score >= 0.65:
            return 'high'
        elif motivation_score >= 0.45:
            return 'moderate'
        elif motivation_score >= 0.25:
            return 'low'
        else:
            return 'very_low'
    
    def _calculate_learning_velocity(self, row) -> str:
        """Calculate learning velocity category"""
        qpm = row['questions_per_minute']
        accuracy = row['accuracy']
        
        # Fast learner: high speed + high accuracy
        if qpm > 0.5 and accuracy > 0.75:
            return 'fast'
        # Slow learner: low speed or low accuracy
        elif qpm < 0.25 or accuracy < 0.5:
            return 'slow'
        else:
            return 'moderate'
    
    def _calculate_difficulty_readiness(self, row) -> bool:
        """Determine if user is ready for increased difficulty"""
        current_accuracy = row['accuracy']
        rolling_accuracy = row['accuracy_rolling_mean']
        trend = row['accuracy_trend']
        
        # Ready if: good current performance + stable/improving trend
        return (current_accuracy >= 0.75 and 
                rolling_accuracy >= 0.7 and 
                trend >= -0.05)
    
    def save_processed_data(self, df: pd.DataFrame, output_path: str) -> None:
        """Save processed data to file"""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Save as both CSV and JSON for flexibility
        df.to_csv(output_path.replace('.json', '.csv'), index=False)
        
        # Convert to JSON (handle datetime serialization)
        df_json = df.copy()
        for col in ['start_time', 'end_time']:
            if col in df_json.columns:
                df_json[col] = df_json[col].astype(str)
        
        df_json.to_json(output_path, orient='records', indent=2)
        
        print(f"Processed data saved to {output_path}")
        
        # Save data summary
        summary = {
            'total_sessions': len(df),
            'unique_users': df['user_id'].nunique(),
            'date_range': {
                'start': df['start_time'].min().isoformat(),
                'end': df['start_time'].max().isoformat()
            },
            'feature_columns': list(df.columns),
            'target_variables': ['optimal_time_category', 'performance_score', 
                               'motivation_level', 'learning_velocity', 'difficulty_readiness']
        }
        
        summary_path = output_path.replace('.json', '_summary.json')
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"Data summary saved to {summary_path}")

def main():
    """Main preprocessing pipeline"""
    preprocessor = DataPreprocessor()
    
    print("Starting data preprocessing pipeline...")
    
    # Load raw data (in production, this would be from your database)
    raw_data = preprocessor.load_raw_user_data("sample_data")
    
    # Clean data
    clean_data = preprocessor.clean_data(raw_data)
    
    # Engineer features
    featured_data = preprocessor.engineer_features(clean_data)
    
    # Create target variables
    final_data = preprocessor.create_target_variables(featured_data)
    
    # Save processed data
    output_path = "../data/processed/training_data.json"
    preprocessor.save_processed_data(final_data, output_path)
    
    print("Data preprocessing complete!")
    print(f"Final dataset: {len(final_data)} sessions from {final_data['user_id'].nunique()} users")

if __name__ == "__main__":
    main()
