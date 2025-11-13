"""
Smart Study Buddy - API Integration Layer
Connects the AI models with the backend API for real-time predictions and insights.
"""

import json
import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import os
import sys
import joblib
import logging

# Add parent directories to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from study_buddy.models.behavior_analyzer import BehaviorAnalyzer, BehaviorInsight
from study_buddy.models.reminder_scheduler import ReminderScheduler
from study_buddy.models.motivation_tracker import MotivationTracker, MotivationInsight
from study_buddy.models.performance_predictor import PerformancePredictor, PerformancePrediction

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StudyBuddyAPI:
    """Main API integration class for Smart Study Buddy"""
    
    def __init__(self, config_path: str = None, api_base_url: str = None):
        """
        Initialize the Study Buddy API integration
        
        Args:
            config_path: Path to configuration file
            api_base_url: Base URL for the backend API
        """
        self.config = self._load_config(config_path)
        self.api_base_url = api_base_url or "http://localhost:8000/api"
        
        # Initialize AI components
        self.behavior_analyzer = BehaviorAnalyzer(config_path)
        self.reminder_scheduler = ReminderScheduler(config_path)
        self.motivation_tracker = MotivationTracker(config_path)
        self.performance_predictor = PerformancePredictor(config_path)
        
        # Load trained models if available
        self.trained_models = {}
        self.scalers = {}
        self.encoders = {}
        self._load_trained_models()
        
    def _load_config(self, config_path: str) -> Dict:
        """Load configuration"""
        if config_path is None:
            config_path = "../study-buddy/config/study_buddy_config.json"
        
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning(f"Config file not found: {config_path}")
            return {}
    
    def _load_trained_models(self) -> None:
        """Load pre-trained ML models"""
        models_dir = "../study-buddy/models/trained/"
        
        if not os.path.exists(models_dir):
            logger.info("No trained models directory found. Using rule-based analysis.")
            return
        
        try:
            # Load models
            model_files = [f for f in os.listdir(models_dir) if f.endswith('_model.pkl')]
            for model_file in model_files:
                model_name = model_file.replace('_model.pkl', '')
                self.trained_models[model_name] = joblib.load(os.path.join(models_dir, model_file))
            
            # Load scalers and encoders
            for file_type, storage in [('_scaler.pkl', self.scalers), ('_encoder.pkl', self.encoders)]:
                files = [f for f in os.listdir(models_dir) if f.endswith(file_type)]
                for file_name in files:
                    name = file_name.replace(file_type, '')
                    storage[name] = joblib.load(os.path.join(models_dir, file_name))
            
            logger.info(f"Loaded {len(self.trained_models)} trained models")
            
        except Exception as e:
            logger.error(f"Error loading trained models: {e}")
    
    async def get_user_data(self, user_id: str, token: str) -> Dict:
        """
        Fetch user data from the backend API
        
        Args:
            user_id: User identifier
            token: Authentication token
        
        Returns:
            User data including sessions, progress, etc.
        """
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            # Fetch user sessions
            sessions_response = requests.get(
                f"{self.api_base_url}/users/{user_id}/sessions",
                headers=headers,
                timeout=10
            )
            sessions_response.raise_for_status()
            sessions = sessions_response.json()
            
            # Fetch user progress
            progress_response = requests.get(
                f"{self.api_base_url}/users/{user_id}/progress",
                headers=headers,
                timeout=10
            )
            progress_response.raise_for_status()
            progress = progress_response.json()
            
            # Fetch user preferences
            preferences_response = requests.get(
                f"{self.api_base_url}/users/{user_id}/preferences",
                headers=headers,
                timeout=10
            )
            preferences_response.raise_for_status()
            preferences = preferences_response.json()
            
            return {
                "user_id": user_id,
                "sessions": sessions,
                "progress": progress,
                "preferences": preferences,
                "last_updated": datetime.now().isoformat()
            }
            
        except requests.RequestException as e:
            logger.error(f"Error fetching user data: {e}")
            return {"user_id": user_id, "sessions": [], "progress": {}, "preferences": {}}
    
    def analyze_user_behavior(self, user_data: Dict) -> Dict:
        """
        Analyze user behavior patterns and generate insights
        
        Args:
            user_data: Complete user data from API
        
        Returns:
            Behavior analysis results
        """
        try:
            sessions = user_data.get("sessions", [])
            
            if len(sessions) < 3:
                return {
                    "status": "insufficient_data",
                    "message": "Need at least 3 sessions for behavior analysis",
                    "recommendations": ["Complete more study sessions to unlock personalized insights"]
                }
            
            # Convert sessions to required format
            session_objects = []
            for session in sessions:
                try:
                    session_obj = self._convert_session_format(session)
                    session_objects.append(session_obj)
                except Exception as e:
                    logger.warning(f"Error converting session: {e}")
                    continue
            
            if not session_objects:
                return {"status": "error", "message": "No valid sessions found"}
            
            # Analyze behavior patterns
            time_pref, time_confidence = self.behavior_analyzer.analyze_study_time_preference(session_objects)
            velocity, vel_confidence = self.behavior_analyzer.analyze_learning_velocity(session_objects)
            motivation_pattern, mot_confidence = self.behavior_analyzer.analyze_motivation_pattern(session_objects)
            
            # Detect struggle patterns
            struggle_insights = self.behavior_analyzer.detect_struggle_patterns(session_objects)
            
            # Generate recommendations
            recommendations = self.behavior_analyzer.generate_study_recommendations(session_objects)
            
            return {
                "status": "success",
                "analysis": {
                    "study_time_preference": {
                        "preference": time_pref.value,
                        "confidence": time_confidence,
                        "description": f"You perform best during {time_pref.value.replace('_', ' ')} hours"
                    },
                    "learning_velocity": {
                        "velocity": velocity,
                        "confidence": vel_confidence,
                        "description": f"Your learning pace is {velocity}"
                    },
                    "motivation_pattern": {
                        "pattern": motivation_pattern.value,
                        "confidence": mot_confidence,
                        "description": f"You are primarily {motivation_pattern.value.replace('_', ' ')}"
                    }
                },
                "struggle_areas": [self._format_insight(insight) for insight in struggle_insights],
                "recommendations": [self._format_insight(rec) for rec in recommendations],
                "sessions_analyzed": len(session_objects)
            }
            
        except Exception as e:
            logger.error(f"Error in behavior analysis: {e}")
            return {"status": "error", "message": str(e)}
    
    def generate_study_reminders(self, user_data: Dict) -> List[Dict]:
        """
        Generate personalized study reminders for the user
        
        Args:
            user_data: User data including sessions and preferences
        
        Returns:
            List of reminder objects
        """
        try:
            sessions = user_data.get("sessions", [])
            preferences = user_data.get("preferences", {})
            
            # Convert sessions to study items format
            study_items = []
            for session in sessions[-20:]:  # Last 20 sessions
                items = self._convert_to_study_items(session)
                study_items.extend(items)
            
            # Generate reminders
            reminders = self.reminder_scheduler.generate_study_reminders(
                user_data["user_id"], 
                study_items, 
                preferences
            )
            
            # Optimize reminder timing
            optimized_reminders = []
            for reminder in reminders:
                optimal_time = self.reminder_scheduler.optimize_reminder_timing(preferences, reminder)
                reminder["optimal_send_time"] = optimal_time.isoformat()
                optimized_reminders.append(reminder)
            
            return optimized_reminders
            
        except Exception as e:
            logger.error(f"Error generating reminders: {e}")
            return []
    
    def track_motivation(self, user_data: Dict) -> Dict:
        """
        Track and analyze user motivation levels
        
        Args:
            user_data: User data including recent sessions
        
        Returns:
            Motivation analysis and insights
        """
        try:
            # Generate motivation insights
            motivation_insight = self.motivation_tracker.generate_motivation_insights(user_data)
            
            return {
                "current_level": motivation_insight.current_level.value,
                "trend": motivation_insight.trend,
                "confidence": motivation_insight.confidence,
                "recommendations": motivation_insight.recommendations,
                "primary_triggers": [trigger.value for trigger in motivation_insight.triggers],
                "analysis_type": motivation_insight.insight_type
            }
            
        except Exception as e:
            logger.error(f"Error tracking motivation: {e}")
            return {
                "current_level": "moderate",
                "trend": "stable",
                "confidence": 0.0,
                "recommendations": ["Continue your current study routine"],
                "primary_triggers": ["progress"]
            }
    
    def predict_performance(self, user_data: Dict, prediction_type: str, **kwargs) -> Dict:
        """
        Generate performance predictions
        
        Args:
            user_data: User data
            prediction_type: Type of prediction to make
            **kwargs: Additional parameters for specific predictions
        
        Returns:
            Performance prediction results
        """
        try:
            if prediction_type == "optimal_session_time":
                sessions = user_data.get("sessions", [])
                prediction = self.performance_predictor.predict_optimal_session_time(sessions)
                
            elif prediction_type == "difficulty_readiness":
                topic = kwargs.get("topic", "general")
                progress = user_data.get("progress", {})
                prediction = self.performance_predictor.predict_difficulty_readiness(progress, topic)
                
            elif prediction_type == "topic_performance":
                new_topic = kwargs.get("topic", "arrays")
                prediction = self.performance_predictor.predict_topic_performance(user_data, new_topic)
                
            elif prediction_type == "retention_forecast":
                topic = kwargs.get("topic", "general")
                days_ahead = kwargs.get("days_ahead", 7)
                prediction = self.performance_predictor.predict_retention_forecast(user_data, topic, days_ahead)
                
            elif prediction_type == "struggle_areas":
                predictions = self.performance_predictor.predict_struggle_areas(user_data)
                return {
                    "predictions": [self._format_prediction(pred) for pred in predictions],
                    "count": len(predictions)
                }
            
            else:
                return {"error": f"Unknown prediction type: {prediction_type}"}
            
            return self._format_prediction(prediction)
            
        except Exception as e:
            logger.error(f"Error in performance prediction: {e}")
            return {"error": str(e)}
    
    def get_personalized_response(self, user_data: Dict, context: str, message_type: str = "general") -> str:
        """
        Generate personalized response based on user behavior and context
        
        Args:
            user_data: User data and behavior analysis
            context: Current context (session_start, achievement, struggle, etc.)
            message_type: Type of message needed
        
        Returns:
            Personalized message string
        """
        try:
            # Load motivational responses
            with open("../study-buddy/data/motivational_responses.json", 'r') as f:
                responses = json.load(f)
            
            # Determine user's motivation level and preferences
            motivation_analysis = self.track_motivation(user_data)
            current_level = motivation_analysis["current_level"]
            
            # Select appropriate response category
            response_categories = responses.get("motivational_responses", {})
            
            if context == "session_start":
                time_of_day = self._get_current_time_period()
                messages = response_categories.get("daily_motivation", {}).get(f"{time_of_day}_energy", [])
                
            elif context == "achievement":
                if message_type == "streak":
                    streak_days = user_data.get("current_streak", 1)
                    milestone_key = self._get_streak_milestone_key(streak_days)
                    messages = response_categories.get("achievement_celebrations", {}).get("streak_milestones", {}).get(milestone_key, [])
                else:
                    messages = response_categories.get("achievement_celebrations", {}).get("session_completions", {}).get("perfect_session", [])
                
            elif context == "struggle":
                messages = response_categories.get("encouragement_during_struggles", {}).get("concept_difficulty", [])
                
            elif context == "comeback":
                messages = response_categories.get("comeback_motivation", {}).get("after_break", [])
                
            else:  # general encouragement
                if current_level in ["very_low", "low"]:
                    messages = response_categories.get("encouragement_during_struggles", {}).get("motivation_dip", [])
                else:
                    messages = response_categories.get("daily_motivation", {}).get("morning_energy", [])
            
            # Select random message from appropriate category
            if messages:
                import random
                return random.choice(messages)
            else:
                return "Keep up the great work! You're making excellent progress! 🌟"
                
        except Exception as e:
            logger.error(f"Error generating personalized response: {e}")
            return "You're doing amazing! Keep pushing forward! 💪"
    
    def _convert_session_format(self, session: Dict) -> Any:
        """Convert API session format to internal format"""
        from study_buddy.models.behavior_analyzer import UserSession
        
        return UserSession(
            session_id=session.get("_id", ""),
            user_id=session.get("userId", ""),
            start_time=datetime.fromisoformat(session.get("createdAt", datetime.now().isoformat())),
            end_time=datetime.fromisoformat(session.get("updatedAt", datetime.now().isoformat())),
            questions_attempted=len(session.get("questions", [])),
            questions_correct=len([q for q in session.get("questions", []) if q.get("isCorrect", False)]),
            topics_covered=session.get("topics", []),
            difficulty_level=session.get("difficulty", "medium"),
            session_type=session.get("type", "practice")
        )
    
    def _convert_to_study_items(self, session: Dict) -> List[Any]:
        """Convert session to study items for reminder scheduling"""
        from study_buddy.models.reminder_scheduler import StudyItem
        
        items = []
        questions = session.get("questions", [])
        
        for i, question in enumerate(questions):
            item = StudyItem(
                item_id=f"{session.get('_id', '')}_{i}",
                item_type="question",
                content=question.get("question", ""),
                difficulty_level=question.get("difficulty", "medium"),
                last_reviewed=datetime.fromisoformat(session.get("updatedAt", datetime.now().isoformat())),
                review_count=1,
                success_rate=1.0 if question.get("isCorrect", False) else 0.0,
                next_review_due=datetime.now() + timedelta(days=1)
            )
            items.append(item)
        
        return items
    
    def _format_insight(self, insight: BehaviorInsight) -> Dict:
        """Format behavior insight for API response"""
        return {
            "type": insight.insight_type,
            "confidence": insight.confidence_score,
            "description": insight.description,
            "recommendation": insight.recommendation,
            "data": insight.supporting_data
        }
    
    def _format_prediction(self, prediction: PerformancePrediction) -> Dict:
        """Format performance prediction for API response"""
        return {
            "type": prediction.prediction_type.value,
            "confidence": prediction.confidence,
            "prediction": prediction.prediction_value,
            "reasoning": prediction.reasoning,
            "recommendations": prediction.recommendations,
            "supporting_data": prediction.supporting_data
        }
    
    def _get_current_time_period(self) -> str:
        """Get current time period for contextual responses"""
        hour = datetime.now().hour
        
        if 6 <= hour < 12:
            return "morning"
        elif 12 <= hour < 17:
            return "afternoon"
        elif 17 <= hour < 22:
            return "evening"
        else:
            return "night"
    
    def _get_streak_milestone_key(self, streak_days: int) -> str:
        """Get appropriate milestone key for streak celebration"""
        if streak_days >= 100:
            return "100_days"
        elif streak_days >= 60:
            return "60_days"
        elif streak_days >= 30:
            return "30_days"
        elif streak_days >= 14:
            return "14_days"
        elif streak_days >= 7:
            return "7_days"
        else:
            return "3_days"

