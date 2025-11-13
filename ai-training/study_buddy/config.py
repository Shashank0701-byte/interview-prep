"""
Configuration management for Smart Study Buddy RAG system.
"""

import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Configuration class for RAG system."""
    
    # API Keys
    GEMINI_API_KEY: str = os.getenv('GEMINI_API_KEY', '')
    PINECONE_API_KEY: str = os.getenv('PINECONE_API_KEY', '')
    
    # Gemini Configuration
    EMBEDDING_MODEL: str = os.getenv('EMBEDDING_MODEL', 'models/text-embedding-004')
    GENERATION_MODEL: str = os.getenv('GENERATION_MODEL', 'gemini-1.5-pro')
    GENERATION_MODEL_FAST: str = os.getenv('GENERATION_MODEL_FAST', 'gemini-1.5-flash')
    MAX_CONTEXT_LENGTH: int = int(os.getenv('MAX_CONTEXT_LENGTH', '2000000'))
    
    # Vector Database Configuration
    PINECONE_ENVIRONMENT: str = os.getenv('PINECONE_ENVIRONMENT', 'gcp-starter')
    PINECONE_INDEX_NAME: str = os.getenv('PINECONE_INDEX_NAME', 'study-buddy-rag')
    CHROMA_PERSIST_DIRECTORY: str = os.getenv('CHROMA_PERSIST_DIRECTORY', './chroma_db')
    
    # Text Processing
    CHUNK_SIZE: int = int(os.getenv('CHUNK_SIZE', '1000'))
    CHUNK_OVERLAP: int = int(os.getenv('CHUNK_OVERLAP', '200'))
    
    # MongoDB Configuration
    MONGODB_URI: str = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/interview-prep')
    
    # API Configuration
    API_HOST: str = os.getenv('API_HOST', 'localhost')
    API_PORT: int = int(os.getenv('API_PORT', '8001'))
    DEBUG: bool = os.getenv('DEBUG', 'false').lower() == 'true'
    
    # Logging
    LOG_LEVEL: str = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE: str = os.getenv('LOG_FILE', 'logs/study_buddy.log')
    
    # Paths
    BASE_DIR: Path = Path(__file__).parent.parent
    DATA_DIR: Path = BASE_DIR / "study-buddy" / "data"
    MODELS_DIR: Path = BASE_DIR / "study-buddy" / "models"
    LOGS_DIR: Path = BASE_DIR / "logs"
    
    @classmethod
    def validate(cls) -> bool:
        """Validate configuration."""
        errors = []
        
        if not cls.GEMINI_API_KEY:
            errors.append("GEMINI_API_KEY is required")
        
        if not cls.PINECONE_API_KEY and not Path(cls.CHROMA_PERSIST_DIRECTORY).parent.exists():
            errors.append("Either PINECONE_API_KEY or valid CHROMA_PERSIST_DIRECTORY is required")
        
        if errors:
            print("❌ Configuration errors:")
            for error in errors:
                print(f"   - {error}")
            return False
        
        return True
    
    @classmethod
    def create_directories(cls):
        """Create necessary directories."""
        directories = [cls.LOGS_DIR, cls.DATA_DIR, cls.MODELS_DIR]
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
    
    @classmethod
    def get_vector_db_config(cls) -> dict:
        """Get vector database configuration."""
        if cls.PINECONE_API_KEY:
            return {
                "type": "pinecone",
                "api_key": cls.PINECONE_API_KEY,
                "environment": cls.PINECONE_ENVIRONMENT,
                "index_name": cls.PINECONE_INDEX_NAME
            }
        else:
            return {
                "type": "chroma",
                "persist_directory": cls.CHROMA_PERSIST_DIRECTORY
            }
    
    @classmethod
    def summary(cls):
        """Print configuration summary."""
        print("🔧 Smart Study Buddy Configuration:")
        print(f"   Embedding Model: {cls.EMBEDDING_MODEL}")
        print(f"   Generation Model: {cls.GENERATION_MODEL}")
        print(f"   Vector DB: {cls.get_vector_db_config()['type'].title()}")
        print(f"   Chunk Size: {cls.CHUNK_SIZE}")
        print(f"   API Port: {cls.API_PORT}")
        print(f"   Debug Mode: {cls.DEBUG}")
