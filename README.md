# StackIt - Q&A Platform

A minimal question-and-answer platform built with Next.js, PostgreSQL, and TypeScript. StackIt supports collaborative learning and structured knowledge sharing with a clean, user-friendly interface.

## Features

### Core Features
- **Ask Questions**: Users can submit questions with rich text descriptions and tags
- **Rich Text Editor**: Full-featured editor with formatting, lists, links, images, and emojis
- **Answer Questions**: Users can provide detailed answers with the same rich text capabilities
- **Voting System**: Upvote/downvote questions and answers
- **Accept Answers**: Question owners can mark answers as accepted
- **Tagging System**: Organize questions with relevant tags
- **Notification System**: Real-time notifications for answers, mentions, and votes
- **Question Filters**: Filter by newest, unanswered, answered, and most voted
- **Search**: Full-text search across questions and descriptions
- **Dark/Light Mode**: Toggle between themes
- **Responsive Design**: Works on all device sizes

### User Roles
- **Guest**: View questions and answers
- **User**: Ask questions, post answers, vote, receive notifications
- **Admin**: Moderate content (expandable)

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, PostgreSQL
- **Authentication**: JWT with bcrypt
- **UI Components**: Radix UI, shadcn/ui
- **Database**: PostgreSQL with raw SQL queries

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- Git

### 1. Clone and Install

\`\`\`bash
git clone <repository-url>
cd stackit-platform
npm install
\`\`\`

### 2. Database Setup

Create a PostgreSQL database:
\`\`\`sql
CREATE DATABASE stackit;
\`\`\`

### 3. Environment Variables

Copy the example environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

Update `.env` with your database credentials:
\`\`\`env
DATABASE_URL=postgresql://username:password@localhost:5432/stackit
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
\`\`\`

### 4. Initialize Database

The application includes SQL scripts to set up the database schema and seed data. You can run these manually or the application will handle the setup.

To run manually:
\`\`\`bash
# Connect to your PostgreSQL database and run:
# scripts/01-create-database.sql
# scripts/02-seed-data.sql
\`\`\`

### 5. Run the Application

\`\`\`bash
npm run dev
\`\`\`

The application will be available at `http://localhost:3000`

### 6. Default Users

The seed data includes these test users:
- **Admin**: admin@stackit.com / password
- **User**: john@example.com / password
- **User**: jane@example.com / password

## Project Structure

\`\`\`
stackit-platform/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── ask/               # Ask question page
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── questions/         # Question pages
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── header.tsx        # Main navigation
│   ├── question-card.tsx # Question display component
│   └── rich-text-editor.tsx # Rich text editor
├── contexts/             # React contexts
│   ├── auth-context.tsx  # Authentication state
│   └── theme-context.tsx # Theme management
├── lib/                  # Utility libraries
│   ├── auth.ts          # Authentication utilities
│   ├── db.ts            # Database connection
│   └── utils.ts         # General utilities
└── scripts/             # Database scripts
    ├── 01-create-database.sql
    └── 02-seed-data.sql
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Questions
- `GET /api/questions` - List questions with filters
- `POST /api/questions` - Create new question
- `GET /api/questions/[id]` - Get question details
- `GET /api/questions/[id]/answers` - Get question answers
- `POST /api/questions/[id]/answers` - Post new answer
- `POST /api/questions/[id]/accept` - Accept an answer

### Voting
- `POST /api/votes` - Vote on questions/answers

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/[id]/read` - Mark notification as read

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts and profiles
- `questions` - Questions with metadata
- `answers` - Answers to questions
- `tags` - Available tags
- `question_tags` - Question-tag relationships
- `votes` - User votes on questions/answers
- `notifications` - User notifications

## Deployment

### Production Build
\`\`\`bash
npm run build
npm start
\`\`\`

### Environment Variables for Production
Ensure these are set in your production environment:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Strong secret key for JWT tokens
- `NODE_ENV=production`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
