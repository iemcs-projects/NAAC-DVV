#!/usr/bin/env python3
"""
NAAC Validation FastAPI Application
Provides REST API endpoints for file validation and text extraction
"""

import sys
import os
import tempfile
import shutil
from pathlib import Path
from typing import Dict, Any, Optional, List
import logging
import json

from fastapi import FastAPI, File, UploadFile, HTTPException, Form, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add project root to path
sys.path.append(str(Path(__file__).parent))

from config.settings import settings
from validators.file_validator import FileValidator
from utils.file_utils import FileProcessor
from utils.ocr_utils_no_tesseract import FlexibleOCRProcessor

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

# FastAPI app initialization
app = FastAPI(
    title="NAAC Validation System",
    description="File validation and text extraction API for NAAC DVV submissions",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize validators and processors
file_validator = FileValidator()
file_processor = FileProcessor()
ocr_processor = FlexibleOCRProcessor(ocr_method="text_only")


class SubmissionData(BaseModel):
    """Model for submission data"""
    project_name: Optional[str] = None
    pi_name: Optional[str] = None
    amount: Optional[float] = None
    year: Optional[int] = None
    funding_agency: Optional[str] = None
    department_name: Optional[str] = None
    criteria: Optional[str] = "3.1.1"


class ValidationResponse(BaseModel):
    """Response model for validation results"""
    success: bool
    message: str
    data: Dict[str, Any]
    errors: List[str] = []


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "NAAC Validation System API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test system components
        system_status = {
            "file_validator": "available",
            "file_processor": "available", 
            "ocr_processor": ocr_processor.ocr_method,
            "settings": "loaded"
        }
        
        return {
            "status": "healthy",
            "components": system_status,
            "timestamp": str(Path(__file__).stat().st_mtime)
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")


@app.post("/validate-file", response_model=ValidationResponse)
async def validate_file_only(
    file: UploadFile = File(...),
    file_type: str = Form(default="general")
):
    """
    Validate a single file without submission data
    
    Args:
        file: Uploaded file
        file_type: Type of file (sanction_letter, data_template, etc.)
    """
    temp_file_path = None
    
    # Console logging for better debugging
    logger.info(f"📄 File validation request: {file.filename} (type: {file_type})")
    print(f"🔍 [VALIDATE-FILE] Processing: {file.filename} | Type: {file_type} | Size: {file.size if hasattr(file, 'size') else 'unknown'}")
    
    try:
        # Create temporary file
        temp_file_path = _save_uploaded_file(file)
        logger.info(f"💾 Temporary file created: {temp_file_path}")
        
        # Validate file
        validation_result = file_validator.validate(temp_file_path, file_type)
        logger.info(f"✅ File validation completed: {validation_result.is_valid}")
        
        # Extract text if validation passes
        text_result = None
        if validation_result.is_valid:
            logger.info("📝 Extracting text from validated file...")
            text_result = _extract_text_from_file(temp_file_path)
            print(f"📄 [TEXT-EXTRACT] Method: {text_result.get('method', 'unknown')} | Length: {len(text_result.get('text', ''))} chars")
        
        response_data = {
            "file_validation": validation_result.to_dict(),
            "text_extraction": text_result,
            "file_info": {
                "original_name": file.filename,
                "content_type": file.content_type,
                "size_bytes": Path(temp_file_path).stat().st_size if temp_file_path else 0
            }
        }
        
        # Console summary
        status = "✅ PASSED" if validation_result.is_valid else "❌ FAILED"
        print(f"🎯 [VALIDATION-RESULT] {status} | Errors: {len(validation_result.errors)} | File: {file.filename}")
        
        return ValidationResponse(
            success=validation_result.is_valid,
            message="File validation completed",
            data=response_data,
            errors=validation_result.errors
        )
        
    except Exception as e:
        logger.error(f"File validation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")
    
    finally:
        # Clean up temporary file
        if temp_file_path and Path(temp_file_path).exists():
            os.unlink(temp_file_path)


@app.post("/validate-submission", response_model=ValidationResponse)
async def validate_complete_submission(
    file: UploadFile = File(...),
    submission_data: str = Form(...),
    criteria: str = Form(default="3.1.1"),
    file_type: str = Form(default="sanction_letter")
):
    """
    Validate a complete submission (file + data)
    
    Args:
        file: Supporting document file
        submission_data: JSON string with submission data
        criteria: NAAC criteria (e.g., "3.1.1")
        file_type: Type of supporting document
    """
    temp_file_path = None
    
    # Console logging for complete validation
    logger.info(f"🎯 Complete validation request: {file.filename} | Criteria: {criteria}")
    print(f"🔍 [COMPLETE-VALIDATION] File: {file.filename} | Criteria: {criteria} | Type: {file_type}")
    
    try:
        # Parse submission data
        try:
            data_dict = json.loads(submission_data)
            logger.info(f"📋 Parsed submission data: {len(data_dict)} fields")
            print(f"📊 [SUBMISSION-DATA] Fields: {list(data_dict.keys())}")
        except json.JSONDecodeError as e:
            logger.error(f"❌ Invalid JSON in submission data: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Invalid JSON in submission_data: {str(e)}")
        
        # Create temporary file
        temp_file_path = _save_uploaded_file(file)
        logger.info(f"💾 Temporary file created for complete validation")
        
        # Perform complete validation
        validation_result = _validate_complete_submission(
            data_row=data_dict,
            file_path=temp_file_path,
            criteria=criteria,
            file_type=file_type
        )
        
        # Console summary for complete validation
        decision = validation_result["overall_decision"]
        confidence = validation_result.get("confidence_score", 0)
        error_count = len(validation_result.get("errors", []))
        
        decision_emoji = {"ACCEPT": "✅", "FLAG_FOR_REVIEW": "⚠️", "REJECT": "❌"}.get(decision, "❓")
        print(f"🎯 [VALIDATION-COMPLETE] {decision_emoji} {decision} | Confidence: {confidence:.2f} | Errors: {error_count}")
        
        return ValidationResponse(
            success=validation_result["overall_decision"] in ["ACCEPT", "FLAG_FOR_REVIEW"],
            message=f"Validation completed - {validation_result['overall_decision']}",
            data=validation_result,
            errors=validation_result.get("errors", [])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Submission validation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")
    
    finally:
        # Clean up temporary file
        if temp_file_path and Path(temp_file_path).exists():
            os.unlink(temp_file_path)


@app.post("/extract-text")
async def extract_text_only(
    file: UploadFile = File(...)
):
    """
    Extract text from uploaded file (PDF, Excel, etc.)
    """
    temp_file_path = None
    
    # Console logging for text extraction
    logger.info(f"📝 Text extraction request: {file.filename}")
    print(f"📄 [EXTRACT-TEXT] Processing: {file.filename} | Content-Type: {file.content_type}")
    
    try:
        # Create temporary file
        temp_file_path = _save_uploaded_file(file)
        
        # Extract text
        text_result = _extract_text_from_file(temp_file_path)
        
        # Console logging for extraction results
        if text_result.get("error"):
            logger.error(f"❌ Text extraction failed: {text_result['error']}")
            print(f"❌ [EXTRACT-ERROR] {text_result['error']}")
        else:
            text_length = len(text_result.get("text", ""))
            method = text_result.get("method", "unknown")
            logger.info(f"✅ Text extracted: {text_length} characters using {method}")
            print(f"✅ [EXTRACT-SUCCESS] Method: {method} | Length: {text_length} chars")
        
        return {
            "success": not text_result.get("error"),
            "message": "Text extraction completed",
            "data": {
                "extracted_text": text_result.get("text", ""),
                "method": text_result.get("method", "unknown"),
                "error": text_result.get("error"),
                "file_info": {
                    "original_name": file.filename,
                    "content_type": file.content_type,
                    "size_bytes": Path(temp_file_path).stat().st_size
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Text extraction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {str(e)}")
    
    finally:
        # Clean up temporary file
        if temp_file_path and Path(temp_file_path).exists():
            os.unlink(temp_file_path)


def _save_uploaded_file(upload_file: UploadFile) -> str:
    """Save uploaded file to temporary location"""
    try:
        # Create temporary file with proper extension
        suffix = Path(upload_file.filename or "temp").suffix
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            shutil.copyfileobj(upload_file.file, temp_file)
            return temp_file.name
    except Exception as e:
        logger.error(f"Failed to save uploaded file: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process uploaded file")


def _extract_text_from_file(file_path: str) -> Dict[str, Any]:
    """Extract text using file processor or OCR"""
    file_path = Path(file_path)
    
    try:
        if file_path.suffix.lower() == ".pdf":
            # Try text extraction first
            text = file_processor.extract_pdf_text(file_path)
            
            if text and len(text.split()) > 20:  # Meaningful text found
                return {"text": text, "method": "pdf_text_extraction"}
            else:
                logger.info("Minimal text found, trying OCR backend")
                return ocr_processor.extract_text_from_pdf(file_path)
        
        elif file_path.suffix.lower() in [".xlsx", ".xls"]:
            df = file_processor.read_excel_file(file_path)
            return {"text": df.to_string(), "method": "excel_to_text"}
        
        else:
            return {"error": f"Unsupported file type: {file_path.suffix}"}
    
    except Exception as e:
        return {"error": str(e)}


def _validate_criteria_specific(data_row: Dict[str, Any], criteria: str) -> Dict[str, Any]:
    """Criteria-specific validation rules"""
    result = {"errors": [], "checks": []}
    
    try:
        if criteria == "3.1.1":
            # Grant validation
            amount = data_row.get("amount", 0)
            if amount:
                try:
                    amount = float(amount)
                    if amount <= 0:
                        result["errors"].append(f"Invalid amount: {amount}")
                    else:
                        result["checks"].append(f"Valid amount: {amount}")
                except (ValueError, TypeError):
                    result["errors"].append(f"Amount is not a valid number: {amount}")

            year = data_row.get("year", 0)
            if year:
                try:
                    year = int(year)
                    current_year = 2025  # Updated to current year
                    if not (current_year - 5 <= year <= current_year):
                        result["errors"].append(f"Year {year} outside valid range ({current_year-5}-{current_year})")
                    else:
                        result["checks"].append(f"Valid year: {year}")
                except (ValueError, TypeError):
                    result["errors"].append(f"Year is not a valid number: {year}")
        
        elif criteria == "3.1.2":
            dept = data_row.get("department_name", "")
            if not dept or not str(dept).strip():
                result["errors"].append("Missing department name")
            else:
                result["checks"].append(f"Valid department: {dept}")

        elif criteria == "7.1.10":
            # Ethics and values validation
            options = data_row.get("options")
            if options is not None:
                try:
                    options = int(options)
                    if not (0 <= options <= 4):
                        result["errors"].append(f"Options value {options} must be between 0 and 4")
                    else:
                        result["checks"].append(f"Valid options value: {options}")
                except (ValueError, TypeError):
                    result["errors"].append(f"Options is not a valid number: {options}")

            # Check session year
            session = data_row.get("session")
            if session:
                try:
                    session = int(session)
                    current_year = 2025
                    if not (1990 <= session <= current_year):
                        result["errors"].append(f"Session {session} must be between 1990 and {current_year}")
                    else:
                        result["checks"].append(f"Valid session: {session}")
                except (ValueError, TypeError):
                    result["errors"].append(f"Session is not a valid year: {session}")
    
    except Exception as e:
        result["errors"].append(f"Criteria validation error: {str(e)}")
    
    return result


def _determine_overall_decision(errors: list, warnings: list = None) -> tuple:
    """Determine overall decision based on errors and warnings"""
    warnings = warnings or []
    
    if not errors:
        return "ACCEPT", 0.9
    elif len(errors) <= 2 and len(warnings) <= 3:
        return "FLAG_FOR_REVIEW", 0.6
    else:
        return "REJECT", 0.2


def _validate_complete_submission(data_row: Dict[str, Any], file_path: str, criteria: str, file_type: str) -> Dict[str, Any]:
    """Validate complete submission (file + data)"""
    logger.info(f"Validating submission for criteria {criteria}")
    
    result = {
        "criteria": criteria,
        "submission_data": data_row,
        "file_path": file_path,
        "validations": {},
        "overall_decision": "REJECT",
        "confidence_score": 0.0,
        "errors": [],
        "warnings": [],
    }
    
    try:
        # Step 1: File validation
        file_result = file_validator.validate(file_path, file_type)
        result["validations"]["file_validation"] = file_result.to_dict()
        
        if not file_result.is_valid:
            result["errors"].extend(file_result.errors)
            return result
        
        # Step 2: Extract text
        text_result = _extract_text_from_file(file_path)
        result["validations"]["text_extraction"] = text_result
        
        if text_result.get("error"):
            result["errors"].append(f"Text extraction failed: {text_result['error']}")
            return result
        
        # Step 3: Criteria-specific checks
        criteria_result = _validate_criteria_specific(data_row, criteria)
        result["validations"]["criteria_validation"] = criteria_result
        
        if criteria_result.get("errors"):
            result["errors"].extend(criteria_result["errors"])
        
        # Step 4: Determine decision
        decision, confidence = _determine_overall_decision(
            result["errors"], result.get("warnings", [])
        )
        result["overall_decision"] = decision
        result["confidence_score"] = confidence
        
        logger.info(f"Validation completed - Decision: {result['overall_decision']}")
    
    except Exception as e:
        result["errors"].append(f"Unexpected error: {str(e)}")
        logger.error(str(e))
    
    return result


# Criteria validation moved to ValidationUtils


if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Starting NAAC Validation FastAPI Server")
    print("=" * 60)
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🔍 Redoc Documentation: http://localhost:8000/redoc")  
    print("❤️  Health Check: http://localhost:8000/health")
    print("=" * 60)
    print("📋 Available Endpoints:")
    print("   POST /validate-file        - Validate single file")
    print("   POST /validate-submission  - Complete validation (file + data)")
    print("   POST /extract-text         - Extract text only")
    print("   GET  /health              - System health check")
    print("=" * 60)
    print("🔧 Console logs will show detailed processing information...")
    print("")
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
