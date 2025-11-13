"""
Smart Study Buddy - Backend Database Connector
Handles database operations and data synchronization with the backend.
"""

import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging
import os
import sys

# Database imports (adjust based on your backend database)
try:
    import pymongo
    from pymongo import MongoClient
    MONGODB_AVAILABLE = True
except ImportError:
    MONGODB_AVAILABLE = False
    logging.warning("MongoDB not available. Install pymongo for MongoDB support.")

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    POSTGRESQL_AVAILABLE = True
except ImportError:
    POSTGRESQL_AVAILABLE = False
    logging.warning("PostgreSQL not available. Install psycopg2 for PostgreSQL support.")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BackendConnector:
    """Handles database connections and data operations for Study Buddy"""
    
    def __init__(self, db_config: Dict):
        """
        Initialize database connector
        
        Args:
            db_config: Database configuration dictionary
        """
        self.db_config = db_config
        self.db_type = db_config.get("type", "mongodb")
        self.connection = None
        self.database = None
        
        # Connect to database
        self._connect()
    
    def _connect(self) -> None:
        """Establish database connection"""
        try:
            if self.db_type == "mongodb" and MONGODB_AVAILABLE:
                self._connect_mongodb()
            elif self.db_type == "postgresql" and POSTGRESQL_AVAILABLE:
                self._connect_postgresql()
            else:
                logger.warning(f"Database type {self.db_type} not supported or dependencies missing")
                
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
    
    def _connect_mongodb(self) -> None:
        """Connect to MongoDB"""
        connection_string = self.db_config.get("connection_string", "mongodb://localhost:27017/")
        database_name = self.db_config.get("database", "interview_prep")
        
        self.connection = MongoClient(connection_string)
        self.database = self.connection[database_name]
        
        # Test connection
        self.database.command("ping")
        logger.info("Connected to MongoDB successfully")
    
    def _connect_postgresql(self) -> None:
        """Connect to PostgreSQL"""
        self.connection = psycopg2.connect(
            host=self.db_config.get("host", "localhost"),
            port=self.db_config.get("port", 5432),
            database=self.db_config.get("database", "interview_prep"),
            user=self.db_config.get("user", "postgres"),
            password=self.db_config.get("password", "")
        )
        
        # Test connection
        with self.connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        logger.info("Connected to PostgreSQL successfully")
    
    def get_user_sessions(self, user_id: str, limit: int = 50, 
                         start_date: Optional[datetime] = None) -> List[Dict]:
        """
        Fetch user sessions from database
        
        Args:
            user_id: User identifier
            limit: Maximum number of sessions to fetch
            start_date: Optional start date filter
        
        Returns:
            List of session dictionaries
        """
        try:
            if self.db_type == "mongodb":
                return self._get_mongodb_sessions(user_id, limit, start_date)
            elif self.db_type == "postgresql":
                return self._get_postgresql_sessions(user_id, limit, start_date)
            else:
                return []
                
        except Exception as e:
            logger.error(f"Error fetching user sessions: {e}")
            return []
    
    def _get_mongodb_sessions(self, user_id: str, limit: int, 
                             start_date: Optional[datetime]) -> List[Dict]:
        """Fetch sessions from MongoDB"""
        collection = self.database["sessions"]
        
        # Build query
        query = {"userId": user_id}
        if start_date:
            query["createdAt"] = {"$gte": start_date}
        
        # Fetch sessions
        cursor = collection.find(query).sort("createdAt", -1).limit(limit)
        sessions = list(cursor)
        
        # Convert ObjectId to string for JSON serialization
        for session in sessions:
            session["_id"] = str(session["_id"])
        
        return sessions
    
    def _get_postgresql_sessions(self, user_id: str, limit: int, 
                                start_date: Optional[datetime]) -> List[Dict]:
        """Fetch sessions from PostgreSQL"""
        with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
            query = """
                SELECT * FROM sessions 
                WHERE user_id = %s
            """
            params = [user_id]
            
            if start_date:
                query += " AND created_at >= %s"
                params.append(start_date)
            
            query += " ORDER BY created_at DESC LIMIT %s"
            params.append(limit)
            
            cursor.execute(query, params)
            sessions = [dict(row) for row in cursor.fetchall()]
        
        return sessions
    
    def get_user_progress(self, user_id: str) -> Dict:
        """
        Fetch user progress data
        
        Args:
            user_id: User identifier
        
        Returns:
            User progress dictionary
        """
        try:
            if self.db_type == "mongodb":
                return self._get_mongodb_progress(user_id)
            elif self.db_type == "postgresql":
                return self._get_postgresql_progress(user_id)
            else:
                return {}
                
        except Exception as e:
            logger.error(f"Error fetching user progress: {e}")
            return {}
    
    def _get_mongodb_progress(self, user_id: str) -> Dict:
        """Fetch progress from MongoDB"""
        # Aggregate progress from sessions
        collection = self.database["sessions"]
        
        pipeline = [
            {"$match": {"userId": user_id}},
            {"$group": {
                "_id": "$userId",
                "total_sessions": {"$sum": 1},
                "total_questions": {"$sum": {"$size": "$questions"}},
                "total_correct": {"$sum": {
                    "$size": {
                        "$filter": {
                            "input": "$questions",
                            "cond": {"$eq": ["$$this.isCorrect", True]}
                        }
                    }
                }},
                "topics_practiced": {"$addToSet": "$topics"},
                "last_session": {"$max": "$createdAt"},
                "avg_session_duration": {"$avg": "$duration"}
            }}
        ]
        
        result = list(collection.aggregate(pipeline))
        
        if result:
            progress = result[0]
            progress["accuracy"] = progress["total_correct"] / max(progress["total_questions"], 1)
            progress["topics_practiced"] = len(progress["topics_practiced"][0]) if progress["topics_practiced"] else 0
            return progress
        
        return {}
    
    def _get_postgresql_progress(self, user_id: str) -> Dict:
        """Fetch progress from PostgreSQL"""
        with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
            query = """
                SELECT 
                    COUNT(*) as total_sessions,
                    SUM(questions_attempted) as total_questions,
                    SUM(questions_correct) as total_correct,
                    AVG(accuracy) as avg_accuracy,
                    MAX(created_at) as last_session,
                    AVG(duration_minutes) as avg_session_duration
                FROM sessions 
                WHERE user_id = %s
            """
            
            cursor.execute(query, [user_id])
            progress = dict(cursor.fetchone() or {})
        
        return progress
    
    def save_behavior_analysis(self, user_id: str, analysis: Dict) -> bool:
        """
        Save behavior analysis results to database
        
        Args:
            user_id: User identifier
            analysis: Analysis results dictionary
        
        Returns:
            Success status
        """
        try:
            analysis_data = {
                "user_id": user_id,
                "analysis": analysis,
                "created_at": datetime.now(),
                "analysis_version": "1.0"
            }
            
            if self.db_type == "mongodb":
                collection = self.database["behavior_analysis"]
                collection.insert_one(analysis_data)
                
            elif self.db_type == "postgresql":
                with self.connection.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO behavior_analysis (user_id, analysis_data, created_at)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (user_id) 
                        DO UPDATE SET analysis_data = %s, created_at = %s
                    """, [user_id, json.dumps(analysis), datetime.now(), 
                         json.dumps(analysis), datetime.now()])
                    self.connection.commit()
            
            logger.info(f"Saved behavior analysis for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving behavior analysis: {e}")
            return False
    
    def get_behavior_analysis(self, user_id: str) -> Optional[Dict]:
        """
        Retrieve latest behavior analysis for user
        
        Args:
            user_id: User identifier
        
        Returns:
            Latest behavior analysis or None
        """
        try:
            if self.db_type == "mongodb":
                collection = self.database["behavior_analysis"]
                result = collection.find_one(
                    {"user_id": user_id}, 
                    sort=[("created_at", -1)]
                )
                return result["analysis"] if result else None
                
            elif self.db_type == "postgresql":
                with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("""
                        SELECT analysis_data FROM behavior_analysis 
                        WHERE user_id = %s 
                        ORDER BY created_at DESC 
                        LIMIT 1
                    """, [user_id])
                    
                    result = cursor.fetchone()
                    return result["analysis_data"] if result else None
            
            return None
            
        except Exception as e:
            logger.error(f"Error retrieving behavior analysis: {e}")
            return None
    
    def save_reminders(self, user_id: str, reminders: List[Dict]) -> bool:
        """
        Save generated reminders to database
        
        Args:
            user_id: User identifier
            reminders: List of reminder dictionaries
        
        Returns:
            Success status
        """
        try:
            for reminder in reminders:
                reminder_data = {
                    "user_id": user_id,
                    "reminder_type": reminder.get("type"),
                    "title": reminder.get("title"),
                    "message": reminder.get("message"),
                    "scheduled_time": reminder.get("scheduled_time"),
                    "urgency": reminder.get("urgency"),
                    "created_at": datetime.now(),
                    "sent": False,
                    "dismissed": False
                }
                
                if self.db_type == "mongodb":
                    collection = self.database["reminders"]
                    collection.insert_one(reminder_data)
                    
                elif self.db_type == "postgresql":
                    with self.connection.cursor() as cursor:
                        cursor.execute("""
                            INSERT INTO reminders 
                            (user_id, reminder_type, title, message, scheduled_time, urgency, created_at)
                            VALUES (%s, %s, %s, %s, %s, %s, %s)
                        """, [
                            user_id, reminder_data["reminder_type"], reminder_data["title"],
                            reminder_data["message"], reminder_data["scheduled_time"],
                            reminder_data["urgency"], reminder_data["created_at"]
                        ])
                    self.connection.commit()
            
            logger.info(f"Saved {len(reminders)} reminders for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving reminders: {e}")
            return False
    
    def get_pending_reminders(self, user_id: str) -> List[Dict]:
        """
        Get pending reminders for user
        
        Args:
            user_id: User identifier
        
        Returns:
            List of pending reminders
        """
        try:
            current_time = datetime.now()
            
            if self.db_type == "mongodb":
                collection = self.database["reminders"]
                cursor = collection.find({
                    "user_id": user_id,
                    "sent": False,
                    "dismissed": False,
                    "scheduled_time": {"$lte": current_time}
                }).sort("scheduled_time", 1)
                
                return list(cursor)
                
            elif self.db_type == "postgresql":
                with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute("""
                        SELECT * FROM reminders 
                        WHERE user_id = %s 
                        AND sent = FALSE 
                        AND dismissed = FALSE 
                        AND scheduled_time <= %s
                        ORDER BY scheduled_time ASC
                    """, [user_id, current_time])
                    
                    return [dict(row) for row in cursor.fetchall()]
            
            return []
            
        except Exception as e:
            logger.error(f"Error fetching pending reminders: {e}")
            return []
    
    def mark_reminder_sent(self, reminder_id: str) -> bool:
        """
        Mark reminder as sent
        
        Args:
            reminder_id: Reminder identifier
        
        Returns:
            Success status
        """
        try:
            if self.db_type == "mongodb":
                collection = self.database["reminders"]
                result = collection.update_one(
                    {"_id": reminder_id},
                    {"$set": {"sent": True, "sent_at": datetime.now()}}
                )
                return result.modified_count > 0
                
            elif self.db_type == "postgresql":
                with self.connection.cursor() as cursor:
                    cursor.execute("""
                        UPDATE reminders 
                        SET sent = TRUE, sent_at = %s 
                        WHERE id = %s
                    """, [datetime.now(), reminder_id])
                    self.connection.commit()
                    return cursor.rowcount > 0
            
            return False
            
        except Exception as e:
            logger.error(f"Error marking reminder as sent: {e}")
            return False
    
    def get_user_streak(self, user_id: str) -> Dict:
        """
        Calculate user's current study streak
        
        Args:
            user_id: User identifier
        
        Returns:
            Streak information
        """
        try:
            sessions = self.get_user_sessions(user_id, limit=100)
            
            if not sessions:
                return {"current_streak": 0, "longest_streak": 0, "last_session": None}
            
            # Sort sessions by date
            sessions.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
            
            # Calculate current streak
            current_streak = 0
            session_dates = set()
            
            for session in sessions:
                session_date = datetime.fromisoformat(session.get("createdAt", "")).date()
                session_dates.add(session_date)
            
            # Check consecutive days
            sorted_dates = sorted(session_dates, reverse=True)
            current_date = datetime.now().date()
            
            for i, session_date in enumerate(sorted_dates):
                expected_date = current_date - timedelta(days=i)
                if session_date == expected_date:
                    current_streak += 1
                else:
                    break
            
            # Calculate longest streak (simplified)
            longest_streak = current_streak  # In production, implement proper longest streak calculation
            
            return {
                "current_streak": current_streak,
                "longest_streak": longest_streak,
                "last_session": sessions[0].get("createdAt") if sessions else None,
                "total_session_days": len(session_dates)
            }
            
        except Exception as e:
            logger.error(f"Error calculating user streak: {e}")
            return {"current_streak": 0, "longest_streak": 0, "last_session": None}
    
    def close_connection(self) -> None:
        """Close database connection"""
        try:
            if self.connection:
                self.connection.close()
                logger.info("Database connection closed")
        except Exception as e:
            logger.error(f"Error closing database connection: {e}")

class DataSynchronizer:
    """Handles data synchronization between AI models and backend"""
    
    def __init__(self, backend_connector: BackendConnector):
        """Initialize with backend connector"""
        self.backend = backend_connector
        
    async def sync_user_data(self, user_id: str) -> Dict:
        """
        Synchronize and prepare user data for AI analysis
        
        Args:
            user_id: User identifier
        
        Returns:
            Synchronized user data
        """
        try:
            # Fetch all user data
            sessions = self.backend.get_user_sessions(user_id)
            progress = self.backend.get_user_progress(user_id)
            streak_info = self.backend.get_user_streak(user_id)
            
            # Prepare synchronized data structure
            user_data = {
                "user_id": user_id,
                "sessions": sessions,
                "progress": progress,
                "streak_data": streak_info,
                "preferences": {},  # Could be fetched from user preferences table
                "last_sync": datetime.now().isoformat()
            }
            
            return user_data
            
        except Exception as e:
            logger.error(f"Error synchronizing user data: {e}")
            return {"user_id": user_id, "sessions": [], "progress": {}, "streak_data": {}}
    
    async def update_ai_insights(self, user_id: str, insights: Dict) -> bool:
        """
        Update AI-generated insights in the backend
        
        Args:
            user_id: User identifier
            insights: AI-generated insights
        
        Returns:
            Success status
        """
        try:
            # Save behavior analysis
            if "behavior_analysis" in insights:
                self.backend.save_behavior_analysis(user_id, insights["behavior_analysis"])
            
            # Save reminders
            if "study_reminders" in insights:
                self.backend.save_reminders(user_id, insights["study_reminders"])
            
            logger.info(f"Updated AI insights for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating AI insights: {e}")
            return False

# Factory function for easy initialization
def create_backend_connector(config: Dict) -> BackendConnector:
    """
    Create backend connector based on configuration
    
    Args:
        config: Database configuration
    
    Returns:
        Configured BackendConnector instance
    """
    return BackendConnector(config)

# Example configuration templates
MONGODB_CONFIG = {
    "type": "mongodb",
    "connection_string": "mongodb://localhost:27017/",
    "database": "interview_prep"
}

POSTGRESQL_CONFIG = {
    "type": "postgresql",
    "host": "localhost",
    "port": 5432,
    "database": "interview_prep",
    "user": "postgres",
    "password": "password"
}
