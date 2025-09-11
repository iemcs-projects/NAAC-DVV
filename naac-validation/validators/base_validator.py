from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from pathlib import Path
import logging
from datetime import datetime

from config.settings import settings

# Set up logging
logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL))
logger = logging.getLogger(__name__)

class ValidationResult:
    """Standard validation result format"""
    
    def __init__(self, 
                 is_valid: bool = True, 
                 errors: List[str] = None, 
                 warnings: List[str] = None,
                 confidence_score: float = 1.0,
                 extracted_data: Dict[str, Any] = None):
        self.is_valid = is_valid
        self.errors = errors or []
        self.warnings = warnings or []
        self.confidence_score = confidence_score
        self.extracted_data = extracted_data or {}
        self.timestamp = datetime.now()
        self.decision = self._make_decision()
    
    def _make_decision(self) -> str:
        """Make decision based on validation and confidence score"""
        if not self.is_valid:
            return "REJECT"
        elif self.confidence_score >= settings.CONFIDENCE_ACCEPT_THRESHOLD:
            return "ACCEPT"
        elif self.confidence_score >= settings.CONFIDENCE_FLAG_THRESHOLD:
            return "FLAG_FOR_REVIEW"
        else:
            return "REJECT"
    
    def add_error(self, error: str):
        """Add an error to the result"""
        self.errors.append(error)
        self.is_valid = False
    
    def add_warning(self, warning: str):
        """Add a warning to the result"""
        self.warnings.append(warning)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert result to dictionary"""
        return {
            "is_valid": self.is_valid,
            "decision": self.decision,
            "confidence_score": self.confidence_score,
            "errors": self.errors,
            "warnings": self.warnings,
            "extracted_data": self.extracted_data,
            "timestamp": self.timestamp.isoformat()
        }

class BaseValidator(ABC):
    """Base class for all validators"""
    
    def __init__(self):
        self.validation_rules = settings.load_validation_rules()
        self.logger = logger
    
    @abstractmethod
    def validate(self, *args, **kwargs) -> ValidationResult:
        """Main validation method to be implemented by subclasses"""
        pass
    
    def _log_validation(self, validator_name: str, result: ValidationResult, **kwargs):
        """Log validation results"""
        log_data = {
            "validator": validator_name,
            "decision": result.decision,
            "confidence": result.confidence_score,
            "errors_count": len(result.errors),
            "warnings_count": len(result.warnings),
            **kwargs
        }
        
        if result.is_valid:
            self.logger.info(f"Validation passed: {log_data}")
        else:
            self.logger.warning(f"Validation failed: {log_data}")
    
    def _validate_required_fields(self, data: Dict[str, Any], required_fields: List[str]) -> List[str]:
        """Check if all required fields are present and not empty"""
        missing_fields = []
        for field in required_fields:
            if field not in data or not data[field] or str(data[field]).strip() == '':
                missing_fields.append(field)
        return missing_fields
    
    def _validate_year_range(self, year: int, max_years_back: int = 5) -> bool:
        """Validate if year is within acceptable range"""
        current_year = datetime.now().year
        return (current_year - max_years_back) <= year <= current_year
    
    def _validate_amount(self, amount: float, min_amount: float = 0, max_amount: float = float('inf')) -> bool:
        """Validate if amount is within acceptable range"""
        return min_amount <= amount <= max_amount
    
    def _normalize_text(self, text: str) -> str:
        """Normalize text for comparison"""
        if not text:
            return ""
        return str(text).lower().strip()
    
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two texts (simple implementation)"""
        if not text1 or not text2:
            return 0.0
        
        text1_norm = self._normalize_text(text1)
        text2_norm = self._normalize_text(text2)
        
        # Simple exact match check
        if text1_norm == text2_norm:
            return 1.0
        
        # Simple substring check
        if text1_norm in text2_norm or text2_norm in text1_norm:
            return 0.7
        
        # Simple word overlap check
        words1 = set(text1_norm.split())
        words2 = set(text2_norm.split())
        
        if not words1 or not words2:
            return 0.0
        
        overlap = len(words1.intersection(words2))
        total_unique = len(words1.union(words2))
        
        
        return overlap / total_unique if total_unique > 0 else 0.0