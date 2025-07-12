#!/bin/bash

# Complete StackIt Backend Setup Script

echo "🚀 StackIt Backend Complete Setup"
echo "=================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Python
if ! command_exists python3; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

echo "✅ Python 3 found"

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

echo "✅ Python dependencies installed"

# Setup PostgreSQL
echo "🗄️  Setting up PostgreSQL..."
python scripts/setup_postgresql.py

if [ $? -ne 0 ]; then
    echo "❌ PostgreSQL setup failed"
    echo "Please set up PostgreSQL manually and try again"
    exit 1
fi

# Setup database tables
echo "🏗️  Creating database tables..."
python scripts/setup_database.py

if [ $? -ne 0 ]; then
    echo "❌ Database table creation failed"
    exit 1
fi

# Seed database
echo "🌱 Seeding database with sample data..."
python scripts/seed_data.py

if [ $? -ne 0 ]; then
    echo "⚠️  Database seeding failed, but continuing..."
fi

echo ""
echo "🎉 StackIt Backend Setup Complete!"
echo "=================================="
echo "📖 API Documentation: http://localhost:8000/docs"
echo "🔍 Alternative docs: http://localhost:8000/redoc"
echo ""
echo "🚀 Starting the server..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000
