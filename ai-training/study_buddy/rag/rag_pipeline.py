"""
Complete RAG pipeline integrating embeddings, retrieval, and generation.
"""

import logging
from typing import Dict, Any, List, Optional
from .embeddings.gemini_embeddings import GeminiEmbeddings
from .vector_store import VectorStore, create_vector_store
from .retrieval.retriever import Retriever
from .generation.generator import Generator
from ..config import Config

logger = logging.getLogger(__name__)

class RAGPipeline:
    """Complete RAG pipeline for Smart Study Buddy."""
    
    def __init__(self, config: Optional[Config] = None):
        """Initialize RAG pipeline.
        
        Args:
            config: Configuration object
        """
        self.config = config or Config()
        
        # Initialize components
        self.embeddings = None
        self.vector_store = None
        self.retriever = None
        self.generator = None
        
        # Conversation memory
        self.conversation_history = []
        
        logger.info("RAG pipeline initialized")
    
    def setup(self):
        """Set up all RAG components."""
        try:
            # Initialize embeddings
            self.embeddings = GeminiEmbeddings(
                model_name=self.config.EMBEDDING_MODEL,
                api_key=self.config.GEMINI_API_KEY
            )
            
            # Initialize vector store
            vector_config = self.config.get_vector_db_config()
            self.vector_store = create_vector_store(vector_config)
            
            # Initialize retriever
            self.retriever = Retriever(self.embeddings, self.vector_store)
            
            # Initialize generator
            self.generator = Generator(
                api_key=self.config.GEMINI_API_KEY,
                model_name=self.config.GENERATION_MODEL,
                fast_model=self.config.GENERATION_MODEL_FAST
            )
            
            logger.info("RAG pipeline setup completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error setting up RAG pipeline: {e}")
            return False
    
    def add_documents(self, documents: List[Dict[str, Any]]):
        """Add documents to the knowledge base.
        
        Args:
            documents: List of documents to add
        """
        if not self.embeddings or not self.vector_store:
            raise RuntimeError("RAG pipeline not set up. Call setup() first.")
        
        try:
            # Extract text content for embedding
            texts = [doc['content'] for doc in documents]
            
            # Generate embeddings
            logger.info(f"Generating embeddings for {len(texts)} documents...")
            embeddings = self.embeddings.embed_texts(texts)
            
            # Add to vector store
            logger.info("Adding documents to vector store...")
            self.vector_store.add_documents(documents, embeddings)
            
            logger.info(f"Successfully added {len(documents)} documents to knowledge base")
            
        except Exception as e:
            logger.error(f"Error adding documents: {e}")
            raise
    
    def chat(self, query: str, user_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Main chat interface for the study buddy.
        
        Args:
            query: User query
            user_context: User context information
            
        Returns:
            Chat response with metadata
        """
        if not self._is_ready():
            return self._create_error_response("RAG pipeline not ready")
        
        try:
            # Add to conversation history
            self.conversation_history.append({
                'type': 'user',
                'content': query,
                'timestamp': self._get_timestamp()
            })
            
            # Retrieve relevant documents
            retrieved_docs = self.retriever.retrieve_with_context(
                query=query,
                user_context=user_context or {},
                k=5
            )
            
            # Determine if we should use fast model
            use_fast_model = self._should_use_fast_model(query)
            
            # Generate response
            response = self.generator.generate_response(
                query=query,
                retrieved_docs=retrieved_docs,
                user_context=user_context,
                use_fast_model=use_fast_model
            )
            
            # Add to conversation history
            self.conversation_history.append({
                'type': 'assistant',
                'content': response['response'],
                'timestamp': self._get_timestamp(),
                'metadata': {
                    'retrieved_docs': len(retrieved_docs),
                    'model_used': response['model_used']
                }
            })
            
            # Limit conversation history
            self._trim_conversation_history()
            
            return response
            
        except Exception as e:
            logger.error(f"Error in chat: {e}")
            return self._create_error_response(str(e))
    
    def send_study_reminder(self, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Send personalized study reminder.
        
        Args:
            user_context: User context with study patterns
            
        Returns:
            Study reminder response
        """
        if not self.generator:
            return self._create_error_response("Generator not initialized")
        
        try:
            return self.generator.generate_study_reminder(user_context)
        except Exception as e:
            logger.error(f"Error generating study reminder: {e}")
            return self._create_error_response(str(e))
    
    def celebrate_achievement(self, achievement: Dict[str, Any], user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate achievement celebration.
        
        Args:
            achievement: Achievement details
            user_context: User context
            
        Returns:
            Celebration response
        """
        if not self.generator:
            return self._create_error_response("Generator not initialized")
        
        try:
            return self.generator.generate_achievement_celebration(achievement, user_context)
        except Exception as e:
            logger.error(f"Error generating celebration: {e}")
            return self._create_error_response(str(e))
    
    def get_conversation_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent conversation history.
        
        Args:
            limit: Maximum number of messages to return
            
        Returns:
            Recent conversation history
        """
        return self.conversation_history[-limit:] if self.conversation_history else []
    
    def clear_conversation_history(self):
        """Clear conversation history."""
        self.conversation_history = []
        logger.info("Conversation history cleared")
    
    def get_knowledge_base_stats(self) -> Dict[str, Any]:
        """Get statistics about the knowledge base.
        
        Returns:
            Knowledge base statistics
        """
        # This would need to be implemented based on vector store capabilities
        return {
            'status': 'ready' if self._is_ready() else 'not_ready',
            'components': {
                'embeddings': self.embeddings is not None,
                'vector_store': self.vector_store is not None,
                'retriever': self.retriever is not None,
                'generator': self.generator is not None
            },
            'conversation_history_length': len(self.conversation_history)
        }
    
    def _is_ready(self) -> bool:
        """Check if pipeline is ready for use."""
        return all([
            self.embeddings is not None,
            self.vector_store is not None,
            self.retriever is not None,
            self.generator is not None
        ])
    
    def _should_use_fast_model(self, query: str) -> bool:
        """Determine if we should use the fast model for this query.
        
        Args:
            query: User query
            
        Returns:
            True if fast model should be used
        """
        # Use fast model for simple queries
        simple_patterns = [
            'hi', 'hello', 'thanks', 'thank you', 'yes', 'no', 'ok', 'okay',
            'what is', 'define', 'explain briefly'
        ]
        
        query_lower = query.lower().strip()
        
        # Short queries
        if len(query_lower) < 20:
            return True
        
        # Simple greeting or acknowledgment patterns
        if any(pattern in query_lower for pattern in simple_patterns):
            return True
        
        return False
    
    def _trim_conversation_history(self, max_length: int = 20):
        """Trim conversation history to prevent memory issues.
        
        Args:
            max_length: Maximum number of messages to keep
        """
        if len(self.conversation_history) > max_length:
            self.conversation_history = self.conversation_history[-max_length:]
    
    def _create_error_response(self, error_message: str) -> Dict[str, Any]:
        """Create error response.
        
        Args:
            error_message: Error message
            
        Returns:
            Error response
        """
        return {
            'response': "I'm having some technical difficulties right now. Please try again in a moment!",
            'error': error_message,
            'type': 'error',
            'timestamp': self._get_timestamp()
        }
    
    def _get_timestamp(self) -> str:
        """Get current timestamp."""
        from datetime import datetime
        return datetime.now().isoformat()
