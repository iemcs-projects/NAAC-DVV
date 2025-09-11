#!/usr/bin/env python3
"""
NAAC Validation System - Main Entry Point (No System OCR Dependencies)

This script demonstrates usage of the NAAC validation system
with pluggable OCR backends (text-only, EasyOCR, PaddleOCR, or Cloud OCR).
"""

import sys
import json
import logging
from pathlib import Path
from typing import Dict, Any

# Add project root to path
sys.path.append(str(Path(__file__).parent))

from config.settings import settings
from validators.file_validator import FileValidator
from utils.file_utils import FileProcessor
from utils.ocr_utils_no_tesseract import OCRProcessor   # ⬅️ Uses your pluggable OCR class
from utils.llm_utils import LLMValidator

# Setup logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(settings.LOG_FILE),
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)


class NaacValidationSystem:
    """Main NAAC validation system"""

    def __init__(self, ocr_method: str = "text_only"):
        self.file_validator = FileValidator()
        self.file_processor = FileProcessor()

        # Initialize OCR with method (text_only, easyocr, paddleocr, cloud)
        self.ocr_processor = OCRProcessor(ocr_method=ocr_method)

        # Initialize LLM validator only if API key is available
        try:
            self.llm_validator = LLMValidator()
            self.llm_available = True
        except ValueError as e:
            logger.warning(f"LLM validator not available: {str(e)}")
            self.llm_validator = None
            self.llm_available = False

    def validate_single_submission(
        self, data_row: Dict[str, Any], supporting_file_path: str, criteria: str = "3.1.1"
    ) -> Dict[str, Any]:
        """
        Validate a single submission (data row + supporting file)
        """
        logger.info(f"Validating submission for criteria {criteria}")

        result = {
            "criteria": criteria,
            "submission_data": data_row,
            "file_path": supporting_file_path,
            "validations": {},
            "overall_decision": "REJECT",
            "confidence_score": 0.0,
            "errors": [],
            "warnings": [],
        }

        try:
            # Step 1: File validation
            file_result = self.file_validator.validate(supporting_file_path, "sanction_letter")
            result["validations"]["file_validation"] = file_result.to_dict()

            if not file_result.is_valid:
                result["errors"].extend(file_result.errors)
                return result

            # Step 2: Extract text
            text_result = self._extract_text_from_file(supporting_file_path)
            result["validations"]["text_extraction"] = text_result

            if text_result.get("error"):
                result["errors"].append(f"Text extraction failed: {text_result['error']}")
                return result

            # Step 3: AI validation
            if self.llm_available and text_result.get("text"):
                llm_result = self.llm_validator.validate_document_content(
                    data_row=data_row,
                    extracted_text=text_result["text"],
                    document_type="sanction_letter",
                )
                result["validations"]["ai_validation"] = llm_result
                result["confidence_score"] = llm_result.get("confidence_score", 0.0)
                result["overall_decision"] = llm_result.get("decision", "REJECT")
            else:
                result["warnings"].append("AI validation not available - basic validation only")
                result["overall_decision"] = "FLAG_FOR_REVIEW"

            # Step 4: Criteria-specific checks
            criteria_result = self._validate_criteria_specific(data_row, criteria)
            result["validations"]["criteria_validation"] = criteria_result

            if criteria_result.get("errors"):
                result["errors"].extend(criteria_result["errors"])

            logger.info(
                f"Validation completed - Decision: {result['overall_decision']}, "
                f"Confidence: {result['confidence_score']:.2f}"
            )

        except Exception as e:
            result["errors"].append(f"Unexpected error: {str(e)}")
            logger.error(str(e))

        return result

    def _extract_text_from_file(self, file_path: str) -> Dict[str, Any]:
        """
        Extract text using file processor (text PDF) or fallback to OCRProcessor
        """
        file_path = Path(file_path)

        try:
            if file_path.suffix.lower() == ".pdf":
                # Try text extraction first
                text = self.file_processor.extract_pdf_text(file_path)

                if text and len(text.split()) > 20:  # Meaningful text found
                    return {"text": text, "method": "pdf_text_extraction"}
                else:
                    logger.info("Minimal text found, trying OCR backend")
                    return self.ocr_processor.extract_text_from_pdf(file_path)

            elif file_path.suffix.lower() in [".xlsx", ".xls"]:
                df = self.file_processor.read_excel_file(file_path)
                return {"text": df.to_string(), "method": "excel_to_text"}

            else:
                return {"error": f"Unsupported file type: {file_path.suffix}"}

        except Exception as e:
            return {"error": str(e)}

    def _validate_criteria_specific(self, data_row: Dict[str, Any], criteria: str) -> Dict[str, Any]:
        """Criteria-specific rules"""
        result = {"errors": [], "checks": []}

        try:
            if criteria == "3.1.1":
                # Grant validation
                amount = float(data_row.get("amount", 0))
                year = int(data_row.get("year", 0))
                if amount <= 0:
                    result["errors"].append(f"Invalid amount: {amount}")
                else:
                    result["checks"].append(f"Valid amount: {amount}")

                current_year = 2024
                if not (current_year - 5 <= year <= current_year):
                    result["errors"].append(f"Year {year} outside range")
                else:
                    result["checks"].append(f"Valid year: {year}")

            elif criteria == "3.1.2":
                dept = data_row.get("department_name", "")
                if not dept.strip():
                    result["errors"].append("Missing department name")
                else:
                    result["checks"].append(f"Valid department: {dept}")

        except Exception as e:
            result["errors"].append(f"Criteria validation error: {str(e)}")

        return result

    def get_system_status(self) -> Dict[str, Any]:
        """System status info"""
        return {
            "system_status": "operational",
            "components": {
                "file_validator": "available",
                "file_processor": "available",
                "ocr_processor": self.ocr_processor.ocr_method,
                "llm_validator": "available" if self.llm_available else "not_configured",
            },
            "configuration": {
                "allowed_file_types": settings.ALLOWED_FILE_TYPES,
                "max_file_size_mb": settings.MAX_FILE_SIZE_MB,
            },
        }


def main():
    """CLI entrypoint"""
    print("🚀 NAAC Validation System (No OCR Dependencies)")
    print("=" * 60)

    # Config validation
    config_errors = settings.validate_setup()
    if config_errors:
        print("❌ Config errors found:")
        for e in config_errors:
            print("  -", e)
        return

    # Initialize system (text-only mode by default)
    system = NaacValidationSystem(ocr_method="text_only")

    # Show status
    status = system.get_system_status()
    print("\n📋 System Status:")
    for comp, state in status["components"].items():
        print(f"  - {comp}: {state}")

    # Example run
    sample_data = {
        "project_name": "AI Research Project",
        "pi_name": "Dr. John Doe",
        "amount": 500000,
        "year": 2023,
        "funding_agency": "DST",
        "department_name": "Computer Science",
    }
    print("\n📊 Sample Data:", json.dumps(sample_data, indent=2))
    print("\n✅ System ready to validate submissions!")


if __name__ == "__main__":
    main()
