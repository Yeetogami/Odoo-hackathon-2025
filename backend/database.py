from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

# Multiple database URL options for different setups
DATABASE_URLS = [
    # Docker setup
    "postgresql://postgres:password@localhost:5432/stackit",
    # Local PostgreSQL with default settings
    "postgresql://postgres:postgres@localhost:5432/stackit",
    # Local PostgreSQL without password
    "postgresql://postgres@localhost:5432/stackit",
    # Custom from environment
    os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/stackit")
]

def create_database_engine():
    """Try different database configurations"""
    for db_url in DATABASE_URLS:
        try:
            engine = create_engine(db_url)
            # Test connection
            with engine.connect() as conn:
                conn.execute("SELECT 1")
            print(f"✅ Connected to database: {db_url.split('@')[1] if '@' in db_url else db_url}")
            return engine
        except Exception as e:
            print(f"❌ Failed to connect with {db_url.split('@')[1] if '@' in db_url else db_url}: {str(e)[:100]}")
            continue
    
    raise Exception("Could not connect to PostgreSQL. Please check your database setup.")

engine = create_database_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    questions = relationship("Question", back_populates="user")
    answers = relationship("Answer", back_populates="user")
    votes = relationship("Vote", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="questions")
    answers = relationship("Answer", back_populates="question")
    tags = relationship("Tag", secondary="question_tags", back_populates="questions")

class Answer(Base):
    __tablename__ = "answers"
    
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    accepted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    question = relationship("Question", back_populates="answers")
    user = relationship("User", back_populates="answers")
    votes = relationship("Vote", back_populates="answer")

class Vote(Base):
    __tablename__ = "votes"
    
    id = Column(Integer, primary_key=True, index=True)
    answer_id = Column(Integer, ForeignKey("answers.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vote_type = Column(String(10), nullable=False)  # 'up' or 'down'
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    answer = relationship("Answer", back_populates="votes")
    user = relationship("User", back_populates="votes")

class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    questions = relationship("Question", secondary="question_tags", back_populates="tags")

class QuestionTag(Base):
    __tablename__ = "question_tags"
    
    question_id = Column(Integer, ForeignKey("questions.id"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.id"), primary_key=True)

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(20), nullable=False)  # 'answer' or 'mention'
    related_id = Column(Integer, nullable=False)  # answer_id
    message = Column(String(255), nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="notifications")

# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
