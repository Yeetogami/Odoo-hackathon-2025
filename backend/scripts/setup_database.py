#!/usr/bin/env python3
"""
Database setup script for StackIt
Run this script to create all database tables
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import create_tables, engine
from sqlalchemy import text

def setup_database():
    """Create all database tables"""
    try:
        print("Creating database tables...")
        create_tables()
        print("✅ Database tables created successfully!")
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ Database connection test successful!")
            
    except Exception as e:
        print(f"❌ Error setting up database: {e}")
        return False
    
    return True

if __name__ == "__main__":
    setup_database()
