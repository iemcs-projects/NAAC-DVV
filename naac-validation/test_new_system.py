#!/usr/bin/env python3
"""
Test script for the new unified NAAC validation system
Tests text extraction, database validation, and AI confidence scoring
"""

import json
import sys
from pathlib import Path

# Add project root to path
sys.path.append(str(Path(__file__).parent))

from processors.ocr_processor import UnifiedOCRProcessor
from validation.criteria.criteria_validator import CriteriaValidator
from validation.content_validator import NAACContentValidator

def test_ocr_processor():
    """Test the unified OCR processor"""
    print("🔍 Testing Unified OCR Processor...")
    
    try:
        processor = UnifiedOCRProcessor()
        status = processor.get_status()
        print(f"   ✅ OCR Processor initialized: {status}")
        return True
    except Exception as e:
        print(f"   ❌ OCR Processor failed: {str(e)}")
        return False

def test_criteria_validator():
    """Test the criteria validator"""
    print("📋 Testing Criteria Validator...")
    
    try:
        validator = CriteriaValidator()
        
        # Test supported criteria
        criteria_list = validator.list_supported_criteria()
        print(f"   ✅ Supported criteria: {len(criteria_list)}")
        
        # Test specific criteria info
        criteria_info = validator.get_criteria_info("3.1.1")
        print(f"   ✅ Criteria 3.1.1 info loaded: {criteria_info.get('name', 'Unknown')}")
        
        return True
    except Exception as e:
        print(f"   ❌ Criteria Validator failed: {str(e)}")
        return False

def test_content_validator():
    """Test the content validator"""
    print("🤖 Testing Content Validator...")
    
    try:
        validator = NAACContentValidator()
        info = validator.get_validator_info()
        print(f"   ✅ Content Validator initialized: {info['model']}")
        print(f"   📡 API configured: {info['api_configured']}")
        return True
    except Exception as e:
        print(f"   ❌ Content Validator failed: {str(e)}")
        return False

def test_complete_workflow():
    """Test the complete validation workflow with sample data"""
    print("🎯 Testing Complete Validation Workflow...")
    
    try:
        # Initialize components
        criteria_validator = CriteriaValidator()
        
        # Sample database record for criteria 3.1.1
        sample_record = {
            "name_of_project": "AI-based Educational Platform Development",
            "name_of_principal_investigator": "Dr. John Smith", 
            "department_of_principal_investigator": "Computer Science",
            "name_of_funding_agency": "Department of Science and Technology",
            "amount_sanctioned": 500000.0,
            "year_of_award": 2023,
            "duration_of_project": 24,
            "type": "Government"
        }
        
        # Sample extracted text that matches the record
        sample_text = """
        Project Title: AI-based Educational Platform Development
        Principal Investigator: Dr. John Smith, Computer Science Department
        Funding Agency: Department of Science and Technology
        Sanctioned Amount: Rs. 5,00,000
        Project Duration: 24 months
        Award Year: 2023
        """
        
        # Test validation
        result = criteria_validator.validate_criteria_document(
            "3.1.1", sample_record, sample_text
        )
        
        print(f"   ✅ Validation completed!")
        print(f"   📊 Decision: {result.get('decision', 'Unknown')}")
        print(f"   🎯 Confidence: {result.get('confidence_score', 0.0):.3f}")
        print(f"   📋 Criteria: {result.get('criteria_name', 'Unknown')}")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Complete workflow failed: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("🚀 NAAC Validation System - New Architecture Test")
    print("=" * 60)
    
    results = []
    
    # Run individual component tests
    results.append(("OCR Processor", test_ocr_processor()))
    results.append(("Criteria Validator", test_criteria_validator()))
    results.append(("Content Validator", test_content_validator()))
    results.append(("Complete Workflow", test_complete_workflow()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY:")
    print("=" * 60)
    
    passed = 0
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {status}  {name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("🎉 All tests passed! New validation system is ready.")
    else:
        print("⚠️  Some tests failed. Check the errors above.")
    
    print("=" * 60)

if __name__ == "__main__":
    main()