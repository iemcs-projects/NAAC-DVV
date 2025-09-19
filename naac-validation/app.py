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
from processors.ocr_processor import UnifiedOCRProcessor
from validation.criteria.criteria_validator import CriteriaValidator
from validation.content_validator import NAACContentValidator
from config.database import db

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
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize processors
ocr_processor = UnifiedOCRProcessor()
criteria_validator = CriteriaValidator()

@app.post("/extract-text-mistral")
async def extract_text_with_mistral(
    file: UploadFile = File(...),
    force_ocr: bool = Form(default=True),
    language: str = Form(default="eng")
):
    """
    Extract text using Mistral AI Vision OCR specifically.
    Designed for scanned documents and images.
    
    Args:
        file: Upload file (PDF, images)
        force_ocr: Force OCR even if text is available (default: True)
        language: OCR language (default: "eng")
        
    Returns:
        Detailed OCR results with confidence scores and metadata
    """
    temp_file_path = None
    
    logger.info(f"[MISTRAL-OCR] Processing: {file.filename}")
    print(f"[AI] [MISTRAL-OCR] File: {file.filename} | Force OCR: {force_ocr} | Language: {language}")
    
    try:
        # Validate file type
        if not file.filename.lower().endswith(('.pdf', '.png', '.jpg', '.jpeg', '.tiff', '.bmp')):
            raise HTTPException(
                status_code=400,
                detail="Mistral OCR supports PDF and image files only (.pdf, .png, .jpg, .jpeg, .tiff, .bmp)"
            )
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as temp_file:
            temp_file_path = temp_file.name
            shutil.copyfileobj(file.file, temp_file)
        
        # Use unified OCR processor with Mistral focus
        extraction_result = ocr_processor.extract_text(temp_file_path, use_ocr=force_ocr)
        
        extracted_text = extraction_result.get("text", "")
        ocr_method = extraction_result.get("ocr_method", "none")
        
        # Enhanced response with OCR-specific details
        response_data = {
            "success": bool(extracted_text),
            "message": f"Mistral OCR completed using {ocr_method}",
            "data": {
                "extracted_text": extracted_text,
                "text_length": len(extracted_text),
                "ocr_method": ocr_method,
                "ocr_used": extraction_result.get("ocr_used", False),
                "pages_processed": extraction_result.get("pages_processed", 0),
                "confidence_scores": extraction_result.get("confidence_scores", []),
                "errors": extraction_result.get("errors", []),
                "processing_stats": {
                    "language": language,
                    "force_ocr": force_ocr,
                    "file_size": Path(temp_file_path).stat().st_size,
                    "file_type": Path(file.filename).suffix.lower()
                },
                "file_info": {
                    "original_name": file.filename,
                    "content_type": file.content_type,
                    "processed_with": "Mistral AI Vision OCR"
                }
            }
        }
        
        # Console summary
        if extracted_text:
            avg_confidence = sum(extraction_result.get("confidence_scores", [0])) / max(len(extraction_result.get("confidence_scores", [1])), 1)
            logger.info(f"[MISTRAL-SUCCESS] Text: {len(extracted_text)} chars | Method: {ocr_method} | Confidence: {avg_confidence:.2f}")
            print(f"[SUCCESS] [MISTRAL-OCR] Success! Method: {ocr_method} | Text Length: {len(extracted_text)} | Pages: {extraction_result.get('pages_processed', 0)}")
        else:
            logger.warning(f"[MISTRAL-WARNING] No text extracted from {file.filename}")
            print(f"[WARNING] [MISTRAL-OCR] Warning: No text extracted")
        
        return response_data
        
    except Exception as e:
        logger.error(f"[MISTRAL-ERROR] OCR failed: {str(e)}")
        print(f"[ERROR] [MISTRAL-OCR] Error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Mistral OCR processing failed: {str(e)}"
        )
    
    finally:
        # Clean up temporary file
        if temp_file_path and Path(temp_file_path).exists():
            os.unlink(temp_file_path)


