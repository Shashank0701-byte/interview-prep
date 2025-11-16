"""
Document retrieval system for RAG pipeline.
"""

import logging
from typing import List, Dict, Any, Optional
from ..embeddings.gemini_embeddings import GeminiEmbeddings
from ..vector_store import VectorStore

logger = logging.getLogger(__name__)

class Retriever:
    """Document retriever for RAG system."""
    
    def __init__(self, embeddings: GeminiEmbeddings, vector_store: VectorStore):
        """Initialize retriever.
        
        Args:
            embeddings: Embedding generator
            vector_store: Vector store for similarity search
        """
        self.embeddings = embeddings
        self.vector_store = vector_store
        
        logger.info("Initialized document retriever")
    
    def retrieve(self, query: str, k: int = 5, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Retrieve relevant documents for a query.
        
        Args:
            query: User query
            k: Number of documents to retrieve
            filters: Optional filters for retrieval
            
        Returns:
            List of relevant documents with scores
        """
        try:
            # Generate query embedding
            query_embedding = self.embeddings.embed_query(query)
            
            # Search for similar documents
            documents = self.vector_store.similarity_search(query_embedding, k=k)
            
            # Apply filters if provided
            if filters:
                documents = self._apply_filters(documents, filters)
            
            # Enhance documents with retrieval metadata
            for doc in documents:
                doc['retrieval_query'] = query
                doc['retrieval_timestamp'] = self._get_timestamp()
            
            logger.info(f"Retrieved {len(documents)} documents for query: {query[:50]}...")
            return documents
            
        except Exception as e:
            logger.error(f"Error retrieving documents: {e}")
            return []
    
    def retrieve_with_context(self, query: str, user_context: Dict[str, Any], k: int = 5) -> List[Dict[str, Any]]:
        """Retrieve documents with user context awareness.
        
        Args:
            query: User query
            user_context: User context (study patterns, preferences, etc.)
            k: Number of documents to retrieve
            
        Returns:
            Context-aware retrieved documents
        """
        # Enhance query with user context
        enhanced_query = self._enhance_query_with_context(query, user_context)
        
        # Retrieve documents
        documents = self.retrieve(enhanced_query, k=k)
        
        # Re-rank based on user context
        documents = self._rerank_by_context(documents, user_context)
        
        return documents
    
    def _enhance_query_with_context(self, query: str, user_context: Dict[str, Any]) -> str:
        """Enhance query with user context.
        
        Args:
            query: Original query
            user_context: User context information
            
        Returns:
            Enhanced query string
        """
        context_parts = []
        
        # Add learning style context
        if 'learning_style' in user_context:
            context_parts.append(f"learning style: {user_context['learning_style']}")
        
        # Add current phase context
        if 'current_phase' in user_context:
            context_parts.append(f"current phase: {user_context['current_phase']}")
        
        # Add weak areas context
        if 'weak_areas' in user_context and user_context['weak_areas']:
            weak_areas = ', '.join(user_context['weak_areas'])
            context_parts.append(f"weak areas: {weak_areas}")
        
        # Add experience level context
        if 'experience_level' in user_context:
            context_parts.append(f"experience: {user_context['experience_level']}")
        
        if context_parts:
            context_str = ' | '.join(context_parts)
            enhanced_query = f"{query} [Context: {context_str}]"
        else:
            enhanced_query = query
        
        return enhanced_query
    
    def _rerank_by_context(self, documents: List[Dict[str, Any]], user_context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Re-rank documents based on user context.
        
        Args:
            documents: Retrieved documents
            user_context: User context information
            
        Returns:
            Re-ranked documents
        """
        for doc in documents:
            # Calculate context relevance score
            context_score = self._calculate_context_relevance(doc, user_context)
            
            # Combine with similarity score
            original_score = doc.get('score', 0.0)
            doc['context_score'] = context_score
            doc['combined_score'] = (original_score * 0.7) + (context_score * 0.3)
        
        # Sort by combined score
        documents.sort(key=lambda x: x.get('combined_score', 0.0), reverse=True)
        
        return documents
    
    def _calculate_context_relevance(self, document: Dict[str, Any], user_context: Dict[str, Any]) -> float:
        """Calculate how relevant a document is to user context.
        
        Args:
            document: Document to score
            user_context: User context information
            
        Returns:
            Context relevance score (0.0 to 1.0)
        """
        score = 0.0
        factors = 0
        
        doc_metadata = document.get('metadata', {})
        doc_content = document.get('content', '').lower()
        
        # Check learning style match
        if 'learning_style' in user_context:
            user_style = user_context['learning_style'].lower()
            doc_style = doc_metadata.get('learning_style', '').lower()
            
            if user_style in doc_content or user_style == doc_style:
                score += 1.0
            factors += 1
        
        # Check phase relevance
        if 'current_phase' in user_context:
            current_phase = user_context['current_phase'].lower()
            doc_phase = doc_metadata.get('phase', '').lower()
            
            if current_phase in doc_content or current_phase == doc_phase:
                score += 1.0
            factors += 1
        
        # Check weak areas coverage
        if 'weak_areas' in user_context and user_context['weak_areas']:
            weak_areas = [area.lower() for area in user_context['weak_areas']]
            doc_topics = doc_metadata.get('topics', [])
            
            if isinstance(doc_topics, str):
                doc_topics = [doc_topics]
            
            doc_topics_lower = [topic.lower() for topic in doc_topics]
            
            # Check if document covers any weak areas
            covers_weak_area = any(
                weak_area in doc_content or 
                any(weak_area in topic for topic in doc_topics_lower)
                for weak_area in weak_areas
            )
            
            if covers_weak_area:
                score += 1.0
            factors += 1
        
        # Check experience level appropriateness
        if 'experience_level' in user_context:
            user_exp = user_context['experience_level']
            doc_difficulty = doc_metadata.get('difficulty', 'medium').lower()
            
            # Map experience to appropriate difficulty
            exp_to_difficulty = {
                'beginner': ['easy', 'beginner'],
                'intermediate': ['medium', 'intermediate'],
                'advanced': ['hard', 'advanced', 'expert']
            }
            
            user_difficulties = exp_to_difficulty.get(user_exp.lower(), ['medium'])
            
            if doc_difficulty in user_difficulties:
                score += 1.0
            factors += 1
        
        # Return average score
        return score / factors if factors > 0 else 0.5
    
    def _apply_filters(self, documents: List[Dict[str, Any]], filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Apply filters to retrieved documents.
        
        Args:
            documents: Documents to filter
            filters: Filter criteria
            
        Returns:
            Filtered documents
        """
        filtered_docs = []
        
        for doc in documents:
            metadata = doc.get('metadata', {})
            include_doc = True
            
            # Apply each filter
            for filter_key, filter_value in filters.items():
                if filter_key in metadata:
                    if isinstance(filter_value, list):
                        if metadata[filter_key] not in filter_value:
                            include_doc = False
                            break
                    else:
                        if metadata[filter_key] != filter_value:
                            include_doc = False
                            break
            
            if include_doc:
                filtered_docs.append(doc)
        
        return filtered_docs
    
    def _get_timestamp(self) -> str:
        """Get current timestamp."""
        from datetime import datetime
        return datetime.now().isoformat()
