"""
Smart Study Buddy - Reminder Scheduling Engine
Implements intelligent spaced repetition and personalized reminder scheduling.
"""

import json
import datetime
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import math

class ReminderType(Enum):
    SPACED_REPETITION = "spaced_repetition"
    STREAK_MAINTENANCE = "streak_maintenance"
    PERFORMANCE_BASED = "performance_based"
    MOTIVATION_BOOST = "motivation_boost"

class ReminderUrgency(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class StudyItem:
    """Represents an item that needs review (question, concept, topic)"""
    item_id: str
    item_type: str  # question, concept, topic
    content: str
    difficulty_level: str
    last_reviewed: datetime.datetime
    review_count: int
    success_rate: float
    next_review_due: datetime.datetime
    
class ReminderScheduler:
    """Intelligent reminder scheduling system with spaced repetition"""
    
    def __init__(self, config_path: str = None):
        """Initialize the reminder scheduler"""
        self.config = self._load_config(config_path)
        self.reminder_templates = self._load_reminder_templates()
        
    def _load_config(self, config_path: str) -> Dict:
        """Load configuration from JSON file"""
        if config_path is None:
            config_path = "../config/study_buddy_config.json"
        
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return self._get_default_config()
    
    def _load_reminder_templates(self) -> Dict:
        """Load reminder templates from data file"""
        try:
            with open("../data/study_reminders.json", 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {}
    
    def _get_default_config(self) -> Dict:
        """Return default configuration"""
        return {
            "reminder_system": {
                "spaced_repetition": {
                    "initial_interval_hours": 24,
                    "multiplier_on_success": 2.5,
                    "reduction_on_failure": 0.5,
                    "maximum_interval_days": 30,
                    "minimum_interval_hours": 4
                },
                "study_streak": {
                    "reminder_before_break_hours": 20,
                    "motivation_boost_frequency": 3,
                    "streak_celebration_milestones": [3, 7, 14, 30, 60, 100]
                }
            }
        }
    
    def calculate_next_review(self, study_item: StudyItem, performance_score: float) -> datetime.datetime:
        """
        Calculate when an item should be reviewed next using spaced repetition
        
        Args:
            study_item: The item that was just reviewed
            performance_score: How well the user performed (0.0 to 1.0)
        
        Returns:
            Next review datetime
        """
        config = self.config["reminder_system"]["spaced_repetition"]
        
        # Base interval calculation
        if study_item.review_count == 0:
            # First review
            interval_hours = config["initial_interval_hours"]
        else:
            # Calculate interval based on previous performance
            base_interval = config["initial_interval_hours"] * (config["multiplier_on_success"] ** (study_item.review_count - 1))
            
            # Adjust based on performance
            if performance_score >= 0.8:
                # Good performance - increase interval
                interval_hours = base_interval * config["multiplier_on_success"]
            elif performance_score >= 0.6:
                # Moderate performance - maintain interval
                interval_hours = base_interval
            else:
                # Poor performance - decrease interval
                interval_hours = base_interval * config["reduction_on_failure"]
        
        # Apply difficulty adjustment
        difficulty_multiplier = self._get_difficulty_multiplier(study_item.difficulty_level)
        interval_hours *= difficulty_multiplier
        
        # Apply bounds
        interval_hours = max(interval_hours, config["minimum_interval_hours"])
        interval_hours = min(interval_hours, config["maximum_interval_days"] * 24)
        
        # Calculate next review time
        next_review = datetime.datetime.now() + datetime.timedelta(hours=interval_hours)
        
        return next_review
    
    def _get_difficulty_multiplier(self, difficulty: str) -> float:
        """Get multiplier based on difficulty level"""
        multipliers = {
            "easy": 1.5,      # Easier items can wait longer
            "medium": 1.0,    # Standard interval
            "hard": 0.7       # Harder items need more frequent review
        }
        return multipliers.get(difficulty, 1.0)
    
    def generate_study_reminders(self, user_id: str, study_items: List[StudyItem], 
                               user_preferences: Dict) -> List[Dict]:
        """
        Generate personalized study reminders for a user
        
        Args:
            user_id: User identifier
            study_items: List of items the user is studying
            user_preferences: User's study preferences and patterns
        
        Returns:
            List of reminder objects
        """
        reminders = []
        now = datetime.datetime.now()
        
        # Check for due reviews (spaced repetition)
        due_items = [item for item in study_items if item.next_review_due <= now]
        if due_items:
            reminders.extend(self._create_spaced_repetition_reminders(due_items, user_preferences))
        
        # Check for upcoming reviews
        upcoming_items = [item for item in study_items 
                         if now < item.next_review_due <= now + datetime.timedelta(hours=4)]
        if upcoming_items:
            reminders.extend(self._create_upcoming_review_reminders(upcoming_items, user_preferences))
        
        # Check streak status
        streak_reminder = self._check_streak_status(user_id, user_preferences)
        if streak_reminder:
            reminders.append(streak_reminder)
        
        # Performance-based reminders
        performance_reminders = self._generate_performance_reminders(study_items, user_preferences)
        reminders.extend(performance_reminders)
        
        return reminders
    
    def _create_spaced_repetition_reminders(self, due_items: List[StudyItem], 
                                          user_preferences: Dict) -> List[Dict]:
        """Create reminders for items due for review"""
        reminders = []
        
        # Group items by urgency
        overdue_items = [item for item in due_items 
                        if item.next_review_due < datetime.datetime.now() - datetime.timedelta(hours=24)]
        recent_due = [item for item in due_items if item not in overdue_items]
        
        # Create overdue reminder (high urgency)
        if overdue_items:
            reminder = {
                "type": ReminderType.SPACED_REPETITION.value,
                "urgency": ReminderUrgency.HIGH.value,
                "title": "Overdue Reviews",
                "message": self._get_reminder_message("overdue_review", len(overdue_items), user_preferences),
                "items": [item.item_id for item in overdue_items],
                "scheduled_time": datetime.datetime.now(),
                "action_required": True
            }
            reminders.append(reminder)
        
        # Create regular due reminder (medium urgency)
        if recent_due:
            reminder = {
                "type": ReminderType.SPACED_REPETITION.value,
                "urgency": ReminderUrgency.MEDIUM.value,
                "title": "Review Time",
                "message": self._get_reminder_message("due_review", len(recent_due), user_preferences),
                "items": [item.item_id for item in recent_due],
                "scheduled_time": datetime.datetime.now(),
                "action_required": True
            }
            reminders.append(reminder)
        
        return reminders
    
    def _create_upcoming_review_reminders(self, upcoming_items: List[StudyItem], 
                                        user_preferences: Dict) -> List[Dict]:
        """Create gentle reminders for upcoming reviews"""
        if not upcoming_items:
            return []
        
        reminder = {
            "type": ReminderType.SPACED_REPETITION.value,
            "urgency": ReminderUrgency.LOW.value,
            "title": "Upcoming Reviews",
            "message": self._get_reminder_message("upcoming_review", len(upcoming_items), user_preferences),
            "items": [item.item_id for item in upcoming_items],
            "scheduled_time": datetime.datetime.now() + datetime.timedelta(hours=1),
            "action_required": False
        }
        
        return [reminder]
    
    def _check_streak_status(self, user_id: str, user_preferences: Dict) -> Optional[Dict]:
        """Check if streak needs attention"""
        # This would typically query the database for user's streak info
        # For now, we'll simulate based on last activity
        
        last_activity = user_preferences.get("last_activity")
        if not last_activity:
            return None
        
        # Convert string to datetime if needed
        if isinstance(last_activity, str):
            last_activity = datetime.datetime.fromisoformat(last_activity)
        
        hours_since_activity = (datetime.datetime.now() - last_activity).total_seconds() / 3600
        current_streak = user_preferences.get("current_streak", 0)
        
        config = self.config["reminder_system"]["study_streak"]
        
        # Check if streak is at risk
        if hours_since_activity >= config["reminder_before_break_hours"]:
            return {
                "type": ReminderType.STREAK_MAINTENANCE.value,
                "urgency": ReminderUrgency.HIGH.value,
                "title": "Streak at Risk!",
                "message": self._get_reminder_message("streak_at_risk", current_streak, user_preferences),
                "scheduled_time": datetime.datetime.now(),
                "action_required": True,
                "streak_days": current_streak
            }
        
        # Check for milestone celebration
        if current_streak in config["streak_celebration_milestones"]:
            return {
                "type": ReminderType.STREAK_MAINTENANCE.value,
                "urgency": ReminderUrgency.LOW.value,
                "title": "Streak Milestone!",
                "message": self._get_reminder_message("streak_celebration", current_streak, user_preferences),
                "scheduled_time": datetime.datetime.now(),
                "action_required": False,
                "streak_days": current_streak
            }
        
        return None
    
    def _generate_performance_reminders(self, study_items: List[StudyItem], 
                                      user_preferences: Dict) -> List[Dict]:
        """Generate reminders based on performance patterns"""
        reminders = []
        
        # Analyze weak areas
        weak_items = [item for item in study_items if item.success_rate < 0.6]
        if len(weak_items) >= 3:
            topics = list(set(item.content.split()[0] for item in weak_items))  # Extract topics
            reminder = {
                "type": ReminderType.PERFORMANCE_BASED.value,
                "urgency": ReminderUrgency.MEDIUM.value,
                "title": "Focus Areas Identified",
                "message": self._get_reminder_message("weak_areas", topics[:2], user_preferences),
                "items": [item.item_id for item in weak_items[:5]],
                "scheduled_time": datetime.datetime.now() + datetime.timedelta(hours=2),
                "action_required": False
            }
            reminders.append(reminder)
        
        # Analyze strong areas for advancement
        strong_items = [item for item in study_items if item.success_rate > 0.85]
        if len(strong_items) >= 5:
            reminder = {
                "type": ReminderType.PERFORMANCE_BASED.value,
                "urgency": ReminderUrgency.LOW.value,
                "title": "Ready for Advanced Topics",
                "message": self._get_reminder_message("advancement_ready", len(strong_items), user_preferences),
                "scheduled_time": datetime.datetime.now() + datetime.timedelta(hours=6),
                "action_required": False
            }
            reminders.append(reminder)
        
        return reminders
    
    def _get_reminder_message(self, message_type: str, context_data, user_preferences: Dict) -> str:
        """Get personalized reminder message based on type and context"""
        templates = self.reminder_templates.get("reminder_templates", {})
        
        # Get user's preferred time and tone
        time_of_day = self._get_current_time_period()
        user_tone = user_preferences.get("preferred_tone", "encouraging")
        
        # Select appropriate message template
        if message_type == "overdue_review":
            messages = templates.get("spaced_repetition", {}).get("long_term_review", {}).get("messages", [])
            message = messages[0] if messages else "Time for your overdue reviews!"
            return message.replace("{topic}", f"{context_data} items")
        
        elif message_type == "due_review":
            messages = templates.get("spaced_repetition", {}).get("short_term_review", {}).get("messages", [])
            message = messages[0] if messages else "Ready for your review session!"
            return message.replace("{topic}", f"{context_data} concepts")
        
        elif message_type == "upcoming_review":
            messages = templates.get("spaced_repetition", {}).get("immediate_review", {}).get("messages", [])
            message = messages[0] if messages else "Reviews coming up soon!"
            return message
        
        elif message_type == "streak_at_risk":
            messages = templates.get("streak_maintenance", {}).get("streak_at_risk", {}).get("messages", [])
            message = messages[0] if messages else "Your streak needs attention!"
            return message.replace("{streak_days}", str(context_data))
        
        elif message_type == "streak_celebration":
            messages = templates.get("streak_maintenance", {}).get("streak_celebration", {}).get("messages", [])
            message = messages[0] if messages else "Congratulations on your streak!"
            return message.replace("{streak_days}", str(context_data))
        
        elif message_type == "weak_areas":
            messages = templates.get("performance_based", {}).get("struggling_area", {}).get("messages", [])
            message = messages[0] if messages else "Let's work on challenging areas!"
            topics_str = " and ".join(context_data) if isinstance(context_data, list) else str(context_data)
            return message.replace("{topic}", topics_str)
        
        elif message_type == "advancement_ready":
            messages = templates.get("performance_based", {}).get("strength_reinforcement", {}).get("messages", [])
            message = messages[0] if messages else "Ready for more challenges!"
            return message.replace("{topic}", "advanced concepts")
        
        return "Time for your next study session!"
    
    def _get_current_time_period(self) -> str:
        """Get current time period for contextual messaging"""
        hour = datetime.datetime.now().hour
        
        if 6 <= hour < 12:
            return "morning"
        elif 12 <= hour < 17:
            return "afternoon"
        elif 17 <= hour < 22:
            return "evening"
        else:
            return "night"
    
    def optimize_reminder_timing(self, user_preferences: Dict, reminder: Dict) -> datetime.datetime:
        """
        Optimize when to send a reminder based on user preferences
        
        Args:
            user_preferences: User's study patterns and preferences
            reminder: The reminder to schedule
        
        Returns:
            Optimized datetime for sending the reminder
        """
        # Get user's optimal study times
        optimal_times = user_preferences.get("optimal_study_times", ["09:00", "14:00", "20:00"])
        current_time = datetime.datetime.now()
        
        # If it's urgent, send immediately during reasonable hours
        if reminder["urgency"] == ReminderUrgency.HIGH.value:
            if 7 <= current_time.hour <= 22:  # Reasonable hours
                return current_time
            else:
                # Schedule for next morning
                next_morning = current_time.replace(hour=9, minute=0, second=0, microsecond=0)
                if next_morning <= current_time:
                    next_morning += datetime.timedelta(days=1)
                return next_morning
        
        # For non-urgent reminders, find next optimal time
        for time_str in optimal_times:
            hour, minute = map(int, time_str.split(':'))
            target_time = current_time.replace(hour=hour, minute=minute, second=0, microsecond=0)
            
            # If target time is in the future today, use it
            if target_time > current_time:
                return target_time
        
        # If all optimal times have passed today, use first optimal time tomorrow
        hour, minute = map(int, optimal_times[0].split(':'))
        tomorrow = current_time + datetime.timedelta(days=1)
        return tomorrow.replace(hour=hour, minute=minute, second=0, microsecond=0)
