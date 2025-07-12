from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ContentModerationBase(BaseModel):
    content_type: str
    content_id: int
    flagged_words: Optional[List[str]] = None

class ContentModerationCreate(ContentModerationBase):
    pass

class ContentModerationDecision(BaseModel):
    admin_decision: str  # 'approved' or 'rejected'
    admin_notes: Optional[str] = None

class ContentModeration(ContentModerationBase):
    id: int
    admin_id: Optional[int] = None
    admin_decision: Optional[str] = None
    admin_notes: Optional[str] = None
    created_at: datetime
    reviewed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class FlaggedContent(BaseModel):
    moderation_id: int
    content_type: str
    content_id: int
    content_title: str
    content_text: str
    author: str
    flagged_words: List[str]
    created_at: datetime

    class Config:
        from_attributes = True
