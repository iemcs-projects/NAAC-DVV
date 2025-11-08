#!/usr/bin/env python3
"""
NAAC Validation System - Simplified FastAPI Application

This is a streamlined version of the NAAC validation system with only essential endpoints.
Removed redundant endpoints and simplified code structure for better maintainability.
"""

import os
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
from contextlib import asynccontextmanager

# FastAPI imports
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Import validation system components
from processors.ocr_processor import UnifiedOCRProcessor
from validation.criteria.criteria_validator import CriteriaValidator
from config.database import db
from response_simplifier import format_api_response

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Pydantic models for API responses
class ValidationResponse(BaseModel):
    success: bool
    message: str
    data: Dict[str, Any]
    error: Optional[str] = None

# Initialize system components
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    logger.info("🚀 Starting NAAC Validation System")
    
    # Initialize components
    global ocr_processor, criteria_validator
    
    try:
        ocr_processor = UnifiedOCRProcessor()
        criteria_validator = CriteriaValidator()
        logger.info("✅ System components initialized successfully")
        yield
    except Exception as e:
        logger.error(f"❌ System initialization failed: {str(e)}")
        yield
    finally:
        logger.info("🔄 Shutting down NAAC Validation System")

# Create FastAPI application
app = FastAPI(
    title="NAAC Validation System",
    description="Streamlined document validation against NAAC criteria using AI",
    version="2.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Utility functions
def _save_uploaded_file(file: UploadFile) -> str:
    """Save uploaded file to temporary location"""
    try:
        temp_path = f"temp_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
        with open(temp_path, "wb") as temp_file:
            temp_file.write(file.file.read())
        return temp_path
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File upload failed: {str(e)}")

def _cleanup_file(file_path: str):
    """Clean up temporary file"""
    try:
        if file_path and Path(file_path).exists():
            os.remove(file_path)
    except Exception as e:
        logger.warning(f"File cleanup failed: {str(e)}")

# ==========================================
# CORE API ENDPOINTS
# ==========================================

@app.get("/health")
async def health_check():
    """System health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0",
        "components": {
            "database": "connected" if db else "disconnected",
            "ocr_processor": "initialized",
            "criteria_validator": "initialized"
        }
    }

@app.post("/extract-text")
async def extract_text_from_document(
    file: UploadFile = File(...),
    use_ocr: bool = Form(default=True)
):
    """Extract text from uploaded document"""
    temp_file_path = None
    
    try:
        temp_file_path = _save_uploaded_file(file)
        extraction_result = ocr_processor.extract_text(temp_file_path, use_ocr=use_ocr)
        
        return {
            "success": True,
            "message": "Text extraction completed",
            "data": {
                "text": extraction_result.get("text", ""),
                "text_length": len(extraction_result.get("text", "")),
                "extraction_method": extraction_result.get("ocr_method", "direct"),
                "filename": file.filename
            }
        }
        
    except Exception as e:
        logger.error(f"Text extraction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {str(e)}")
    finally:
        if temp_file_path:
            _cleanup_file(temp_file_path)

@app.post("/validate-record")
async def validate_single_record(
    file: UploadFile = File(...),
    criteria_code: str = Form(...),
    record_id: int = Form(...)
):
    """Validate document against specific database record with simplified response"""
    temp_file_path = None
    
    try:
        # Save uploaded file
        temp_file_path = _save_uploaded_file(file)
        
        # Get database record
        db_record = db.get_criteria_record(criteria_code, record_id)
        if not db_record:
            raise HTTPException(
                status_code=404,
                detail=f"No record found for criteria {criteria_code}, record_id {record_id}"
            )
        
        # Extract text
        extraction_result = ocr_processor.extract_text(temp_file_path, use_ocr=True)
        if not extraction_result.get("text"):
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from uploaded file"
            )
        
        # Validate using criteria validator
        validation_result = criteria_validator.validate_criteria_document(
            criteria_code, db_record, extraction_result["text"]
        )
        
        # Create response structure for simplification
        original_response = {
            "success": True,
            "message": f"Validation completed for {criteria_code}",
            "data": {"validation_result": validation_result}
        }
        
        # Return simplified response
        return format_api_response(original_response, "single")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Single validation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")
    finally:
        if temp_file_path:
            _cleanup_file(temp_file_path)

@app.post("/validate-all-records")
async def validate_all_records(
    file: UploadFile = File(...),
    criteria_code: str = Form(...),
    confidence_threshold: float = Form(default=0.7),
    max_records: int = Form(default=10)
):
    """Validate document against all database records with clean response"""
    temp_file_path = None
    
    try:
        # Save uploaded file
        temp_file_path = _save_uploaded_file(file)
        
        # Get records for criteria
        records = db.get_records_by_criteria(criteria_code, limit=max_records)
        if not records:
            raise HTTPException(
                status_code=404,
                detail=f"No records found for criteria {criteria_code}"
            )
        
        # Extract text
        extraction_result = ocr_processor.extract_text(temp_file_path, use_ocr=True)
        if not extraction_result.get("text"):
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from uploaded file"
            )
        
        # Validate against each record
        validation_results = []
        decision_counts = {"ACCEPT": 0, "FLAG_FOR_REVIEW": 0, "REJECT": 0}
        
        for idx, record in enumerate(records):
            result = criteria_validator.validate_criteria_document(
                criteria_code, record, extraction_result["text"]
            )
            
            result["record_index"] = idx + 1
            result["database_record"] = record
            validation_results.append(result)
            
            # Count decisions
            decision = result.get("decision", "REJECT")
            decision_counts[decision] = decision_counts.get(decision, 0) + 1
        
        # Filter and sort results
        filtered_results = [
            r for r in validation_results 
            if r["confidence_score"] >= confidence_threshold
        ]
        filtered_results.sort(key=lambda x: x["confidence_score"], reverse=True)
        
        best_match = filtered_results[0] if filtered_results else validation_results[0]
        
        # Create response for simplification
        original_response = {
            "success": True,
            "message": f"Bulk validation completed - {len(records)} records processed",
            "data": {
                "bulk_validation_summary": {
                    "total_records_checked": len(records),
                    "best_match_confidence": best_match["confidence_score"],
                    "decision_breakdown": decision_counts
                },
                "best_match": best_match,
                "top_matches": filtered_results[:5]
            }
        }
        
        # Return simplified response
        return format_api_response(original_response, "bulk")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Bulk validation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")
    finally:
        if temp_file_path:
            _cleanup_file(temp_file_path)

# ==========================================
# UTILITY ENDPOINTS
# ==========================================

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
        status = db.get_database_status()
        return status
    except Exception as e:
        logger.error(f"Database status error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database status check failed: {str(e)}")

@app.get("/api-docs")
async def get_api_documentation():
    """API documentation and usage examples"""
    return {
        "endpoints": {
            "/validate-record": {
                "method": "POST",
                "description": "Validate single record with clean response",
                "parameters": ["file", "criteria_code", "record_id"]
            },
            "/validate-all-records": {
                "method": "POST", 
                "description": "Validate against all records with clean response",
                "parameters": ["file", "criteria_code", "confidence_threshold", "max_records"]
            },
            "/extract-text": {
                "method": "POST",
                "description": "Extract text from document",
                "parameters": ["file", "use_ocr"]
            },
            "/criteria": {
                "method": "GET",
                "description": "List supported criteria"
            }
        },
        "supported_criteria": [
            "2.1.1 - Teaching staff appointments",
            "3.1.1 - Research grants received",
            "3.2.1 - Publications/innovations",
            "3.2.2 - Research workshops",
            "3.3.1 - Research papers",
            "3.4.1 - Extension activities"
        ],
        "response_format": {
            "data": "Core validation results",
            "details": "Detailed analysis and confidence breakdown"
        }
    }

# ==========================================
# ERROR HANDLERS
# ==========================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "timestamp": datetime.now().isoformat()
        }
    )

# ==========================================
# SERVER STARTUP
# ==========================================

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Starting NAAC Validation FastAPI Server")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("❤️  Health Check: http://localhost:8000/health")
    print("🎯 Simplified & Optimized Version 2.0")
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )