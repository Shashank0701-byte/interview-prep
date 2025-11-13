"""
Response generation using Gemini for RAG system.
"""

import google.generativeai as genai
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class Generator:
    """Response generator using Gemini."""
    
    def __init__(self, api_key: str, model_name: str = "gemini-1.5-pro", fast_model: str = "gemini-1.5-flash"):
        """Initialize generator.
        
        Args:
            api_key: Gemini API key
            model_name: Primary model for complex responses
            fast_model: Fast model for simple responses
        """
        self.api_key = api_key
        self.model_name = model_name
        self.fast_model = fast_model
        
        # Configure Gemini
        genai.configure(api_key=api_key)
        
        # Initialize models
        self.model = genai.GenerativeModel(model_name)
        self.fast_model_instance = genai.GenerativeModel(fast_model)
        
        logger.info(f"Initialized generator with models: {model_name}, {fast_model}")
    
    def generate_response(
        self, 
        query: str, 
        retrieved_docs: List[Dict[str, Any]], 
        user_context: Optional[Dict[str, Any]] = None,
        use_fast_model: bool = False
    ) -> Dict[str, Any]:
        """Generate response using retrieved documents and user context.
        
        Args:
            query: User query
            retrieved_docs: Retrieved documents from RAG
            user_context: User context information
            use_fast_model: Whether to use fast model for quick responses
            
        Returns:
            Generated response with metadata
        """
        try:
            # Build context from retrieved documents
            context = self._build_context(retrieved_docs)
            
            # Create prompt
            prompt = self._create_prompt(query, context, user_context)
            
            # Choose model based on complexity
            model = self.fast_model_instance if use_fast_model else self.model
            
            # Generate response
            response = model.generate_content(prompt)
            
            # Process and return response
            return {
                'response': response.text,
                'query': query,
                'context_docs': len(retrieved_docs),
                'model_used': self.fast_model if use_fast_model else self.model_name,
                'timestamp': datetime.now().isoformat(),
                'user_context': user_context or {}
            }
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return {
                'response': self._get_fallback_response(),
                'error': str(e),
                'type': 'error',
                'timestamp': self._get_timestamp(),
                'model_used': 'fallback',
                'context_docs': len(retrieved_docs) if retrieved_docs else 0
            }
    
    def generate_study_reminder(self, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized study reminder.
        
        Args:
            user_context: User context with study patterns
            
        Returns:
            Study reminder response
        """
        prompt = self._create_reminder_prompt(user_context)
        
        try:
            response = self.fast_model_instance.generate_content(prompt)
            
            return {
                'response': response.text,
                'type': 'study_reminder',
                'user_context': user_context,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating study reminder: {e}")
            return self._create_fallback_reminder(user_context)
    
    def generate_achievement_celebration(self, achievement: Dict[str, Any], user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate achievement celebration message.
        
        Args:
            achievement: Achievement details
            user_context: User context
            
        Returns:
            Celebration response
        """
        prompt = self._create_celebration_prompt(achievement, user_context)
        
        try:
            response = self.fast_model_instance.generate_content(prompt)
            
            return {
                'response': response.text,
                'type': 'achievement_celebration',
                'achievement': achievement,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating celebration: {e}")
            return self._create_fallback_celebration(achievement)
    
    def _build_context(self, retrieved_docs: List[Dict[str, Any]]) -> str:
        """Build context string from retrieved documents.
        
        Args:
            retrieved_docs: Retrieved documents
            
        Returns:
            Context string
        """
        if not retrieved_docs:
            return "No relevant context found in knowledge base."
        
        context_parts = []
        for i, doc in enumerate(retrieved_docs[:3]):  # Limit to top 3 most relevant docs
            content = doc.get('content', '')
            score = doc.get('score', 0.0)
            doc_type = doc.get('metadata', {}).get('type', 'general')
            
            # Add document type for better context understanding
            context_parts.append(f"[{doc_type.upper()}] {content}")
        
        return "\n\n".join(context_parts)
    
    def _create_prompt(self, query: str, context: str, user_context: Optional[Dict[str, Any]]) -> str:
        """Create prompt for response generation.
        
        Args:
            query: User query
            context: Retrieved context
            user_context: User context information
            
        Returns:
            Generated prompt
        """
        # Base prompt template
        prompt_template = """You are a Smart Study Buddy AI, a knowledgeable companion that helps users with interview preparation. You provide accurate, helpful information while being encouraging and supportive.

CONTEXT FROM KNOWLEDGE BASE:
{context}

USER INFORMATION:
{user_info}

USER QUERY: {query}

INSTRUCTIONS:
- FIRST: Answer the user's question directly and accurately using the context provided
- Provide clear, specific explanations with examples when helpful
- Use the context information to give comprehensive, factual answers
- THEN: Add encouragement and reference user progress when relevant
- Suggest practical next steps or related topics to explore
- Keep responses informative, clear, and conversational
- If the context doesn't contain the answer, say so and provide general guidance

RESPONSE FORMAT:
1. Direct answer to the question
2. Additional helpful details or examples
3. Encouraging note with personalized context
4. Suggested next steps (if applicable)

RESPONSE:"""
        
        # Build user info string
        user_info = self._format_user_context(user_context) if user_context else "No specific user context available."
        
        return prompt_template.format(
            context=context,
            user_info=user_info,
            query=query
        )
    
    def _create_reminder_prompt(self, user_context: Dict[str, Any]) -> str:
        """Create prompt for study reminder.
        
        Args:
            user_context: User context
            
        Returns:
            Reminder prompt
        """
        prompt_template = """You are a Smart Study Buddy AI creating a personalized study reminder.

USER CONTEXT:
{user_info}

Create a brief, encouraging study reminder that:
- References their study streak or recent progress
- Suggests what to focus on based on their weak areas
- Mentions their optimal study time if relevant
- Is motivational but not pushy
- Includes a specific action they can take

Keep it under 100 words and make it feel personal and supportive.

REMINDER:"""
        
        user_info = self._format_user_context(user_context)
        return prompt_template.format(user_info=user_info)
    
    def _create_celebration_prompt(self, achievement: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Create prompt for achievement celebration.
        
        Args:
            achievement: Achievement details
            user_context: User context
            
        Returns:
            Celebration prompt
        """
        prompt_template = """You are a Smart Study Buddy AI celebrating a user's achievement!

ACHIEVEMENT:
{achievement}

USER CONTEXT:
{user_info}

Create an enthusiastic but genuine celebration message that:
- Acknowledges their specific achievement
- References their journey or progress
- Encourages them to keep going
- Suggests what they might tackle next
- Uses appropriate celebratory language (emojis are okay!)

Keep it under 150 words and make it feel like a friend celebrating with them.

CELEBRATION:"""
        
        achievement_str = f"Type: {achievement.get('type', 'Unknown')}\nDetails: {achievement.get('details', 'Achievement unlocked!')}"
        user_info = self._format_user_context(user_context)
        
        return prompt_template.format(
            achievement=achievement_str,
            user_info=user_info
        )
    
    def _format_user_context(self, user_context: Dict[str, Any]) -> str:
        """Format user context for prompts.
        
        Args:
            user_context: User context dictionary
            
        Returns:
            Formatted context string
        """
        context_parts = []
        
        if 'study_streak' in user_context:
            context_parts.append(f"Study streak: {user_context['study_streak']} days")
        
        if 'current_phase' in user_context:
            context_parts.append(f"Current learning phase: {user_context['current_phase']}")
        
        if 'weak_areas' in user_context and user_context['weak_areas']:
            weak_areas = ', '.join(user_context['weak_areas'])
            context_parts.append(f"Areas to improve: {weak_areas}")
        
        if 'learning_style' in user_context:
            context_parts.append(f"Learning style: {user_context['learning_style']}")
        
        if 'preferred_study_time' in user_context:
            context_parts.append(f"Preferred study time: {user_context['preferred_study_time']}")
        
        if 'experience_level' in user_context:
            context_parts.append(f"Experience level: {user_context['experience_level']}")
        
        if 'recent_performance' in user_context:
            context_parts.append(f"Recent performance: {user_context['recent_performance']}")
        
        return '\n'.join(context_parts) if context_parts else "No specific context available"
    
    def _create_fallback_response(self, query: str, error: str) -> Dict[str, Any]:
        """Create fallback response when generation fails.
        
        Args:
            query: Original query
            error: Error message
            
        Returns:
            Fallback response
        """
        fallback_responses = [
            "I'm having trouble processing that right now, but I'm here to help! Could you try rephrasing your question?",
            "Let me think about that differently. What specific aspect of your interview prep would you like to focus on?",
            "I want to give you the best answer possible. Could you provide a bit more context about what you're working on?"
        ]
        
        import random
        response = random.choice(fallback_responses)
        
        return {
            'response': response,
            'query': query,
            'type': 'fallback',
            'error': error,
            'timestamp': datetime.now().isoformat()
        }
    
    def _create_fallback_reminder(self, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Create fallback study reminder.
        
        Args:
            user_context: User context
            
        Returns:
            Fallback reminder
        """
        return {
            'response': "Hey there! 👋 Just a friendly reminder that consistent practice makes all the difference. Even 15 minutes today can help you stay sharp for your interviews!",
            'type': 'study_reminder_fallback',
            'user_context': user_context,
            'timestamp': datetime.now().isoformat()
        }
    
    def _create_fallback_celebration(self, achievement: Dict[str, Any]) -> Dict[str, Any]:
        """Create fallback celebration message.
        
        Args:
            achievement: Achievement details
            
        Returns:
            Fallback celebration
        """
        return {
            'response': "🎉 Awesome job! Every step forward is progress worth celebrating. Keep up the great work!",
            'type': 'achievement_celebration_fallback',
            'achievement': achievement,
            'timestamp': datetime.now().isoformat()
        }
    
    def _get_fallback_response(self) -> str:
        """Get a fallback response for errors."""
        fallback_responses = [
            "I'm having trouble processing that right now, but I'm here to help! Could you try rephrasing your question?",
            "Let me think about that differently. What specific aspect of your interview prep would you like to focus on?",
            "I want to give you the best answer possible. Could you provide a bit more context about what you're working on?",
            "I'm experiencing some technical difficulties, but I'm still here to support your learning journey!"
        ]
        
        import random
        return random.choice(fallback_responses)
    
    def _get_timestamp(self) -> str:
        """Get current timestamp."""
        return datetime.now().isoformat()
