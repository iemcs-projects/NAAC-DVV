class DocumentValidator:
    def __init__(self, criteria_code):
        self.criteria_code = criteria_code
    
    def validate_page_fields(self, extracted_fields, database_record, page_number):
        """Validate extracted fields against database record"""
        print(f"=== VALIDATION DEBUG ===")
        print(f"Page: {page_number}, Criteria: {self.criteria_code}")
        print(f"Extracted fields count: {len(extracted_fields)}")
        print(f"Database record keys: {list(database_record.keys()) if database_record else 'None'}")
        
        validation_result = {
            "page_number": page_number,
            "is_valid": True,
            "errors": [],
            "matched_fields": {},
            "confidence_score": 0.0
        }
        
        # Check if any fields were extracted (validates criteria is supported)
        if len(extracted_fields) == 0:
            validation_result["is_valid"] = False
            validation_result["errors"].append(f"No fields extracted - criteria {self.criteria_code} may not be supported or document content doesn't match expected format")
            validation_result["confidence_score"] = 0.0
            return validation_result
        
        # Compare each field
        total_fields = len(extracted_fields)
        matched_count = 0
        
        for field, extracted_value in extracted_fields.items():
            db_value = database_record.get(field, "")
            print(f"Validating field: {field}, Extracted: {extracted_value}, DB: {db_value}")
            if self._fields_match(extracted_value, db_value):
                validation_result["matched_fields"][field] = True
                matched_count += 1
            else:
                validation_result["matched_fields"][field] = False
                validation_result["errors"].append(f"Mismatch in {field}")
        
        # Calculate confidence
        if total_fields > 0:
            validation_result["confidence_score"] = matched_count / total_fields
            # Strict validation: require 100% match (1.0) for PASS
            validation_result["is_valid"] = validation_result["confidence_score"] >= 1.0
        
        return validation_result
    
    def _fields_match(self, extracted, database):
        """Check if extracted field matches database field with normalization"""
        if not extracted or not database:
            return False
        
        # Normalize both values
        ext_clean = self._normalize_text(str(extracted))
        db_clean = self._normalize_text(str(database))
        
        return ext_clean == db_clean
    
    def _normalize_text(self, text):
        """Normalize text for comparison - handles names, projects, etc."""
        import re
        
        # Basic cleanup
        normalized = text.lower().strip()
        
        # Remove quotes and special characters
        normalized = re.sub(r'["\'""]', '', normalized)
        
        # Normalize spaces around punctuation (Dr. vs Dr.)
        normalized = re.sub(r'\s*\.\s*', '.', normalized)  # "Dr. " → "dr."
        normalized = re.sub(r'\s*,\s*', ', ', normalized)  # Handle commas consistently
        
        # Collapse multiple spaces to single space
        normalized = re.sub(r'\s+', ' ', normalized)
        
        # Remove common prefixes/suffixes that might vary
        normalized = re.sub(r'\b(dr|prof|mr|ms|mrs)\.?\s*', r'\1.', normalized)  # Standardize titles
        
        # Handle department/organization variations
        normalized = re.sub(r'\bdept\.?\s+', 'department ', normalized)
        normalized = re.sub(r'\buniv\.?\s+', 'university ', normalized)
        
        return normalized.strip()