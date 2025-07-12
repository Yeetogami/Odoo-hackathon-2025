#!/usr/bin/env python3
"""
Test database connection script
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_connection():
    """Test database connection with different configurations"""
    print("🔍 Testing database connections...")
    
    # Test direct psycopg2 connection
    try:
        import psycopg2
        
        configs = [
            {"host": "localhost", "port": "5432", "user": "postgres", "password": "password", "database": "stackit"},
            {"host": "localhost", "port": "5432", "user": "postgres", "password": "postgres", "database": "stackit"},
            {"host": "localhost", "port": "5432", "user": "postgres", "password": "", "database": "stackit"},
        ]
        
        for i, config in enumerate(configs, 1):
            try:
                conn = psycopg2.connect(**config)
                cursor = conn.cursor()
                cursor.execute("SELECT version()")
                version = cursor.fetchone()
                print(f"✅ Connection {i} successful: {config['user']}@{config['host']}:{config['port']}")
                print(f"   PostgreSQL version: {version[0][:50]}...")
                cursor.close()
                conn.close()
                return True
            except Exception as e:
                print(f"❌ Connection {i} failed: {str(e)[:100]}")
        
        return False
        
    except ImportError:
        print("❌ psycopg2 not installed")
        return False

def test_sqlalchemy():
    """Test SQLAlchemy connection"""
    try:
        from database import engine
        with engine.connect() as conn:
            result = conn.execute("SELECT 1")
            print("✅ SQLAlchemy connection successful")
            return True
    except Exception as e:
        print(f"❌ SQLAlchemy connection failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 StackIt Database Connection Test")
    print("===================================")
    
    if test_connection():
        print("\n🔗 Testing SQLAlchemy...")
        test_sqlalchemy()
    else:
        print("\n💡 Troubleshooting tips:")
        print("1. Make sure PostgreSQL is running")
        print("2. Check if the database 'stackit' exists")
        print("3. Verify PostgreSQL credentials")
        print("4. Try running: python scripts/setup_postgresql.py")
