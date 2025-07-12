from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.auth import get_admin_user
from app.models.user import User
from app.models.question import Question, Answer, ContentModeration
from app.schemas.moderation import FlaggedContent, ContentModerationDecision

router = APIRouter()

@router.get("/flagged-content", response_model=List[FlaggedContent])
def get_flagged_content(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    # Get all pending moderation items
    moderations = db.query(ContentModeration).filter(
        ContentModeration.admin_decision.is_(None)
    ).all()
    
    flagged_items = []
    
    for mod in moderations:
        if mod.content_type == "question":
            question = db.query(Question).filter(Question.id == mod.content_id).first()
            if question:
                flagged_items.append(FlaggedContent(
                    moderation_id=mod.id,
                    content_type="question",
                    content_id=question.id,
                    content_title=question.title,
                    content_text=question.content,
                    author=question.user.username,
                    flagged_words=mod.flagged_words.split(",") if mod.flagged_words else [],
                    created_at=mod.created_at
                ))
        elif mod.content_type == "answer":
            answer = db.query(Answer).filter(Answer.id == mod.content_id).first()
            if answer:
                flagged_items.append(FlaggedContent(
                    moderation_id=mod.id,
                    content_type="answer",
                    content_id=answer.id,
                    content_title=f"Answer to: {answer.question.title}",
                    content_text=answer.content,
                    author=answer.user.username,
                    flagged_words=mod.flagged_words.split(",") if mod.flagged_words else [],
                    created_at=mod.created_at
                ))
    
    return sorted(flagged_items, key=lambda x: x.created_at, reverse=True)

@router.post("/review/{moderation_id}")
def review_content(
    moderation_id: int,
    decision: ContentModerationDecision,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    moderation = db.query(ContentModeration).filter(
        ContentModeration.id == moderation_id
    ).first()
    
    if not moderation:
        raise HTTPException(status_code=404, detail="Moderation record not found")
    
    # Update moderation record
    moderation.admin_id = admin_user.id
    moderation.admin_decision = decision.admin_decision
    moderation.admin_notes = decision.admin_notes
    moderation.reviewed_at = func.now()
    
    # Update content status
    if moderation.content_type == "question":
        question = db.query(Question).filter(Question.id == moderation.content_id).first()
        if question:
            if decision.admin_decision == "approved":
                question.moderation_status = "approved"
                question.is_flagged = False
            else:
                question.moderation_status = "rejected"
    elif moderation.content_type == "answer":
        answer = db.query(Answer).filter(Answer.id == moderation.content_id).first()
        if answer:
            if decision.admin_decision == "approved":
                answer.moderation_status = "approved"
                answer.is_flagged = False
            else:
                answer.moderation_status = "rejected"
    
    db.commit()
    
    return {"message": f"Content {decision.admin_decision} successfully"}

@router.get("/stats")
def get_moderation_stats(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    pending_count = db.query(ContentModeration).filter(
        ContentModeration.admin_decision.is_(None)
    ).count()
    
    approved_count = db.query(ContentModeration).filter(
        ContentModeration.admin_decision == "approved"
    ).count()
    
    rejected_count = db.query(ContentModeration).filter(
        ContentModeration.admin_decision == "rejected"
    ).count()
    
    return {
        "pending": pending_count,
        "approved": approved_count,
        "rejected": rejected_count,
        "total": pending_count + approved_count + rejected_count
    }
