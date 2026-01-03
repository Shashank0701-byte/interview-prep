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

# -------------------------------------------------
# Pydantic Models
# -------------------------------------------------

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


# -------------------------------------------------
# Main ChatAPI Class
# -------------------------------------------------

class ChatAPI:
    """FastAPI application for chat interface."""

    def __init__(self):
        """Initialize FastAPI application."""
        self.app = FastAPI(
            title="Smart Study Buddy API",
            description="AI-powered study companion with RAG capabilities",
            version="0.1.0"
        )

        # -------------------------------------------------
        # CORS (UPDATED FOR RENDER DEPLOYMENT)
        # -------------------------------------------------
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=[
                "*",
                "https://interview-prep-1-ferg.onrender.com",
                "http://localhost:3000",
                "http://localhost:5173",
            ],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        # Initialize RAG
        self.rag_pipeline = RAGPipeline()
        self.setup_complete = False

        # WebSocket clients
        self.active_connections: List[WebSocket] = []

        # Setup routes
        self._setup_routes()

        logger.info("Chat API initialized")

    # -------------------------------------------------
    # ROUTES
    # -------------------------------------------------

    def _setup_routes(self):

        @self.app.on_event("startup")
        async def startup_event():
            """Initialize RAG pipeline."""
            logger.info("Setting up RAG pipeline...")
            self.setup_complete = self.rag_pipeline.setup()

            if self.setup_complete:
                logger.info("RAG pipeline setup completed successfully")
                await self._load_initial_data()
            else:
                logger.error("RAG pipeline setup FAILED")

        @self.app.get("/")
        async def root():
            return {
                "message": "Smart Study Buddy API",
                "status": "ready" if self.setup_complete else "initializing",
                "version": "0.1.0"
            }

        # -------------------------------------------------
        # HEALTH ENDPOINTS
        # -------------------------------------------------

        @self.app.get("/health")
        async def health_check():
            stats = self.rag_pipeline.get_knowledge_base_stats()
            return {
                "status": "healthy" if self.setup_complete else "initializing",
                "pipeline_ready": stats["status"] == "ready",
                "components": stats["components"],
                "timestamp": datetime.now().isoformat()
            }

        # ⭐ NEW: FRONTEND EXPECTS /ai/health
        @self.app.get("/ai/health")
        async def ai_health():
            stats = self.rag_pipeline.get_knowledge_base_stats()
            return {
                "success": True,
                "status": "healthy" if self.setup_complete else "initializing",
                "pipeline_ready": stats["status"] == "ready",
                "components": stats["components"],
                "model": Config.GENERATION_MODEL,
                "timestamp": datetime.now().isoformat()
            }

        # -------------------------------------------------
        # CHAT
        # -------------------------------------------------

        @self.app.post("/chat", response_model=ChatResponse)
        async def chat(request: ChatRequest):
            if not self.setup_complete:
                raise HTTPException(status_code=503, detail="Service initializing")

            try:
                response = self.rag_pipeline.chat(
                    query=request.message,
                    user_context=request.user_context
                )

                if "error" in response:
                    raise HTTPException(status_code=500, detail=response["error"])

                return ChatResponse(
                    response=response["response"],
                    timestamp=response["timestamp"],
                    context_docs=response.get("context_docs", 0),
                    model_used=response.get("model_used", "unknown"),
                    user_context=response.get("user_context", {})
                )

            except Exception as e:
                logger.error(f"Chat error: {e}")
                raise HTTPException(status_code=500, detail=str(e))

        # -------------------------------------------------
        # REMINDERS
        # -------------------------------------------------

        @self.app.post("/reminder")
        async def send_reminder(request: ReminderRequest):
            if not self.setup_complete:
                raise HTTPException(status_code=503, detail="Service initializing")

            try:
                return self.rag_pipeline.send_study_reminder(request.user_context)
            except Exception as e:
                logger.error(f"Reminder error: {e}")
                raise HTTPException(status_code=500, detail=str(e))

        # -------------------------------------------------
        # CELEBRATION
        # -------------------------------------------------

        @self.app.post("/celebrate")
        async def celebrate_achievement(request: CelebrationRequest):
            if not self.setup_complete:
                raise HTTPException(status_code=503, detail="Service initializing")
            try:
                return self.rag_pipeline.celebrate_achievement(
                    achievement=request.achievement,
                    user_context=request.user_context
                )
            except Exception as e:
                logger.error(f"Celebration error: {e}")
                raise HTTPException(status_code=500, detail=str(e))

        # -------------------------------------------------
        # CONVERSATION HISTORY
        # -------------------------------------------------

        @self.app.get("/conversation/history")
        async def get_history(limit: int = 10):
            if not self.setup_complete:
                raise HTTPException(status_code=503, detail="Service initializing")
            return {"history": self.rag_pipeline.get_conversation_history(limit)}

        @self.app.delete("/conversation/history")
        async def clear_history():
            if not self.setup_complete:
                raise HTTPException(status_code=503, detail="Service initializing")
            self.rag_pipeline.clear_conversation_history()
            return {"message": "Conversation history cleared"}

        # -------------------------------------------------
        # WEBSOCKET ENDPOINT
        # -------------------------------------------------

        @self.app.websocket("/ws")
        async def websocket_endpoint(websocket: WebSocket):
            await self.connect(websocket)

            try:
                while True:
                    raw = await websocket.receive_text()
                    payload = json.loads(raw)

                    if self.setup_complete:
                        response = self.rag_pipeline.chat(
                            query=payload.get("message", ""),
                            user_context=payload.get("user_context", {})
                        )
                        await websocket.send_text(json.dumps(response))
                    else:
                        await websocket.send_text(json.dumps({
                            "error": "Service initializing",
                            "response": "Please wait, loading knowledge base..."
                        }))

            except WebSocketDisconnect:
                self.disconnect(websocket)

    # -------------------------------------------------
    # WEBSOCKET MGMT
    # -------------------------------------------------

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Active: {len(self.active_connections)}")

    # -------------------------------------------------
    # LOAD INITIAL DATA INTO RAG
    # -------------------------------------------------

    async def _load_initial_data(self):
        try:
            from pathlib import Path
            data_dir = Path(__file__).parent.parent / "data"

            documents = []

            # behavior patterns
            behavior = data_dir / "user_behavior_patterns.json"
            if behavior.exists():
                data = json.load(open(behavior))
                documents.extend(self._convert_behavior_data(data))

            # motivation
            motivation = data_dir / "motivational_responses.json"
            if motivation.exists():
                data = json.load(open(motivation))
                documents.extend(self._convert_motivation_data(data))

            # reminders
            reminders = data_dir / "study_reminders.json"
            if reminders.exists():
                data = json.load(open(reminders))
                documents.extend(self._convert_reminders_data(data))

            # enhanced training data
            enhanced_data = data_dir / "processed" / "enhanced_training_data.json"
            if enhanced_data.exists():
                try:
                    data = json.load(open(enhanced_data, encoding='utf-8'))
                    # Map chunk_id to id for vector store
                    for item in data:
                        if 'id' not in item and 'chunk_id' in item:
                            item['id'] = item['chunk_id']
                    
                    documents.extend(data)
                    logger.info(f"Loaded {len(data)} enhanced training documents")
                except Exception as e:
                    logger.error(f"Error loading enhanced data: {e}")

            if documents:
                self.rag_pipeline.add_documents(documents)
                logger.info(f"Loaded {len(documents)} documents into RAG")

        except Exception as e:
            logger.error(f"Error loading initial RAG data: {e}")

    # -------------------------------------------------
    # DOCUMENT CONVERSION HELPERS
    # -------------------------------------------------

    def _convert_behavior_data(self, data):
        docs = []
        for category, patterns in data.get("behavior_patterns", {}).items():
            for name, content in patterns.items():
                docs.append({
                    "id": f"behavior_{category}_{name}",
                    "content": f"{name}: {json.dumps(content)}",
                    "metadata": {
                        "type": "behavior_pattern",
                        "category": category
                    }
                })
        return docs

    def _convert_motivation_data(self, data):
        docs = []
        for bucket, section in data.get("motivational_responses", {}).items():
            for i, text in enumerate(section.get("responses", [])):
                docs.append({
                    "id": f"motivation_{bucket}_{i}",
                    "content": text,
                    "metadata": {"type": "motivational_response", "category": bucket}
                })
        return docs

    def _convert_reminders_data(self, data):
        docs = []
        for bucket, section in data.get("study_reminders", {}).items():
            for i, template in enumerate(section.get("templates", [])):
                docs.append({
                    "id": f"reminder_{bucket}_{i}",
                    "content": template,
                    "metadata": {"type": "reminder", "category": bucket}
                })
        return docs


# -------------------------------------------------
# Create app for uvicorn
# -------------------------------------------------

def create_app():
    api = ChatAPI()
    return api.app

app = create_app()
