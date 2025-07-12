from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.question import Tag
from app.schemas.question import Tag as TagSchema

router = APIRouter()

@router.get("/", response_model=List[TagSchema])
def get_tags(db: Session = Depends(get_db)):
    tags = db.query(Tag).all()
    return tags

@router.get("/suggestions", response_model=List[str])
def get_tag_suggestions(db: Session = Depends(get_db)):
    tags = db.query(Tag).limit(20).all()
    return [tag.name for tag in tags]
