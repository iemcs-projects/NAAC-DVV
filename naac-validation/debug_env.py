#!/usr/bin/env python3
"""
Debug script to test environment variable loading
"""

import os
from dotenv import load_dotenv

print("🔍 Environment Variable Debug Test")
print("=" * 50)

# Load .env file
load_dotenv()

print("📁 Current working directory:", os.getcwd())
print("📄 .env file exists:", os.path.exists('.env'))

# Check environment variables
env_vars = {
    'DB_HOST': os.getenv('DB_HOST'),
    'DB_PORT': os.getenv('DB_PORT'), 
    'DB_NAME': os.getenv('DB_NAME'),
    'DB_USER': os.getenv('DB_USER'),
    'DB_PASSWORD': os.getenv('DB_PASSWORD')
}

print("\n🔧 Environment Variables:")
for key, value in env_vars.items():
    if key == 'DB_PASSWORD':
        # Mask password for security
        display_value = '*' * len(value) if value else 'None'
    else:
        display_value = value
    print(f"   {key}: {display_value}")

# Test manual configuration
print("\n🧪 Manual Configuration Test:")
manual_config = {
    "host": "localhost",
    "user": "root", 
    "password": "MySQL@321",
    "database": "Naac_Dvv",
    "port": 3306
}

try:
    import mysql.connector
    connection = mysql.connector.connect(**manual_config)
    if connection.is_connected():
        print("   ✅ Manual connection successful!")
        cursor = connection.cursor()
        cursor.execute("SHOW TABLES;")
        tables = cursor.fetchall()
        print(f"   📋 Found {len(tables)} tables in database")
        cursor.close()
        connection.close()
    else:
        print("   ❌ Manual connection failed")
except Exception as e:
    print(f"   ❌ Manual connection error: {str(e)}")

print("=" * 50)