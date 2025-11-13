"""
Smart Study Buddy - Motivation Tracking Engine
Tracks user motivation levels and provides personalized encouragement.
"""

import json
import datetime
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import statistics

class MotivationLevel(Enum):
    VERY_LOW = "very_low"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    VERY_HIGH = "very_high"

class MotivationTrigger(Enum):
    ACHIEVEMENT = "achievement"
    PROGRESS = "progress"
    SOCIAL = "social"
    MASTERY = "mastery"
    CHALLENGE = "challenge"

@dataclass
class MotivationSignal:
    """Represents a signal that indicates motivation level"""
    signal_type: str
    timestamp: datetime.datetime
    value: float  # -1.0 to 1.0 (negative = demotivating, positive = motivating)
    context: Dict
    confidence: float  # 0.0 to 1.0

@dataclass
class MotivationInsight:
    """Represents an insight about user motivation"""
    insight_type: str
    current_level: MotivationLevel
    trend: str  # "increasing", "decreasing", "stable"
    confidence: float
    recommendations: List[str]
    triggers: List[MotivationTrigger]

class MotivationTracker:
    """Tracks and analyzes user motivation patterns"""
    
    def __init__(self, config_path: str = None):
        """Initialize the motivation tracker"""
        self.config = self._load_config(config_path)
        self.motivational_responses = self._load_motivational_responses()
        self.motivation_history = []
        
    def _load_config(self, config_path: str) -> Dict:
        """Load configuration from JSON file"""
        if config_path is None:
            config_path = "../config/study_buddy_config.json"
        
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return self._get_default_config()
    
    def _load_motivational_responses(self) -> Dict:
        """Load motivational response templates"""
        try:
            with open("../data/motivational_responses.json", 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {}
    
    def _get_default_config(self) -> Dict:
        """Return default configuration"""
        return {
            "learning_parameters": {
                "motivation_tracking_sensitivity": 0.7,
                "achievement_celebration_threshold": 0.8
            }
        }
    
    def analyze_session_motivation(self, session_data: Dict) -> MotivationSignal:
        """
        Analyze a single session for motivation indicators
        
        Args:
            session_data: Dictionary containing session information
        
        Returns:
            MotivationSignal indicating the motivational impact of the session
        """
        signals = []
        
        # Analyze completion rate
        completion_rate = session_data.get("completion_rate", 0.0)
        if completion_rate >= 0.9:
            signals.append(0.3)  # High completion is motivating
        elif completion_rate < 0.5:
            signals.append(-0.2)  # Low completion is demotivating
        
        # Analyze accuracy
        accuracy = session_data.get("accuracy", 0.0)
        if accuracy >= 0.8:
            signals.append(0.4)  # High accuracy is very motivating
        elif accuracy < 0.5:
            signals.append(-0.3)  # Low accuracy can be demotivating
        
        # Analyze session duration vs planned
        planned_duration = session_data.get("planned_duration_minutes", 30)
        actual_duration = session_data.get("actual_duration_minutes", 0)
        
        if actual_duration >= planned_duration * 0.9:
            signals.append(0.2)  # Completing planned duration is motivating
        elif actual_duration < planned_duration * 0.5:
            signals.append(-0.1)  # Cutting sessions short can indicate low motivation
        
        # Analyze difficulty progression
        difficulty_attempted = session_data.get("difficulty_level", "medium")
        if difficulty_attempted == "hard":
            signals.append(0.2)  # Attempting hard problems shows motivation
        
        # Analyze time of day vs user preference
        session_time = session_data.get("start_time")
        if session_time and self._is_optimal_time(session_time, session_data.get("user_preferences", {})):
            signals.append(0.1)  # Studying at optimal time indicates good motivation
        
        # Calculate overall motivation signal
        if signals:
            overall_signal = sum(signals) / len(signals)
        else:
            overall_signal = 0.0
        
        # Clamp to valid range
        overall_signal = max(-1.0, min(1.0, overall_signal))
        
        return MotivationSignal(
            signal_type="session_analysis",
            timestamp=datetime.datetime.now(),
            value=overall_signal,
            context=session_data,
            confidence=min(len(signals) / 5.0, 1.0)  # More signals = higher confidence
        )
    
    def track_streak_motivation(self, streak_data: Dict) -> MotivationSignal:
        """
        Analyze streak-related motivation
        
        Args:
            streak_data: Dictionary containing streak information
        
        Returns:
            MotivationSignal for streak-related motivation
        """
        current_streak = streak_data.get("current_streak", 0)
        longest_streak = streak_data.get("longest_streak", 0)
        days_since_last_session = streak_data.get("days_since_last", 0)
        
        motivation_value = 0.0
        
        # Positive motivation from active streaks
        if current_streak > 0:
            if current_streak >= 7:
                motivation_value += 0.4  # Weekly streaks are very motivating
            elif current_streak >= 3:
                motivation_value += 0.3  # Short streaks are motivating
            else:
                motivation_value += 0.2  # Any streak is somewhat motivating
        
        # Milestone motivation
        milestone_thresholds = [3, 7, 14, 30, 60, 100]
        if current_streak in milestone_thresholds:
            motivation_value += 0.5  # Milestone achievement is highly motivating
        
        # Demotivation from broken streaks
        if current_streak == 0 and longest_streak > 0:
            if days_since_last_session <= 2:
                motivation_value -= 0.1  # Recent break, mild demotivation
            elif days_since_last_session <= 7:
                motivation_value -= 0.3  # Week-long break, moderate demotivation
            else:
                motivation_value -= 0.5  # Long break, significant demotivation
        
        # Risk of breaking streak
        if current_streak > 0 and days_since_last_session >= 1:
            motivation_value -= 0.2 * days_since_last_session  # Increasing concern
        
        motivation_value = max(-1.0, min(1.0, motivation_value))
        
        return MotivationSignal(
            signal_type="streak_analysis",
            timestamp=datetime.datetime.now(),
            value=motivation_value,
            context=streak_data,
            confidence=0.8  # Streak data is usually reliable
        )
    
    def analyze_progress_motivation(self, progress_data: Dict) -> MotivationSignal:
        """
        Analyze motivation based on learning progress
        
        Args:
            progress_data: Dictionary containing progress information
        
        Returns:
            MotivationSignal for progress-related motivation
        """
        questions_mastered = progress_data.get("questions_mastered", 0)
        total_questions = progress_data.get("total_questions", 1)
        recent_improvement = progress_data.get("recent_improvement_rate", 0.0)
        time_spent_learning = progress_data.get("total_time_minutes", 0)
        
        motivation_value = 0.0
        
        # Progress percentage motivation
        progress_percentage = questions_mastered / total_questions
        if progress_percentage >= 0.8:
            motivation_value += 0.4  # Near completion is very motivating
        elif progress_percentage >= 0.5:
            motivation_value += 0.2  # Good progress is motivating
        elif progress_percentage < 0.1:
            motivation_value -= 0.1  # Very slow progress can be demotivating
        
        # Recent improvement motivation
        if recent_improvement > 0.1:
            motivation_value += 0.3  # Visible improvement is motivating
        elif recent_improvement < -0.05:
            motivation_value -= 0.2  # Regression is demotivating
        
        # Time investment recognition
        if time_spent_learning > 300:  # More than 5 hours
            motivation_value += 0.2  # Significant time investment shows commitment
        
        # Mastery milestones
        mastery_milestones = [10, 25, 50, 100, 200, 500]
        if questions_mastered in mastery_milestones:
            motivation_value += 0.4  # Mastery milestones are motivating
        
        motivation_value = max(-1.0, min(1.0, motivation_value))
        
        return MotivationSignal(
            signal_type="progress_analysis",
            timestamp=datetime.datetime.now(),
            value=motivation_value,
            context=progress_data,
            confidence=0.7
        )
    
    def get_current_motivation_level(self, recent_signals: List[MotivationSignal]) -> MotivationLevel:
        """
        Determine current motivation level based on recent signals
        
        Args:
            recent_signals: List of recent motivation signals
        
        Returns:
            Current motivation level
        """
        if not recent_signals:
            return MotivationLevel.MODERATE
        
        # Weight recent signals more heavily
        weighted_values = []
        now = datetime.datetime.now()
        
        for signal in recent_signals:
            # Calculate time weight (more recent = higher weight)
            hours_ago = (now - signal.timestamp).total_seconds() / 3600
            time_weight = max(0.1, 1.0 - (hours_ago / 168))  # Decay over a week
            
            # Apply confidence weight
            confidence_weight = signal.confidence
            
            # Combined weight
            total_weight = time_weight * confidence_weight
            weighted_values.append(signal.value * total_weight)
        
        if not weighted_values:
            return MotivationLevel.MODERATE
        
        # Calculate weighted average
        avg_motivation = sum(weighted_values) / len(weighted_values)
        
        # Map to motivation level
        if avg_motivation >= 0.6:
            return MotivationLevel.VERY_HIGH
        elif avg_motivation >= 0.3:
            return MotivationLevel.HIGH
        elif avg_motivation >= -0.1:
            return MotivationLevel.MODERATE
        elif avg_motivation >= -0.4:
            return MotivationLevel.LOW
        else:
            return MotivationLevel.VERY_LOW
    
    def generate_motivation_insights(self, user_data: Dict) -> MotivationInsight:
        """
        Generate comprehensive motivation insights for a user
        
        Args:
            user_data: Complete user data including sessions, progress, etc.
        
        Returns:
            MotivationInsight with recommendations
        """
        # Collect recent signals
        recent_signals = []
        
        # Analyze recent sessions
        recent_sessions = user_data.get("recent_sessions", [])
        for session in recent_sessions[-10:]:  # Last 10 sessions
            signal = self.analyze_session_motivation(session)
            recent_signals.append(signal)
        
        # Analyze streak
        streak_signal = self.track_streak_motivation(user_data.get("streak_data", {}))
        recent_signals.append(streak_signal)
        
        # Analyze progress
        progress_signal = self.analyze_progress_motivation(user_data.get("progress_data", {}))
        recent_signals.append(progress_signal)
        
        # Determine current level
        current_level = self.get_current_motivation_level(recent_signals)
        
        # Analyze trend
        trend = self._analyze_motivation_trend(recent_signals)
        
        # Calculate confidence
        confidence = self._calculate_insight_confidence(recent_signals)
        
        # Generate recommendations
        recommendations = self._generate_motivation_recommendations(current_level, trend, user_data)
        
        # Identify primary triggers
        triggers = self._identify_motivation_triggers(recent_signals, user_data)
        
        return MotivationInsight(
            insight_type="comprehensive_analysis",
            current_level=current_level,
            trend=trend,
            confidence=confidence,
            recommendations=recommendations,
            triggers=triggers
        )
    
    def _analyze_motivation_trend(self, signals: List[MotivationSignal]) -> str:
        """Analyze whether motivation is increasing, decreasing, or stable"""
        if len(signals) < 3:
            return "stable"
        
        # Sort by timestamp
        sorted_signals = sorted(signals, key=lambda s: s.timestamp)
        
        # Calculate trend using linear regression approach
        values = [s.value for s in sorted_signals]
        
        # Simple trend calculation
        first_half = values[:len(values)//2]
        second_half = values[len(values)//2:]
        
        if not first_half or not second_half:
            return "stable"
        
        first_avg = statistics.mean(first_half)
        second_avg = statistics.mean(second_half)
        
        difference = second_avg - first_avg
        
        if difference > 0.1:
            return "increasing"
        elif difference < -0.1:
            return "decreasing"
        else:
            return "stable"
    
    def _calculate_insight_confidence(self, signals: List[MotivationSignal]) -> float:
        """Calculate confidence in the motivation analysis"""
        if not signals:
            return 0.0
        
        # Base confidence on number of signals and their individual confidence
        signal_count_factor = min(len(signals) / 10.0, 1.0)
        avg_signal_confidence = statistics.mean([s.confidence for s in signals])
        
        return (signal_count_factor + avg_signal_confidence) / 2.0
    
    def _generate_motivation_recommendations(self, level: MotivationLevel, trend: str, 
                                           user_data: Dict) -> List[str]:
        """Generate personalized motivation recommendations"""
        recommendations = []
        
        if level == MotivationLevel.VERY_LOW:
            recommendations.extend([
                "Take a short break and return with easier topics",
                "Set smaller, achievable goals to rebuild confidence",
                "Review your 'why' - remember your interview goals",
                "Consider studying with a friend or joining a study group"
            ])
        
        elif level == MotivationLevel.LOW:
            recommendations.extend([
                "Focus on topics you enjoy or find easier",
                "Celebrate small wins - every question mastered counts",
                "Try shorter study sessions to reduce overwhelm",
                "Review your recent progress to see how far you've come"
            ])
        
        elif level == MotivationLevel.MODERATE:
            if trend == "decreasing":
                recommendations.extend([
                    "Mix challenging topics with easier ones",
                    "Set a specific goal for this week",
                    "Try a different study approach or time of day"
                ])
            else:
                recommendations.extend([
                    "You're on a good track - maintain consistency",
                    "Consider gradually increasing difficulty",
                    "Set a new milestone to work towards"
                ])
        
        elif level in [MotivationLevel.HIGH, MotivationLevel.VERY_HIGH]:
            recommendations.extend([
                "Great momentum! Consider tackling advanced topics",
                "Share your progress - you're doing amazing",
                "Set an ambitious but achievable goal",
                "Help others or teach concepts to reinforce learning"
            ])
        
        return recommendations[:3]  # Return top 3 recommendations
    
    def _identify_motivation_triggers(self, signals: List[MotivationSignal], 
                                    user_data: Dict) -> List[MotivationTrigger]:
        """Identify what motivates this user most"""
        triggers = []
        
        # Analyze signal patterns
        achievement_signals = [s for s in signals if "mastery" in s.context or "completion" in s.context]
        progress_signals = [s for s in signals if "improvement" in s.context or "progress" in s.context]
        streak_signals = [s for s in signals if s.signal_type == "streak_analysis"]
        
        # Determine primary triggers based on positive signals
        if achievement_signals and statistics.mean([s.value for s in achievement_signals]) > 0.2:
            triggers.append(MotivationTrigger.ACHIEVEMENT)
        
        if progress_signals and statistics.mean([s.value for s in progress_signals]) > 0.2:
            triggers.append(MotivationTrigger.PROGRESS)
        
        if streak_signals and statistics.mean([s.value for s in streak_signals]) > 0.2:
            triggers.append(MotivationTrigger.CHALLENGE)
        
        # Default triggers if none identified
        if not triggers:
            triggers = [MotivationTrigger.PROGRESS, MotivationTrigger.ACHIEVEMENT]
        
        return triggers
    
    def _is_optimal_time(self, session_time: str, user_preferences: Dict) -> bool:
        """Check if session time matches user's optimal study times"""
        optimal_times = user_preferences.get("optimal_study_times", [])
        if not optimal_times:
            return True  # No preference data available
        
        try:
            session_hour = datetime.datetime.fromisoformat(session_time).hour
            for time_str in optimal_times:
                optimal_hour = int(time_str.split(':')[0])
                if abs(session_hour - optimal_hour) <= 1:  # Within 1 hour
                    return True
        except (ValueError, AttributeError):
            pass
        
        return False
