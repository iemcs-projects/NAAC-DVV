"""
NAAC Criteria-specific validation rules and logic
"""
from typing import Dict, Any, List
from validation.content_validator import NAACContentValidator

class CriteriaValidator:
    """Validates documents against specific NAAC criteria requirements"""
    
    def __init__(self):
        self.content_validator = NAACContentValidator()
        
        # Define criteria-specific requirements
        self.criteria_requirements = {
            "2.1.1": {
                "name": "Number of teaching staff joined the institution during the last five years",
                "required_fields": ["faculty_name", "joining_date", "designation", "department"],
                "document_types": ["joining_letter", "appointment_order"],
                "validation_rules": {
                    "joining_date": "must be within last 5 years",
                    "designation": "must be teaching position"
                }
            },
            "2.2.1": {
                "name": "Students to full time teacher ratio",
                "required_fields": ["student_count", "teacher_count", "academic_year"],
                "document_types": ["enrollment_data", "faculty_list"],
                "validation_rules": {
                    "ratio": "student_count / teacher_count should be reasonable"
                }
            },
            "3.1.1": {
                "name": "Grants received from Government and non-governmental agencies for research projects",
                "required_fields": ["project_title", "pi_name", "co_pi_names", "funding_agency", "sanctioned_amount", "duration", "sanction_year"],
                "document_types": ["sanction_letter", "grant_certificate"],
                "validation_rules": {
                    "sanctioned_amount": "must be > 0",
                    "sanction_year": "must be within assessment period",
                    "pi_name": "must be faculty of institution"
                }
            },
            "3.2.1": {
                "name": "Institution has created an ecosystem for innovations and has initiatives for creation and transfer of knowledge",
                "required_fields": ["innovation_title", "participants", "outcome", "year"],
                "document_types": ["innovation_report", "patent_document", "publication"],
                "validation_rules": {
                    "participants": "must include institution members",
                    "outcome": "must show tangible results"
                }
            },
            "3.2.2": {
                "name": "Number of workshops/seminars conducted on Research Methodology, Intellectual Property Rights (IPR) and entrepreneurship",
                "required_fields": ["event_title", "date", "resource_persons", "participants_count", "topic"],
                "document_types": ["event_report", "attendance_sheet", "photos"],
                "validation_rules": {
                    "topic": "must be related to Research/IPR/Entrepreneurship",
                    "participants_count": "must be > 0"
                }
            },
            "3.3.1": {
                "name": "Number of research papers published per teacher in the Journals notified on UGC website during the last five years",
                "required_fields": ["paper_title", "authors", "journal_name", "publication_year", "ugc_listed"],
                "document_types": ["research_paper", "journal_certificate", "ugc_verification"],
                "validation_rules": {
                    "ugc_listed": "journal must be in UGC approved list",
                    "authors": "at least one author must be from institution"
                }
            },
            "3.4.1": {
                "name": "Extension activities are carried out in the neighborhood community, sensitizing students to social issues, for their holistic development",
                "required_fields": ["activity_title", "location", "participants", "duration", "impact"],
                "document_types": ["activity_report", "photos", "beneficiary_feedback"],
                "validation_rules": {
                    "location": "must be in neighboring community",
                    "participants": "must include students"
                }
            }
        }

    def validate_criteria_document(self, criteria_code: str, expected_data: Dict[str, Any], 
                                  extracted_text: str) -> Dict[str, Any]:
        """
        Validate document for specific NAAC criteria
        
        Args:
            criteria_code: NAAC criteria code (e.g., "3.1.1")
            expected_data: Expected data from Excel template
            extracted_text: Text extracted from document
        """
        
        if criteria_code not in self.criteria_requirements:
            return {
                "is_valid": False,
                "decision": "REJECT",
                "confidence_score": 0.0,
                "error": f"Unknown criteria code: {criteria_code}",
                "supported_criteria": list(self.criteria_requirements.keys())
            }
        
        criteria_info = self.criteria_requirements[criteria_code]
        
        # Perform content validation with criteria-specific context
        result = self.content_validator.validate_criteria_specific(
            criteria_code, expected_data, extracted_text
        )
        
        # Add criteria-specific validation
        criteria_validation = self._validate_criteria_requirements(
            criteria_code, expected_data, extracted_text, criteria_info
        )
        
        # Merge results
        result.update({
            "criteria_code": criteria_code,
            "criteria_name": criteria_info["name"],
            "criteria_validation": criteria_validation,
            "required_fields_check": self._check_required_fields(
                expected_data, criteria_info["required_fields"]
            )
        })
        
        # Adjust confidence based on criteria-specific validation
        if not criteria_validation["meets_requirements"]:
            result["confidence_score"] *= 0.7  # Reduce confidence
            result["decision"] = "FLAG_FOR_REVIEW" if result["decision"] == "ACCEPT" else result["decision"]
        
        return result

    def _validate_criteria_requirements(self, criteria_code: str, expected_data: Dict[str, Any], 
                                      extracted_text: str, criteria_info: Dict[str, Any]) -> Dict[str, Any]:
        """Validate criteria-specific requirements"""
        
        validation_result = {
            "meets_requirements": True,
            "requirement_checks": {},
            "warnings": [],
            "errors": []
        }
        
        validation_rules = criteria_info.get("validation_rules", {})
        
        # Apply criteria-specific validation rules
        for field, rule in validation_rules.items():
            check_result = self._apply_validation_rule(field, rule, expected_data, extracted_text)
            validation_result["requirement_checks"][field] = check_result
            
            if not check_result["passed"]:
                validation_result["meets_requirements"] = False
                if check_result["severity"] == "error":
                    validation_result["errors"].append(check_result["message"])
                else:
                    validation_result["warnings"].append(check_result["message"])
        
        return validation_result

    def _apply_validation_rule(self, field: str, rule: str, expected_data: Dict[str, Any], 
                              extracted_text: str) -> Dict[str, Any]:
        """Apply specific validation rule"""
        
        result = {
            "passed": True,
            "message": f"{field} validation passed",
            "severity": "info"
        }
        
        field_value = expected_data.get(field)
        
        try:
            if "within last 5 years" in rule and field in ["joining_date", "sanction_year"]:
                from datetime import datetime
                current_year = datetime.now().year
                
                if isinstance(field_value, (int, float)):
                    year = int(field_value)
                elif isinstance(field_value, str) and field_value.isdigit():
                    year = int(field_value)
                else:
                    # Try to extract year from text
                    import re
                    year_match = re.search(r'\b(20\d{2})\b', str(field_value))
                    year = int(year_match.group(1)) if year_match else None
                
                if year and (current_year - year > 5):
                    result.update({
                        "passed": False,
                        "message": f"{field} ({year}) is older than 5 years",
                        "severity": "error"
                    })
            
            elif "must be > 0" in rule and field in ["sanctioned_amount", "participants_count"]:
                if isinstance(field_value, str):
                    # Extract numeric value
                    import re
                    numbers = re.findall(r'[\d,]+', field_value.replace(',', ''))
                    amount = float(numbers[0]) if numbers else 0
                else:
                    amount = float(field_value) if field_value else 0
                
                if amount <= 0:
                    result.update({
                        "passed": False,
                        "message": f"{field} must be greater than 0, found: {amount}",
                        "severity": "error"
                    })
            
            elif "teaching position" in rule and field == "designation":
                teaching_keywords = ["professor", "assistant", "associate", "lecturer", "faculty", "teacher"]
                if not any(keyword in str(field_value).lower() for keyword in teaching_keywords):
                    result.update({
                        "passed": False,
                        "message": f"Designation '{field_value}' may not be a teaching position",
                        "severity": "warning"
                    })
            
            elif "UGC approved" in rule and field == "ugc_listed":
                if not field_value or str(field_value).lower() in ["no", "false", "0"]:
                    result.update({
                        "passed": False,
                        "message": "Journal is not in UGC approved list",
                        "severity": "error"
                    })
            
        except Exception as e:
            result.update({
                "passed": False,
                "message": f"Validation error for {field}: {str(e)}",
                "severity": "warning"
            })
        
        return result

    def _check_required_fields(self, data: Dict[str, Any], required_fields: List[str]) -> Dict[str, Any]:
        """Check if all required fields are present"""
        
        missing_fields = []
        present_fields = []
        
        for field in required_fields:
            if field in data and data[field] and str(data[field]).strip():
                present_fields.append(field)
            else:
                missing_fields.append(field)
        
        return {
            "all_present": len(missing_fields) == 0,
            "missing_fields": missing_fields,
            "present_fields": present_fields,
            "completion_percentage": len(present_fields) / len(required_fields) * 100
        }

    def get_criteria_info(self, criteria_code: str = None) -> Dict[str, Any]:
        """Get information about supported criteria"""
        
        if criteria_code:
            return self.criteria_requirements.get(criteria_code, {"error": "Criteria not found"})
        
        return {
            "supported_criteria": list(self.criteria_requirements.keys()),
            "total_criteria": len(self.criteria_requirements),
            "criteria_details": self.criteria_requirements
        }

    def list_supported_criteria(self) -> List[Dict[str, str]]:
        """List all supported NAAC criteria"""
        
        return [
            {
                "code": code,
                "name": info["name"],
                "required_fields": len(info["required_fields"]),
                "document_types": ", ".join(info["document_types"])
            }
            for code, info in self.criteria_requirements.items()
        ]