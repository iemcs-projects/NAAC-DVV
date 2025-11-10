from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
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


@app.post("/validate")
async def validate_file(criteria_code: str = Form(...), file: UploadFile = File(...)):
    """Accept a PDF file and criteria code, validate it and store if it passes.

    Request: multipart/form-data with fields:
      - criteria_code: string
      - file: PDF (UploadFile)

    Response: JSON with validation report and saved file path when PASS.
    """
    # Save uploaded file to staging with a unique name
    print(f"criteria_code: {criteria_code}")
    filename = file.filename or f"upload_{uuid4().hex}.pdf"
    ext = os.path.splitext(filename)[1] or ".pdf"
    staging_name = f"{uuid4().hex}{ext}"
    staging_path = os.path.join(STAGING_DIR, staging_name)

    try:
        contents = await file.read()
        with open(staging_path, "wb") as f:
            f.write(contents)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to save upload: {exc}")

    # Initialize components (same flow as main.py)
    ocr = OCRProcessor()
    file_handler = FileHandler()
    extractor = FieldExtractor(criteria_code)
    validator = DocumentValidator(criteria_code)
    db = DatabaseQueries()
    output = JSONOutput()

    # Get DB records
    db_records = db.get_criteria_records(criteria_code)

    # Get number of pages
    try:
        page_count = file_handler.get_pdf_page_count(staging_path)
    except Exception as exc:
        # cleanup staging
        try:
            os.remove(staging_path)
        except Exception:
            pass
        raise HTTPException(status_code=400, detail=f"Failed to read PDF pages: {exc}")

    validation_results = []
    processed_page_count = 0

    for page_num in range(page_count):
        text = ocr.extract_text_from_pdf_page(staging_path, page_num)
        
        # Skip pages with no extractable text (empty or image-only pages)
        if not text or len(text.strip()) < 10:  # Skip if less than 10 characters
            continue
            
        extracted_fields = extractor.extract_fields_from_text(text)

        if processed_page_count < len(db_records):
            db_record = db_records[processed_page_count]
            validation_result = validator.validate_page_fields(
                extracted_fields, db_record, page_num + 1
            )
            validation_results.append(validation_result)
            processed_page_count += 1
        else:
            # No DB record to compare against — mark as invalid
            validation_results.append({
                "page_number": page_num + 1,
                "is_valid": False,
                "errors": ["No database record available for this page"],
                "matched_fields": {},
                "confidence_score": 0.0,
            })

    # Generate final report
    failed_page = None
    for result in validation_results:
        if not result.get("is_valid", False):
            failed_page = result.get("page_number")
            break

    final_report = output.generate_validation_report(criteria_code, validation_results, failed_page)

    # If overall pass, move staging file to uploads and keep original filename (unique-safe)
    saved_path = None
    try:
        if final_report.get("validation_summary", {}).get("overall_status") == "PASS":
            # create a unique filename to avoid collision
            dest_name = f"{uuid4().hex}{ext}"
            dest_path = os.path.join(UPLOADS_DIR, dest_name)
            shutil.move(staging_path, dest_path)
            saved_path = dest_path
        else:
            # remove staging file
            try:
                os.remove(staging_path)
            except Exception:
                pass
    except Exception as exc:
        # best-effort cleanup
        try:
            if os.path.exists(staging_path):
                os.remove(staging_path)
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Failed to finalize upload: {exc}")

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

    uvicorn.run("api:app", host="127.0.0.1", port=8000, reload=True)
