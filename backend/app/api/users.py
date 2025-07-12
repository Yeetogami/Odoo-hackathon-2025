from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.schemas.user import User as UserSchema

router = APIRouter()

@router.get("/profile", response_model=UserSchema)
def get_user_profile(current_user: User = Depends(get_current_user)):
    return UserSchema.from_orm(current_user)
