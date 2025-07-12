from sqlalchemy.orm import Session
from app.models.question import Notification

def create_notification(
    db: Session,
    user_id: int,
    type: str,
    title: str,
    message: str,
    related_question_id: int = None,
    related_answer_id: int = None
):
    notification = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        related_question_id=related_question_id,
        related_answer_id=related_answer_id
    )
    db.add(notification)
    db.commit()
    return notification
