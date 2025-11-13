"""
Smart Study Buddy - Behavior Analysis Engine
Analyzes user study patterns and learning behaviors to provide personalized insights.
"""

import json
import datetime
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum

class LearningStyle(Enum):
    VISUAL = "visual_learner"
    KINESTHETIC = "kinesthetic_learner"
    AUDITORY = "auditory_learner"

class StudyTimePreference(Enum):
    MORNING = "morning_learner"
    AFTERNOON = "afternoon_learner"
    EVENING = "evening_learner"
    NIGHT_OWL = "night_owl"

class MotivationPattern(Enum):
    ACHIEVEMENT_DRIVEN = "achievement_driven"
    PROGRESS_DRIVEN = "progress_driven"
    SOCIAL_DRIVEN = "social_driven"
    MASTERY_DRIVEN = "mastery_driven"

@dataclass
class UserSession:
    """Represents a single study session"""
    session_id: str
    user_id: str
    start_time: datetime.datetime
    end_time: datetime.datetime
    questions_attempted: int
    questions_correct: int
    topics_covered: List[str]
    difficulty_level: str
    session_type: str  # practice, review, assessment
    
    @property
    def duration_minutes(self) -> int:
        return int((self.end_time - self.start_time).total_seconds() / 60)
    
    @property
    def accuracy_rate(self) -> float:
        if self.questions_attempted == 0:
            return 0.0
        return self.questions_correct / self.questions_attempted

@dataclass
class BehaviorInsight:
    """Represents an insight about user behavior"""
    insight_type: str
    confidence_score: float
    description: str
    recommendation: str
    supporting_data: Dict

