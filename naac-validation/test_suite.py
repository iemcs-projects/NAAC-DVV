#!/usr/bin/env python3
"""
Unified Test Suite for NAAC Validation System

Combines all test functionality into a single comprehensive test file.
Tests database connectivity, validation logic, and system integration.
"""

import os
import sys
import json
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

def test_validation_logic():
    """Test validation logic with sample data"""
    print("🧪 Testing Validation Logic...")
    
    # Sample database record
    database_record = {
        'sl_no': '1',
        'name_of_principal_investigator': 'Dr. John Doe',
        'department_of_principal_investigator': 'Computer Science',
        'name_of_project': 'Advanced AI Research',
        'year_of_award': '2024',
        'amount_sanctioned': '2.50',
        'name_of_funding_agency': 'UGC'
    }
    
    # Sample extracted text
    extracted_text = """
    Certificate of Research Grant
    This is to certify that Dr. John Doe from the Department of Computer
    Science has been awarded a research grant for the project titled "Advanced AI Research".
    The project has been sanctioned with an amount of ₹ 2.50 Crore(s) by
    the funding agency UGC in the year 2024.
    """
    
    try:
        from validation.criteria.criteria_validator import CriteriaValidator
        
        validator = CriteriaValidator()
        result = validator.validate_criteria_document("3.1.1", database_record, extracted_text)
        
        print(f"   ✅ Validation completed")
        print(f"   📊 Confidence Score: {result.get('confidence_score', 0):.3f}")
        print(f"   🎯 Decision: {result.get('decision', 'UNKNOWN')}")
        
        return result.get('confidence_score', 0) > 0.5
        
    except Exception as e:
        print(f"   ❌ Validation test failed: {str(e)}")
        return False

def test_api_endpoints():
    """Test API endpoints availability"""
    print("🌐 Testing API Endpoints...")
    
    try:
        import requests
        
        base_url = "http://localhost:8000"
        
        # Test health endpoint
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print(f"   ✅ Health endpoint: {response.status_code}")
        else:
            print(f"   ⚠️  Health endpoint: {response.status_code}")
            
        # Test criteria endpoint
        response = requests.get(f"{base_url}/criteria", timeout=5)
        if response.status_code == 200:
            print(f"   ✅ Criteria endpoint: {response.status_code}")
        else:
            print(f"   ⚠️  Criteria endpoint: {response.status_code}")
            
        return True
        
    except requests.exceptions.ConnectionError:
        print("   ⚠️  Server not running - start with 'python app.py'")
        return False
    except Exception as e:
        print(f"   ❌ API test failed: {str(e)}")
        return False

def test_system_integration():
    """Test complete system integration"""
    print("🔧 Testing System Integration...")
    
    tests_passed = 0
    total_tests = 3
    
    # Database test
    if test_database_connection():
        tests_passed += 1
    
    # Validation test  
    if test_validation_logic():
        tests_passed += 1
        
    # API test (optional)
    if test_api_endpoints():
        tests_passed += 1
    
    print(f"\n📊 Test Results: {tests_passed}/{total_tests} tests passed")
    
    if tests_passed == total_tests:
        print("✅ All systems operational!")
        return True
    elif tests_passed >= 2:
        print("⚠️  Most systems working (API server may not be running)")
        return True
    else:
        print("❌ System has issues - check configuration")
        return False

def main():
    """Main test runner"""
    print("🧪 NAAC Validation System - Test Suite")
    print("=" * 50)
    
    # Run comprehensive test
    success = test_system_integration()
    
    if success:
        print("\n🎉 System is ready for use!")
    else:
        print("\n🚨 System needs attention - check logs for details")
    
    return success

if __name__ == "__main__":
    main()