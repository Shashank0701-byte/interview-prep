"""
Basic test script for RAG pipeline functionality.
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
current_dir = Path(__file__).parent.parent.parent
sys.path.insert(0, str(current_dir))

from study_buddy.rag.rag_pipeline import RAGPipeline
from study_buddy.config import Config
import json

def load_sample_data():
    """Load sample data for testing."""
    sample_documents = [
        {
            'id': 'behavior_1',
            'content': 'Morning learners typically perform 30% better on complex problem-solving tasks. They prefer shorter, focused study sessions of 25-30 minutes with challenging content.',
            'metadata': {
                'type': 'behavior_pattern',
                'learning_style': 'morning_learner',
                'topics': ['study_patterns', 'performance_optimization'],
                'difficulty': 'intermediate'
            }
        },
        {
            'id': 'motivation_1', 
            'content': 'When users complete 3 consecutive days of study, celebrate with encouraging messages that reference their streak. Use phrases like "You\'re on fire!" and "Consistency is key to success!"',
            'metadata': {
                'type': 'motivational_response',
                'trigger': 'study_streak',
                'topics': ['motivation', 'achievement_celebration'],
                'difficulty': 'easy'
            }
        },
        {
            'id': 'concept_1',
            'content': 'Big O notation describes the upper bound of algorithm complexity. O(1) is constant time, O(n) is linear time, O(n²) is quadratic time. Focus on understanding growth rates rather than exact calculations.',
            'metadata': {
                'type': 'concept_explanation',
                'difficulty': 'beginner',
                'topics': ['algorithms', 'big_o', 'time_complexity'],
                'phase': 'foundation'
            }
        },
        {
            'id': 'reminder_1',
            'content': 'Spaced repetition works best when review intervals increase: 1 day, 3 days, 1 week, 2 weeks, 1 month. This matches the forgetting curve and maximizes retention.',
            'metadata': {
                'type': 'study_methodology',
                'topics': ['spaced_repetition', 'memory', 'learning_science'],
                'difficulty': 'intermediate'
            }
        }
    ]
    
    return sample_documents

def test_basic_setup():
    """Test basic RAG pipeline setup."""
    print("🧪 Testing RAG Pipeline Setup...")
    
    # Validate configuration
    if not Config.validate():
        print("❌ Configuration validation failed")
        return False
    
    # Initialize pipeline
    pipeline = RAGPipeline()
    
    # Setup components
    success = pipeline.setup()
    if not success:
        print("❌ Pipeline setup failed")
        return False
    
    print("✅ RAG pipeline setup successful")
    return True

def test_document_ingestion(pipeline):
    """Test document ingestion."""
    print("\n📚 Testing Document Ingestion...")
    
    try:
        # Load sample documents
        documents = load_sample_data()
        
        # Add documents to pipeline
        pipeline.add_documents(documents)
        
        print(f"✅ Successfully ingested {len(documents)} documents")
        return True
        
    except Exception as e:
        print(f"❌ Document ingestion failed: {e}")
        return False

def test_basic_chat(pipeline):
    """Test basic chat functionality."""
    print("\n💬 Testing Basic Chat...")
    
    test_queries = [
        "What is Big O notation?",
        "How should I study in the morning?",
        "I completed 3 days of studying!",
        "When should I review my notes?"
    ]
    
    user_context = {
        'learning_style': 'morning_learner',
        'study_streak': 3,
        'current_phase': 'foundation',
        'weak_areas': ['algorithms', 'time_complexity']
    }
    
    for query in test_queries:
        try:
            print(f"\n🔍 Query: {query}")
            response = pipeline.chat(query, user_context)
            
            if 'error' in response:
                print(f"❌ Error: {response['error']}")
                return False
            
            print(f"🤖 Response: {response['response'][:100]}...")
            print(f"📊 Retrieved docs: {response.get('context_docs', 0)}")
            
        except Exception as e:
            print(f"❌ Chat failed for query '{query}': {e}")
            return False
    
    print("✅ Basic chat functionality working")
    return True

def test_special_features(pipeline):
    """Test special features like reminders and celebrations."""
    print("\n🎉 Testing Special Features...")
    
    user_context = {
        'study_streak': 5,
        'current_phase': 'problem_solving',
        'preferred_study_time': 'morning',
        'recent_performance': 'improving'
    }
    
    try:
        # Test study reminder
        reminder = pipeline.send_study_reminder(user_context)
        print(f"📅 Study Reminder: {reminder['response'][:100]}...")
        
        # Test achievement celebration
        achievement = {
            'type': 'study_streak',
            'details': '5 day study streak completed!'
        }
        celebration = pipeline.celebrate_achievement(achievement, user_context)
        print(f"🎊 Celebration: {celebration['response'][:100]}...")
        
        print("✅ Special features working")
        return True
        
    except Exception as e:
        print(f"❌ Special features failed: {e}")
        return False

def test_conversation_memory(pipeline):
    """Test conversation memory functionality."""
    print("\n🧠 Testing Conversation Memory...")
    
    try:
        # Get conversation history
        history = pipeline.get_conversation_history()
        print(f"📝 Conversation history length: {len(history)}")
        
        # Show recent messages
        for msg in history[-3:]:
            print(f"   {msg['type']}: {msg['content'][:50]}...")
        
        print("✅ Conversation memory working")
        return True
        
    except Exception as e:
        print(f"❌ Conversation memory failed: {e}")
        return False

def main():
    """Run all tests."""
    print("🚀 Smart Study Buddy RAG Pipeline Test\n")
    
    # Test basic setup
    if not test_basic_setup():
        print("\n❌ Basic setup failed. Check your configuration.")
        return False
    
    # Initialize pipeline for further tests
    pipeline = RAGPipeline()
    pipeline.setup()
    
    # Test document ingestion
    if not test_document_ingestion(pipeline):
        print("\n❌ Document ingestion failed.")
        return False
    
    # Test basic chat
    if not test_basic_chat(pipeline):
        print("\n❌ Basic chat failed.")
        return False
    
    # Test special features
    if not test_special_features(pipeline):
        print("\n❌ Special features failed.")
        return False
    
    # Test conversation memory
    if not test_conversation_memory(pipeline):
        print("\n❌ Conversation memory failed.")
        return False
    
    # Get pipeline stats
    stats = pipeline.get_knowledge_base_stats()
    print(f"\n📊 Pipeline Stats:")
    print(f"   Status: {stats['status']}")
    print(f"   Components ready: {sum(stats['components'].values())}/4")
    print(f"   Conversation length: {stats['conversation_history_length']}")
    
    print("\n🎉 All tests passed! RAG pipeline is working correctly.")
    print("\n📋 Next steps:")
    print("   1. Add more training data to study-buddy/data/")
    print("   2. Test with real user scenarios")
    print("   3. Integrate with FastAPI backend")
    print("   4. Build chat interface")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
