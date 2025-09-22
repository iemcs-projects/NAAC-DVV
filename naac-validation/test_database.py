#!/usr/bin/env python3
"""
Test script for database integration with NAAC validation system
Tests direct database connectivity and record fetching
"""

import os
import sys
from pathlib import Path

# Add project root to path
sys.path.append(str(Path(__file__).parent))

# Set environment variables for testing
os.environ.setdefault('DB_HOST', 'localhost')
os.environ.setdefault('DB_NAME', 'naac_dvv')
os.environ.setdefault('DB_USER', 'root')
os.environ.setdefault('DB_PASSWORD', '')

def test_database_connection():
    """Test basic database connectivity"""
    print("🔗 Testing Database Connection...")
    
    try:
        from config.database import db
        
        status = db.get_database_status()
        if status["status"] == "connected":
            print(f"   ✅ Connected to database: {status['database']} on {status['host']}")
            print(f"   📊 Table statistics: {status['table_counts']}")
            return True
        else:
            print(f"   ❌ Connection failed: {status.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"   ❌ Database connection test failed: {str(e)}")
        return False

def test_record_retrieval():
    """Test fetching records from database"""
    print("📋 Testing Record Retrieval...")
    
    try:
        from config.database import db
        
        # Test getting a specific record
        record = db.get_criteria_record("3.1.1", 4)  # Using your sample data
        
        if record:
            print(f"   ✅ Retrieved record 4 for criteria 3.1.1")
            print(f"   📊 PI: {record.get('name_of_principal_investigator', 'Unknown')}")
            print(f"   📊 Project: {record.get('name_of_project', 'Unknown')}")
            print(f"   📊 Amount: {record.get('amount_sanctioned', 'Unknown')}")
            return True
        else:
            print("   ⚠️ No record found (this is OK if database is empty)")
            return True
            
    except Exception as e:
        print(f"   ❌ Record retrieval test failed: {str(e)}")
        return False

def test_criteria_records():
    """Test getting records by criteria"""
    print("📂 Testing Records by Criteria...")
    
    try:
        from config.database import db
        
        records = db.get_records_by_criteria("3.1.1", limit=5)
        print(f"   ✅ Retrieved {len(records)} records for criteria 3.1.1")
        
        for i, record in enumerate(records[:3], 1):  # Show first 3
            pi_name = record.get('name_of_principal_investigator', 'Unknown')
            project = record.get('name_of_project', 'Unknown')
            print(f"   📋 Record {i}: {pi_name} - {project}")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Criteria records test failed: {str(e)}")
        return False

def test_search_functionality():
    """Test search functionality"""
    print("🔍 Testing Search Functionality...")
    
    try:
        from config.database import db
        
        # Test searching by PI name
        search_params = {"name_of_principal_investigator": "Dr"}
        records = db.search_records("3.1.1", search_params)
        
        print(f"   ✅ Search found {len(records)} records with 'Dr' in PI name")
        return True
        
    except Exception as e:
        print(f"   ❌ Search functionality test failed: {str(e)}")
        return False

def demonstrate_api_usage():
    """Show how to use the new API endpoints"""
    print("\n" + "=" * 60)
    print("📖 NEW API ENDPOINTS USAGE EXAMPLES:")
    print("=" * 60)
    
    examples = [
        {
            "title": "Validate Document Against Database Record",
            "method": "POST",
            "endpoint": "/validate-record",
            "description": "Automatically fetches record from database and validates document",
            "example": """
curl -X POST "http://localhost:8000/validate-record" \\
  -F "file=@document.pdf" \\
  -F "criteria_code=3.1.1" \\
  -F "record_id=4"
"""
        },
        {
            "title": "Get Records by Criteria",
            "method": "GET", 
            "endpoint": "/records/{criteria_code}",
            "description": "Get recent records for validation",
            "example": """
curl "http://localhost:8000/records/3.1.1?limit=10"
"""
        },
        {
            "title": "Search Records",
            "method": "GET",
            "endpoint": "/search/{criteria_code}",
            "description": "Search records by PI name, project, etc.",
            "example": """
curl "http://localhost:8000/search/3.1.1?pi_name=Dr.%20Smith&year=2024"
"""
        },
        {
            "title": "Database Status",
            "method": "GET",
            "endpoint": "/database/status", 
            "description": "Check database connection and statistics",
            "example": """
curl "http://localhost:8000/database/status"
"""
        }
    ]
    
    for example in examples:
        print(f"\n🔹 {example['title']}")
        print(f"   Method: {example['method']} {example['endpoint']}")
        print(f"   Description: {example['description']}")
        print(f"   Example: {example['example']}")

def main():
    """Run all database tests"""
    print("🚀 NAAC Validation System - Database Integration Test")
    print("=" * 60)
    
    results = []
    
    # Run tests
    results.append(("Database Connection", test_database_connection()))
    results.append(("Record Retrieval", test_record_retrieval()))
    results.append(("Criteria Records", test_criteria_records()))
    results.append(("Search Functionality", test_search_functionality()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 DATABASE INTEGRATION TEST RESULTS:")
    print("=" * 60)
    
    passed = 0
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {status}  {name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("🎉 Database integration is working! You can now validate directly from database.")
    else:
        print("⚠️  Some tests failed. Check your database configuration.")
        print("💡 Make sure to:")
        print("   - Install: pip install mysql-connector-python")
        print("   - Configure database credentials in .env file")
        print("   - Ensure database server is running")
    
    # Show API usage examples
    demonstrate_api_usage()
    
    print("=" * 60)

if __name__ == "__main__":
    main()