# StackIt - Q&A Platform

A complete question-and-answer platform built with FastAPI, React, and PostgreSQL.

## Features

- User authentication and authorization
- Question and answer management
- Voting system
- Tag system
- Real-time notifications
- Content moderation with admin review
- Dark/light mode
- Responsive design

## Tech Stack

- **Backend**: FastAPI, PostgreSQL, SQLAlchemy
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Authentication**: JWT tokens
- **Content Moderation**: better_profanity

## Setup Instructions

### 1. Backend Setup
\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
\`\`\`

### 2. Database Setup
\`\`\`bash
# Create PostgreSQL database
createdb stackit_db

# Run the schema
psql -d stackit_db -f ../database/schema.sql
\`\`\`

### 3. Environment Configuration
\`\`\`bash
# Backend
cp .env.example .env
# Edit .env with your database credentials

# Frontend
cd frontend
cp .env.example .env.local
\`\`\`

### 4. Install Frontend Dependencies
\`\`\`bash
cd frontend
npm install
\`\`\`

### 5. Run the Application
\`\`\`bash
# Terminal 1 - Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
\`\`\`

### 6. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Default Admin Account
- Email: admin@stackit.com
- Password: admin123

## Content Moderation

The platform includes automatic content moderation using the `better_profanity` library. When users submit questions or answers:

1. Content is automatically scanned for inappropriate language
2. Flagged content is hidden from public view
3. Admins receive notifications about flagged content
4. Admins can review and approve/reject flagged content

Access the admin panel at `/admin` when logged in as an admin user.
\`\`\`
