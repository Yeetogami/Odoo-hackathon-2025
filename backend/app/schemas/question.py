from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class TagBase(BaseModel):
    name: str

class Tag(TagBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class QuestionBase(BaseModel):
    title: str
    content: str

class QuestionCreate(QuestionBase):
    tag_names: List[str] = []

class QuestionUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tag_names: Optional[List[str]] = None

class AnswerBase(BaseModel):
    content: str

class AnswerCreate(AnswerBase):
    question_id: int

class Answer(AnswerBase):
    id: int
    question_id: int
    user_id: int
    is_accepted: bool
    is_flagged: bool
    moderation_status: str
    created_at: datetime
    user: dict
    vote_count: int = 0
    user_vote: Optional[str] = None

    class Config:
        from_attributes = True

class Question(QuestionBase):
    id: int
    user_id: int
    is_answered: bool
    is_flagged: bool
    moderation_status: str
    created_at: datetime
    updated_at: datetime
    user: dict
    tags: List[Tag] = []
    answers: List[Answer] = []
    vote_count: int = 0
    answer_count: int = 0
    user_vote: Optional[str] = None

    class Config:
        from_attributes = True

class QuestionList(BaseModel):
    id: int
    title: str
    content: str
    user_id: int
    is_answered: bool
    is_flagged: bool
    moderation_status: str
    created_at: datetime
    user: dict
    tags: List[Tag] = []
    vote_count: int = 0
    answer_count: int = 0

    class Config:
        from_attributes = True

class VoteCreate(BaseModel):
    vote_type: str  # 'up' or 'down'
