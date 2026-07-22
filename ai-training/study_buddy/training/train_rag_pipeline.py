"""
Smart Study Buddy - RAG Pipeline Training Orchestrator
Orchestrates: document processing → embedding generation → vector store indexing → retrieval quality verification

Run: python -m study_buddy.training.train_rag_pipeline
"""

import json
import sys
import os
import logging
import hashlib
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
import numpy as np

# Ensure the parent of study_buddy is on path (i.e., ai-training directory)
_study_buddy_parent = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if _study_buddy_parent not in sys.path:
    sys.path.insert(0, _study_buddy_parent)

from study_buddy.rag.rag_pipeline import RAGPipeline
from study_buddy.rag.embeddings.gemini_embeddings import GeminiEmbeddings
from study_buddy.rag.vector_store import create_vector_store
from study_buddy.rag.retrieval.retriever import Retriever
from study_buddy.config import Config

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class RAGPipelineTrainer:
    """Orchestrates the full RAG pipeline training lifecycle."""

    def __init__(self, config: Optional[Config] = None):
        self.config = config or Config()
        self.data_dir = Path(__file__).parent.parent / "data"
        self.results_dir = self.data_dir / "processed"
        self.results_dir.mkdir(parents=True, exist_ok=True)

    # ----------------------------------------------------------------
    # STEP 1: COLLECT ALL DOCUMENTS
    # ----------------------------------------------------------------
    def collect_all_documents(self) -> List[Dict[str, Any]]:
        """Collect all documents from .txt and .json data sources."""
        documents = []

        # --- .txt files ---
        logger.info("Collecting .txt documents...")
        for txt_path in sorted(self.data_dir.glob("*.txt")):
            if txt_path.name == "process_new_documents.py":
                continue
            try:
                content = txt_path.read_text(encoding="utf-8")
                documents.append({
                    "id": txt_path.stem,
                    "content": content,
                    "metadata": {
                        "type": "text_document",
                        "source": txt_path.name,
                        "category": self._infer_category(txt_path.stem),
                        "quality_score": "high",
                    }
                })
                logger.info(f"  Added: {txt_path.name} ({len(content)} chars)")
            except Exception as e:
                logger.error(f"  Failed: {txt_path.name} — {e}")

        # --- .json files ---
        logger.info("Collecting .json documents...")
        json_files = [
            "technical_concepts.json", "behavioral_questions.json",
            "coding_patterns.json", "system_design_concepts.json",
            "company_specific_prep.json", "motivational_responses.json",
            "study_strategies.json", "interview_questions.json",
            "user_behavior_patterns.json", "study_reminders.json",
        ]
        for jf in json_files:
            jf_path = self.data_dir / jf
            if not jf_path.exists():
                logger.warning(f"  Skipped (not found): {jf}")
                continue
            try:
                data = json.loads(jf_path.read_text(encoding="utf-8"))
                if isinstance(data, list):
                    for item in data:
                        if "id" not in item:
                            item_str = json.dumps(item, sort_keys=True)
                            item_hash = hashlib.md5(item_str.encode('utf-8')).hexdigest()[:16]
                            item["id"] = f"{jf_path.stem}_{item_hash}"
                        documents.append(item)
                elif isinstance(data, dict):
                    documents.append({
                        "id": jf_path.stem,
                        "content": json.dumps(data, indent=2),
                        "metadata": {"type": "json_document", "source": jf}
                    })
                logger.info(f"  Added: {jf}")
            except Exception as e:
                logger.error(f"  Failed: {jf} — {e}")

        logger.info(f"Total documents collected: {len(documents)}")
        return documents

    def _infer_category(self, stem: str) -> str:
        """Map a filename stem to a content category."""
        mapping = {
            "advanced_algorithms": "algorithms",
            "system_design_interviews": "system_design",
            "system_design_deep_dive": "system_design",
            "behavioral_interview_mastery": "behavioral",
            "coding_interview_patterns": "coding_patterns",
            "company_specific_guides": "company_prep",
            "resume_optimization": "career_prep",
            "negotiation_strategies": "career_advancement",
            "frontend_interview_questions": "frontend",
            "leadership_mgmt_interviews": "leadership",
            "data_ml_interview_questions": "data_ml",
            "mock_interview_scripts": "mock_interviews",
            "star_method_examples": "behavioral",
            "web_development": "frontend",
            "software_engineering": "general",
            "machine_learning": "data_ml",
            "database_fundamentals": "databases",
            "cloud_computing": "cloud_devops",
            "devops_cloud_infrastructure": "cloud_devops",
            "mobile_development": "mobile",
            "blockchain_web3_development": "blockchain",
            "cybersecurity_ethical_hacking": "security",
            "generative_ai_llm_mastery": "ai_ml",
            "data_science_analytics": "data_ml",
        }
        return mapping.get(stem, "general")

    # ----------------------------------------------------------------
    # STEP 2: CHUNK DOCUMENTS
    # ----------------------------------------------------------------
    def chunk_documents(
        self, documents: List[Dict[str, Any]], chunk_size: int = 1000, overlap: int = 200
    ) -> List[Dict[str, Any]]:
        """Split long documents into overlapping chunks."""
        chunked = []
        for doc in documents:
            content = doc.get("content", "")
            if not content:
                continue

            # For very large documents, split into sections then chunk
            sections = content.split("\n\n")
            buffer = ""
            chunk_idx = 0

            for section in sections:
                if len(buffer) + len(section) < chunk_size:
                    buffer += section + "\n\n"
                else:
                    if buffer.strip():
                        chunked.append(self._make_chunk(doc, buffer, chunk_idx))
                        chunk_idx += 1
                    # Carry over overlap
                    buffer = (buffer[-overlap:] if len(buffer) > overlap else "") + section + "\n\n"

            if buffer.strip():
                chunked.append(self._make_chunk(doc, buffer, chunk_idx))

        logger.info(f"Chunked into {len(chunked)} segments (size={chunk_size}, overlap={overlap})")
        return chunked

    def _make_chunk(self, parent: Dict, text: str, idx: int) -> Dict:
        return {
            "chunk_id": f"{parent['id']}_chunk_{idx}",
            "document_id": parent["id"],
            "content": text.strip(),
            "metadata": {
                **parent.get("metadata", {}),
                "chunk_index": idx,
            }
        }

    # ----------------------------------------------------------------
    # STEP 3: GENERATE EMBEDDINGS & INDEX VECTOR STORE
    # ----------------------------------------------------------------
    def build_vector_index(self, chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate embeddings and index chunks in the vector store."""
        logger.info("Building vector index...")

        # Validate config
        if not self.config.GEMINI_API_KEY:
            logger.error("GEMINI_API_KEY is not set. Aborting index build.")
            return {"status": "failed", "error": "Missing GEMINI_API_KEY"}

        # Initialize pipeline components
        embeddings = GeminiEmbeddings(
            model_name=self.config.EMBEDDING_MODEL,
            api_key=self.config.GEMINI_API_KEY,
        )

        vector_config = self.config.get_vector_db_config()
        vector_store = create_vector_store(vector_config)

        retriever = Retriever(embeddings, vector_store)

        texts = [c["content"] for c in chunks]
        logger.info(f"Generating {len(texts)} embeddings...")
        try:
            emb_vectors = embeddings.embed_texts(texts)
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            return {"status": "failed", "error": str(e)}

        logger.info(f"Adding {len(chunks)} chunks to vector store...")
        try:
            vector_store.add_documents(chunks, emb_vectors)
        except Exception as e:
            logger.error(f"Vector store indexing failed: {e}")
            return {"status": "failed", "error": str(e)}

        # Save enhanced training data for downstream use
        enhanced_path = self.results_dir / "enhanced_training_data.json"
        # Map chunk_id → id for compatibility
        for c in chunks:
            c["id"] = c["chunk_id"]
        enhanced_path.write_text(
            json.dumps(chunks, indent=2, ensure_ascii=False), encoding="utf-8"
        )
        logger.info(f"Saved enhanced training data → {enhanced_path}")

        return {
            "status": "success",
            "total_chunks": len(chunks),
            "vector_db_type": vector_config["type"],
        }

    # ----------------------------------------------------------------
    # STEP 4: RETRIEVAL QUALITY VERIFICATION
    # ----------------------------------------------------------------
    def verify_retrieval_quality(self, test_queries: List[str] = None) -> Dict[str, Any]:
        """Evaluate retrieval quality by running sample queries and scoring results."""
        if test_queries is None:
            test_queries = [
                "How do I prepare for behavioral interviews?",
                "Explain the CAP theorem in system design",
                "How to negotiate salary after a job offer?",
                "What are common coding interview patterns?",
                "How to optimize a React application?",
                "Tell me about the STAR method",
                "What machine learning algorithms should I know?",
                "How to lead a technical team?",
            ]

        logger.info("Verifying retrieval quality...")

        pipeline = RAGPipeline(self.config)
        if not pipeline.setup():
            logger.error("RAG pipeline setup failed. Skipping verification.")
            return {"status": "skipped", "error": "Pipeline setup failed"}

        results = []
        for q in test_queries:
            try:
                resp = pipeline.chat(q, user_context={"persona": "test_verification"})
                results.append({
                    "query": q,
                    "response_length": len(resp.get("response", "")),
                    "context_docs": resp.get("context_docs", 0),
                    "has_response": bool(resp.get("response")),
                    "error": resp.get("error"),
                })
                logger.info(f"  ✓ [{resp.get('context_docs', 0)} docs] {q[:60]}...")
            except Exception as e:
                results.append({"query": q, "error": str(e)})
                logger.warning(f"  ✗ {q[:60]}... — {e}")

        success_rate = sum(1 for r in results if r.get("has_response") and not r.get("error"))
        total = len(results)

        context_docs_list = [r["context_docs"] for r in results if "context_docs" in r]
        avg_context_docs = round(np.mean(context_docs_list), 1) if context_docs_list else 0

        report = {
            "status": "completed",
            "total_queries": total,
            "successful_queries": success_rate,
            "success_rate": round(success_rate / total * 100, 1) if total else 0,
            "avg_context_docs": avg_context_docs,
            "details": results,
        }

        # Save verification report
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_path = self.results_dir / f"retrieval_verification_{ts}.json"
        report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
        logger.info(f"Verification report → {report_path}")

        return report

    # ----------------------------------------------------------------
    # FULL PIPELINE
    # ----------------------------------------------------------------
    def run_full_pipeline(
        self,
        chunk_size: int = 1000,
        overlap: int = 200,
        verify: bool = True,
    ) -> Dict[str, Any]:
        """Run the complete training pipeline end-to-end."""
        logger.info("=" * 60)
        logger.info("RAG PIPELINE TRAINING — START")
        logger.info("=" * 60)

        timeline = {}

        # Step 1
        t0 = datetime.now()
        docs = self.collect_all_documents()
        timeline["collect_documents"] = (datetime.now() - t0).total_seconds()

        # Step 2
        t0 = datetime.now()
        chunks = self.chunk_documents(docs, chunk_size, overlap)
        timeline["chunk_documents"] = (datetime.now() - t0).total_seconds()

        # Step 3
        t0 = datetime.now()
        index_result = self.build_vector_index(chunks)
        timeline["build_vector_index"] = (datetime.now() - t0).total_seconds()

        # Step 4 (optional)
        verification = None
        if verify and index_result.get("status") == "success":
            t0 = datetime.now()
            verification = self.verify_retrieval_quality()
            timeline["verify_retrieval_quality"] = (datetime.now() - t0).total_seconds()

        # Summary
        summary = {
            "pipeline_status": index_result.get("status", "failed"),
            "timeline_seconds": timeline,
            "total_documents": len(docs),
            "total_chunks": len(chunks),
            "index_result": index_result,
            "verification": verification,
            "config": {
                "chunk_size": chunk_size,
                "overlap": overlap,
                "embedding_model": self.config.EMBEDDING_MODEL,
                "vector_db": self.config.get_vector_db_config()["type"],
            },
            "completed_at": datetime.now().isoformat(),
        }

        # Save full pipeline report
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        summary_path = self.results_dir / f"pipeline_training_{ts}.json"
        summary_path.write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")

        logger.info("=" * 60)
        logger.info("RAG PIPELINE TRAINING — COMPLETE")
        logger.info(f"  Documents : {len(docs)}")
        logger.info(f"  Chunks    : {len(chunks)}")
        logger.info(f"  Index     : {index_result.get('status')}")
        logger.info(f"  Report    : {summary_path}")
        logger.info("=" * 60)

        return summary


def main():
    trainer = RAGPipelineTrainer()
    trainer.run_full_pipeline(chunk_size=1000, overlap=200, verify=True)


if __name__ == "__main__":
    main()
