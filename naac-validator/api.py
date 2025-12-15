from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware  # ADD THIS IMPORT
import os
import shutil
from uuid import uuid4

from core.ocr_processor import OCRProcessor
from core.field_extractor import FieldExtractor
from core.validator import DocumentValidator
from database.queries import DatabaseQueries
from utils.json_output import JSONOutput
from utils.file_handler import FileHandler


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
STAGING_DIR = os.path.join(UPLOADS_DIR, "staging")
os.makedirs(STAGING_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

app = FastAPI(title="NAAC Validator API")

# ADD CORS MIDDLEWARE - This is the fix!
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default port
        "http://localhost:3000",  # React default port
        "http://localhost:3001",  # Alternative port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "NAAC Validator API", "status": "running"}


@app.get("/health")
async def health():
    """Health check with database status"""
    from datetime import datetime
    
    db = DatabaseQueries()
    db_status = "connected" if db.connect() else "disconnected"
    if db.connection:
        db.connection.close()
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "database": db_status
    }


@app.post("/validate")
async def validate_file(criteria_code: str = Form(...), file: UploadFile = File(...)):
    """Accept a PDF file and criteria code, validate it and store if it passes.

    Request: multipart/form-data with fields:
      - criteria_code: string
      - file: PDF (UploadFile)

    Response: JSON with validation report and saved file path when PASS.
    """
    print(f"\n{'='*60}")
    print(f"Validation Request Received")
    print(f"{'='*60}")
    print(f"Criteria Code: {criteria_code}")
    print(f"Filename: {file.filename}")
    print(f"Content Type: {file.content_type}")
    
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400, 
            detail="Only PDF files are supported"
        )
    
    # Save uploaded file to staging with a unique name
    filename = file.filename or f"upload_{uuid4().hex}.pdf"
    ext = os.path.splitext(filename)[1] or ".pdf"
    staging_name = f"{uuid4().hex}{ext}"
    staging_path = os.path.join(STAGING_DIR, staging_name)

    try:
        contents = await file.read()
        file_size = len(contents)
        print(f"File size: {file_size / 1024:.2f} KB")
        
        with open(staging_path, "wb") as f:
            f.write(contents)
        print(f"✓ File saved to staging: {staging_path}")
    except Exception as exc:
        print(f"✗ Failed to save file: {exc}")
        raise HTTPException(status_code=500, detail=f"Failed to save upload: {exc}")

    # Initialize components
    try:
        print(f"\nInitializing validator components...")
        ocr = OCRProcessor()
        file_handler = FileHandler()
        extractor = FieldExtractor(criteria_code)
        validator = DocumentValidator(criteria_code)
        db = DatabaseQueries()
        output = JSONOutput()
        print(f"✓ Components initialized")
    except Exception as exc:
        print(f"✗ Failed to initialize components: {exc}")
        # Cleanup
        try:
            os.remove(staging_path)
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Initialization error: {exc}")

    # Get DB records
    try:
        print(f"\nFetching database records for {criteria_code}...")
        db_records = db.get_criteria_records(criteria_code)
        print(f"✓ Found {len(db_records)} database records")
    except Exception as exc:
        print(f"✗ Database query failed: {exc}")
        # Cleanup
        try:
            os.remove(staging_path)
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Database error: {exc}")

    # Get number of pages
    try:
        page_count = file_handler.get_pdf_page_count(staging_path)
        print(f"✓ PDF has {page_count} pages")
    except Exception as exc:
        print(f"✗ Failed to read PDF: {exc}")
        # Cleanup staging
        try:
            os.remove(staging_path)
        except Exception:
            pass
        raise HTTPException(status_code=400, detail=f"Failed to read PDF pages: {exc}")

    validation_results = []
    processed_page_count = 0

    print(f"\n{'='*60}")
    print(f"Processing Pages")
    print(f"{'='*60}")

    for page_num in range(page_count):
        print(f"\n[Page {page_num + 1}/{page_count}]")
        
        try:
            # Extract text from page
            print(f"  └─ Extracting text with OCR...")
            text = ocr.extract_text_from_pdf_page(staging_path, page_num)
            
            # Skip pages with no extractable text
            if not text or len(text.strip()) < 10:
                print(f"  └─ ⚠ Skipping page (insufficient text)")
                continue
            
            print(f"  └─ ✓ Extracted {len(text)} characters")
            
            # Extract fields from text
            print(f"  └─ Extracting fields...")
            extracted_fields = extractor.extract_fields_from_text(text)
            print(f"  └─ ✓ Extracted {len(extracted_fields)} fields")

            if processed_page_count < len(db_records):
                db_record = db_records[processed_page_count]
                print(f"  └─ Validating against DB record {processed_page_count + 1}...")
                validation_result = validator.validate_page_fields(
                    extracted_fields, db_record, page_num + 1
                )
                print(f"  └─ {'✓ VALID' if validation_result.get('is_valid') else '✗ INVALID'}")
                validation_results.append(validation_result)
                processed_page_count += 1
            else:
                # No DB record to compare against
                print(f"  └─ ⚠ No database record available")
                validation_results.append({
                    "page_number": page_num + 1,
                    "is_valid": False,
                    "errors": ["No database record available for this page"],
                    "matched_fields": {},
                    "confidence_score": 0.0,
                })
        except Exception as exc:
            print(f"  └─ ✗ Error processing page: {exc}")
            validation_results.append({
                "page_number": page_num + 1,
                "is_valid": False,
                "errors": [f"Error processing page: {str(exc)}"],
                "matched_fields": {},
                "confidence_score": 0.0,
            })

    # Generate final report
    print(f"\n{'='*60}")
    print(f"Generating Validation Report")
    print(f"{'='*60}")
    
    failed_page = None
    for result in validation_results:
        if not result.get("is_valid", False):
            failed_page = result.get("page_number")
            break

    final_report = output.generate_validation_report(criteria_code, validation_results, failed_page)
    
    overall_status = final_report.get("validation_summary", {}).get("overall_status")
    passed = final_report.get("validation_summary", {}).get("passed", 0)
    failed = final_report.get("validation_summary", {}).get("failed", 0)
    
    print(f"Status: {overall_status}")
    print(f"Passed: {passed}, Failed: {failed}")

    # If overall pass, move staging file to uploads
    saved_path = None
    try:
        if overall_status == "PASS":
            dest_name = f"{uuid4().hex}{ext}"
            dest_path = os.path.join(UPLOADS_DIR, dest_name)
            shutil.move(staging_path, dest_path)
            saved_path = dest_path
            print(f"✓ File saved to: {dest_path}")
        else:
            # Remove staging file
            try:
                os.remove(staging_path)
                print(f"✓ Staging file removed (validation failed)")
            except Exception:
                pass
    except Exception as exc:
        print(f"✗ Failed to finalize upload: {exc}")
        # Best-effort cleanup
        try:
            if os.path.exists(staging_path):
                os.remove(staging_path)
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Failed to finalize upload: {exc}")

    print(f"\n{'='*60}")
    print(f"Validation Complete")
    print(f"{'='*60}\n")

    response = {"report": final_report, "saved_path": saved_path}
    return JSONResponse(status_code=200, content=response)


@app.get("/database-records")
async def get_database_records(criteria_code: str):
    """Get database records for a criteria code via query parameter.
    
    Usage: /database-records?criteria_code=3.1.1
    """
    print(f"Fetching database records for criteria code: {criteria_code}")
    db = DatabaseQueries()
    
    # Test connection first
    if not db.connect():
        raise HTTPException(status_code=503, detail="Database connection failed - check MySQL config")
    db.connection.close()
    
    records = db.get_criteria_records(criteria_code)
    
    # Return detailed info
    table_name = f"response_{criteria_code.replace('.', '_')}"
    return JSONResponse(status_code=200, content={
        "criteria_code": criteria_code,
        "table_name": table_name,
        "record_count": len(records),
        "records": records
    })


if __name__ == "__main__":
    import uvicorn

    print("\n" + "="*60)
    print("Starting NAAC Validator API Server")
    print("="*60)
    print(f"Server: http://127.0.0.1:8000")
    print(f"Docs: http://127.0.0.1:8000/docs")
    print(f"Health: http://127.0.0.1:8000/health")
    print("="*60 + "\n")

    uvicorn.run("api:app", host="127.0.0.1", port=8000, reload=True)