def _save_uploaded_file(file: UploadFile) -> str:
    """Save uploaded file to temporary location"""
    with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as temp_file:
        temp_file_path = temp_file.name
        shutil.copyfileobj(file.file, temp_file)
    return temp_file_path


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
            "ocr_processor": "unified_processor_available",
            "criteria_validator": "available", 
            "content_validator": "available",
            "settings": "loaded"
        }
        
        # Test OCR processor
        try:
            ocr_status = ocr_processor.get_status()
            system_status["ocr_details"] = ocr_status
        except Exception as e:
            system_status["ocr_processor"] = f"error: {str(e)}"
        
        # Test criteria validator
        try:
            supported_criteria = criteria_validator.list_supported_criteria()
            system_status["supported_criteria_count"] = len(supported_criteria)
        except Exception as e:
            system_status["criteria_validator"] = f"error: {str(e)}"
        
        return {
            "status": "healthy",
            "components": system_status,
            "timestamp": str(Path(__file__).stat().st_mtime),
            "validation_workflow": "database_integration_ready"
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


@app.post("/validate-with-database", response_model=ValidationResponse)
async def validate_with_database(
    file: UploadFile = File(...),
    database_record: str = Form(...),
    criteria_code: str = Form(...)
):
    """
    Validate document against database record using AI instructions
    
    Args:
        file: Document file to validate
        database_record: JSON string with database record
        criteria_code: NAAC criteria code (e.g., "3.1.1")
    """
    temp_file_path = None
    
    logger.info(f"🎯 Database validation request: {file.filename} | Criteria: {criteria_code}")
    
    try:
        # Parse database record
        try:
            db_record = json.loads(database_record)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON in database_record: {str(e)}")
        
        # Save uploaded file
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as temp_file:
            temp_file_path = temp_file.name
            shutil.copyfileobj(file.file, temp_file)
        
        logger.info(f"📁 File saved: {temp_file_path}")
        
        # Extract text using unified OCR processor
        extraction_result = ocr_processor.extract_text(temp_file_path)
        
        if not extraction_result["success"]:
            raise HTTPException(
                status_code=400,
                detail=f"Text extraction failed: {extraction_result.get('error', 'Unknown error')}"
            )
        
        extracted_text = extraction_result["extracted_text"]
        logger.info(f"📝 Text extracted: {len(extracted_text)} characters")
        
        # Validate using criteria validator with database record
        validation_result = criteria_validator.validate_criteria_document(
            criteria_code, db_record, extracted_text
        )
        
        # Prepare response
        response_data = {
            "validation_result": validation_result,
            "extraction_info": extraction_result.get("metadata", {}),
            "criteria_info": criteria_validator.get_criteria_info(criteria_code),
            "processing_stats": {
                "file_size": Path(temp_file_path).stat().st_size,
                "text_length": len(extracted_text),
                "confidence_score": validation_result.get("confidence_score", 0.0)
            }
        }
        
        # Console summary
        decision = validation_result.get("decision", "UNKNOWN")
        confidence = validation_result.get("confidence_score", 0.0)
        status_emoji = "✅" if decision == "ACCEPT" else "⚠️" if decision == "FLAG_FOR_REVIEW" else "❌"
        
        print(f"🎯 [DATABASE-VALIDATION] {status_emoji} {decision} | Confidence: {confidence:.3f} | Criteria: {criteria_code}")
        
        return ValidationResponse(
            success=validation_result.get("is_valid", False),
            message=f"Database validation completed for {criteria_code}",
            data=response_data,
            errors=[]
        )
        
    except Exception as e:
        logger.error(f"Database validation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")
    
    finally:
        # Clean up temporary file
        if temp_file_path and Path(temp_file_path).exists():
            os.unlink(temp_file_path)


@app.get("/criteria/{criteria_code}")
async def get_criteria_info(criteria_code: str):
    """Get information about a specific NAAC criteria"""
    try:
        criteria_info = criteria_validator.get_criteria_info(criteria_code)
        if "error" in criteria_info:
            raise HTTPException(status_code=404, detail=f"Criteria {criteria_code} not found")
        
        return {
            "criteria_code": criteria_code,
            "info": criteria_info,
            "supported_criteria": criteria_validator.list_supported_criteria()
        }
    except Exception as e:
        logger.error(f"Error getting criteria info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get criteria info: {str(e)}")


@app.get("/criteria")
async def list_supported_criteria():
    """List all supported NAAC criteria"""
    try:
        return {
            "supported_criteria": criteria_validator.list_supported_criteria(),
            "total_count": len(criteria_validator.list_supported_criteria())
        }
    except Exception as e:
        logger.error(f"Error listing criteria: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list criteria: {str(e)}")


@app.post("/validate-record", response_model=ValidationResponse)
async def validate_record_from_database(
    file: UploadFile = File(...),
    criteria_code: str = Form(...),
    record_id: int = Form(...)
):
    """
    Validate document against database record (fetched automatically)
    
    Args:
        file: Document file to validate
        criteria_code: NAAC criteria code (e.g., "3.1.1")
        record_id: Database record ID (sl_no)
    """
    temp_file_path = None
    
    logger.info(f"[TARGET] Database record validation: {file.filename} | Criteria: {criteria_code} | Record ID: {record_id}")
    
    try:
        # Fetch record from database
        database_record = db.get_criteria_record(criteria_code, record_id)
        
        if not database_record:
            raise HTTPException(
                status_code=404, 
                detail=f"Record with ID {record_id} not found for criteria {criteria_code}"
            )
        
        logger.info(f"[DATA] Retrieved database record: {database_record.get('name_of_project', 'Unknown')}")
        
        # Save uploaded file
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as temp_file:
            temp_file_path = temp_file.name
            shutil.copyfileobj(file.file, temp_file)
        
        # Extract text using unified OCR processor
        extraction_result = ocr_processor.extract_text(temp_file_path)
        
        # Check if extraction was successful
        extracted_text = extraction_result.get("text", "")
        if not extracted_text and extraction_result.get("errors"):
            raise HTTPException(
                status_code=400,
                detail=f"Text extraction failed: {'; '.join(extraction_result['errors'])}"
            )
        
        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="No text could be extracted from the document"
            )
        
        logger.info(f"[FILE] Text extracted: {len(extracted_text)} characters")
        
        # Validate using criteria validator with database record
        validation_result = criteria_validator.validate_criteria_document(
            criteria_code, database_record, extracted_text
        )
        
        # Prepare response
        response_data = {
            "validation_result": validation_result,
            "database_record": database_record,
            "extraction_info": extraction_result.get("metadata", {}),
            "criteria_info": criteria_validator.get_criteria_info(criteria_code),
            "processing_stats": {
                "file_size": Path(temp_file_path).stat().st_size,
                "text_length": len(extracted_text),
                "confidence_score": validation_result.get("confidence_score", 0.0),
                "record_id": record_id
            }
        }
        
        # Console summary
        decision = validation_result.get("decision", "UNKNOWN")
        confidence = validation_result.get("confidence_score", 0.0)
        status_emoji = "✅" if decision == "ACCEPT" else "⚠️" if decision == "FLAG_FOR_REVIEW" else "❌"
        
        print(f"🎯 [DB-RECORD-VALIDATION] {status_emoji} {decision} | Confidence: {confidence:.3f} | Record: {record_id}")
        
        return ValidationResponse(
            success=validation_result.get("is_valid", False),
            message=f"Database record validation completed for {criteria_code}",
            data=response_data,
            errors=[]
        )
        
    except Exception as e:
        logger.error(f"Database record validation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")
    
    finally:
        # Clean up temporary file
        if temp_file_path and Path(temp_file_path).exists():
            os.unlink(temp_file_path)


