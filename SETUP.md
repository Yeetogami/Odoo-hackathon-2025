# StackIt Setup Guide

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+

### 1. Install PostgreSQL

**macOS (Homebrew):**
\`\`\`bash
brew install postgresql
brew services start postgresql
\`\`\`

**Windows:**
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

**Ubuntu/Debian:**
\`\`\`bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
\`\`\`

### 2. Setup Database

\`\`\`bash
# Connect as postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE stackit;
CREATE USER stackit_user WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE stackit TO stackit_user;
\q
\`\`\`

### 3. Clone and Install

\`\`\`bash
git clone <your-repo>
cd stackit-platform
npm install
\`\`\`

### 4. Environment Setup

Create `.env` file:
\`\`\`env
PGUSER=stackit_user
PGHOST=localhost
PGDATABASE=stackit
PGPASSWORD=password123
PGPORT=5432
JWT_SECRET=your-super-secret-jwt-key-make-it-very-long-and-random
NODE_ENV=development
\`\`\`

### 5. Initialize Database

\`\`\`bash
# Run database scripts
psql -U stackit_user -d stackit -h localhost -f scripts/01-create-database.sql
psql -U stackit_user -d stackit -h localhost -f scripts/02-seed-data.sql
\`\`\`

### 6. Start Application

\`\`\`bash
npm run dev
\`\`\`

Visit: `http://localhost:3000`

## Test Accounts

**All passwords are: `password`**

- **Admin**: admin@stackit.com
- **User**: john@example.com  
- **User**: jane@example.com
- **User**: guru@example.com

## Verification

1. Test database: `http://localhost:3000/api/test-db`
2. Login with admin account
3. Visit admin dashboard: `http://localhost:3000/admin`

## Troubleshooting

**Database connection failed:**
\`\`\`bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U stackit_user -d stackit -h localhost
\`\`\`

**Login issues:**
- Ensure database is seeded with user data
- Check browser console for errors
- Verify JWT_SECRET is set

**Port conflicts:**
\`\`\`bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