class BehaviorAnalyzer:
    """Main class for analyzing user study behavior patterns"""
    
    def __init__(self, config_path: str = None):
        """Initialize the behavior analyzer with configuration"""
        self.config = self._load_config(config_path)
        self.behavior_patterns = self._load_behavior_patterns()
        
    def _load_config(self, config_path: str) -> Dict:
        """Load configuration from JSON file"""
        if config_path is None:
            config_path = "../config/study_buddy_config.json"
        
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            # Return default config if file not found
            return {
                "learning_parameters": {
                    "behavior_analysis_window_days": 30,
                    "minimum_sessions_for_pattern": 5,
                    "motivation_tracking_sensitivity": 0.7
                }
            }
    
    def _load_behavior_patterns(self) -> Dict:
        """Load behavior patterns from data file"""
        try:
            with open("../data/user_behavior_patterns.json", 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {}
    
    def analyze_study_time_preference(self, sessions: List[UserSession]) -> Tuple[StudyTimePreference, float]:
        """
        Analyze when the user performs best during the day
        Returns: (preference, confidence_score)
        """
        if len(sessions) < self.config["learning_parameters"]["minimum_sessions_for_pattern"]:
            return StudyTimePreference.MORNING, 0.0
        
        # Group sessions by time of day
        time_performance = {
            "morning": {"sessions": 0, "total_accuracy": 0.0, "total_duration": 0},
            "afternoon": {"sessions": 0, "total_accuracy": 0.0, "total_duration": 0},
            "evening": {"sessions": 0, "total_accuracy": 0.0, "total_duration": 0},
            "night": {"sessions": 0, "total_accuracy": 0.0, "total_duration": 0}
        }
        
        for session in sessions:
            hour = session.start_time.hour
            time_period = self._get_time_period(hour)
            
            time_performance[time_period]["sessions"] += 1
            time_performance[time_period]["total_accuracy"] += session.accuracy_rate
            time_performance[time_period]["total_duration"] += session.duration_minutes
        
        # Calculate average performance for each time period
        best_period = None
        best_score = 0.0
        
        for period, data in time_performance.items():
            if data["sessions"] > 0:
                avg_accuracy = data["total_accuracy"] / data["sessions"]
                avg_duration = data["total_duration"] / data["sessions"]
                
                # Combined score: accuracy (70%) + duration (30%)
                score = (avg_accuracy * 0.7) + (min(avg_duration / 45, 1.0) * 0.3)
                
                if score > best_score:
                    best_score = score
                    best_period = period
        
        # Map to enum and calculate confidence
        preference_mapping = {
            "morning": StudyTimePreference.MORNING,
            "afternoon": StudyTimePreference.AFTERNOON,
            "evening": StudyTimePreference.EVENING,
            "night": StudyTimePreference.NIGHT_OWL
        }
        
        preference = preference_mapping.get(best_period, StudyTimePreference.MORNING)
        confidence = min(best_score * len(sessions) / 10, 1.0)  # More sessions = higher confidence
        
        return preference, confidence
    
    def _get_time_period(self, hour: int) -> str:
        """Convert hour to time period"""
        if 6 <= hour < 12:
            return "morning"
        elif 12 <= hour < 17:
            return "afternoon"
        elif 17 <= hour < 22:
            return "evening"
        else:
            return "night"
    
    def analyze_learning_velocity(self, sessions: List[UserSession]) -> Tuple[str, float]:
        """
        Analyze how fast the user learns new concepts
        Returns: (velocity_category, confidence_score)
        """
        if len(sessions) < 3:
            return "moderate", 0.0
        
        # Calculate questions per hour and accuracy trends
        total_questions = sum(s.questions_attempted for s in sessions)
        total_hours = sum(s.duration_minutes for s in sessions) / 60
        
        if total_hours == 0:
            return "moderate", 0.0
        
        questions_per_hour = total_questions / total_hours
        avg_accuracy = sum(s.accuracy_rate for s in sessions) / len(sessions)
        
        # Categorize velocity based on patterns from behavior_patterns.json
        if questions_per_hour > 15 and avg_accuracy > 0.8:
            velocity = "fast"
        elif questions_per_hour < 8 or avg_accuracy < 0.6:
            velocity = "slow"
        else:
            velocity = "moderate"
        
        # Calculate confidence based on consistency
        accuracy_variance = self._calculate_variance([s.accuracy_rate for s in sessions])
        confidence = max(0.0, 1.0 - accuracy_variance)
        
        return velocity, confidence
    
    def analyze_motivation_pattern(self, sessions: List[UserSession]) -> Tuple[MotivationPattern, float]:
        """
        Analyze what motivates the user most
        Returns: (motivation_pattern, confidence_score)
        """
        if len(sessions) < self.config["learning_parameters"]["minimum_sessions_for_pattern"]:
            return MotivationPattern.PROGRESS_DRIVEN, 0.0
        
        # Analyze session patterns for motivation indicators
        session_frequency = self._calculate_session_frequency(sessions)
        difficulty_progression = self._analyze_difficulty_progression(sessions)
        session_length_consistency = self._analyze_session_consistency(sessions)
        
        # Score different motivation patterns
        motivation_scores = {
            MotivationPattern.ACHIEVEMENT_DRIVEN: 0.0,
            MotivationPattern.PROGRESS_DRIVEN: 0.0,
            MotivationPattern.MASTERY_DRIVEN: 0.0,
            MotivationPattern.SOCIAL_DRIVEN: 0.0
        }
        
        # Achievement-driven indicators
        if session_frequency > 0.8:  # High frequency
            motivation_scores[MotivationPattern.ACHIEVEMENT_DRIVEN] += 0.3
        
        # Progress-driven indicators
        if difficulty_progression > 0.6:  # Steady progression
            motivation_scores[MotivationPattern.PROGRESS_DRIVEN] += 0.4
        
        # Mastery-driven indicators
        if session_length_consistency > 0.7:  # Consistent long sessions
            motivation_scores[MotivationPattern.MASTERY_DRIVEN] += 0.3
        
        # Find highest scoring pattern
        best_pattern = max(motivation_scores.keys(), key=lambda k: motivation_scores[k])
        confidence = motivation_scores[best_pattern]
        
        return best_pattern, confidence
    
    def detect_struggle_patterns(self, sessions: List[UserSession]) -> List[BehaviorInsight]:
        """
        Detect if user is struggling with specific concepts or patterns
        Returns: List of insights about struggle areas
        """
        insights = []
        
        if len(sessions) < 3:
            return insights
        
        # Analyze accuracy trends
        recent_sessions = sessions[-5:]  # Last 5 sessions
        recent_accuracy = [s.accuracy_rate for s in recent_sessions]
        
        if len(recent_accuracy) >= 3:
            avg_recent_accuracy = sum(recent_accuracy) / len(recent_accuracy)
            
            # Low accuracy pattern
            if avg_recent_accuracy < 0.6:
                insights.append(BehaviorInsight(
                    insight_type="low_accuracy",
                    confidence_score=1.0 - avg_recent_accuracy,
                    description=f"Recent accuracy is {avg_recent_accuracy:.1%}, indicating difficulty with current concepts",
                    recommendation="Consider reviewing fundamentals or switching to easier topics temporarily",
                    supporting_data={"recent_accuracy": recent_accuracy}
                ))
        
        # Analyze topic-specific struggles
        topic_performance = {}
        for session in sessions:
            for topic in session.topics_covered:
                if topic not in topic_performance:
                    topic_performance[topic] = []
                topic_performance[topic].append(session.accuracy_rate)
        
        # Find consistently difficult topics
        for topic, accuracies in topic_performance.items():
            if len(accuracies) >= 3:
                avg_accuracy = sum(accuracies) / len(accuracies)
                if avg_accuracy < 0.65:
                    insights.append(BehaviorInsight(
                        insight_type="topic_difficulty",
                        confidence_score=min(len(accuracies) / 5, 1.0),
                        description=f"Consistent difficulty with {topic} (avg accuracy: {avg_accuracy:.1%})",
                        recommendation=f"Focus on {topic} fundamentals with additional practice",
                        supporting_data={"topic": topic, "accuracies": accuracies}
                    ))
        
        return insights
    
    def generate_study_recommendations(self, sessions: List[UserSession]) -> List[BehaviorInsight]:
        """
        Generate personalized study recommendations based on behavior analysis
        Returns: List of actionable recommendations
        """
        recommendations = []
        
        if len(sessions) < 2:
            recommendations.append(BehaviorInsight(
                insight_type="getting_started",
                confidence_score=1.0,
                description="Building your learning profile",
                recommendation="Complete a few more sessions to unlock personalized insights",
                supporting_data={"sessions_needed": 3}
            ))
            return recommendations
        
        # Analyze study time preference
        time_pref, time_confidence = self.analyze_study_time_preference(sessions)
        if time_confidence > 0.6:
            recommendations.append(BehaviorInsight(
                insight_type="optimal_study_time",
                confidence_score=time_confidence,
                description=f"You perform best during {time_pref.value.replace('_', ' ')} hours",
                recommendation=f"Schedule your most challenging topics during {time_pref.value.replace('_', ' ')} sessions",
                supporting_data={"preferred_time": time_pref.value}
            ))
        
        # Analyze learning velocity
        velocity, vel_confidence = self.analyze_learning_velocity(sessions)
        if vel_confidence > 0.5:
            if velocity == "fast":
                recommendations.append(BehaviorInsight(
                    insight_type="learning_pace",
                    confidence_score=vel_confidence,
                    description="You're a fast learner with high accuracy",
                    recommendation="Consider tackling more advanced topics or increasing session difficulty",
                    supporting_data={"velocity": velocity}
                ))
            elif velocity == "slow":
                recommendations.append(BehaviorInsight(
                    insight_type="learning_pace",
                    confidence_score=vel_confidence,
                    description="You prefer thorough, methodical learning",
                    recommendation="Focus on understanding concepts deeply before moving to new topics",
                    supporting_data={"velocity": velocity}
                ))
        
        return recommendations
    
    def _calculate_session_frequency(self, sessions: List[UserSession]) -> float:
        """Calculate how frequently user studies (0-1 scale)"""
        if len(sessions) < 2:
            return 0.0
        
        # Calculate days between first and last session
        first_session = min(sessions, key=lambda s: s.start_time)
        last_session = max(sessions, key=lambda s: s.start_time)
        
        total_days = (last_session.start_time - first_session.start_time).days + 1
        session_days = len(set(s.start_time.date() for s in sessions))
        
        return min(session_days / total_days, 1.0)
    
    def _analyze_difficulty_progression(self, sessions: List[UserSession]) -> float:
        """Analyze if user is progressing through difficulty levels"""
        if len(sessions) < 3:
            return 0.0
        
        difficulty_mapping = {"easy": 1, "medium": 2, "hard": 3}
        
        # Check if there's upward progression in difficulty
        progression_score = 0.0
        for i in range(1, len(sessions)):
            prev_diff = difficulty_mapping.get(sessions[i-1].difficulty_level, 1)
            curr_diff = difficulty_mapping.get(sessions[i].difficulty_level, 1)
            
            if curr_diff >= prev_diff:
                progression_score += 1
        
        return progression_score / (len(sessions) - 1)
    
    def _analyze_session_consistency(self, sessions: List[UserSession]) -> float:
        """Analyze consistency in session lengths"""
        if len(sessions) < 3:
            return 0.0
        
        durations = [s.duration_minutes for s in sessions]
        variance = self._calculate_variance(durations)
        
        # Lower variance = higher consistency
        return max(0.0, 1.0 - (variance / 100))  # Normalize variance
    
    def _calculate_variance(self, values: List[float]) -> float:
        """Calculate variance of a list of values"""
        if len(values) < 2:
            return 0.0
        
        mean = sum(values) / len(values)
        variance = sum((x - mean) ** 2 for x in values) / len(values)
        return variance
