"""
API Response Simplifier for NAAC Validation System
Converts complex validation responses to simplified format
"""

from typing import Dict, Any, List
from datetime import datetime

def simplify_bulk_validation_response(original_response: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert complex bulk validation response to simplified format
    
    Args:
        original_response: The original complex response from validation
        
    Returns:
        Dict with simplified structure: data (accepted/rejected) and details
    """
    
    if not original_response.get("success", False):
        # Return error response as-is for failed validations
        return original_response
    
    original_data = original_response["data"]
    bulk_summary = original_data["bulk_validation_summary"]
    top_matches = original_data.get("top_matches", [])
    best_match = original_data.get("best_match")
    
    # If there's only a best_match (single record validation), convert to list
    if best_match and not top_matches:
        top_matches = [best_match]
    
    # Initialize simplified structure
    simplified = {
        "success": original_response["success"],
        "message": original_response["message"],
        "data": {
            "summary": {
                "total_records_processed": bulk_summary["total_records_checked"],
                "best_match_confidence": bulk_summary["best_match_confidence"]
            },
            "accepted_records": [],
            "rejected_records": []
        },
        "details": {
            "confidence_breakdown": bulk_summary["decision_breakdown"],
            "extraction_info": original_data.get("extraction_info", {}),
            "validation_analysis": []
        }
    }
    
    # Process each validation result
    for idx, match in enumerate(top_matches):
        # Extract basic record info for data section
        db_record = match["database_record"]
        record_summary = {
            "record_id": db_record.get("id"),
            "principal_investigator": db_record.get("name_of_principal_investigator"),
            "project_name": db_record.get("name_of_project"),
            "amount": db_record.get("amount_sanctioned"),
            "funding_agency": db_record.get("name_of_funding_agency"),
            "year_of_award": db_record.get("year_of_award"),
            "confidence_score": match["confidence_score"],
            "decision": match["decision"]
        }
        
        # Categorize by decision
        if match["decision"] == "ACCEPT":
            simplified["data"]["accepted_records"].append(record_summary)
        elif match["decision"] == "REJECT":
            simplified["data"]["rejected_records"].append(record_summary)
        else:  # FLAG_FOR_REVIEW or other
            # You can decide where to put these - perhaps add a "flagged_records" list
            # For now, treating as separate category
            if "flagged_records" not in simplified["data"]:
                simplified["data"]["flagged_records"] = []
            simplified["data"]["flagged_records"].append(record_summary)
        
        # Extract detailed analysis for details section
        ai_analysis = match.get("ai_analysis", {})
        db_comparison = match.get("database_comparison", {})
        
        # Calculate field match statistics
        field_matches = ai_analysis.get("field_matches", {})
        total_fields = len(field_matches)
        matched_fields = len([f for f in field_matches.values() if f.get("found", False)])
        
        detailed_analysis = {
            "record_id": db_record.get("id"),
            "record_index": match.get("record_index", idx + 1),
            "ai_analysis": {
                "overall_assessment": ai_analysis.get("overall_assessment", ""),
                "recommendation": ai_analysis.get("recommendation", match["decision"]),
                "confidence_score": ai_analysis.get("confidence_score", match["confidence_score"]),
                "field_match_summary": {
                    "total_fields_matched": matched_fields,
                    "total_fields_checked": total_fields,
                    "match_percentage": round((matched_fields / total_fields * 100) if total_fields > 0 else 0, 1)
                },
                "concerns": ai_analysis.get("concerns", []),
                "strengths": ai_analysis.get("strengths", [])
            },
            "database_comparison": {
                "text_coverage": round(db_comparison.get("text_coverage", 0) * 100, 1),
                "found_fields_count": len(db_comparison.get("found_fields", [])),
                "missing_fields_count": len(db_comparison.get("missing_fields", [])),
                "missing_fields": db_comparison.get("missing_fields", []),
                "completion_percentage": match.get("required_fields_check", {}).get("completion_percentage", 0)
            },
            "validation_timestamp": match.get("validation_timestamp", datetime.now().isoformat())
        }
        
        simplified["details"]["validation_analysis"].append(detailed_analysis)
    
    return simplified

def simplify_single_validation_response(original_response: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert single record validation response to simplified format
    
    Args:
        original_response: The original response from single record validation
        
    Returns:
        Dict with simplified structure
    """
    
    if not original_response.get("success", False):
        return original_response
    
    validation_result = original_response["data"]["validation_result"]
    
    # Create simplified single record response
    simplified = {
        "success": original_response["success"],
        "message": original_response["message"],
        "data": {
            "summary": {
                "total_records_processed": 1,
                "confidence_score": validation_result["confidence_score"]
            },
            "result": {
                "record_id": validation_result["database_record"].get("id"),
                "principal_investigator": validation_result["database_record"].get("name_of_principal_investigator"),
                "project_name": validation_result["database_record"].get("name_of_project"),
                "amount": validation_result["database_record"].get("amount_sanctioned"),
                "funding_agency": validation_result["database_record"].get("name_of_funding_agency"),
                "year_of_award": validation_result["database_record"].get("year_of_award"),
                "confidence_score": validation_result["confidence_score"],
                "decision": validation_result["decision"],
                "is_valid": validation_result["is_valid"]
            }
        },
        "details": {
            "ai_analysis": {
                "reasoning": validation_result["ai_analysis"].get("reasoning", ""),
                "matched_fields": validation_result["ai_analysis"].get("matched_fields", []),
                "confidence_factors": validation_result["ai_analysis"].get("confidence_factors", {})
            },
            "database_comparison": validation_result.get("database_comparison", {}),
            "validation_timestamp": validation_result.get("validation_timestamp", datetime.now().isoformat()),
            "criteria_info": {
                "code": validation_result.get("criteria_code"),
                "name": validation_result.get("criteria_name")
            }
        }
    }
    
    return simplified

# Usage examples and integration functions
def format_api_response(response_data: Dict[str, Any], response_type: str = "bulk") -> Dict[str, Any]:
    """
    Main function to format API responses based on type
    
    Args:
        response_data: Original response from validation
        response_type: "bulk" or "single" validation response
        
    Returns:
        Simplified response format
    """
    
    if response_type == "bulk":
        return simplify_bulk_validation_response(response_data)
    elif response_type == "single":
        return simplify_single_validation_response(response_data)
    else:
        # Return original if type not recognized
        return response_data

# Example usage in FastAPI endpoint
def example_fastapi_integration():
    """
    Example of how to integrate this into your FastAPI endpoints
    """
    
    # This would be in your FastAPI route
    """
    @app.post("/validate-against-all-records-simplified")
    async def validate_against_all_records_simplified(
        file: UploadFile = File(...),
        criteria_code: str = Form(...),
        confidence_threshold: float = Form(default=0.7)
    ):
        # ... existing validation logic ...
        
        # Get original complex response
        original_response = await validate_against_all_records(file, criteria_code, confidence_threshold)
        
        # Simplify the response
        simplified_response = format_api_response(original_response, "bulk")
        
        return simplified_response
    
    @app.post("/validate-record-simplified")  
    async def validate_record_simplified(
        file: UploadFile = File(...),
        criteria_code: str = Form(...),
        record_id: int = Form(...)
    ):
        # ... existing validation logic ...
        
        # Get original response
        original_response = await validate_record(file, criteria_code, record_id)
        
        # Simplify the response
        simplified_response = format_api_response(original_response, "single")
        
        return simplified_response
    """
    pass

if __name__ == "__main__":
    # Test with example data
    import json
    
    # Load the example response (your original JSON)
    with open("simplified_response_example.json", "r") as f:
        example = json.load(f)
    
    print("Simplified Response Structure:")
    print("=" * 50)
    print(json.dumps(example, indent=2))