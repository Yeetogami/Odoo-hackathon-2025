from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class NotificationBase(BaseModel):
    type: str
    title: str
    message: str

class NotificationCreate(NotificationBase):
    user_id: int
    related_question_id: Optional[int] = None
    related_answer_id: Optional[int] = None

class Notification(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    related_question_id: Optional[int] = None
    related_answer_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
