# StackIt - Q&A Platform

A modern, minimal question-and-answer platform built with Next.js, PostgreSQL, and TypeScript. StackIt enables collaborative learning through structured knowledge sharing with a clean, user-friendly interface.

## ✨ Features

### Core Functionality
- **🔐 Authentication System** - JWT-based login/register with role management
- **❓ Question Management** - Ask, edit, and organize questions with rich text
- **💬 Answer System** - Detailed answers with acceptance and voting
- **🏷️ Tagging System** - Categorize questions with multiple tags
- **⬆️ Voting System** - Upvote/downvote questions and answers
- **🔔 Real-time Notifications** - Get notified of answers, votes, and mentions
- **🔍 Advanced Search** - Full-text search across questions and descriptions
- **📱 Responsive Design** - Works perfectly on all devices

### User Experience
- **🌙 Dark/Light Mode** - Toggle between themes
- **⚡ Micro-animations** - Smooth transitions and hover effects
- **⌨️ Typing Animation** - Dynamic search suggestions
- **📄 Pagination** - Efficient content browsing
- **🎯 Smart Filtering** - Filter by status, votes, and recency

### Admin Features
- **👑 Admin Dashboard** - Comprehensive moderation tools
- **🚩 Content Moderation** - Flag and manage inappropriate content
- **📊 Analytics** - User and content statistics
- **🗑️ Content Management** - Delete flagged questions/answers

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **PostgreSQL** - Robust relational database
- **JWT** - Secure authentication
- **bcryptjs** - Password hashing

### Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd stackit-platform
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up PostgreSQL**
   \`\`\`bash
   # Create database
   createdb stackit
   
   # Create user
   psql -c "CREATE USER stackit_user WITH PASSWORD 'password123';"
   psql -c "GRANT ALL PRIVILEGES ON DATABASE stackit TO stackit_user;"
   \`\`\`

4. **Configure environment**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your database credentials
   \`\`\`

5. **Initialize database**
   \`\`\`bash
   psql -U stackit_user -d stackit -f scripts/01-create-database.sql
   psql -U stackit_user -d stackit -f scripts/02-seed-data.sql
   \`\`\`

6. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

Visit `http://localhost:3000` to see the application.

## 👥 User Roles

### Guest Users
- View all questions and answers
- Browse by categories and tags
- Search content
- No account required

### Registered Users
- All guest permissions
- Ask questions with rich text editor
- Post detailed answers
- Vote on questions and answers
- Receive notifications
- Accept answers to their questions

### Administrators
- All user permissions
- Access admin dashboard
- Moderate flagged content
- Delete inappropriate content
- View platform statistics
- Manage user accounts

## 🎨 Design Features

### Micro-animations
- **Typing Animation** - Dynamic search suggestions on homepage
- **Fade-in Effects** - Smooth content loading
- **Hover Animations** - Interactive button and card effects
- **Loading States** - Elegant loading indicators
- **Notification Badges** - Pulsing unread indicators

### Color Scheme
- **Primary Color**: Green (#096A00)
- **Dark Mode**: Sophisticated dark theme
- **Light Mode**: Clean, minimal light theme
- **Accent Colors**: Carefully chosen for accessibility

## 📊 Database Schema

### Core Tables
- **users** - User accounts and profiles
- **questions** - Questions with metadata
- **answers** - Answers linked to questions
- **tags** - Categorization system
- **votes** - User voting records
- **notifications** - Real-time notifications

### Relationships
- Users can have many questions and answers
- Questions can have many answers and tags
- Users can vote once per question/answer
- Notifications link to related content

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Questions
- `GET /api/questions` - List questions (with filters)
- `POST /api/questions` - Create question
- `GET /api/questions/[id]` - Get question details
- `POST /api/questions/[id]/accept` - Accept answer

### Answers
- `GET /api/questions/[id]/answers` - Get answers
- `POST /api/questions/[id]/answers` - Post answer

### Voting
- `POST /api/votes` - Vote on content

### Admin
- `GET /api/admin/dashboard` - Admin statistics
- `DELETE /api/admin/questions/[id]` - Delete question
- `DELETE /api/admin/answers/[id]` - Delete answer

## 🧪 Testing

### Test Accounts
All test accounts use password: `password`

- **Admin**: admin@stackit.com
- **User 1**: john@example.com
- **User 2**: jane@example.com
- **User 3**: guru@example.com

### Testing Features
1. **Authentication** - Login/logout functionality
2. **Question Flow** - Ask → Answer → Vote → Accept
3. **Search** - Full-text search capabilities
4. **Notifications** - Real-time updates
5. **Admin Panel** - Content moderation

## 📈 Performance

### Optimizations
- **Database Indexing** - Optimized queries
- **Lazy Loading** - Efficient content loading
- **Debounced Search** - Reduced API calls
- **Connection Pooling** - Database efficiency
- **Responsive Images** - Optimized media loading

### Monitoring
- Database connection health checks
- Error logging and handling
- Performance metrics tracking

## 🔒 Security

### Authentication
- JWT tokens with expiration
- Secure password hashing (bcrypt)
- Role-based access control

### Data Protection
- SQL injection prevention
- XSS protection
- CSRF protection
- Input validation and sanitization

## 🚀 Deployment

### Production Setup
1. Set up PostgreSQL database
2. Configure environment variables
3. Build the application: `npm run build`
4. Start production server: `npm start`

### Environment Variables
\`\`\`env
PGUSER=your_db_user
PGHOST=your_db_host
PGDATABASE=your_db_name
PGPASSWORD=your_db_password
PGPORT=5432
JWT_SECRET=your_jwt_secret
NODE_ENV=production
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the troubleshooting section in SETUP.md
- Review the API documentation
- Open an issue on GitHub

---

**StackIt** - Empowering collaborative learning through structured Q&A
