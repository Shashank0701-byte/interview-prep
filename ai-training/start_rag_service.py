#!/usr/bin/env python3
"""
Week 3: FastAPI RAG Service Launcher

This script starts the Python FastAPI service that provides RAG capabilities
to your Node.js backend.
"""

import uvicorn
import sys
from pathlib import Path

# Add current directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

from study_buddy.api.chat_api import ChatAPI

def main():
    """Start the FastAPI RAG service."""
    print("🚀 Starting Smart Study Buddy RAG Service")
    print("=" * 50)
    print("📡 Service will be available at: http://localhost:8001")
    print("📚 RAG Pipeline: Embeddings + Vector DB + Gemini AI")
    print("🔗 Ready for Node.js backend integration")
    print("=" * 50)
    
    # Create FastAPI app
    chat_api = ChatAPI()
    app = chat_api.app
    
    # Start the server
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        log_level="info",
        reload=False  # Set to True for development
    )

if __name__ == "__main__":
    main()
