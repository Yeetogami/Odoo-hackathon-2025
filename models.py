from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, Table, TIMESTAMP, func
from sqlalchemy.orm import relationship
from database import Base

# Junction table
question_tags = Table(
    "question_tags", Base.metadata,
    Column("question_id", Integer, ForeignKey("questions.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True)
    email = Column(String(255), unique=True)
    password_hash = Column(String(255))
    role = Column(String(20), default='user')
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

class Tag(Base):
    __tablename__ = "tags"
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True)
    description = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
# Define Answer model BEFORE Question

class Answer(Base):
    __tablename__ = "answers"
    id = Column(Integer, primary_key=True)
    content = Column(Text, nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"))
    author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    is_accepted = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())



class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True)
    title = Column(String(255))
    description = Column(Text)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    is_answered = Column(Boolean, default=False)
    accepted_answer_id = Column(Integer, ForeignKey("answers.id"))
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    author = relationship("User")
    tags = relationship("Tag", secondary=question_tags, backref="questions")
