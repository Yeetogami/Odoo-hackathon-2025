from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, questions, answers, users, tags, notifications, moderation
from app.core.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="StackIt API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(questions.router, prefix="/api/questions", tags=["questions"])
app.include_router(answers.router, prefix="/api/answers", tags=["answers"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(tags.router, prefix="/api/tags", tags=["tags"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(moderation.router, prefix="/api/moderation", tags=["moderation"])

@app.get("/")
async def root():
    return {"message": "StackIt API"}
