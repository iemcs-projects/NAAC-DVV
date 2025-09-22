#!/usr/bin/env python3
"""
Usage Examples for the New NAAC Validation System

This demonstrates how to use the new database-based validation workflow:
1. Extract text from documents
2. Validate against database records using AI instructions
3. Get confidence scores and detailed analysis
"""

import json
import sys
from pathlib import Path

# Add project root to path
sys.path.append(str(Path(__file__).parent))

from processors.ocr_processor import UnifiedOCRProcessor
from validation.criteria.criteria_validator import CriteriaValidator

def example_1_basic_validation():
    """Example 1: Basic validation workflow"""
    print("📋 Example 1: Basic Database Validation")
    print("-" * 50)
    
    # Initialize components
    criteria_validator = CriteriaValidator()
    
    # Sample database record (as it would come from your backend models)
    database_record = {
        "name_of_project": "Development of AI-powered Learning Management System",
        "name_of_principal_investigator": "Dr. Sarah Johnson", 
        "department_of_principal_investigator": "Computer Science & Engineering",
        "name_of_funding_agency": "University Grants Commission",
        "amount_sanctioned": 750000.50,
        "year_of_award": 2022,
        "duration_of_project": 36,
        "type": "Government"
    }
    
    # Sample text extracted from a document
    extracted_text = """
    SANCTION ORDER
    
    Project Title: Development of AI-powered Learning Management System
    Principal Investigator: Dr. Sarah Johnson
    Department: Computer Science & Engineering
    Funding Agency: University Grants Commission (UGC)
    Sanctioned Amount: Rs. 7,50,000.50
    Project Duration: 36 months
    Sanctioned Year: 2022
    Project Type: Government Funded Research
    
    This project aims to develop an innovative learning management system
    using artificial intelligence to enhance student engagement and learning outcomes.
    """
    
    # Perform validation
    result = criteria_validator.validate_criteria_document(
        criteria_code="3.1.1",
        database_record=database_record,
        extracted_text=extracted_text
    )
    
    # Display results
    print(f"✅ Validation Result:")
    print(f"   Decision: {result.get('decision', 'Unknown')}")
    print(f"   Confidence: {result.get('confidence_score', 0.0):.3f}")
    print(f"   Valid: {result.get('is_valid', False)}")
    print(f"   Criteria: {result.get('criteria_name', 'Unknown')}")
    print()

def example_2_mismatch_detection():
    """Example 2: Detecting mismatches in data"""
    print("📋 Example 2: Mismatch Detection")
    print("-" * 50)
    
    criteria_validator = CriteriaValidator()
    
    # Database record
    database_record = {
        "name_of_project": "Blockchain Research Initiative",
        "name_of_principal_investigator": "Dr. Michael Brown", 
        "amount_sanctioned": 500000.0,
        "year_of_award": 2023
    }
    
    # Text with different information (mismatched)
    extracted_text = """
    RESEARCH GRANT APPROVAL
    
    Project: Machine Learning in Healthcare
    PI: Dr. Alice Smith
    Amount: Rs. 3,00,000
    Year: 2021
    """
    
    result = criteria_validator.validate_criteria_document(
        "3.1.1", database_record, extracted_text
    )
    
    print(f"❌ Mismatch Detection:")
    print(f"   Decision: {result.get('decision', 'Unknown')}")
    print(f"   Confidence: {result.get('confidence_score', 0.0):.3f}")
    print(f"   Valid: {result.get('is_valid', False)}")
    print()

def example_3_supported_criteria():
    """Example 3: Check supported criteria"""
    print("📋 Example 3: Supported NAAC Criteria")
    print("-" * 50)
    
    criteria_validator = CriteriaValidator()
    
    supported = criteria_validator.list_supported_criteria()
    
    print("Supported NAAC Criteria:")
    for criteria in supported:
        print(f"   {criteria['code']}: {criteria['name']}")
        print(f"      Required fields: {criteria['required_fields']}")
        print(f"      Document types: {criteria['document_types']}")
        print()

def example_4_api_usage():
    """Example 4: How to use with FastAPI endpoints"""
    print("📋 Example 4: API Usage Example")
    print("-" * 50)
    
    # This shows the JSON structure for the new API endpoint
    api_example = {
        "endpoint": "POST /validate-with-database",
        "parameters": {
            "file": "document.pdf (multipart/form-data)",
            "database_record": json.dumps({
                "name_of_project": "Your project name from database",
                "name_of_principal_investigator": "PI name from database",
                "amount_sanctioned": 500000.0,
                "year_of_award": 2023
            }),
            "criteria_code": "3.1.1"
        },
        "response_format": {
            "success": True,
            "message": "Database validation completed for 3.1.1",
            "data": {
                "validation_result": {
                    "decision": "ACCEPT|FLAG_FOR_REVIEW|REJECT",
                    "confidence_score": 0.85,
                    "is_valid": True,
                    "criteria_code": "3.1.1",
                    "ai_analysis": "...",
                    "database_comparison": "..."
                }
            }
        }
    }
    
    print("API Usage:")
    print(json.dumps(api_example, indent=2))
    print()

def main():
    """Run all examples"""
    print("🚀 NAAC Database Validation - Usage Examples")
    print("=" * 60)
    print()
    
    try:
        example_1_basic_validation()
        example_2_mismatch_detection()
        example_3_supported_criteria()
        example_4_api_usage()
        
        print("✅ All examples completed successfully!")
        print("\n🎯 Key Benefits of New System:")
        print("   • AI-powered confidence scoring")
        print("   • Database model integration")
        print("   • Detailed validation instructions")
        print("   • Unified OCR processing")
        print("   • RESTful API endpoints")
        
    except Exception as e:
        print(f"❌ Example failed: {str(e)}")

if __name__ == "__main__":
    main()