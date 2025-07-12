from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional
import re
from datetime import datetime

from database import get_db, User, Question, Answer, Vote, Notification, Tag, QuestionTag
from auth import verify_token, get_password_hash, verify_password, create_access_token
from schemas import (
    UserCreate, UserLogin, UserResponse, Token,
    QuestionCreate, QuestionResponse, QuestionListResponse,
    AnswerCreate, AnswerResponse,
    VoteCreate, NotificationResponse
)

app = FastAPI(title="StackIt API", description="Q&A Forum Backend", version="1.0.0")
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# Authentication Endpoints
@app.post("/signup", response_model=UserResponse)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return UserResponse(id=db_user.id, username=db_user.username, email=db_user.email)

@app.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=access_token, token_type="bearer")

# Question Endpoints
@app.post("/questions", response_model=QuestionResponse)
def create_question(
    question_data: QuestionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Create question
    db_question = Question(
        title=question_data.title,
        description=question_data.description,
        user_id=current_user.id
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    
    # Handle tags
    for tag_name in question_data.tags:
        # Get or create tag
        tag = db.query(Tag).filter(Tag.name == tag_name.lower()).first()
        if not tag:
            tag = Tag(name=tag_name.lower())
            db.add(tag)
            db.commit()
            db.refresh(tag)
        
        # Create question-tag relationship
        question_tag = QuestionTag(question_id=db_question.id, tag_id=tag.id)
        db.add(question_tag)
    
    db.commit()
    
    # Get question with tags for response
    question_tags = db.query(Tag).join(QuestionTag).filter(QuestionTag.question_id == db_question.id).all()
    tag_names = [tag.name for tag in question_tags]
    
    return QuestionResponse(
        id=db_question.id,
        title=db_question.title,
        description=db_question.description,
        tags=tag_names,
        username=current_user.username,
        created_at=db_question.created_at,
        answer_count=0
    )

@app.get("/questions", response_model=List[QuestionListResponse])
def get_questions(tag: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(Question).join(User)
    
    if tag:
        query = query.join(QuestionTag).join(Tag).filter(Tag.name == tag.lower())
    
    questions = query.order_by(Question.created_at.desc()).all()
    
    result = []
    for question in questions:
        # Get tags for this question
        question_tags = db.query(Tag).join(QuestionTag).filter(QuestionTag.question_id == question.id).all()
        tag_names = [tag.name for tag in question_tags]
        
        # Get answer count
        answer_count = db.query(Answer).filter(Answer.question_id == question.id).count()
        
        result.append(QuestionListResponse(
            id=question.id,
            title=question.title,
            description=question.description[:200] + "..." if len(question.description) > 200 else question.description,
            tags=tag_names,
            username=question.user.username,
            created_at=question.created_at,
            answer_count=answer_count
        ))
    
    return result

# Answer Endpoints
@app.post("/questions/{question_id}/answers", response_model=AnswerResponse)
def create_answer(
    question_id: int,
    answer_data: AnswerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if question exists
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Create answer
    db_answer = Answer(
        question_id=question_id,
        user_id=current_user.id,
        content=answer_data.content
    )
    db.add(db_answer)
    db.commit()
    db.refresh(db_answer)
    
    # Create notification for question owner (if not answering own question)
    if question.user_id != current_user.id:
        notification = Notification(
            user_id=question.user_id,
            type="answer",
            related_id=db_answer.id,
            message=f"{current_user.username} answered your question: {question.title}"
        )
        db.add(notification)
    
    # Check for mentions in the answer content
    mentions = re.findall(r'@(\w+)', answer_data.content)
    for username in mentions:
        mentioned_user = db.query(User).filter(User.username == username).first()
        if mentioned_user and mentioned_user.id != current_user.id:
            notification = Notification(
                user_id=mentioned_user.id,
                type="mention",
                related_id=db_answer.id,
                message=f"{current_user.username} mentioned you in an answer"
            )
            db.add(notification)
    
    db.commit()
    
    return AnswerResponse(
        id=db_answer.id,
        content=db_answer.content,
        username=current_user.username,
        created_at=db_answer.created_at,
        accepted=db_answer.accepted,
        vote_count=0
    )

@app.get("/questions/{question_id}/answers", response_model=List[AnswerResponse])
def get_answers(question_id: int, db: Session = Depends(get_db)):
    # Check if question exists
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    answers = db.query(Answer).join(User).filter(Answer.question_id == question_id).order_by(Answer.created_at.desc()).all()
    
    result = []
    for answer in answers:
        # Calculate vote count
        vote_count = db.query(func.sum(
            func.case([(Vote.vote_type == 'up', 1), (Vote.vote_type == 'down', -1)], else_=0)
        )).filter(Vote.answer_id == answer.id).scalar() or 0
        
        result.append(AnswerResponse(
            id=answer.id,
            content=answer.content,
            username=answer.user.username,
            created_at=answer.created_at,
            accepted=answer.accepted,
            vote_count=vote_count
        ))
    
    return result

# Voting Endpoints
@app.post("/answers/{answer_id}/vote")
def vote_answer(
    answer_id: int,
    vote_data: VoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if answer exists
    answer = db.query(Answer).filter(Answer.id == answer_id).first()
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")
    
    # Check if user already voted
    existing_vote = db.query(Vote).filter(
        and_(Vote.answer_id == answer_id, Vote.user_id == current_user.id)
    ).first()
    
    if existing_vote:
        if existing_vote.vote_type == vote_data.vote_type:
            # Remove vote if same type
            db.delete(existing_vote)
        else:
            # Update vote type
            existing_vote.vote_type = vote_data.vote_type
    else:
        # Create new vote
        new_vote = Vote(
            answer_id=answer_id,
            user_id=current_user.id,
            vote_type=vote_data.vote_type
        )
        db.add(new_vote)
    
    db.commit()
    
    # Calculate new vote count
    vote_count = db.query(func.sum(
        func.case([(Vote.vote_type == 'up', 1), (Vote.vote_type == 'down', -1)], else_=0)
    )).filter(Vote.answer_id == answer_id).scalar() or 0
    
    return {"message": "Vote recorded", "vote_count": vote_count}

@app.post("/answers/{answer_id}/accept")
def accept_answer(
    answer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if answer exists
    answer = db.query(Answer).filter(Answer.id == answer_id).first()
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")
    
    # Check if current user is the question owner
    question = db.query(Question).filter(Question.id == answer.question_id).first()
    if question.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only question owner can accept answers")
    
    # Unaccept all other answers for this question
    db.query(Answer).filter(Answer.question_id == answer.question_id).update({"accepted": False})
    
    # Accept this answer
    answer.accepted = True
    db.commit()
    
    return {"message": "Answer accepted"}

# Notification Endpoints
@app.get("/notifications", response_model=dict)
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()
    
    unread_count = db.query(Notification).filter(
        and_(Notification.user_id == current_user.id, Notification.read == False)
    ).count()
    
    notification_list = []
    for notification in notifications:
        notification_list.append(NotificationResponse(
            id=notification.id,
            type=notification.type,
            message=notification.message,
            read=notification.read,
            created_at=notification.created_at
        ))
    
    return {
        "notifications": notification_list,
        "unread_count": unread_count
    }

@app.post("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notification = db.query(Notification).filter(
        and_(Notification.id == notification_id, Notification.user_id == current_user.id)
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.read = True
    db.commit()
    
    return {"message": "Notification marked as read"}

# Health check
@app.get("/")
def root():
    return {"message": "StackIt API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
