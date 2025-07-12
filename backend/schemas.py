from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# User schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Question schemas
class QuestionCreate(BaseModel):
    title: str
    description: str
    tags: List[str]

class QuestionResponse(BaseModel):
    id: int
    title: str
    description: str
    tags: List[str]
    username: str
    created_at: datetime
    answer_count: int

class QuestionListResponse(BaseModel):
    id: int
    title: str
    description: str
    tags: List[str]
    username: str
    created_at: datetime
    answer_count: int

# Answer schemas
class AnswerCreate(BaseModel):
    content: str

class AnswerResponse(BaseModel):
    id: int
    content: str
    username: str
    created_at: datetime
    accepted: bool
    vote_count: int

# Vote schemas
class VoteCreate(BaseModel):
    vote_type: str  # 'up' or 'down'

# Notification schemas
class NotificationResponse(BaseModel):
    id: int
    type: str
    message: str
    read: bool
    created_at: datetime
