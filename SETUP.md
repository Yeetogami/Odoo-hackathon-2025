# Local Setup Instructions for StackIt

## Prerequisites

1. **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
2. **PostgreSQL** - Install locally

### Installing PostgreSQL

#### On macOS (using Homebrew):
\`\`\`bash
brew install postgresql
brew services start postgresql
\`\`\`

#### On Windows:
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user

#### On Ubuntu/Debian:
\`\`\`bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
\`\`\`

## Setup Steps

### 1. Clone and Install Dependencies
\`\`\`bash
git clone <your-repo>
cd stackit-platform
npm install
\`\`\`

### 2. Set Up PostgreSQL Database

#### Create Database and User
\`\`\`bash
# Connect to PostgreSQL as superuser
psql -U postgres

# In the PostgreSQL prompt:
CREATE DATABASE stackit;
CREATE USER stackit_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE stackit TO stackit_user;
\q
\`\`\`

### 3. Configure Environment Variables

Copy the environment file:
\`\`\`bash
cp .env.local .env
\`\`\`

Edit `.env` with your database credentials:
\`\`\`env
PGUSER=stackit_user
PGHOST=localhost
PGDATABASE=stackit
PGPASSWORD=your_password
PGPORT=5432
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
NODE_ENV=development
\`\`\`

### 4. Initialize Database Schema

Connect to your database and run the setup scripts:

\`\`\`bash
# Connect to the database
psql -U stackit_user -d stackit -h localhost

# Copy and paste the contents of scripts/01-create-database.sql
# Then copy and paste the contents of scripts/02-seed-data.sql
\`\`\`

Or run them directly:
\`\`\`bash
psql -U stackit_user -d stackit -h localhost -f scripts/01-create-database.sql
psql -U stackit_user -d stackit -h localhost -f scripts/02-seed-data.sql
\`\`\`

### 5. Start the Application

\`\`\`bash
npm run dev
\`\`\`

The application will be available at `http://localhost:3000`

## Test Users

After running the seed script, you can login with:
- **Email**: admin@stackit.com **Password**: password
- **Email**: john@example.com **Password**: password  
- **Email**: jane@example.com **Password**: password

## Troubleshooting

### Database Connection Issues

1. **Check if PostgreSQL is running**:
   \`\`\`bash
   # macOS/Linux
   pg_ctl status
   
   # Or check processes
   ps aux | grep postgres
   \`\`\`

2. **Test connection manually**:
   \`\`\`bash
   psql -U stackit_user -d stackit -h localhost
   \`\`\`

3. **Check PostgreSQL logs**:
   \`\`\`bash
   # macOS (Homebrew)
   tail -f /usr/local/var/log/postgres.log
   
   # Ubuntu/Debian
   sudo tail -f /var/log/postgresql/postgresql-*.log
   \`\`\`

### Common Issues

1. **"database does not exist"**: Make sure you created the database
2. **"password authentication failed"**: Check your username/password in .env
3. **"connection refused"**: PostgreSQL service isn't running

### Alternative: Using Docker (Optional)

If you prefer Docker, create a `docker-compose.yml`:

\`\`\`yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: stackit
      POSTGRES_USER: stackit_user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
\`\`\`

Then run:
\`\`\`bash
docker-compose up -d
