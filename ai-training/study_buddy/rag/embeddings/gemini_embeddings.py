"""
Gemini-based embedding generation for RAG system.
"""

import google.generativeai as genai
import numpy as np
from typing import List, Optional, Dict, Any
import logging
from ...config import Config

logger = logging.getLogger(__name__)

class GeminiEmbeddings:
    """Gemini-based embedding generator."""
    
    def __init__(self, model_name: str = None, api_key: str = None):
        """Initialize Gemini embeddings.
        
        Args:
            model_name: Gemini embedding model name
            api_key: Gemini API key
        """
        self.model_name = model_name or Config.EMBEDDING_MODEL
        self.api_key = api_key or Config.GEMINI_API_KEY
        
        if not self.api_key:
            raise ValueError("Gemini API key is required")
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        
        logger.info(f"Initialized Gemini embeddings with model: {self.model_name}")
    
    def embed_text(self, text: str) -> List[float]:
        """Generate embedding for a single text.
        
        Args:
            text: Input text to embed
            
        Returns:
            List of embedding values
        """
        try:
            result = genai.embed_content(
                model=self.model_name,
                content=text,
                task_type="retrieval_document"
            )
            return result['embedding']
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise
    
    def embed_texts(self, texts: List[str], batch_size: int = 10) -> List[List[float]]:
        """Generate embeddings for multiple texts.
        
        Args:
            texts: List of texts to embed
            batch_size: Number of texts to process at once
            
        Returns:
            List of embeddings
        """
        embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_embeddings = []
            
            for text in batch:
                try:
                    embedding = self.embed_text(text)
                    batch_embeddings.append(embedding)
                except Exception as e:
                    logger.error(f"Error embedding text: {text[:50]}... - {e}")
                    # Use zero vector as fallback
                    batch_embeddings.append([0.0] * 768)  # Default dimension
            
            embeddings.extend(batch_embeddings)
            logger.info(f"Processed batch {i//batch_size + 1}/{(len(texts)-1)//batch_size + 1}")
        
        return embeddings
    
    def embed_query(self, query: str) -> List[float]:
        """Generate embedding for a query.
        
        Args:
            query: Query text to embed
            
        Returns:
            Query embedding
        """
        try:
            result = genai.embed_content(
                model=self.model_name,
                content=query,
                task_type="retrieval_query"
            )
            return result['embedding']
        except Exception as e:
            logger.error(f"Error generating query embedding: {e}")
            raise
    
    def get_embedding_dimension(self) -> int:
        """Get the dimension of embeddings.
        
        Returns:
            Embedding dimension
        """
        # Test with a simple text to get dimension
        try:
            test_embedding = self.embed_text("test")
            return len(test_embedding)
        except Exception as e:
            logger.error(f"Error getting embedding dimension: {e}")
            return 768  # Default dimension for text-embedding-004
    
    def similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculate cosine similarity between two embeddings.
        
        Args:
            embedding1: First embedding
            embedding2: Second embedding
            
        Returns:
            Cosine similarity score
        """
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        
        # Calculate cosine similarity
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return dot_product / (norm1 * norm2)
