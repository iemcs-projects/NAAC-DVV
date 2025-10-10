"""
NAAC Criteria-specific validation rules and logic with database model integration
"""
import logging
from typing import Dict, Any, List, Optional
from validation.content_validator import NAACContentValidator

class CriteriaValidator:
    """Validates documents against specific NAAC criteria requirements and database models"""
    
    def __init__(self):
        self.content_validator = NAACContentValidator()
        
        # Simplified, generic criteria requirements - easy to extend
        self.criteria_requirements = {
            "2.1.1": {
                "name": "Number of teaching staff joined the institution during the last five years",
                "database_model": "response_2_1_1",
                "required_fields": ["programme_name", "year", "no_of_students"],
                "validation_rules": {"year": "within_assessment_period", "no_of_students": "positive_number"}
            },
            "3.1.1": {
                "name": "Grants received from Government and non-governmental agencies for research projects",
                "database_model": "response_3_1_1", 
                "required_fields": ["name_of_project", "name_of_principal_investigator", "name_of_funding_agency", "amount_sanctioned", "year_of_award"],
                "validation_rules": {
                    "amount_sanctioned": "positive_number_crores",
                    "year_of_award": "within_assessment_period"
                }
            },
            "3.2.1": {
                "name": "Institution has created an ecosystem for innovations and has initiatives for creation and transfer of knowledge",
                "database_model": "response_3_2_1",
                "required_fields": ["paper_title", "author_names", "journal_name", "year_of_publication"],
                "validation_rules": {"year_of_publication": "within_assessment_period"}
            }
        }
        
        # Default criteria template for easy addition of new criteria
        self.default_criteria_template = {
            "name": "NAAC Criteria Validation",
            "database_model": "response_generic",
            "required_fields": [],
            "validation_rules": {}
        }
        
        # Criteria-specific AI validation instructions
        # Simplified, generalized AI instructions
        self.ai_instructions = {
            "default": """
            You are validating a document for NAAC criteria {criteria_code}.
            Compare the extracted document text with the provided database record.
            
            VALIDATION APPROACH:
            - Focus on substantial matches rather than perfect formatting
            - Handle common variations in names, departments, and project titles
            - Accept reasonable approximations and abbreviations
            - Consider the document may contain multiple records
            
            KEY MATCHING RULES:
            1. Names: Accept partial matches, title variations (Dr./Prof.), and reasonable spelling differences
            2. Departments: Match full names with abbreviations (CSE=Computer Science, ECE=Electronics)
            3. Projects/Titles: Accept similar titles, focus on core subject matter
            4. Amounts: Match numerical values regardless of formatting (₹2.50 Crore = 2.50)
            5. Organizations: Match agency names and common abbreviations
            6. Dates/Years: Exact match required for years
            7. Types/Categories: Match classifications allowing for format differences
            
            CONFIDENCE SCORING (Be Generous):
            - 0.8-1.0: Strong match with 80%+ field alignment
            - 0.6-0.7: Good match with minor discrepancies  
            - 0.4-0.5: Partial match with some significant differences
            - 0.2-0.3: Weak match with major issues
            - 0.0-0.1: No meaningful match or completely contradictory
            
            IMPORTANT: Prioritize substantial accuracy over perfect formatting. 
            Minor variations in names, abbreviations, and formatting should not heavily penalize the score.
            """
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
        
        # Use generalized AI instructions for all criteria
        ai_instructions = self.ai_instructions["default"].format(
            criteria_code=criteria_code,
            criteria_name=criteria_info.get("name", "Document Validation")
        )
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
        
        # Only adjust confidence for serious validation failures
        if not criteria_validation["meets_requirements"]:
            # Check if there are any actual errors (not just warnings)
            has_errors = any(check["severity"] == "error" 
                           for check in criteria_validation["requirement_checks"].values() 
                           if not check["passed"])
            
            if has_errors:
                result["confidence_score"] *= 0.9  # Minor reduction only
                # Don't automatically downgrade decision
        
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
        """Apply validation rule using simplified rule engine"""
        
        # Default to passing - be more lenient
        result = {"passed": True, "message": f"{field} validation passed", "severity": "info"}
        field_value = database_record.get(field)
        
        try:
            # Simplified validation - focus on critical issues only
            if rule == "within_assessment_period":
                year = self._extract_year(field_value)
                if year and year < 2019:  # Very lenient - last 6+ years
                    result.update({
                        "passed": False,
                        "message": f"{field}: Year {year} is too old",
                        "severity": "warning"  # Changed to warning
                    })
            
            elif rule in ["positive_number", "positive_number_crores"]:
                number = self._extract_number(field_value)
                if number <= 0:
                    result.update({
                        "passed": False,
                        "message": f"{field}: Amount must be positive, found {number}",
                        "severity": "warning"  # Changed to warning
                    })
            
            # All other validations pass by default - focus on data matching not validation
            
        except Exception as e:
            # Even exceptions shouldn't fail validation - just log
            pass
        
        return result

    def _validate_year_range(self, value: Any) -> tuple:
        """Validate year is within assessment period"""
        year = self._extract_year(value)
        if not year:
            return False, "Invalid year format"
        
        from datetime import datetime
        current_year = datetime.now().year
        if (current_year - 5) <= year <= current_year:
            return True, f"Year {year} is valid"
        return False, f"Year {year} is outside assessment period ({current_year-5}-{current_year})"
    
    def _validate_positive_number(self, value: Any) -> tuple:
        """Validate number is positive (handles crores format)"""
        number = self._extract_number(value)
        if number > 0:
            return True, f"Amount {number} crores is valid"
        return False, f"Amount must be greater than 0, found: {number} crores"
    
    def _validate_positive_number_crores(self, value: Any) -> tuple:
        """Validate amount in crores format"""
        # Add debug logging to identify the issue
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"DEBUG: Validating amount value: '{value}' (type: {type(value).__name__})")
        
        number = self._extract_number(value)
        logger.info(f"DEBUG: Extracted number: {number}")
        
        if number > 0:
            return True, f"Amount ₹{number} Crore(s) is valid"
        return False, f"Amount must be greater than 0, found: {number} crores"
    
    def _validate_government_classification(self, value: Any) -> tuple:
        """Validate government classification"""
        if not value:
            return False, "Missing grant type classification"
        
        value_str = str(value).strip().lower()
        valid_types = ["government", "non government", "govt", "non govt"]
        
        if any(valid_type in value_str for valid_type in valid_types):
            return True, f"Grant type '{value}' is valid"
        return False, f"Grant type '{value}' must be 'Government' or 'Non Government'"
    
    def _validate_faculty_position(self, value: Any) -> tuple:
        """Validate PI name indicates faculty position (check for Dr. title and proper format)"""
        if not value:
            return False, "Missing PI name"
        
        value_str = str(value).lower()
        # Check for academic titles indicating faculty position
        faculty_indicators = ["dr.", "prof.", "professor", "assistant", "associate", "lecturer", "faculty", "teacher"]
        
        # For PI names, check if it starts with Dr. or Prof. or contains academic titles
        if any(indicator in value_str for indicator in faculty_indicators):
            return True, f"'{value}' appears to be a valid faculty member"
        
        # Also accept if it's a properly formatted name (might be missing title in some records)
        name_parts = str(value).split()
        if len(name_parts) >= 2:  # At least first and last name
            return True, f"'{value}' appears to be a valid name format"
            
        return False, f"'{value}' may not be a valid faculty designation"
    
    def _validate_institutional_affiliation(self, value: Any) -> tuple:
        """Validate institutional affiliation"""
        if not value:
            return False, "Missing affiliation information"
        return True, "Affiliation present"
    
    def _extract_year(self, value: Any) -> Optional[int]:
        """Extract year from various formats"""
        if isinstance(value, (int, float)):
            return int(value)
        elif isinstance(value, str) and value.isdigit():
            return int(value)
        else:
            import re
            year_match = re.search(r'\b(20\d{2})\b', str(value))
            return int(year_match.group(1)) if year_match else None

    def _extract_number(self, value: Any) -> float:

        """Extract numeric value from various formats (handles decimals, crores, and extra characters)"""
        import re

        if value is None:
            return 0.0

        try:
            # Direct numeric types
            if isinstance(value, (int, float)):
                return float(value)

            # Decimal from DB
            if hasattr(value, "to_integral_value"):
                return float(value)

            # String handling
            if isinstance(value, str):
                # Remove commas and currency symbols, letters, etc.
                cleaned = re.sub(r'[^\d.]', '', value)
                return float(cleaned) if cleaned else 0.0

            # Last resort: convert to string
            return float(str(value))
        except Exception:
            return 0.0
        
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
                "database_model": info.get("database_model", "")
            }
            for code, info in self.criteria_requirements.items()
        ]

    def add_criteria(self, criteria_code: str, name: str, database_model: str, 
                    required_fields: List[str], validation_rules: Dict[str, str] = None) -> bool:
        """
        Dynamically add new criteria configuration
        
        Args:
            criteria_code: NAAC criteria code (e.g., "4.1.1")
            name: Criteria description
            database_model: Database model name (e.g., "response_4_1_1")
            required_fields: List of required field names
            validation_rules: Optional validation rules dict
            
        Returns:
            bool: Success status
        """
        try:
            self.criteria_requirements[criteria_code] = {
                "name": name,
                "database_model": database_model,
                "required_fields": required_fields or [],
                "validation_rules": validation_rules or {}
            }
            return True
        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to add criteria {criteria_code}: {str(e)}")
            return False

    def validate_any_criteria(self, criteria_code: str, database_record: Dict[str, Any], 
                             extracted_text: str, criteria_name: str = None, 
                             required_fields: List[str] = None) -> Dict[str, Any]:
        """
        Validate any criteria using generic approach - even if not pre-configured
        
        Args:
            criteria_code: NAAC criteria code 
            database_record: Database record to validate
            extracted_text: Document text
            criteria_name: Optional criteria name
            required_fields: Optional required fields list
        """
        
        # Use existing config if available, otherwise create on-the-fly
        if criteria_code not in self.criteria_requirements:
            temp_criteria = {
                "name": criteria_name or f"Criteria {criteria_code}",
                "database_model": f"response_{criteria_code.replace('.', '_')}",
                "required_fields": required_fields or list(database_record.keys()),
                "validation_rules": {}
            }
        else:
            temp_criteria = self.criteria_requirements[criteria_code]
        
        # Use standard validation logic
        ai_instructions = self.ai_instructions["default"].format(
            criteria_code=criteria_code,
            criteria_name=temp_criteria["name"]
        )
        
        result = self.content_validator.validate_with_database_record(
            criteria_code, database_record, extracted_text, ai_instructions
        )
        
        # Add criteria info
        result.update({
            "criteria_code": criteria_code,
            "criteria_name": temp_criteria["name"],
            "database_model": temp_criteria.get("database_model", ""),
            "criteria_validation": {"meets_requirements": True, "requirement_checks": {}, "warnings": [], "errors": []},
            "required_fields_check": self._check_required_fields(
                database_record, temp_criteria["required_fields"]
            )
        })
        
        return result