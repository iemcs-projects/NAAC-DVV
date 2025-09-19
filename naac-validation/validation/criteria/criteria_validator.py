"""
NAAC Criteria-specific validation rules and logic with database model integration
"""
from typing import Dict, Any, List, Optional
from validation.content_validator import NAACContentValidator

class CriteriaValidator:
    """Validates documents against specific NAAC criteria requirements and database models"""
    
    def __init__(self):
        self.content_validator = NAACContentValidator()
        
        # Define criteria-specific requirements with database model mappings and AI instructions
        self.criteria_requirements = {
            "2.1.1": {
                "name": "Number of teaching staff joined the institution during the last five years",
                "database_model": "response_2_1_1",
                "model_fields": ["programme_name", "programme_code", "no_of_seats", "no_of_students", "year", "session"],
                "required_fields": ["programme_name", "year", "no_of_students"],
                "document_types": ["enrollment_data", "programme_details"],
                "ai_validation_instructions": """
                You are validating a document against NAAC criteria 2.1.1 (Student enrollment data).
                Compare the extracted text with the database entry and assign a confidence score (0.0-1.0).
                
                KEY VALIDATION POINTS:
                1. Programme Name Matching: Check if programme names in document match database entries
                2. Year Validation: Ensure year mentioned is within the assessment period
                3. Student Numbers: Verify student enrollment numbers are consistent
                4. Data Completeness: Check if all required fields have corresponding information
                
                CONFIDENCE SCORING GUIDE:
                - 0.9-1.0: Perfect match, all data points align with high accuracy
                - 0.7-0.8: Good match, minor discrepancies or formatting differences
                - 0.5-0.6: Partial match, some data points match but concerns exist
                - 0.3-0.4: Poor match, significant discrepancies found
                - 0.0-0.2: No meaningful match, document doesn't support the data
                
                Focus on: Programme identification, enrollment numbers accuracy, year consistency
                """,
                "validation_rules": {
                    "year": "must be within assessment period (last 5 years)",
                    "no_of_students": "must be > 0 and realistic for programme capacity"
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
                "database_model": "response_3_1_1", 
                "model_fields": ["name_of_principal_investigator", "department_of_principal_investigator", "duration_of_project", "type", "name_of_project", "year_of_award", "amount_sanctioned", "name_of_funding_agency"],
                "required_fields": ["name_of_project", "name_of_principal_investigator", "name_of_funding_agency", "amount_sanctioned", "year_of_award"],
                "document_types": ["sanction_letter", "grant_certificate", "approval_letter"],
                "ai_validation_instructions": """
                You are validating a document for NAAC criteria 3.1.1 (Research grants).
                Compare the extracted document text with the database entry for research grant details.
                
                KEY VALIDATION POINTS:
                1. Principal Investigator: Verify PI name and department match between document and database
                2. Project Details: Check project title/name consistency 
                3. Funding Agency: Confirm funding agency name matches
                4. Amount Verification: Cross-check sanctioned amount (consider formatting variations)
                5. Timeline: Verify project duration and award year
                6. Grant Type: Confirm if Government/Non-Government classification is correct
                
                CONFIDENCE SCORING GUIDE:
                - 0.9-1.0: All critical details match perfectly (PI, project, amount, agency)
                - 0.7-0.8: Core details match with minor variations in formatting/spelling
                - 0.5-0.6: Key information matches but some fields have discrepancies
                - 0.3-0.4: Partial match, significant issues with amount/PI/agency details
                - 0.0-0.2: Document doesn't support the claimed grant details
                
                Focus on: PI verification, funding agency confirmation, amount accuracy, project identification
                """,
                "validation_rules": {
                    "amount_sanctioned": "must be > 0 and match document amount",
                    "year_of_award": "must be within assessment period",
                    "name_of_principal_investigator": "must be faculty of institution",
                    "type": "must be 'Government' or 'Non Government'"
                }
            },
            "3.2.1": {
                "name": "Institution has created an ecosystem for innovations and has initiatives for creation and transfer of knowledge",
                "database_model": "response_3_2_1",
                "model_fields": ["paper_title", "author_names", "department", "journal_name", "year_of_publication", "issn_number"],
                "required_fields": ["paper_title", "author_names", "journal_name", "year_of_publication"],
                "document_types": ["research_paper", "publication_certificate", "journal_publication"],
                "ai_validation_instructions": """
                You are validating a document for NAAC criteria 3.2.1 (Innovation and knowledge transfer).
                Compare the extracted document text with database entry for research publications/innovations.
                
                KEY VALIDATION POINTS:
                1. Publication Title: Verify paper/innovation title matches database entry
                2. Author Verification: Check if author names match (consider name variations)
                3. Journal Validation: Confirm journal name and authenticity
                4. Publication Year: Verify year of publication is within assessment period
                5. ISSN Verification: Cross-check ISSN number if available in document
                6. Institutional Affiliation: Ensure authors are affiliated with the institution
                
                CONFIDENCE SCORING GUIDE:
                - 0.9-1.0: Perfect match - title, authors, journal, year all align
                - 0.7-0.8: Strong match with minor spelling/formatting differences
                - 0.5-0.6: Core information matches but some discrepancies exist
                - 0.3-0.4: Partial match, concerns about authenticity or accuracy
                - 0.0-0.2: Document doesn't support the publication claim
                
                Focus on: Title accuracy, author verification, journal authenticity, publication year
                """,
                "validation_rules": {
                    "year_of_publication": "must be within assessment period",
                    "author_names": "at least one author must be from institution",
                    "journal_name": "must be authentic and verifiable"
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

    def validate_criteria_document(self, criteria_code: str, database_record: Dict[str, Any], 
                                  extracted_text: str) -> Dict[str, Any]:
        """
        Validate document for specific NAAC criteria against database record
        
        Args:
            criteria_code: NAAC criteria code (e.g., "3.1.1")
            database_record: Database record data to validate against
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
        
        # Perform content validation with criteria-specific context and AI instructions
        ai_instructions = criteria_info.get("ai_validation_instructions", "")
        result = self.content_validator.validate_with_database_record(
            criteria_code, database_record, extracted_text, ai_instructions
        )
        
        # Add criteria-specific validation
        criteria_validation = self._validate_criteria_requirements(
            criteria_code, database_record, extracted_text, criteria_info
        )
        
        # Merge results
        result.update({
            "criteria_code": criteria_code,
            "criteria_name": criteria_info["name"],
            "database_model": criteria_info.get("database_model", ""),
            "criteria_validation": criteria_validation,
            "required_fields_check": self._check_required_fields(
                database_record, criteria_info["required_fields"]
            )
        })
        
        # Adjust confidence based on criteria-specific validation
        if not criteria_validation["meets_requirements"]:
            result["confidence_score"] *= 0.7  # Reduce confidence
            result["decision"] = "FLAG_FOR_REVIEW" if result["decision"] == "ACCEPT" else result["decision"]
        
        return result

    def _validate_criteria_requirements(self, criteria_code: str, database_record: Dict[str, Any], 
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
            check_result = self._apply_validation_rule(field, rule, database_record, extracted_text)
            validation_result["requirement_checks"][field] = check_result
            
            if not check_result["passed"]:
                validation_result["meets_requirements"] = False
                if check_result["severity"] == "error":
                    validation_result["errors"].append(check_result["message"])
                else:
                    validation_result["warnings"].append(check_result["message"])
        
        return validation_result

    def _apply_validation_rule(self, field: str, rule: str, database_record: Dict[str, Any], 
                              extracted_text: str) -> Dict[str, Any]:
        """Apply specific validation rule"""
        
        result = {
            "passed": True,
            "message": f"{field} validation passed",
            "severity": "info"
        }
        
        field_value = database_record.get(field)
        
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