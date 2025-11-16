"""
Smart Study Buddy - Performance Prediction Engine
Predicts optimal study sessions and identifies potential struggle areas.
"""

import json
import datetime
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from enum import Enum
import statistics
import math

class PredictionType(Enum):
    OPTIMAL_SESSION_TIME = "optimal_session_time"
    DIFFICULTY_READINESS = "difficulty_readiness"
    TOPIC_PERFORMANCE = "topic_performance"
    RETENTION_FORECAST = "retention_forecast"
    STRUGGLE_PREDICTION = "struggle_prediction"

@dataclass
class PerformancePrediction:
    """Represents a performance prediction"""
    prediction_type: PredictionType
    confidence: float  # 0.0 to 1.0
    prediction_value: Any
    reasoning: str
    recommendations: List[str]
    supporting_data: Dict

class PerformancePredictor:
    """Predicts user performance and optimal study conditions"""
    
    def __init__(self, config_path: str = None):
        """Initialize the performance predictor"""
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
            return {"learning_parameters": {"minimum_sessions_for_pattern": 5}}
    
    def _load_behavior_patterns(self) -> Dict:
        """Load behavior patterns from data file"""
        try:
            with open("../data/user_behavior_patterns.json", 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {}
    
    def predict_optimal_session_time(self, user_history: List[Dict]) -> PerformancePrediction:
        """
        Predict the optimal time for the user's next study session
        
        Args:
            user_history: List of previous session data
        
        Returns:
            PerformancePrediction for optimal session timing
        """
        if len(user_history) < 3:
            return PerformancePrediction(
                prediction_type=PredictionType.OPTIMAL_SESSION_TIME,
                confidence=0.3,
                prediction_value="09:00",
                reasoning="Insufficient data for personalized prediction. Suggesting common optimal time.",
                recommendations=["Try morning sessions (9 AM) as they work well for most learners"],
                supporting_data={"sessions_analyzed": len(user_history)}
            )
        
        # Analyze performance by time of day
        time_performance = {}
        
        for session in user_history:
            try:
                session_time = datetime.datetime.fromisoformat(session.get("start_time", ""))
                hour = session_time.hour
                accuracy = session.get("accuracy", 0.0)
                duration = session.get("duration_minutes", 0)
                completion = session.get("completion_rate", 0.0)
                
                # Calculate performance score
                performance_score = (accuracy * 0.5 + completion * 0.3 + min(duration / 45, 1.0) * 0.2)
                
                if hour not in time_performance:
                    time_performance[hour] = []
                time_performance[hour].append(performance_score)
                
            except (ValueError, KeyError):
                continue
        
        # Find optimal time
        best_hour = None
        best_score = 0.0
        
        for hour, scores in time_performance.items():
            if len(scores) >= 2:  # Need at least 2 sessions for reliability
                avg_score = statistics.mean(scores)
                consistency = 1.0 - (statistics.stdev(scores) if len(scores) > 1 else 0.0)
                
                # Combined score: performance + consistency
                combined_score = avg_score * 0.7 + consistency * 0.3
                
                if combined_score > best_score:
                    best_score = combined_score
                    best_hour = hour
        
        if best_hour is None:
            best_hour = 9  # Default to 9 AM
            confidence = 0.3
        else:
            confidence = min(best_score * len(time_performance[best_hour]) / 5, 1.0)
        
        optimal_time = f"{best_hour:02d}:00"
        
        return PerformancePrediction(
            prediction_type=PredictionType.OPTIMAL_SESSION_TIME,
            confidence=confidence,
            prediction_value=optimal_time,
            reasoning=f"Analysis of {len(user_history)} sessions shows best performance at {optimal_time}",
            recommendations=[
                f"Schedule challenging topics around {optimal_time}",
                f"Your performance is {best_score:.1%} better at this time",
                "Consider blocking this time for consistent study sessions"
            ],
            supporting_data={
                "sessions_analyzed": len(user_history),
                "performance_by_hour": time_performance,
                "best_performance_score": best_score
            }
        )
    
    def predict_difficulty_readiness(self, user_progress: Dict, topic: str) -> PerformancePrediction:
        """
        Predict if user is ready for increased difficulty in a topic
        
        Args:
            user_progress: User's progress data
            topic: The topic to analyze
        
        Returns:
            PerformancePrediction for difficulty readiness
        """
        topic_data = user_progress.get("topics", {}).get(topic, {})
        
        if not topic_data:
            return PerformancePrediction(
                prediction_type=PredictionType.DIFFICULTY_READINESS,
                confidence=0.0,
                prediction_value=False,
                reasoning="No data available for this topic",
                recommendations=["Start with basic questions to establish baseline"],
                supporting_data={}
            )
        
        # Analyze readiness factors
        current_accuracy = topic_data.get("accuracy", 0.0)
        questions_completed = topic_data.get("questions_completed", 0)
        current_difficulty = topic_data.get("current_difficulty", "easy")
        recent_trend = topic_data.get("recent_accuracy_trend", 0.0)
        
        # Readiness criteria
        accuracy_threshold = 0.75  # 75% accuracy
        min_questions = 5  # Minimum questions at current level
        positive_trend = recent_trend >= 0.0
        
        ready = (current_accuracy >= accuracy_threshold and 
                questions_completed >= min_questions and 
                positive_trend)
        
        # Calculate confidence
        confidence_factors = []
        if questions_completed >= min_questions:
            confidence_factors.append(min(questions_completed / 10, 1.0))
        if current_accuracy > 0:
            confidence_factors.append(current_accuracy)
        if abs(recent_trend) > 0.1:
            confidence_factors.append(0.8)  # Strong trend indicates reliable data
        
        confidence = statistics.mean(confidence_factors) if confidence_factors else 0.0
        
        # Generate recommendations
        recommendations = []
        if ready:
            next_difficulty = self._get_next_difficulty(current_difficulty)
            recommendations = [
                f"Ready to advance to {next_difficulty} level!",
                f"Your {current_accuracy:.1%} accuracy shows solid understanding",
                "Start with 2-3 questions at the new difficulty level"
            ]
        else:
            if current_accuracy < accuracy_threshold:
                recommendations.append(f"Improve accuracy to {accuracy_threshold:.0%} before advancing")
            if questions_completed < min_questions:
                recommendations.append(f"Complete {min_questions - questions_completed} more questions at current level")
            if not positive_trend:
                recommendations.append("Focus on consistency - recent performance shows room for improvement")
        
        return PerformancePrediction(
            prediction_type=PredictionType.DIFFICULTY_READINESS,
            confidence=confidence,
            prediction_value=ready,
            reasoning=f"Based on {current_accuracy:.1%} accuracy over {questions_completed} questions",
            recommendations=recommendations,
            supporting_data={
                "current_accuracy": current_accuracy,
                "questions_completed": questions_completed,
                "current_difficulty": current_difficulty,
                "recent_trend": recent_trend
            }
        )
    
    def predict_topic_performance(self, user_data: Dict, new_topic: str) -> PerformancePrediction:
        """
        Predict how well user will perform on a new topic based on related topics
        
        Args:
            user_data: Complete user performance data
            new_topic: Topic to predict performance for
        
        Returns:
            PerformancePrediction for topic performance
        """
        # Find related topics
        related_topics = self._find_related_topics(new_topic, user_data)
        
        if not related_topics:
            return PerformancePrediction(
                prediction_type=PredictionType.TOPIC_PERFORMANCE,
                confidence=0.2,
                prediction_value=0.65,  # Default moderate performance
                reasoning="No related topics found for comparison",
                recommendations=["Start with basic questions to establish baseline"],
                supporting_data={"related_topics": []}
            )
        
        # Calculate predicted performance based on related topics
        related_performances = []
        for topic, similarity in related_topics:
            topic_data = user_data.get("topics", {}).get(topic, {})
            if topic_data:
                accuracy = topic_data.get("accuracy", 0.0)
                # Weight by similarity
                weighted_performance = accuracy * similarity
                related_performances.append(weighted_performance)
        
        if not related_performances:
            predicted_performance = 0.65
            confidence = 0.2
        else:
            predicted_performance = statistics.mean(related_performances)
            confidence = min(len(related_performances) / 3, 1.0)  # More related topics = higher confidence
        
        # Adjust for topic difficulty
        topic_difficulty = self._get_topic_difficulty(new_topic)
        difficulty_adjustment = {"easy": 0.1, "medium": 0.0, "hard": -0.1}.get(topic_difficulty, 0.0)
        predicted_performance += difficulty_adjustment
        
        # Clamp to valid range
        predicted_performance = max(0.0, min(1.0, predicted_performance))
        
        # Generate recommendations
        recommendations = []
        if predicted_performance >= 0.8:
            recommendations = [
                "Strong performance expected based on related topics",
                "Consider starting with medium difficulty questions",
                "Your background suggests you'll pick this up quickly"
            ]
        elif predicted_performance >= 0.6:
            recommendations = [
                "Moderate performance expected - good foundation to build on",
                "Start with easy questions and progress gradually",
                "Focus on understanding core concepts first"
            ]
        else:
            recommendations = [
                "This topic may be challenging based on related performance",
                "Start with fundamentals and take your time",
                "Consider reviewing prerequisite topics first"
            ]
        
        return PerformancePrediction(
            prediction_type=PredictionType.TOPIC_PERFORMANCE,
            confidence=confidence,
            prediction_value=predicted_performance,
            reasoning=f"Based on performance in {len(related_topics)} related topics",
            recommendations=recommendations,
            supporting_data={
                "related_topics": related_topics,
                "topic_difficulty": topic_difficulty,
                "related_performances": related_performances
            }
        )
    
    def predict_retention_forecast(self, user_data: Dict, topic: str, days_ahead: int = 7) -> PerformancePrediction:
        """
        Predict how well user will retain knowledge of a topic over time
        
        Args:
            user_data: User's learning data
            topic: Topic to forecast retention for
            days_ahead: Number of days to forecast
        
        Returns:
            PerformancePrediction for retention forecast
        """
        topic_data = user_data.get("topics", {}).get(topic, {})
        
        if not topic_data:
            return PerformancePrediction(
                prediction_type=PredictionType.RETENTION_FORECAST,
                confidence=0.0,
                prediction_value=0.5,
                reasoning="No data available for retention prediction",
                recommendations=["Complete some questions first to enable retention forecasting"],
                supporting_data={}
            )
        
        # Factors affecting retention
        initial_mastery = topic_data.get("accuracy", 0.0)
        review_frequency = topic_data.get("review_sessions", 0)
        time_since_last_review = topic_data.get("days_since_last_review", 0)
        difficulty_level = topic_data.get("difficulty", "medium")
        
        # Ebbinghaus forgetting curve approximation
        # Retention = initial_mastery * e^(-t/S)
        # Where S is the stability (affected by reviews and difficulty)
        
        # Calculate stability factor
        stability = 1.0  # Base stability (1 day)
        
        # Reviews increase stability
        stability *= (1 + review_frequency * 0.5)
        
        # Difficulty affects stability
        difficulty_multiplier = {"easy": 1.2, "medium": 1.0, "hard": 0.8}.get(difficulty_level, 1.0)
        stability *= difficulty_multiplier
        
        # Initial mastery affects stability
        stability *= (0.5 + initial_mastery * 0.5)
        
        # Predict retention after days_ahead
        retention_rate = initial_mastery * math.exp(-days_ahead / stability)
        
        # Calculate confidence based on available data
        confidence_factors = []
        if initial_mastery > 0:
            confidence_factors.append(0.8)
        if review_frequency > 0:
            confidence_factors.append(0.7)
        if time_since_last_review < 30:  # Recent data
            confidence_factors.append(0.6)
        
        confidence = statistics.mean(confidence_factors) if confidence_factors else 0.3
        
        # Generate recommendations
        recommendations = []
        if retention_rate >= 0.7:
            recommendations = [
                f"Good retention expected ({retention_rate:.1%}) in {days_ahead} days",
                "Current review schedule is working well",
                "Consider extending review intervals slightly"
            ]
        elif retention_rate >= 0.5:
            recommendations = [
                f"Moderate retention expected ({retention_rate:.1%}) in {days_ahead} days",
                "Schedule a review session in 3-4 days",
                "Focus on key concepts during review"
            ]
        else:
            recommendations = [
                f"Low retention expected ({retention_rate:.1%}) in {days_ahead} days",
                "Schedule review session within 2 days",
                "Consider more frequent reviews for this topic"
            ]
        
        return PerformancePrediction(
            prediction_type=PredictionType.RETENTION_FORECAST,
            confidence=confidence,
            prediction_value=retention_rate,
            reasoning=f"Forgetting curve analysis based on {initial_mastery:.1%} initial mastery",
            recommendations=recommendations,
            supporting_data={
                "initial_mastery": initial_mastery,
                "stability_factor": stability,
                "days_forecasted": days_ahead,
                "review_frequency": review_frequency
            }
        )
    
    def predict_struggle_areas(self, user_data: Dict) -> List[PerformancePrediction]:
        """
        Predict topics or concepts where user might struggle
        
        Args:
            user_data: Complete user performance data
        
        Returns:
            List of predictions for potential struggle areas
        """
        predictions = []
        topics_data = user_data.get("topics", {})
        
        for topic, data in topics_data.items():
            accuracy = data.get("accuracy", 0.0)
            trend = data.get("recent_accuracy_trend", 0.0)
            time_per_question = data.get("avg_time_per_question", 0.0)
            questions_attempted = data.get("questions_attempted", 0)
            
            # Identify struggle indicators
            struggle_score = 0.0
            struggle_reasons = []
            
            # Low accuracy
            if accuracy < 0.6:
                struggle_score += 0.4
                struggle_reasons.append(f"Low accuracy ({accuracy:.1%})")
            
            # Declining trend
            if trend < -0.1:
                struggle_score += 0.3
                struggle_reasons.append("Declining performance trend")
            
            # Slow progress
            if time_per_question > 300:  # More than 5 minutes per question
                struggle_score += 0.2
                struggle_reasons.append("Taking longer than average per question")
            
            # Avoidance (few attempts)
            if questions_attempted < 3 and topic in user_data.get("recommended_topics", []):
                struggle_score += 0.1
                struggle_reasons.append("Avoiding topic despite recommendations")
            
            # If struggle score is significant, create prediction
            if struggle_score >= 0.3:
                confidence = min(struggle_score, 1.0)
                
                recommendations = self._generate_struggle_recommendations(topic, struggle_reasons, data)
                
                prediction = PerformancePrediction(
                    prediction_type=PredictionType.STRUGGLE_PREDICTION,
                    confidence=confidence,
                    prediction_value=topic,
                    reasoning=f"Struggle indicators: {', '.join(struggle_reasons)}",
                    recommendations=recommendations,
                    supporting_data={
                        "struggle_score": struggle_score,
                        "accuracy": accuracy,
                        "trend": trend,
                        "time_per_question": time_per_question,
                        "questions_attempted": questions_attempted
                    }
                )
                predictions.append(prediction)
        
        # Sort by struggle score (confidence) descending
        predictions.sort(key=lambda p: p.confidence, reverse=True)
        
        return predictions[:3]  # Return top 3 struggle areas
    
    def _get_next_difficulty(self, current_difficulty: str) -> str:
        """Get the next difficulty level"""
        difficulty_progression = {"easy": "medium", "medium": "hard", "hard": "expert"}
        return difficulty_progression.get(current_difficulty, "medium")
    
    def _find_related_topics(self, topic: str, user_data: Dict) -> List[Tuple[str, float]]:
        """Find topics related to the given topic with similarity scores"""
        # This is a simplified implementation
        # In practice, you might use topic embeddings or a knowledge graph
        
        topic_relationships = {
            "arrays": [("strings", 0.8), ("linked_lists", 0.6), ("sorting", 0.7)],
            "strings": [("arrays", 0.8), ("regex", 0.6), ("parsing", 0.5)],
            "trees": [("recursion", 0.9), ("graphs", 0.7), ("binary_search", 0.6)],
            "graphs": [("trees", 0.7), ("bfs", 0.9), ("dfs", 0.9)],
            "dynamic_programming": [("recursion", 0.8), ("memoization", 0.9)],
            "sorting": [("arrays", 0.7), ("searching", 0.6), ("complexity", 0.5)]
        }
        
        related = topic_relationships.get(topic.lower(), [])
        
        # Filter to only include topics the user has experience with
        user_topics = set(user_data.get("topics", {}).keys())
        return [(t, sim) for t, sim in related if t in user_topics]
    
    def _get_topic_difficulty(self, topic: str) -> str:
        """Get the inherent difficulty of a topic"""
        # Simplified topic difficulty mapping
        difficulty_map = {
            "arrays": "easy",
            "strings": "easy",
            "linked_lists": "medium",
            "stacks": "easy",
            "queues": "easy",
            "trees": "medium",
            "graphs": "hard",
            "dynamic_programming": "hard",
            "backtracking": "hard",
            "sorting": "medium",
            "searching": "easy"
        }
        
        return difficulty_map.get(topic.lower(), "medium")
    
    def _generate_struggle_recommendations(self, topic: str, reasons: List[str], 
                                         topic_data: Dict) -> List[str]:
        """Generate recommendations for struggling topics"""
        recommendations = []
        
        if "Low accuracy" in str(reasons):
            recommendations.append("Review fundamental concepts before attempting more questions")
            recommendations.append("Try easier questions to build confidence")
        
        if "Declining performance" in str(reasons):
            recommendations.append("Take a break from this topic and return with fresh perspective")
            recommendations.append("Review your previous correct answers to reinforce patterns")
        
        if "Taking longer" in str(reasons):
            recommendations.append("Focus on pattern recognition rather than solving from scratch")
            recommendations.append("Set time limits to improve decision-making speed")
        
        if "Avoiding topic" in str(reasons):
            recommendations.append("Start with just one easy question to overcome avoidance")
            recommendations.append("Pair this topic with an easier one you enjoy")
        
        # Add topic-specific recommendations
        topic_specific = {
            "dynamic_programming": "Break problems into smaller subproblems and identify overlapping patterns",
            "graphs": "Start with simple traversal algorithms (BFS/DFS) before complex problems",
            "trees": "Master tree traversal methods first, then move to manipulation problems"
        }
        
        if topic.lower() in topic_specific:
            recommendations.append(topic_specific[topic.lower()])
        
        return recommendations[:3]  # Return top 3 recommendations
