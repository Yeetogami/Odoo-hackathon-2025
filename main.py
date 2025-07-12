from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, Question, Tag, User
from schemas import QuestionCreate, QuestionOut
from typing import List

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Simulate user authentication
def get_current_user():
    # Simulate a logged-in user
    return 1  # Replace with actual auth later

@app.post("/questions", response_model=QuestionOut)
def create_question(question: QuestionCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user)):
    db_question = Question(title=question.title, description=question.description, author_id=user_id)

    # Attach tags
    tags_objs = []
    for tag_name in question.tags:
        tag = db.query(Tag).filter(Tag.name == tag_name.lower()).first()
        if not tag:
            tag = Tag(name=tag_name.lower())
            db.add(tag)
            db.commit()
            db.refresh(tag)
        tags_objs.append(tag)

    db_question.tags = tags_objs
    db.add(db_question)
    db.commit()
    db.refresh(db_question)

    return {
        "id": db_question.id,
        "title": db_question.title,
        "description": db_question.description,
        "tags": [tag.name for tag in db_question.tags]
    }
