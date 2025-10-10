#!/usr/bin/env python3
"""
NAAC Validation FastAPI Application - Streamlined Version
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

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add project root to path
sys.path.append(str(Path(__file__).parent))

from config.settings import settings
from processors.ocr_processor import UnifiedOCRProcessor
from validation.criteria.criteria_validator import CriteriaValidator
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


class ValidationResponse(BaseModel):
    """Response model for validation results"""
    success: bool
    message: str
    data: Dict[str, Any]
    errors: List[str] = []


def _save_uploaded_file(file: UploadFile) -> str:
    """Save uploaded file to temporary location"""
    with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as temp_file:
        temp_file_path = temp_file.name
        shutil.copyfileobj(file.file, temp_file)
    return temp_file_path


def _cleanup_file(file_path: str):
    """Clean up temporary file"""
    if file_path and Path(file_path).exists():
        os.unlink(file_path)


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
        ocr_status = ocr_processor.get_status()
        supported_criteria = criteria_validator.list_supported_criteria()
        
        return {
            "status": "healthy",
            "components": {
                "ocr_processor": ocr_status,
                "criteria_validator": "available",
                "supported_criteria_count": len(supported_criteria)
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")


@app.post("/extract-text-mistral")
async def extract_text_with_mistral(
    file: UploadFile = File(...),
    force_ocr: bool = Form(default=True)
):
    """Extract text using Mistral AI Vision OCR or direct extraction"""
    temp_file_path = None
    
    try:
        # Validate file type
        if not file.filename.lower().endswith(('.pdf', '.png', '.jpg', '.jpeg', '.tiff', '.bmp')):
            raise HTTPException(
                status_code=400,
                detail="Supported formats: PDF and image files (.pdf, .png, .jpg, .jpeg, .tiff, .bmp)"
            )
        
        # Save and process file
        temp_file_path = _save_uploaded_file(file)
        extraction_result = ocr_processor.extract_text(temp_file_path, use_ocr=force_ocr)
        
        extracted_text = extraction_result.get("text", "")
        ocr_method = extraction_result.get("ocr_method", "none")
        ocr_used = extraction_result.get("ocr_used", False)
        
        # Determine processing method
        if ocr_used and ocr_method != "none":
            method_description = f"{ocr_method.title()} OCR"
            message = f"Text extracted using {ocr_method} OCR"
        else:
            method_description = "Direct PDF Text Extraction"
            message = "Text extracted directly from PDF (no OCR needed)"
        
        return {
            "success": bool(extracted_text),
            "message": message,
            "data": {
                "extracted_text": extracted_text,
                "text_length": len(extracted_text),
                "ocr_method": ocr_method,
                "ocr_used": ocr_used,
                "pages_processed": extraction_result.get("pages_processed", 0),
                "confidence_scores": extraction_result.get("confidence_scores", []),
                "errors": extraction_result.get("errors", []),
                "file_info": {
                    "original_name": file.filename,
                    "processed_with": method_description
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Text extraction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {str(e)}")
    
    finally:
        _cleanup_file(temp_file_path)


@app.post("/validate-record", response_model=ValidationResponse)
async def validate_record_from_database(
    file: UploadFile = File(...),
    criteria_code: str = Form(...),
    record_id: int = Form(...)
):
    """Validate document against specific database record"""
    temp_file_path = None
    
    try:
        # Fetch record from database
        database_record = db.get_criteria_record(criteria_code, record_id)
        if not database_record:
            raise HTTPException(
                status_code=404, 
                detail=f"Record with ID {record_id} not found for criteria {criteria_code}"
            )
        
        # Save and extract text from file
        temp_file_path = _save_uploaded_file(file)
        extraction_result = ocr_processor.extract_text(temp_file_path)
        
        extracted_text = extraction_result.get("text", "")
        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="No text could be extracted from the document"
            )
        
        # Validate using criteria validator
        validation_result = criteria_validator.validate_criteria_document(
            criteria_code, database_record, extracted_text
        )
        
        response_data = {
            "validation_result": validation_result,
            "database_record": database_record,
            "extraction_info": {
                "text_length": len(extracted_text),
                "ocr_method": extraction_result.get("ocr_method", "none"),
                "ocr_used": extraction_result.get("ocr_used", False)
            },
            "processing_stats": {
                "file_size": Path(temp_file_path).stat().st_size,
                "confidence_score": validation_result.get("confidence_score", 0.0),
                "record_id": record_id
            }
        }
        
        # Collect validation errors
        validation_errors = []
        if validation_result.get("error"):
            validation_errors.append(validation_result["error"])
        if validation_result.get("errors"):
            validation_errors.extend(validation_result["errors"])
        
        return ValidationResponse(
            success=validation_result.get("is_valid", False),
            message=f"Validation completed for criteria {criteria_code}",
            data=response_data,
            errors=validation_errors
        )
        
    except Exception as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")
    
    finally:
        _cleanup_file(temp_file_path)


@app.post("/validate-against-all-records", response_model=ValidationResponse)
async def validate_against_all_records(
    file: UploadFile = File(...),
    criteria_code: str = Form(...),
    limit: int = Form(default=50)
):
    """Validate document against ALL database records for a criteria"""
    temp_file_path = None
    
    try:
        # Fetch all records for the criteria
        all_records = db.get_records_by_criteria(criteria_code, limit)
        if not all_records:
            raise HTTPException(
                status_code=404, 
                detail=f"No records found for criteria {criteria_code}"
            )
        
        # Save and extract text from file
        temp_file_path = _save_uploaded_file(file)
        extraction_result = ocr_processor.extract_text(temp_file_path)
        
        extracted_text = extraction_result.get("text", "")
        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="No text could be extracted from the document"
            )
        
        # Validate against each record
        validation_results = []
        best_match = None
        best_confidence = 0.0
        
        for i, database_record in enumerate(all_records):
            try:
                validation_result = criteria_validator.validate_criteria_document(
                    criteria_code, database_record, extracted_text
                )
                
                validation_result["database_record"] = database_record
                validation_result["record_index"] = i + 1
                validation_results.append(validation_result)
                
                # Track best match
                confidence = validation_result.get("confidence_score", 0.0)
                if confidence > best_confidence:
                    best_confidence = confidence
                    best_match = validation_result
                
            except Exception as e:
                logger.error(f"Failed to validate record {i+1}: {str(e)}")
                validation_results.append({
                    "database_record": database_record,
                    "record_index": i + 1,
                    "error": f"Validation failed: {str(e)}",
                    "confidence_score": 0.0,
                    "decision": "ERROR"
                })
        
        # Sort results by confidence score
        validation_results.sort(key=lambda x: x.get("confidence_score", 0.0), reverse=True)
        
        # Calculate statistics
        decision_stats = {}
        for result in validation_results:
            decision = result.get("decision", "ERROR")
            decision_stats[decision] = decision_stats.get(decision, 0) + 1
        
        response_data = {
            "bulk_validation_summary": {
                "total_records_checked": len(all_records),
                "best_match_confidence": best_confidence,
                "decision_breakdown": decision_stats
            },
            "best_match": best_match,
            "top_matches": validation_results[:10],  # Top 10 results
            "extraction_info": {
                "text_length": len(extracted_text),
                "ocr_method": extraction_result.get("ocr_method", "none")
            }
        }
        
        # Determine overall success
        overall_success = best_match and best_match.get("decision") in ["ACCEPT", "FLAG_FOR_REVIEW"] if best_match else False
        
        return ValidationResponse(
            success=overall_success,
            message=f"Bulk validation completed - {len(validation_results)} records processed",
            data=response_data,
            errors=[]
        )
        
    except Exception as e:
        logger.error(f"Bulk validation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Bulk validation failed: {str(e)}")
    
    finally:
        _cleanup_file(temp_file_path)


# Utility endpoints
@app.get("/criteria")
async def list_supported_criteria():
    """List all supported NAAC criteria"""
    try:
        criteria_list = criteria_validator.list_supported_criteria()
        return {
            "supported_criteria": criteria_list,
            "total_count": len(criteria_list)
        }
    except Exception as e:
        logger.error(f"Error listing criteria: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list criteria: {str(e)}")


@app.get("/records/{criteria_code}")
async def get_records_by_criteria(criteria_code: str, limit: int = 10):
    """Get records for a specific criteria"""
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


@app.get("/database/status")
async def get_database_status():
    """Get database connection status"""
    try:
        return db.get_database_status()
    except Exception as e:
        logger.error(f"Database status check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database status check failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Starting NAAC Validation FastAPI Server")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("❤️  Health Check: http://localhost:8000/health")
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )