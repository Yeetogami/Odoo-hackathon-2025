#!/usr/bin/env python3
"""
Seed script to add sample data to StackIt database
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, User, Question, Answer, Tag, QuestionTag
from auth import get_password_hash

def seed_database():
    """Add sample data to the database"""
    db = SessionLocal()
    
    try:
        print("Adding sample data...")
        
        # Create sample users
        users_data = [
            {"username": "alice", "email": "alice@example.com", "password": "password123"},
            {"username": "bob", "email": "bob@example.com", "password": "password123"},
            {"username": "charlie", "email": "charlie@example.com", "password": "password123"},
        ]
        
        users = []
        for user_data in users_data:
            user = User(
                username=user_data["username"],
                email=user_data["email"],
                password=get_password_hash(user_data["password"])
            )
            db.add(user)
            users.append(user)
        
        db.commit()
        print("✅ Sample users created")
        
        # Create sample tags
        tag_names = ["python", "fastapi", "javascript", "react", "database", "sql"]
        tags = []
        for tag_name in tag_names:
            tag = Tag(name=tag_name)
            db.add(tag)
            tags.append(tag)
        
        db.commit()
        print("✅ Sample tags created")
        
        # Create sample questions
        questions_data = [
            {
                "title": "How to use FastAPI with PostgreSQL?",
                "description": "I'm trying to connect FastAPI with PostgreSQL database. What's the best approach?",
                "user_id": users[0].id,
                "tag_names": ["python", "fastapi", "database"]
            },
            {
                "title": "React state management best practices",
                "description": "What are the current best practices for managing state in React applications?",
                "user_id": users[1].id,
                "tag_names": ["javascript", "react"]
            },
            {
                "title": "SQL JOIN vs Subquery performance",
                "description": "When should I use JOINs vs subqueries for better performance?",
                "user_id": users[2].id,
                "tag_names": ["sql", "database"]
            }
        ]
        
        for q_data in questions_data:
            question = Question(
                title=q_data["title"],
                description=q_data["description"],
                user_id=q_data["user_id"]
            )
            db.add(question)
            db.commit()
            db.refresh(question)
            
            # Add tags to question
            for tag_name in q_data["tag_names"]:
                tag = next((t for t in tags if t.name == tag_name), None)
                if tag:
                    question_tag = QuestionTag(question_id=question.id, tag_id=tag.id)
                    db.add(question_tag)
        
        db.commit()
        print("✅ Sample questions created")
        
        # Create sample answers
        answers_data = [
            {
                "content": "You can use SQLAlchemy with FastAPI. Here's a basic setup: ...",
                "question_id": 1,
                "user_id": users[1].id
            },
            {
                "content": "For React state management, consider using Context API for simple cases or Redux Toolkit for complex applications.",
                "question_id": 2,
                "user_id": users[2].id
            }
        ]
        
        for a_data in answers_data:
            answer = Answer(
                content=a_data["content"],
                question_id=a_data["question_id"],
                user_id=a_data["user_id"]
            )
            db.add(answer)
        
        db.commit()
        print("✅ Sample answers created")
        print("🎉 Database seeded successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
