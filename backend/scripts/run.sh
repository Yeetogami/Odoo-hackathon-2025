#!/bin/bash

# StackIt Backend Setup and Run Script

echo "🚀 Setting up StackIt Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if PostgreSQL is running (via Docker or local)
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker not found. Make sure PostgreSQL is running locally on port 5432"
else
    echo "🐳 Starting PostgreSQL with Docker..."
    docker-compose up -d postgres
    sleep 5
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Setup database
echo "🗄️  Setting up database..."
python scripts/setup_database.py

# Seed database with sample data
echo "🌱 Seeding database with sample data..."
python scripts/seed_data.py

# Start the FastAPI server
echo "🎯 Starting StackIt API server..."
echo "📖 API Documentation will be available at: http://localhost:8000/docs"
echo "🔍 Alternative docs at: http://localhost:8000/redoc"
echo ""
uvicorn main:app --reload --host 0.0.0.0 --port 8000