# Convenience functions for easy integration

async def analyze_user(user_id: str, token: str, api_base_url: str = None) -> Dict:
    """
    Convenience function to analyze a user's behavior
    
    Args:
        user_id: User identifier
        token: Authentication token
        api_base_url: Backend API base URL
    
    Returns:
        Complete behavior analysis
    """
    api = StudyBuddyAPI(api_base_url=api_base_url)
    user_data = await api.get_user_data(user_id, token)
    
    return {
        "behavior_analysis": api.analyze_user_behavior(user_data),
        "motivation_tracking": api.track_motivation(user_data),
        "study_reminders": api.generate_study_reminders(user_data),
        "performance_predictions": {
            "optimal_time": api.predict_performance(user_data, "optimal_session_time"),
            "struggle_areas": api.predict_performance(user_data, "struggle_areas")
        }
    }

def get_study_buddy_response(user_id: str, context: str, user_data: Dict = None) -> str:
    """
    Get a personalized Study Buddy response
    
    Args:
        user_id: User identifier
        context: Current context
        user_data: Optional user data (if not provided, will be minimal response)
    
    Returns:
        Personalized message
    """
    api = StudyBuddyAPI()
    
    if user_data is None:
        user_data = {"user_id": user_id, "sessions": [], "preferences": {}}
    
    return api.get_personalized_response(user_data, context)
