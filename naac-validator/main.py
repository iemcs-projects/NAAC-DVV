import os  # ← Add this import at the top
from core.ocr_processor import OCRProcessor
from core.field_extractor import FieldExtractor
from core.validator import DocumentValidator
from database.queries import DatabaseQueries
from utils.json_output import JSONOutput
from utils.file_handler import FileHandler  # ← Add this import

def main():
    criteria_code = input("Enter criteria code (e.g., 3.1.1): ")
    print(f"Processing criteria: {criteria_code}")

    pdf_file_path = "D:\\Development\\College\\NAAC-Validation\\Naac-Iemcs\\naac-validator\\uploads\\Research_Grant_Certificates.pdf"
    print(f"Processing file: {pdf_file_path}")
    
    if not os.path.exists(pdf_file_path):
        print(f"ERROR: File not found at {pdf_file_path}")
        return
    
    print("File found! Continuing...")
    
    # Initialize components
    ocr = OCRProcessor()
    file_handler = FileHandler()
    extractor = FieldExtractor(criteria_code)
    validator = DocumentValidator(criteria_code)
    db = DatabaseQueries()
    output = JSONOutput()
    
    # Get database records
    print("Fetching database records...")
    db_records = db.get_criteria_records(criteria_code)
    print(f"Found {len(db_records)} database records")
    
    # Get PDF page count
    page_count = file_handler.get_pdf_page_count(pdf_file_path)
    print(f"PDF has {page_count} pages")
    
    validation_results = []
    processed_page_count = 0
    
    # Process each page
    for page_num in range(page_count):
        print(f"\nProcessing page {page_num + 1}...")
        
        # Extract text
        text = ocr.extract_text_from_pdf_page(pdf_file_path, page_num)
        print(f"Extracted text length: {len(text)} characters")
        
        # Skip pages with no extractable text (empty or image-only pages)
        if not text or len(text.strip()) < 10:  # Skip if less than 10 characters
            print(f"Skipping page {page_num + 1} - insufficient text content")
            continue
        
        # Extract fields
        extracted_fields = extractor.extract_fields_from_text(text)
        print(f"Extracted fields: {extracted_fields}")
        
        # Validate against database record (using processed_page_count for DB record index)
        if processed_page_count < len(db_records):
            db_record = db_records[processed_page_count]
            validation_result = validator.validate_page_fields(
                extracted_fields, db_record, page_num + 1
            )
            validation_results.append(validation_result)
            print(f"Validation result: {validation_result}")
            processed_page_count += 1
        else:
            print(f"No database record for processed page count {processed_page_count + 1}")
    
    # Generate final report
    failed_page = None
    for result in validation_results:
        if not result["is_valid"]:
            failed_page = result["page_number"]
            break
    
    final_report = output.generate_validation_report(
        criteria_code, validation_results, failed_page
    )
    
    # Save report
    output.save_json_report(final_report, f"validation_report_{criteria_code}.json")
    
    print(f"\n✅ Validation completed!")
    print(f"Overall status: {final_report['validation_summary']['overall_status']}")
    if failed_page:
        print(f"❌ Validation failed at page: {failed_page}")

if __name__ == "__main__":
    main()