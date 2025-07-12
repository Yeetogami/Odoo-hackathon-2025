-- Run this script to set up your local database
-- Usage: psql -U postgres -f scripts/setup-local.sql

-- Create database and user
CREATE DATABASE stackit;
CREATE USER stackit_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE stackit TO stackit_user;

-- Connect to the stackit database
\c stackit;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO stackit_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO stackit_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO stackit_user;

-- Now run the table creation and seed scripts
\i scripts/01-create-database.sql
\i scripts/02-seed-data.sql
