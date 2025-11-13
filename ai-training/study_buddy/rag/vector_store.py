"""
Vector store implementation supporting both Pinecone and ChromaDB.
"""

import logging
from typing import List, Dict, Any, Optional, Tuple
from abc import ABC, abstractmethod
import json

logger = logging.getLogger(__name__)

class VectorStore(ABC):
    """Abstract base class for vector stores."""
    
    @abstractmethod
    def add_documents(self, documents: List[Dict[str, Any]], embeddings: List[List[float]]):
        """Add documents with embeddings to the store."""
        pass
    
    @abstractmethod
    def similarity_search(self, query_embedding: List[float], k: int = 5) -> List[Dict[str, Any]]:
        """Search for similar documents."""
        pass
    
    @abstractmethod
    def delete_all(self):
        """Delete all documents from the store."""
        pass

class PineconeVectorStore(VectorStore):
    """Pinecone-based vector store."""
    
    def __init__(self, api_key: str, environment: str, index_name: str):
        """Initialize Pinecone vector store.
        
        Args:
            api_key: Pinecone API key
            environment: Pinecone environment
            index_name: Pinecone index name
        """
        try:
            from pinecone import Pinecone, ServerlessSpec
            
            # Initialize Pinecone client
            pc = Pinecone(api_key=api_key)
            
            # Get or create index
            existing_indexes = [index.name for index in pc.list_indexes()]
            
            if index_name not in existing_indexes:
                # Create index with appropriate dimension (768 for Gemini embeddings)
                pc.create_index(
                    name=index_name,
                    dimension=768,
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud="aws",
                        region="us-east-1"
                    )
                )
                logger.info(f"Created Pinecone index: {index_name}")
            
            self.index = pc.Index(index_name)
            logger.info(f"Connected to Pinecone index: {index_name}")
            
        except ImportError:
            raise ImportError("pinecone is required for PineconeVectorStore")
        except Exception as e:
            logger.error(f"Error initializing Pinecone: {e}")
            raise
    
    def add_documents(self, documents: List[Dict[str, Any]], embeddings: List[List[float]]):
        """Add documents with embeddings to Pinecone."""
        vectors = []
        
        for i, (doc, embedding) in enumerate(zip(documents, embeddings)):
            vector_id = doc.get('id', f"doc_{i}")
            
            # Clean metadata for Pinecone - only strings, numbers, booleans, or lists of strings
            metadata = {'content': doc['content'][:1000]}  # Pinecone metadata limit
            
            # Process document metadata
            doc_metadata = doc.get('metadata', {})
            for key, value in doc_metadata.items():
                if isinstance(value, (str, int, float, bool)):
                    metadata[key] = value
                elif isinstance(value, list):
                    # Convert list items to strings
                    metadata[key] = [str(item) for item in value]
                else:
                    # Convert complex objects to strings
                    metadata[key] = str(value)
            
            # Add other simple fields from doc
            for key, value in doc.items():
                if key not in ['content', 'metadata', 'id']:
                    if isinstance(value, (str, int, float, bool)):
                        metadata[key] = value
                    elif isinstance(value, list):
                        metadata[key] = [str(item) for item in value]
                    else:
                        metadata[key] = str(value)
            
            vectors.append({
                'id': vector_id,
                'values': embedding,
                'metadata': metadata
            })
        
        # Upsert in batches
        batch_size = 100
        for i in range(0, len(vectors), batch_size):
            batch = vectors[i:i + batch_size]
            self.index.upsert(vectors=batch)
            logger.info(f"Upserted batch {i//batch_size + 1}/{(len(vectors)-1)//batch_size + 1}")
    
    def similarity_search(self, query_embedding: List[float], k: int = 5) -> List[Dict[str, Any]]:
        """Search for similar documents in Pinecone."""
        try:
            results = self.index.query(
                vector=query_embedding,
                top_k=k,
                include_metadata=True
            )
            
            documents = []
            for match in results['matches']:
                doc = {
                    'id': match['id'],
                    'score': match['score'],
                    'content': match['metadata'].get('content', ''),
                    'metadata': match['metadata']
                }
                documents.append(doc)
            
            return documents
            
        except Exception as e:
            logger.error(f"Error searching Pinecone: {e}")
            return []
    
    def delete_all(self):
        """Delete all vectors from Pinecone index."""
        try:
            self.index.delete(delete_all=True)
            logger.info("Deleted all vectors from Pinecone index")
        except Exception as e:
            logger.error(f"Error deleting from Pinecone: {e}")

