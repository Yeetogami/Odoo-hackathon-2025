from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, asc, func
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.question import Question, Tag, QuestionVote, question_tags
from app.schemas.question import QuestionCreate, QuestionUpdate, Question as QuestionSchema, QuestionList, VoteCreate
from app.services.moderation_service import check_content_moderation
from app.services.notification_service import create_notification

router = APIRouter()

@router.post("/", response_model=QuestionSchema)
def create_question(
    question: QuestionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check content moderation
    is_flagged, flagged_words = check_content_moderation(f"{question.title} {question.content}")
    
    # Create question
    db_question = Question(
        title=question.title,
        content=question.content,
        user_id=current_user.id,
        is_flagged=is_flagged,
        moderation_status="approved" if not is_flagged else "pending",
        flagged_reason=f"Flagged words: {', '.join(flagged_words)}" if flagged_words else None
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    
    # Handle tags
    for tag_name in question.tag_names:
        tag = db.query(Tag).filter(Tag.name == tag_name).first()
        if not tag:
            tag = Tag(name=tag_name)
            db.add(tag)
            db.commit()
            db.refresh(tag)
        db_question.tags.append(tag)
    
    db.commit()
    
    # Create moderation record if flagged
    if is_flagged:
        from app.models.question import ContentModeration
        moderation = ContentModeration(
            content_type="question",
            content_id=db_question.id,
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
                message=f"Question '{question.title}' has been flagged for moderation review.",
                related_question_id=db_question.id
            )
    
    return get_question_with_details(db, db_question.id, current_user.id)

@router.get("/", response_model=List[QuestionList])
def get_questions(
    skip: int = 0,
    limit: int = 20,
    filter_type: str = Query("newest", regex="^(newest|unanswered|answered|most_voted)$"),
    search: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Question).options(
        joinedload(Question.user),
        joinedload(Question.tags)
    )
    
    # Only show approved content to non-admin users
    if not current_user or not current_user.is_admin:
        query = query.filter(Question.moderation_status == "approved")
    
    # Apply search filter
    if search:
        query = query.filter(
            Question.title.ilike(f"%{search}%") | 
            Question.content.ilike(f"%{search}%")
        )
    
    # Apply sorting
    if filter_type == "newest":
        query = query.order_by(desc(Question.created_at))
    elif filter_type == "unanswered":
        query = query.filter(Question.is_answered == False).order_by(desc(Question.created_at))
    elif filter_type == "answered":
        query = query.filter(Question.is_answered == True).order_by(desc(Question.created_at))
    elif filter_type == "most_voted":
        query = query.outerjoin(QuestionVote).group_by(Question.id).order_by(
            desc(func.sum(func.case((QuestionVote.vote_type == 'up', 1), else_=-1)))
        )
    
    questions = query.offset(skip).limit(limit).all()
    
    # Add vote counts and answer counts
    result = []
    for question in questions:
        vote_count = db.query(func.sum(
            func.case((QuestionVote.vote_type == 'up', 1), else_=-1)
        )).filter(QuestionVote.question_id == question.id).scalar() or 0
        
        answer_count = db.query(func.count(Question.id)).join(
            Question.answers
        ).filter(Question.id == question.id).scalar() or 0
        
        question_dict = {
            "id": question.id,
            "title": question.title,
            "content": question.content,
            "user_id": question.user_id,
            "is_answered": question.is_answered,
            "is_flagged": question.is_flagged,
            "moderation_status": question.moderation_status,
            "created_at": question.created_at,
            "user": {"id": question.user.id, "username": question.user.username},
            "tags": [{"id": tag.id, "name": tag.name, "created_at": tag.created_at} for tag in question.tags],
            "vote_count": vote_count,
            "answer_count": answer_count
        }
        result.append(question_dict)
    
    return result

@router.get("/{question_id}", response_model=QuestionSchema)
def get_question(
    question_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Check if user can view this content
    if question.moderation_status != "approved" and (not current_user or not current_user.is_admin):
        raise HTTPException(status_code=404, detail="Question not found")
    
    user_id = current_user.id if current_user else None
    return get_question_with_details(db, question_id, user_id)

@router.post("/{question_id}/vote")
def vote_question(
    question_id: int,
    vote: VoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Check existing vote
    existing_vote = db.query(QuestionVote).filter(
        QuestionVote.question_id == question_id,
        QuestionVote.user_id == current_user.id
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
        new_vote = QuestionVote(
            question_id=question_id,
            user_id=current_user.id,
            vote_type=vote.vote_type
        )
        db.add(new_vote)
    
    db.commit()
    return {"message": "Vote recorded"}

def get_question_with_details(db: Session, question_id: int, user_id: Optional[int] = None):
    from app.models.question import Answer, AnswerVote
    
    question = db.query(Question).options(
        joinedload(Question.user),
        joinedload(Question.tags),
        joinedload(Question.answers).joinedload(Answer.user)
    ).filter(Question.id == question_id).first()
    
    if not question:
        return None
    
    # Calculate vote count
    vote_count = db.query(func.sum(
        func.case((QuestionVote.vote_type == 'up', 1), else_=-1)
    )).filter(QuestionVote.question_id == question_id).scalar() or 0
    
    # Get user's vote
    user_vote = None
    if user_id:
        vote = db.query(QuestionVote).filter(
            QuestionVote.question_id == question_id,
            QuestionVote.user_id == user_id
        ).first()
        user_vote = vote.vote_type if vote else None
    
    # Process answers
    answers = []
    for answer in question.answers:
        if answer.moderation_status == "approved" or (user_id and db.query(User).filter(User.id == user_id, User.is_admin == True).first()):
            answer_vote_count = db.query(func.sum(
                func.case((AnswerVote.vote_type == 'up', 1), else_=-1)
            )).filter(AnswerVote.answer_id == answer.id).scalar() or 0
            
            answer_user_vote = None
            if user_id:
                vote = db.query(AnswerVote).filter(
                    AnswerVote.answer_id == answer.id,
                    AnswerVote.user_id == user_id
                ).first()
                answer_user_vote = vote.vote_type if vote else None
            
            answers.append({
                "id": answer.id,
                "content": answer.content,
                "question_id": answer.question_id,
                "user_id": answer.user_id,
                "is_accepted": answer.is_accepted,
                "is_flagged": answer.is_flagged,
                "moderation_status": answer.moderation_status,
                "created_at": answer.created_at,
                "user": {"id": answer.user.id, "username": answer.user.username},
                "vote_count": answer_vote_count,
                "user_vote": answer_user_vote
            })
    
    return {
        "id": question.id,
        "title": question.title,
        "content": question.content,
        "user_id": question.user_id,
        "is_answered": question.is_answered,
        "is_flagged": question.is_flagged,
        "moderation_status": question.moderation_status,
        "created_at": question.created_at,
        "updated_at": question.updated_at,
        "user": {"id": question.user.id, "username": question.user.username},
        "tags": [{"id": tag.id, "name": tag.name, "created_at": tag.created_at} for tag in question.tags],
        "answers": answers,
        "vote_count": vote_count,
        "answer_count": len(answers),
        "user_vote": user_vote
    }
