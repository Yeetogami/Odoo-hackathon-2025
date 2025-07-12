from pydantic import BaseModel
from typing import List, Optional

class QuestionCreate(BaseModel):
    title: str
    description: str
    tags: Optional[List[str]] = []

class QuestionOut(BaseModel):
    id: int
    title: str
    description: str
    tags: List[str]

    class Config:
        orm_mode = True
