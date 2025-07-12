from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.question import Question, Answer, AnswerVote
from app.schemas.question import AnswerCreate, VoteCreate
from app.services.moderation_service import check_content_moderation
from app.services.notification_service import create_notification

router = APIRouter()

@router.post("/")
def create_answer(
    answer: AnswerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if question exists
    question = db.query(Question).filter(Question.id == answer.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Check content moderation
    is_flagged, flagged_words = check_content_moderation(answer.content)
    
    # Create answer
    db_answer = Answer(
        content=answer.content,
        question_id=answer.question_id,
        user_id=current_user.id,
        is_flagged=is_flagged,
        moderation_status="approved" if not is_flagged else "pending",
        flagged_reason=f"Flagged words: {', '.join(flagged_words)}" if flagged_words else None
    )
    db.add(db_answer)
    db.commit()
    db.refresh(db_answer)
    
    # Create moderation record if flagged
    if is_flagged:
        from app.models.question import ContentModeration
        moderation = ContentModeration(
            content_type="answer",
            content_id=db_answer.id,
            flagged_words=",".join(flagged_words) if flagged_words else None
        )
        db.add(moderation)
        db.commit()
        
        # Notify admins
        admins = db.query(User).filter(User.is_admin == True).all()
        for admin in admins:
            create_notification(
                db=db,
                user_id=admin.id,
                type="moderation",
                title="Content Flagged for Review",
                message=f"An answer has been flagged for moderation review.",
                related_answer_id=db_answer.id
            )
    else:
        # Notify question author if answer is approved
        if question.user_id != current_user.id:
            create_notification(
                db=db,
                user_id=question.user_id,
                type="answer",
                title="New Answer",
                message=f"{current_user.username} answered your question: {question.title}",
                related_question_id=question.id,
                related_answer_id=db_answer.id
            )
    
    return {"message": "Answer created successfully", "id": db_answer.id}

@router.post("/{answer_id}/vote")
def vote_answer(
    answer_id: int,
    vote: VoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    answer = db.query(Answer).filter(Answer.id == answer_id).first()
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")
    
    # Check existing vote
    existing_vote = db.query(AnswerVote).filter(
        AnswerVote.answer_id == answer_id,
        AnswerVote.user_id == current_user.id
    ).first()
    
    if existing_vote:
        if existing_vote.vote_type == vote.vote_type:
            # Remove vote if same type
            db.delete(existing_vote)
        else:
            # Update vote type
            existing_vote.vote_type = vote.vote_type
    else:
        # Create new vote
        new_vote = AnswerVote(
            answer_id=answer_id,
            user_id=current_user.id,
            vote_type=vote.vote_type
        )
        db.add(new_vote)
    
    db.commit()
    return {"message": "Vote recorded"}

@router.post("/{answer_id}/accept")
def accept_answer(
    answer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    answer = db.query(Answer).filter(Answer.id == answer_id).first()
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")
    
    question = db.query(Question).filter(Question.id == answer.question_id).first()
    if question.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only question author can accept answers")
    
    # Unaccept other answers
    db.query(Answer).filter(Answer.question_id == answer.question_id).update({"is_accepted": False})
    
    # Accept this answer
    answer.is_accepted = True
    question.is_answered = True
    
    db.commit()
    
    # Notify answer author
    if answer.user_id != current_user.id:
        create_notification(
            db=db,
            user_id=answer.user_id,
            type="accepted",
            title="Answer Accepted",
            message=f"Your answer to '{question.title}' was accepted!",
            related_question_id=question.id,
            related_answer_id=answer.id
        )
    
    return {"message": "Answer accepted"}