class ChromaVectorStore(VectorStore):
    """ChromaDB-based vector store."""
    
    def __init__(self, persist_directory: str, collection_name: str = "study_buddy"):
        """Initialize ChromaDB vector store.
        
        Args:
            persist_directory: Directory to persist ChromaDB data
            collection_name: Name of the collection
        """
        try:
            import chromadb
            from chromadb.config import Settings
            
            # Initialize ChromaDB client
            self.client = chromadb.PersistentClient(
                path=persist_directory,
                settings=Settings(anonymized_telemetry=False)
            )
            
            # Get or create collection
            self.collection = self.client.get_or_create_collection(
                name=collection_name,
                metadata={"description": "Smart Study Buddy knowledge base"}
            )
            
            logger.info(f"Connected to ChromaDB collection: {collection_name}")
            
        except ImportError:
            raise ImportError("chromadb is required for ChromaVectorStore")
        except Exception as e:
            logger.error(f"Error initializing ChromaDB: {e}")
            raise
    
    def add_documents(self, documents: List[Dict[str, Any]], embeddings: List[List[float]]):
        """Add documents with embeddings to ChromaDB."""
        ids = []
        contents = []
        metadatas = []
        
        for i, doc in enumerate(documents):
            doc_id = doc.get('id', f"doc_{i}")
            content = doc['content']
            
            # Flatten metadata for ChromaDB - only simple types allowed
            metadata = {}
            
            # Process document metadata
            doc_metadata = doc.get('metadata', {})
            for key, value in doc_metadata.items():
                if isinstance(value, (str, int, float, bool)):
                    metadata[key] = value
                elif isinstance(value, list):
                    # Convert list to comma-separated string
                    metadata[key] = ', '.join(str(item) for item in value)
                else:
                    # Convert complex objects to strings
                    metadata[key] = str(value)
            
            # Add other simple fields from doc
            for key, value in doc.items():
                if key not in ['content', 'metadata', 'id']:
                    if isinstance(value, (str, int, float, bool)):
                        metadata[key] = value
                    elif isinstance(value, list):
                        metadata[key] = ', '.join(str(item) for item in value)
                    else:
                        metadata[key] = str(value)
            
            ids.append(doc_id)
            contents.append(content)
            metadatas.append(metadata)
        
        try:
            self.collection.add(
                ids=ids,
                documents=contents,
                embeddings=embeddings,
                metadatas=metadatas
            )
            logger.info(f"Added {len(documents)} documents to ChromaDB")
            
        except Exception as e:
            logger.error(f"Error adding documents to ChromaDB: {e}")
            raise
    
    def similarity_search(self, query_embedding: List[float], k: int = 5) -> List[Dict[str, Any]]:
        """Search for similar documents in ChromaDB."""
        try:
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=k
            )
            
            documents = []
            for i in range(len(results['ids'][0])):
                doc = {
                    'id': results['ids'][0][i],
                    'score': 1 - results['distances'][0][i],  # Convert distance to similarity
                    'content': results['documents'][0][i],
                    'metadata': results['metadatas'][0][i] or {}
                }
                documents.append(doc)
            
            return documents
            
        except Exception as e:
            logger.error(f"Error searching ChromaDB: {e}")
            return []
    
    def delete_all(self):
        """Delete all documents from ChromaDB collection."""
        try:
            # Get all document IDs
            results = self.collection.get()
            if results['ids']:
                self.collection.delete(ids=results['ids'])
                logger.info(f"Deleted {len(results['ids'])} documents from ChromaDB")
            else:
                logger.info("No documents to delete from ChromaDB")
                
        except Exception as e:
            logger.error(f"Error deleting from ChromaDB: {e}")

def create_vector_store(config: Dict[str, Any]) -> VectorStore:
    """Factory function to create vector store based on configuration.
    
    Args:
        config: Vector store configuration
        
    Returns:
        VectorStore instance
    """
    store_type = config.get('type', '').lower()
    
    if store_type == 'pinecone':
        return PineconeVectorStore(
            api_key=config['api_key'],
            environment=config['environment'],
            index_name=config['index_name']
        )
    elif store_type == 'chroma':
        return ChromaVectorStore(
            persist_directory=config['persist_directory']
        )
    else:
        raise ValueError(f"Unsupported vector store type: {store_type}")
