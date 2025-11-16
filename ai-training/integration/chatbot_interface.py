"""
Smart Study Buddy - Chatbot Interface
Provides the main interface for chatbot interactions and response generation.
"""

import json
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Any
import logging
import re
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StudyBuddyChatbot:
    """Main chatbot interface for Smart Study Buddy"""
    
    def __init__(self, api_integration, backend_connector=None):
        """
        Initialize the chatbot
        
        Args:
            api_integration: StudyBuddyAPI instance
            backend_connector: Optional backend connector for data persistence
        """
        self.api = api_integration
        self.backend = backend_connector
        self.conversation_history = {}
        self.user_contexts = {}
        
        # Load response templates
        self._load_response_templates()
        
    def _load_response_templates(self) -> None:
        """Load chatbot response templates"""
        try:
            # Load from config and data files
            with open("../study-buddy/config/study_buddy_config.json", 'r') as f:
                config = json.load(f)
                self.response_templates = config.get("study_buddy", {}).get("response_categories", {})
            
            with open("../study-buddy/data/motivational_responses.json", 'r') as f:
                motivational_data = json.load(f)
                self.motivational_responses = motivational_data.get("motivational_responses", {})
                
        except FileNotFoundError as e:
            logger.warning(f"Could not load response templates: {e}")
            self.response_templates = {}
            self.motivational_responses = {}
    
    async def process_message(self, user_id: str, message: str, context: Dict = None) -> Dict:
        """
        Process user message and generate appropriate response
        
        Args:
            user_id: User identifier
            message: User's message
            context: Optional context information
        
        Returns:
            Response dictionary with message and metadata
        """
        try:
            # Update conversation history
            self._update_conversation_history(user_id, message, "user")
            
            # Analyze message intent
            intent = self._analyze_message_intent(message)
            
            # Get user data for personalization
            user_data = await self._get_user_context(user_id)
            
            # Generate response based on intent
            response = await self._generate_response(user_id, message, intent, user_data, context)
            
            # Update conversation history with response
            self._update_conversation_history(user_id, response["message"], "buddy")
            
            # Log interaction for learning
            self._log_interaction(user_id, message, response, intent)
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return self._get_fallback_response()
    
    def _analyze_message_intent(self, message: str) -> Dict:
        """
        Analyze user message to determine intent
        
        Args:
            message: User's message
        
        Returns:
            Intent analysis dictionary
        """
        message_lower = message.lower().strip()
        
        # Define intent patterns
        intent_patterns = {
            "greeting": [
                r"^(hi|hello|hey|good morning|good afternoon|good evening)",
                r"^(what's up|how are you|how's it going)"
            ],
            "help_request": [
                r"(help|assist|support|stuck|confused|don't understand)",
                r"(how do i|can you help|need help|explain)"
            ],
            "progress_inquiry": [
                r"(how am i doing|my progress|how much have i|statistics|stats)",
                r"(performance|improvement|better|worse)"
            ],
            "motivation_needed": [
                r"(tired|exhausted|give up|quit|frustrated|difficult|hard)",
                r"(motivation|encourage|boost|support|cheer)"
            ],
            "study_planning": [
                r"(what should i study|recommend|suggest|next topic|plan)",
                r"(schedule|when should|optimal time|best time)"
            ],
            "achievement_sharing": [
                r"(completed|finished|solved|mastered|got it right|success)",
                r"(achievement|milestone|streak|progress)"
            ],
            "concept_explanation": [
                r"(explain|what is|how does|definition|meaning)",
                r"(algorithm|data structure|concept|theory)"
            ],
            "difficulty_feedback": [
                r"(too easy|too hard|too difficult|challenging|simple)",
                r"(increase difficulty|decrease difficulty|adjust level)"
            ],
            "time_management": [
                r"(time|duration|how long|session length|break)",
                r"(schedule|calendar|reminder|when to study)"
            ],
            "farewell": [
                r"(bye|goodbye|see you|talk later|done for today)",
                r"(thanks|thank you|appreciate|helpful)"
            ]
        }
        
        # Check for intent matches
        detected_intents = []
        for intent, patterns in intent_patterns.items():
            for pattern in patterns:
                if re.search(pattern, message_lower):
                    detected_intents.append(intent)
                    break
        
        # Determine primary intent
        primary_intent = detected_intents[0] if detected_intents else "general_chat"
        
        # Extract entities (topics, numbers, etc.)
        entities = self._extract_entities(message)
        
        return {
            "primary_intent": primary_intent,
            "all_intents": detected_intents,
            "entities": entities,
            "confidence": 0.8 if detected_intents else 0.3
        }
    
    def _extract_entities(self, message: str) -> Dict:
        """Extract entities from user message"""
        entities = {}
        
        # Extract topics
        topics = [
            "arrays", "strings", "linked lists", "trees", "graphs", "sorting",
            "searching", "dynamic programming", "recursion", "backtracking",
            "greedy", "hash tables", "stacks", "queues", "heaps"
        ]
        
        found_topics = []
        for topic in topics:
            if topic.lower() in message.lower():
                found_topics.append(topic)
        
        if found_topics:
            entities["topics"] = found_topics
        
        # Extract numbers (for difficulty, time, etc.)
        numbers = re.findall(r'\b\d+\b', message)
        if numbers:
            entities["numbers"] = [int(n) for n in numbers]
        
        # Extract difficulty levels
        difficulties = ["easy", "medium", "hard", "beginner", "intermediate", "advanced"]
        found_difficulties = []
        for diff in difficulties:
            if diff.lower() in message.lower():
                found_difficulties.append(diff)
        
        if found_difficulties:
            entities["difficulty"] = found_difficulties
        
        return entities
    
    async def _get_user_context(self, user_id: str) -> Dict:
        """Get or update user context for personalization"""
        if user_id not in self.user_contexts:
            # Fetch fresh user data
            if self.backend:
                from .backend_connector import DataSynchronizer
                synchronizer = DataSynchronizer(self.backend)
                user_data = await synchronizer.sync_user_data(user_id)
            else:
                user_data = {"user_id": user_id, "sessions": [], "progress": {}}
            
            self.user_contexts[user_id] = user_data
        
        return self.user_contexts[user_id]
    
    async def _generate_response(self, user_id: str, message: str, intent: Dict, 
                               user_data: Dict, context: Dict = None) -> Dict:
        """
        Generate appropriate response based on intent and user data
        
        Args:
            user_id: User identifier
            message: Original user message
            intent: Analyzed intent
            user_data: User context data
            context: Additional context
        
        Returns:
            Response dictionary
        """
        primary_intent = intent["primary_intent"]
        entities = intent["entities"]
        
        # Generate response based on intent
        if primary_intent == "greeting":
            response_text = await self._handle_greeting(user_data)
            
        elif primary_intent == "help_request":
            response_text = await self._handle_help_request(message, entities, user_data)
            
        elif primary_intent == "progress_inquiry":
            response_text = await self._handle_progress_inquiry(user_data)
            
        elif primary_intent == "motivation_needed":
            response_text = await self._handle_motivation_request(user_data)
            
        elif primary_intent == "study_planning":
            response_text = await self._handle_study_planning(entities, user_data)
            
        elif primary_intent == "achievement_sharing":
            response_text = await self._handle_achievement_sharing(message, user_data)
            
        elif primary_intent == "concept_explanation":
            response_text = await self._handle_concept_explanation(entities)
            
        elif primary_intent == "difficulty_feedback":
            response_text = await self._handle_difficulty_feedback(message, entities, user_data)
            
        elif primary_intent == "time_management":
            response_text = await self._handle_time_management(entities, user_data)
            
        elif primary_intent == "farewell":
            response_text = await self._handle_farewell(user_data)
            
        else:  # general_chat
            response_text = await self._handle_general_chat(message, user_data)
        
        # Add personalization and context
        response_text = self._personalize_response(response_text, user_data)
        
        # Generate response metadata
        metadata = {
            "intent": primary_intent,
            "confidence": intent["confidence"],
            "personalized": True,
            "timestamp": datetime.now().isoformat(),
            "response_type": "text"
        }
        
        # Add action items if applicable
        actions = self._generate_action_items(primary_intent, entities, user_data)
        if actions:
            metadata["actions"] = actions
        
        return {
            "message": response_text,
            "metadata": metadata
        }
    
    async def _handle_greeting(self, user_data: Dict) -> str:
        """Handle greeting messages"""
        time_of_day = self._get_time_of_day()
        
        greetings = self.response_templates.get("greeting", {}).get(time_of_day, [
            f"Good {time_of_day}! Ready to tackle some interview prep?",
            f"{time_of_day.title()}! Let's make today productive!",
            f"Hey there! Perfect {time_of_day} for learning!"
        ])
        
        base_greeting = random.choice(greetings)
        
        # Add personalization based on user data
        sessions = user_data.get("sessions", [])
        if sessions:
            last_session = sessions[0] if sessions else None
            if last_session:
                last_date = datetime.fromisoformat(last_session.get("createdAt", "")).date()
                today = datetime.now().date()
                
                if last_date == today:
                    base_greeting += " I see you're keeping up your daily practice! 🔥"
                elif (today - last_date).days == 1:
                    base_greeting += " Welcome back! Ready to continue your streak?"
                elif (today - last_date).days > 3:
                    base_greeting += " Great to see you again! Let's get back into the groove."
        
        return base_greeting
    
    async def _handle_help_request(self, message: str, entities: Dict, user_data: Dict) -> str:
        """Handle help and assistance requests"""
        topics = entities.get("topics", [])
        
        if topics:
            topic = topics[0]
            return f"I'd be happy to help with {topic}! What specific aspect are you struggling with? I can break it down into smaller steps or suggest some practice problems to get you started."
        
        # General help
        help_options = [
            "I'm here to help! I can assist with:\n• Study recommendations based on your progress\n• Explaining concepts step by step\n• Motivation and encouragement\n• Planning your study schedule\n\nWhat would you like help with?",
            "No worries, we all need help sometimes! Tell me what's challenging you and I'll do my best to guide you through it. Remember, every expert was once a beginner! 💪",
            "I'm your study buddy! Whether it's understanding a concept, staying motivated, or planning your next steps, I'm here for you. What's on your mind?"
        ]
        
        return random.choice(help_options)
    
    async def _handle_progress_inquiry(self, user_data: Dict) -> str:
        """Handle progress and performance inquiries"""
        sessions = user_data.get("sessions", [])
        progress = user_data.get("progress", {})
        
        if not sessions:
            return "You're just getting started! Complete a few study sessions and I'll be able to show you some amazing insights about your progress. Every journey begins with a single step! 🌟"
        
        # Generate progress summary
        total_sessions = len(sessions)
        total_questions = progress.get("total_questions", 0)
        accuracy = progress.get("accuracy", 0)
        
        progress_text = f"Here's your progress snapshot:\n\n"
        progress_text += f"📚 Sessions completed: {total_sessions}\n"
        progress_text += f"❓ Questions practiced: {total_questions}\n"
        progress_text += f"🎯 Overall accuracy: {accuracy:.1%}\n"
        
        # Add motivational context
        if accuracy >= 0.8:
            progress_text += f"\nExcellent work! Your {accuracy:.1%} accuracy shows you're really mastering the concepts! 🏆"
        elif accuracy >= 0.6:
            progress_text += f"\nSolid progress! You're building strong foundations with {accuracy:.1%} accuracy. Keep it up! 📈"
        else:
            progress_text += f"\nYou're learning and improving! Remember, accuracy comes with practice. Every mistake is a step toward mastery! 💪"
        
        return progress_text
    
    async def _handle_motivation_request(self, user_data: Dict) -> str:
        """Handle motivation and encouragement requests"""
        # Get motivation analysis
        motivation_analysis = self.api.track_motivation(user_data)
        current_level = motivation_analysis.get("current_level", "moderate")
        
        # Select appropriate motivational response
        if current_level in ["very_low", "low"]:
            responses = self.motivational_responses.get("encouragement_during_struggles", {}).get("motivation_dip", [])
        else:
            responses = self.motivational_responses.get("daily_motivation", {}).get("morning_energy", [])
        
        if responses:
            base_response = random.choice(responses)
        else:
            base_response = "You've got this! Every challenge you face is making you stronger and more prepared for your interviews. Keep pushing forward! 🌟"
        
        # Add personalized encouragement
        sessions = user_data.get("sessions", [])
        if sessions:
            recent_sessions = len([s for s in sessions if 
                                 (datetime.now() - datetime.fromisoformat(s.get("createdAt", ""))).days <= 7])
            
            if recent_sessions > 0:
                base_response += f"\n\nYou've completed {recent_sessions} sessions this week - that's dedication! Your consistency will pay off in your interviews."
        
        return base_response
    
    async def _handle_study_planning(self, entities: Dict, user_data: Dict) -> str:
        """Handle study planning and recommendations"""
        # Get AI recommendations
        behavior_analysis = self.api.analyze_user_behavior(user_data)
        
        if behavior_analysis.get("status") == "insufficient_data":
            return "Let's build your personalized study plan! Complete a few more sessions and I'll be able to give you tailored recommendations based on your learning patterns. For now, I'd suggest starting with arrays and strings - they're fundamental for most interviews! 📚"
        
        recommendations = behavior_analysis.get("recommendations", [])
        
        if recommendations:
            response = "Based on your learning patterns, here's what I recommend:\n\n"
            for i, rec in enumerate(recommendations[:3], 1):
                response += f"{i}. {rec.get('recommendation', rec)}\n"
            
            # Add optimal time suggestion
            optimal_time_pred = self.api.predict_performance(user_data, "optimal_session_time")
            if optimal_time_pred.get("prediction"):
                response += f"\n⏰ Your optimal study time appears to be around {optimal_time_pred['prediction']}"
            
            return response
        
        return "I'm analyzing your patterns to give you the best recommendations! In the meantime, focus on consistency - even 20-30 minutes daily will build strong momentum! 🚀"
    
    async def _handle_achievement_sharing(self, message: str, user_data: Dict) -> str:
        """Handle achievement and success sharing"""
        # Detect achievement type
        if any(word in message.lower() for word in ["completed", "finished", "solved"]):
            responses = self.motivational_responses.get("achievement_celebrations", {}).get("session_completions", {}).get("perfect_session", [])
        elif any(word in message.lower() for word in ["streak", "days"]):
            responses = self.motivational_responses.get("achievement_celebrations", {}).get("streak_milestones", {}).get("7_days", [])
        else:
            responses = self.motivational_responses.get("achievement_celebrations", {}).get("mastery_milestone", [])
        
        if responses:
            celebration = random.choice(responses)
        else:
            celebration = "Fantastic work! 🎉 Every achievement, big or small, is a step closer to your interview success!"
        
        # Add encouragement for next steps
        celebration += "\n\nWhat's your next goal? I'm here to help you keep this momentum going! 💪"
        
        return celebration
    
    async def _handle_concept_explanation(self, entities: Dict) -> str:
        """Handle concept explanation requests"""
        topics = entities.get("topics", [])
        
        if topics:
            topic = topics[0]
            explanations = {
                "arrays": "Arrays are collections of elements stored in contiguous memory locations. They're fundamental for many algorithms and offer O(1) access time by index. Key concepts include traversal, searching, sorting, and two-pointer techniques.",
                "trees": "Trees are hierarchical data structures with nodes connected by edges. Binary trees, BSTs, and balanced trees like AVL are common in interviews. Master traversals (inorder, preorder, postorder) and tree manipulation algorithms.",
                "graphs": "Graphs consist of vertices connected by edges. They can be directed/undirected, weighted/unweighted. Key algorithms include BFS, DFS, shortest path (Dijkstra), and minimum spanning tree (Kruskal, Prim).",
                "dynamic programming": "DP solves complex problems by breaking them into simpler subproblems and storing results to avoid recomputation. Identify optimal substructure and overlapping subproblems. Start with memoization, then optimize to tabulation."
            }
            
            explanation = explanations.get(topic, f"Great question about {topic}! This is an important concept for technical interviews.")
            explanation += f"\n\nWould you like me to suggest some practice problems for {topic}, or do you have a specific aspect you'd like to explore deeper?"
            
            return explanation
        
        return "I'd love to explain concepts for you! Which topic are you curious about? Arrays, trees, graphs, dynamic programming, or something else?"
    
    async def _handle_difficulty_feedback(self, message: str, entities: Dict, user_data: Dict) -> str:
        """Handle difficulty adjustment feedback"""
        if "too easy" in message.lower() or "simple" in message.lower():
            return "Great to hear you're finding things manageable! 🚀 Let's level up your challenge. I'll recommend some harder problems that will really test your skills and prepare you for tougher interview questions."
        
        elif "too hard" in message.lower() or "difficult" in message.lower():
            return "No worries at all! Learning is about finding the right challenge level. 💪 Let's step back to some foundational problems to build your confidence, then gradually work up to the harder stuff. Every expert started where you are now!"
        
        return "I appreciate the feedback! Adjusting difficulty is key to effective learning. Tell me more about what feels right for your current level, and I'll help find that sweet spot! 🎯"
    
    async def _handle_time_management(self, entities: Dict, user_data: Dict) -> str:
        """Handle time management and scheduling"""
        numbers = entities.get("numbers", [])
        
        # Get optimal time prediction
        optimal_time_pred = self.api.predict_performance(user_data, "optimal_session_time")
        
        response = "Great question about timing! ⏰\n\n"
        
        if optimal_time_pred.get("prediction"):
            response += f"Based on your patterns, you seem to perform best around {optimal_time_pred['prediction']}. "
        
        response += "For session length, I generally recommend:\n"
        response += "• 25-30 minutes for focused practice\n"
        response += "• 45-60 minutes for deep problem-solving\n"
        response += "• 15-20 minutes for quick reviews\n\n"
        response += "Consistency beats duration - better to study 30 minutes daily than 3 hours once a week! 📈"
        
        return response
    
    async def _handle_farewell(self, user_data: Dict) -> str:
        """Handle goodbye and farewell messages"""
        farewells = [
            "Great session today! Keep up the momentum and I'll see you next time. You're making excellent progress! 🌟",
            "Awesome work! Remember, consistency is key. Looking forward to our next study session together! 💪",
            "Well done today! Every session brings you closer to interview success. Rest well and come back ready to learn! 🚀"
        ]
        
        base_farewell = random.choice(farewells)
        
        # Add streak encouragement if applicable
        streak_data = user_data.get("streak_data", {})
        current_streak = streak_data.get("current_streak", 0)
        
        if current_streak > 0:
            base_farewell += f"\n\nYour {current_streak}-day streak is impressive - keep it going! 🔥"
        
        return base_farewell
    
    async def _handle_general_chat(self, message: str, user_data: Dict) -> str:
        """Handle general conversation"""
        general_responses = [
            "I'm here to support your interview preparation journey! What would you like to work on today? 📚",
            "That's interesting! How can I help you with your coding interview prep? I'm ready to assist with practice, explanations, or motivation! 💪",
            "I love chatting with you! Let's channel this energy into some productive study time. What topic should we tackle? 🚀"
        ]
        
        return random.choice(general_responses)
    
    def _personalize_response(self, response: str, user_data: Dict) -> str:
        """Add personalization to response"""
        # Replace placeholders with user-specific data
        sessions = user_data.get("sessions", [])
        progress = user_data.get("progress", {})
        
        # Replace common placeholders
        response = response.replace("{total_sessions}", str(len(sessions)))
        response = response.replace("{accuracy}", f"{progress.get('accuracy', 0):.1%}")
        
        return response
    
    def _generate_action_items(self, intent: str, entities: Dict, user_data: Dict) -> List[Dict]:
        """Generate actionable items based on conversation"""
        actions = []
        
        if intent == "study_planning":
            actions.append({
                "type": "schedule_session",
                "title": "Schedule Next Study Session",
                "description": "Based on our conversation, schedule your next focused study session"
            })
        
        elif intent == "concept_explanation":
            topics = entities.get("topics", [])
            if topics:
                actions.append({
                    "type": "practice_topic",
                    "title": f"Practice {topics[0].title()}",
                    "description": f"Try some {topics[0]} problems to reinforce the concepts we discussed"
                })
        
        elif intent == "difficulty_feedback":
            actions.append({
                "type": "adjust_difficulty",
                "title": "Adjust Problem Difficulty",
                "description": "Update your practice settings based on the feedback you provided"
            })
        
        return actions
    
    def _update_conversation_history(self, user_id: str, message: str, sender: str) -> None:
        """Update conversation history"""
        if user_id not in self.conversation_history:
            self.conversation_history[user_id] = []
        
        self.conversation_history[user_id].append({
            "message": message,
            "sender": sender,
            "timestamp": datetime.now().isoformat()
        })
        
        # Keep only last 20 messages
        self.conversation_history[user_id] = self.conversation_history[user_id][-20:]
    
    def _log_interaction(self, user_id: str, user_message: str, response: Dict, intent: Dict) -> None:
        """Log interaction for learning and improvement"""
        interaction_log = {
            "user_id": user_id,
            "user_message": user_message,
            "response": response,
            "intent": intent,
            "timestamp": datetime.now().isoformat()
        }
        
        # In production, save to database or analytics system
        logger.info(f"Interaction logged for user {user_id}: {intent['primary_intent']}")
    
    def _get_time_of_day(self) -> str:
        """Get current time of day for contextual responses"""
        hour = datetime.now().hour
        
        if 5 <= hour < 12:
            return "morning"
        elif 12 <= hour < 17:
            return "afternoon"
        elif 17 <= hour < 22:
            return "evening"
        else:
            return "night"
    
    def _get_fallback_response(self) -> Dict:
        """Get fallback response for errors"""
        return {
            "message": "I'm having a small technical hiccup, but I'm still here to help! Could you try rephrasing your question? 🤖",
            "metadata": {
                "intent": "error_fallback",
                "confidence": 0.0,
                "personalized": False,
                "timestamp": datetime.now().isoformat(),
                "response_type": "text"
            }
        }

# Convenience function for quick chatbot setup
def create_study_buddy_chatbot(api_integration, backend_connector=None) -> StudyBuddyChatbot:
    """
    Create and initialize Study Buddy chatbot
    
    Args:
        api_integration: StudyBuddyAPI instance
        backend_connector: Optional backend connector
    
    Returns:
        Configured StudyBuddyChatbot instance
    """
    return StudyBuddyChatbot(api_integration, backend_connector)
