#!/usr/bin/env python3
"""
Script to process new high-quality documents and update training data.
This script reads the new documents, processes them, and updates the vector store.
"""

import json
import os
from pathlib import Path
from typing import List, Dict, Any
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DocumentProcessor:
    """Process new documents for the interview bot knowledge base."""
    
    def __init__(self, data_dir: str):
        self.data_dir = Path(data_dir)
        self.new_docs_dir = self.data_dir
        self.processed_dir = self.data_dir / "processed"
        
    def read_new_documents(self) -> List[Dict[str, Any]]:
        """Read all new text documents."""
        new_documents = []
        
        # Define new document files
        new_doc_files = [
            "advanced_algorithms.txt",
            "system_design_interviews.txt", 
            "behavioral_interview_mastery.txt",
            "coding_interview_patterns.txt",
            "company_specific_guides.txt",
            "resume_optimization.txt",
            "negotiation_strategies.txt"
        ]
        
        for doc_file in new_doc_files:
            doc_path = self.new_docs_dir / doc_file
            if doc_path.exists():
                try:
                    with open(doc_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Create document entry
                    doc_entry = {
                        "id": doc_file.replace('.txt', ''),
                        "title": self._extract_title(content),
                        "content": content,
                        "metadata": {
                            "type": "enhanced_knowledge",
                            "category": self._categorize_document(doc_file),
                            "difficulty": "comprehensive",
                            "topics": self._extract_topics(content),
                            "source": "expert_curated",
                            "quality_score": "high",
                            "interview_frequency": "very_high"
                        }
                    }
                    new_documents.append(doc_entry)
                    logger.info(f"Processed document: {doc_file}")
                    
                except Exception as e:
                    logger.error(f"Error processing {doc_file}: {e}")
            else:
                logger.warning(f"Document not found: {doc_file}")
        
        return new_documents
    
    def _extract_title(self, content: str) -> str:
        """Extract title from document content."""
        lines = content.split('\n')
        for line in lines[:5]:  # Check first 5 lines
            line = line.strip()
            if line and not line.startswith('=') and len(line) < 100:
                return line
        return "Interview Preparation Guide"
    
    def _categorize_document(self, filename: str) -> str:
        """Categorize document based on filename."""
        categories = {
            "advanced_algorithms": "technical_algorithms",
            "system_design_interviews": "system_design",
            "behavioral_interview_mastery": "behavioral",
            "coding_interview_patterns": "coding_patterns",
            "company_specific_guides": "company_prep",
            "resume_optimization": "career_prep",
            "negotiation_strategies": "career_advancement"
        }
        return categories.get(filename.replace('.txt', ''), "general")
    
    def _extract_topics(self, content: str) -> List[str]:
        """Extract key topics from document content."""
        # Simple topic extraction based on headers and key terms
        topics = []
        lines = content.split('\n')
        
        # Look for headers (lines with === or --- underlines)
        for i, line in enumerate(lines):
            line = line.strip()
            if line and i < len(lines) - 1:
                next_line = lines[i + 1].strip()
                if next_line.startswith('===') or next_line.startswith('---'):
                    # This is a header
                    topic = line.lower().replace(' ', '_').replace(':', '').replace(',', '')
                    if len(topic) > 2 and len(topic) < 50:
                        topics.append(topic)
        
        # Add common interview topics if not found
        common_topics = ["algorithms", "data_structures", "system_design", "behavioral", 
                        "coding_patterns", "interview_preparation", "career_growth"]
        for topic in common_topics:
            if topic in content.lower() and topic not in topics:
                topics.append(topic)
        
        return topics[:10]  # Limit to 10 topics
    
    def load_existing_knowledge_base(self) -> List[Dict[str, Any]]:
        """Load existing knowledge base from JSON files."""
        existing_docs = []
        
        json_files = [
            "technical_concepts.json",
            "behavioral_questions.json",
            "coding_patterns.json",
            "system_design_concepts.json",
            "company_specific_prep.json",
            "motivational_responses.json",
            "study_strategies.json",
            "interview_questions.json",
            "user_behavior_patterns.json",
            "study_reminders.json"
        ]
        
        for json_file in json_files:
            json_path = self.new_docs_dir / json_file
            if json_path.exists():
                try:
                    with open(json_path, 'r', encoding='utf-8') as f:
                        docs = json.load(f)
                        if isinstance(docs, list):
                            existing_docs.extend(docs)
                            logger.info(f"Loaded {len(docs)} docs from {json_file}")
                        else:
                            existing_docs.append(docs)
                            logger.info(f"Loaded 1 doc from {json_file}")
                except Exception as e:
                    logger.error(f"Error loading {json_file}: {e}")
            else:
                logger.warning(f"JSON file not found: {json_file}")
        
        logger.info(f"Total existing documents loaded: {len(existing_docs)}")
        return existing_docs
    
    def create_enhanced_training_data(self, new_documents: List[Dict[str, Any]], 
                                    existing_docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Create enhanced training dataset combining new and existing documents."""
        
        # Combine all documents
        all_documents = existing_docs + new_documents
        
        # Create training entries
        training_data = []
        
        for doc in all_documents:
            # Skip documents without ID
            if 'id' not in doc:
                logger.warning(f"Skipping document without ID: {doc}")
                continue
                
            # Extract content from different document structures
            content = self._extract_content_from_doc(doc)
            if not content:
                logger.warning(f"Skipping document {doc.get('id', 'unknown')} - no content found")
                continue
                
            # Split content into manageable chunks
            content_chunks = self._chunk_content(content)
            
            for i, chunk in enumerate(content_chunks):
                training_entry = {
                    "document_id": doc['id'],
                    "chunk_id": f"{doc['id']}_chunk_{i}",
                    "content": chunk,
                    "metadata": doc.get('metadata', {}),
                    "embedding_text": self._prepare_embedding_text(chunk, doc.get('metadata', {})),
                    "quality_score": doc.get('metadata', {}).get('quality_score', 'medium'),
                    "category": doc.get('metadata', {}).get('category', 'general')
                }
                training_data.append(training_entry)
        
        logger.info(f"Created {len(training_data)} training entries")
        return training_data
    
    def _extract_content_from_doc(self, doc: Dict[str, Any]) -> str:
        """Extract content from different document structures."""
        content_parts = []
        
        # Try different content fields
        if 'content' in doc and doc['content']:
            content_parts.append(str(doc['content']))
        
        if 'question' in doc and doc['question']:
            content_parts.append(f"Question: {doc['question']}")
        
        if 'answer' in doc and doc['answer']:
            content_parts.append(f"Answer: {doc['answer']}")
        
        if 'description' in doc and doc['description']:
            content_parts.append(f"Description: {doc['description']}")
        
        if 'explanation' in doc and doc['explanation']:
            content_parts.append(f"Explanation: {doc['explanation']}")
        
        if 'pattern' in doc and doc['pattern']:
            content_parts.append(f"Pattern: {doc['pattern']}")
        
        if 'example' in doc and doc['example']:
            content_parts.append(f"Example: {doc['example']}")
        
        if 'solution' in doc and doc['solution']:
            content_parts.append(f"Solution: {doc['solution']}")
        
        if 'response' in doc and doc['response']:
            content_parts.append(f"Response: {doc['response']}")
        
        # Combine all available content
        if content_parts:
            return "\n\n".join(content_parts)
        
        return ""
    
    def _chunk_content(self, content: str, chunk_size: int = 1000) -> List[str]:
        """Split content into chunks for processing."""
        chunks = []
        
        # Split by sections first
        sections = content.split('\n\n')
        current_chunk = ""
        
        for section in sections:
            if len(current_chunk) + len(section) < chunk_size:
                current_chunk += section + "\n\n"
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = section + "\n\n"
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        # If no sections or chunks too small, split by character
        if not chunks:
            for i in range(0, len(content), chunk_size):
                chunks.append(content[i:i + chunk_size])
        
        return chunks
    
    def _prepare_embedding_text(self, content: str, metadata: Dict[str, Any]) -> str:
        """Prepare text for embedding generation."""
        # Combine content with metadata for better embeddings
        metadata_text = " ".join([
            metadata.get('category', ''),
            " ".join(metadata.get('topics', [])),
            metadata.get('type', '')
        ])
        
        return f"{content} {metadata_text}"
    
    def save_enhanced_data(self, training_data: List[Dict[str, Any]]):
        """Save enhanced training data to files."""
        # Save JSON version
        json_path = self.processed_dir / "enhanced_training_data.json"
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(training_data, f, indent=2, ensure_ascii=False)
        logger.info(f"Saved enhanced training data to {json_path}")
        
        # Save CSV version for compatibility
        import csv
        csv_path = self.processed_dir / "enhanced_training_data.csv"
        
        if training_data:
            fieldnames = ["document_id", "chunk_id", "content", "quality_score", "category", 
                         "embedding_text", "metadata"]
            
            with open(csv_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                
                for entry in training_data:
                    row = {field: entry.get(field, '') for field in fieldnames}
                    # Convert metadata dict to string for CSV
                    if isinstance(row['metadata'], dict):
                        row['metadata'] = json.dumps(row['metadata'])
                    writer.writerow(row)
            
            logger.info(f"Saved enhanced training data to {csv_path}")
        
        # Update summary
        summary = {
            "total_documents": len(set(entry['document_id'] for entry in training_data)),
            "total_chunks": len(training_data),
            "categories": list(set(entry['category'] for entry in training_data)),
            "quality_distribution": {
                quality: len([e for e in training_data if e['quality_score'] == quality])
                for quality in set(entry['quality_score'] for entry in training_data)
            },
            "enhancement_date": "2025-11-15",
            "new_documents_added": [
                "advanced_algorithms.txt",
                "system_design_interviews.txt", 
                "behavioral_interview_mastery.txt",
                "coding_interview_patterns.txt",
                "company_specific_guides.txt",
                "resume_optimization.txt",
                "negotiation_strategies.txt"
            ]
        }
        
        summary_path = self.processed_dir / "enhanced_training_summary.json"
        with open(summary_path, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        logger.info(f"Saved enhancement summary to {summary_path}")

def main():
    """Main processing function."""
    # Set up paths
    data_dir = Path(__file__).parent
    
    # Initialize processor
    processor = DocumentProcessor(data_dir)
    
    logger.info("Starting document processing...")
    
    # Read new documents
    new_documents = processor.read_new_documents()
    logger.info(f"Read {len(new_documents)} new documents")
    
    # Load existing knowledge base
    existing_docs = processor.load_existing_knowledge_base()
    logger.info(f"Loaded {len(existing_docs)} existing documents")
    
    # Create enhanced training data
    training_data = processor.create_enhanced_training_data(new_documents, existing_docs)
    
    # Save enhanced data
    processor.save_enhanced_data(training_data)
    
    logger.info("Document processing completed successfully!")
    
    # Print summary
    print("\n" + "="*50)
    print("ENHANCEMENT SUMMARY")
    print("="*50)
    print(f"New documents added: {len(new_documents)}")
    print(f"Existing documents: {len(existing_docs)}")
    print(f"Total training chunks: {len(training_data)}")
    print(f"Categories covered: {len(set(entry['category'] for entry in training_data))}")
    print("\nEnhanced files created:")
    print("- enhanced_training_data.json")
    print("- enhanced_training_data.csv") 
    print("- enhanced_training_summary.json")
    print("="*50)

if __name__ == "__main__":
    main()