@app.get("/records/{criteria_code}")
async def get_records_by_criteria(criteria_code: str, limit: int = 10):
    """Get recent records for a specific criteria"""
    try:
        records = db.get_records_by_criteria(criteria_code, limit)
        return {
            "criteria_code": criteria_code,
            "records": records,
            "count": len(records)
        }
    except Exception as e:
        logger.error(f"Error getting records: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get records: {str(e)}")


@app.get("/search/{criteria_code}")
async def search_records(criteria_code: str, pi_name: str = None, project_name: str = None, year: int = None):
    """Search records by parameters"""
    try:
        search_params = {}
        if pi_name:
            search_params["name_of_principal_investigator"] = pi_name
        if project_name:
            search_params["name_of_project"] = project_name
        if year:
            search_params["year_of_award"] = str(year)
        
        records = db.search_records(criteria_code, search_params)
        return {
            "criteria_code": criteria_code,
            "search_params": search_params,
            "records": records,
            "count": len(records)
        }
    except Exception as e:
        logger.error(f"Error searching records: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to search records: {str(e)}")


@app.get("/database/status")
async def get_database_status():
    """Get database connection status and statistics"""
    try:
        status = db.get_database_status()
        return status
    except Exception as e:
        logger.error(f"Database status check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database status check failed: {str(e)}")


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
