"""
FastAPI application for Smart Study Buddy chat interface.
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import logging
import json
from datetime import datetime

from ..rag.rag_pipeline import RAGPipeline
from ..config import Config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic models
class ChatRequest(BaseModel):
    message: str
    user_context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    timestamp: str
    context_docs: int
    model_used: str
    user_context: Dict[str, Any]

class ReminderRequest(BaseModel):
    user_context: Dict[str, Any]

class CelebrationRequest(BaseModel):
    achievement: Dict[str, Any]
    user_context: Dict[str, Any]

class ChatAPI:
    """FastAPI application for chat interface."""
    
    def __init__(self):
        """Initialize FastAPI application."""
        self.app = FastAPI(
            title="Smart Study Buddy API",
            description="AI-powered study companion with RAG capabilities",
            version="0.1.0"
        )
        
        # Configure CORS
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        # Initialize RAG pipeline
        self.rag_pipeline = RAGPipeline()
        self.setup_complete = False
        
        # WebSocket connections
        self.active_connections: List[WebSocket] = []
        
        # Setup routes
        self._setup_routes()
        
        logger.info("Chat API initialized")
    
    def _setup_routes(self):
        """Setup API routes."""
        
        @self.app.on_event("startup")
        async def startup_event():
            """Initialize RAG pipeline on startup."""
            logger.info("Setting up RAG pipeline...")
            self.setup_complete = self.rag_pipeline.setup()
            if self.setup_complete:
                logger.info("RAG pipeline setup completed")
                # Load initial data
                await self._load_initial_data()
            else:
                logger.error("RAG pipeline setup failed")
        
        @self.app.get("/")
        async def root():
            """Root endpoint."""
            return {
                "message": "Smart Study Buddy API",
                "status": "ready" if self.setup_complete else "initializing",
                "version": "0.1.0"
            }
        
        @self.app.get("/health")
        async def health_check():
            """Health check endpoint."""
            stats = self.rag_pipeline.get_knowledge_base_stats()
            return {
                "status": "healthy" if self.setup_complete else "initializing",
                "pipeline_ready": stats['status'] == 'ready',
                "components": stats['components'],
                "timestamp": datetime.now().isoformat()
            }
        
        @self.app.post("/chat", response_model=ChatResponse)
        async def chat(request: ChatRequest):
            """Main chat endpoint."""
            if not self.setup_complete:
                raise HTTPException(status_code=503, detail="Service initializing")
            
            try:
                response = self.rag_pipeline.chat(
                    query=request.message,
                    user_context=request.user_context
                )
                
                if 'error' in response:
                    raise HTTPException(status_code=500, detail=response['error'])
                
                return ChatResponse(
                    response=response['response'],
                    timestamp=response['timestamp'],
                    context_docs=response.get('context_docs', 0),
                    model_used=response.get('model_used', 'unknown'),
                    user_context=response.get('user_context', {})
                )
                
            except Exception as e:
                logger.error(f"Chat error: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.post("/reminder")
        async def send_reminder(request: ReminderRequest):
            """Send study reminder."""
            if not self.setup_complete:
                raise HTTPException(status_code=503, detail="Service initializing")
            
            try:
                response = self.rag_pipeline.send_study_reminder(request.user_context)
                return response
                
            except Exception as e:
                logger.error(f"Reminder error: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.post("/celebrate")
        async def celebrate_achievement(request: CelebrationRequest):
            """Celebrate user achievement."""
            if not self.setup_complete:
                raise HTTPException(status_code=503, detail="Service initializing")
            
            try:
                response = self.rag_pipeline.celebrate_achievement(
                    achievement=request.achievement,
                    user_context=request.user_context
                )
                return response
                
            except Exception as e:
                logger.error(f"Celebration error: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/conversation/history")
        async def get_conversation_history(limit: int = 10):
            """Get conversation history."""
            if not self.setup_complete:
                raise HTTPException(status_code=503, detail="Service initializing")
            
            try:
                history = self.rag_pipeline.get_conversation_history(limit)
                return {"history": history}
                
            except Exception as e:
                logger.error(f"History error: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.delete("/conversation/history")
        async def clear_conversation_history():
            """Clear conversation history."""
            if not self.setup_complete:
                raise HTTPException(status_code=503, detail="Service initializing")
            
            try:
                self.rag_pipeline.clear_conversation_history()
                return {"message": "Conversation history cleared"}
                
            except Exception as e:
                logger.error(f"Clear history error: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.websocket("/ws")
        async def websocket_endpoint(websocket: WebSocket):
            """WebSocket endpoint for real-time chat."""
            await self.connect(websocket)
            try:
                while True:
                    # Receive message
                    data = await websocket.receive_text()
                    message_data = json.loads(data)
                    
                    # Process chat message
                    if self.setup_complete:
                        response = self.rag_pipeline.chat(
                            query=message_data.get('message', ''),
                            user_context=message_data.get('user_context', {})
                        )
                        
                        # Send response
                        await websocket.send_text(json.dumps(response))
                    else:
                        await websocket.send_text(json.dumps({
                            'error': 'Service initializing',
                            'response': 'I\'m still setting up. Please try again in a moment!'
                        }))
                        
            except WebSocketDisconnect:
                self.disconnect(websocket)
    
    async def connect(self, websocket: WebSocket):
        """Accept WebSocket connection."""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Active connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        """Remove WebSocket connection."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Active connections: {len(self.active_connections)}")
    
    async def _load_initial_data(self):
        """Load initial training data."""
        try:
            # Load data from JSON files
            from pathlib import Path
            data_dir = Path(__file__).parent.parent / "data"
            
            documents = []
            
            # Load behavior patterns
            behavior_file = data_dir / "user_behavior_patterns.json"
            if behavior_file.exists():
                with open(behavior_file, 'r') as f:
                    behavior_data = json.load(f)
                    documents.extend(self._convert_behavior_data(behavior_data))
            
            # Load motivational responses
            motivation_file = data_dir / "motivational_responses.json"
            if motivation_file.exists():
                with open(motivation_file, 'r') as f:
                    motivation_data = json.load(f)
                    documents.extend(self._convert_motivation_data(motivation_data))
            
            # Load study reminders
            reminders_file = data_dir / "study_reminders.json"
            if reminders_file.exists():
                with open(reminders_file, 'r') as f:
                    reminders_data = json.load(f)
                    documents.extend(self._convert_reminders_data(reminders_data))
            
            if documents:
                self.rag_pipeline.add_documents(documents)
                logger.info(f"Loaded {len(documents)} initial documents")
            else:
                logger.warning("No initial data files found")
                
        except Exception as e:
            logger.error(f"Error loading initial data: {e}")
    
    def _convert_behavior_data(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Convert behavior patterns to documents."""
        documents = []
        
        for category, patterns in data.get('behavior_patterns', {}).items():
            for pattern_name, pattern_data in patterns.items():
                doc = {
                    'id': f"behavior_{category}_{pattern_name}",
                    'content': f"{pattern_name}: {json.dumps(pattern_data)}",
                    'metadata': {
                        'type': 'behavior_pattern',
                        'category': category,
                        'pattern': pattern_name,
                        'topics': ['behavior', 'learning_patterns', category]
                    }
                }
                documents.append(doc)
        
        return documents
    
    def _convert_motivation_data(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Convert motivational responses to documents."""
        documents = []
        
        for category, responses in data.get('motivational_responses', {}).items():
            for i, response in enumerate(responses.get('responses', [])):
                doc = {
                    'id': f"motivation_{category}_{i}",
                    'content': response,
                    'metadata': {
                        'type': 'motivational_response',
                        'category': category,
                        'topics': ['motivation', 'encouragement', category]
                    }
                }
                documents.append(doc)
        
        return documents
    
    def _convert_reminders_data(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Convert study reminders to documents."""
        documents = []
        
        for category, reminders in data.get('study_reminders', {}).items():
            for i, reminder in enumerate(reminders.get('templates', [])):
                doc = {
                    'id': f"reminder_{category}_{i}",
                    'content': reminder,
                    'metadata': {
                        'type': 'study_reminder',
                        'category': category,
                        'topics': ['reminders', 'study_habits', category]
                    }
                }
                documents.append(doc)
        
        return documents

def create_app() -> FastAPI:
    """Create and return FastAPI application."""
    chat_api = ChatAPI()
    return chat_api.app

# For running with uvicorn
app = create_app()
