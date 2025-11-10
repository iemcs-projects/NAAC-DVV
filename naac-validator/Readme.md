# NAAC Document Validator

A Python-based document validation system for NAAC (National Assessment and Accreditation Council) criteria. The system processes PDF documents through OCR, extracts relevant fields, and validates them against database records.

## 📁 Project Structure & File Roles

```
naac-validator/
├── main.py                          # Main execution script
├── config.py                        # Database configuration
├── requirements.txt                 # Python dependencies
├── 
├── core/
│   ├── __init__.py                 # Core package imports
│   ├── ocr_processor.py            # OCR text extraction
│   ├── field_extractor.py          # Field extraction from OCR text
│   └── validator.py                # Document validation logic
│
├── database/
│   ├── __init__.py                 # Database package imports
│   ├── models.py                   # Database table models
│   └── queries.py                  # MySQL database operations
│
├── validation/
│   ├── __init__.py                 # Validation package imports
│   └── criteria_validator.py       # NAAC criteria requirements
│
├── utils/
│   ├── __init__.py                 # Utils package imports
│   ├── file_handler.py             # File processing utilities
│   └── json_output.py              # JSON report generation
│
└── uploads/                        # Document storage directory
```

### 📋 Detailed File Descriptions

#### Root Files
- **`main.py`**: Entry point of the application. Orchestrates the entire validation workflow - takes user input for criteria code, processes PDF pages through OCR, extracts fields, validates against database records, and generates final JSON report.

- **`config.py`**: Central configuration file containing database connection parameters (MySQL host, port, credentials, database name) and application settings like file upload paths.

- **`requirements.txt`**: Lists all Python package dependencies needed for the project including OCR libraries, database connectors, and image processing tools.

#### Core Processing (`core/`)
- **`ocr_processor.py`**: Handles Optical Character Recognition (OCR) functionality. Contains methods to extract text from PDF pages and image files using Tesseract OCR and PyPDF2.

- **`field_extractor.py`**: Extracts structured data fields from raw OCR text using regex patterns. Each NAAC criteria has specific extraction methods (project names, investigator names, amounts, years, etc.).

- **`validator.py`**: Performs field-by-field comparison between extracted document data and database records. Calculates confidence scores and determines validation pass/fail status.

#### Database Layer (`database/`)
- **`models.py`**: Defines database table structures for different NAAC criteria. Each criteria has its own model class specifying table names and field definitions (e.g., Response_3_1_1 for research grants criteria).

- **`queries.py`**: Manages MySQL database connections and operations. Provides methods to fetch criteria records, individual record lookups, and database connection management.

#### Validation Logic (`validation/`)
- **`criteria_validator.py`**: Core criteria management system. Contains detailed requirements for each NAAC criteria including required fields, validation rules, and database model mappings. This is where new criteria configurations are added.

#### Utilities (`utils/`)
- **`file_handler.py`**: Handles file operations including PDF page counting, file existence checks, and directory management for document uploads.

- **`json_output.py`**: Generates structured JSON validation reports with detailed results, confidence scores, error descriptions, and overall validation status for each processed document page.

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- MySQL Server
- Tesseract OCR

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/naac-validator.git
   cd naac-validator
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure database**
   
   Edit `config.py`:
   ```python
   MYSQL_HOST = 'localhost'
   MYSQL_PORT = 3306
   MYSQL_USER = 'root'
   MYSQL_PASSWORD = 'your_password'
   MYSQL_DATABASE = 'naac_db'
   ```

4. **Setup database tables**
   
   Ensure your MySQL database has tables like:
   - `response_2_1_1`
   - `response_3_1_1` 
   - `response_3_2_1`

### Usage

**Basic validation:**
```bash
python main.py
```
Enter criteria code when prompted (e.g., 3.1.1)

**Hardcode inputs in main.py:**
```python
criteria_code = "3.1.1"
pdf_file_path = "uploads/your_document.pdf"
```

## 📋 Supported Criteria

| Code | Description | Required Fields |
|------|-------------|-----------------|
| 2.1.1 | Teaching Staff | programme_name, year, no_of_students |
| 3.1.1 | Research Grants | name_of_project, name_of_principal_investigator, name_of_funding_agency, amount_sanctioned, year_of_award |
| 3.2.1 | Innovation Ecosystem | paper_title, author_names, journal_name, year_of_publication |

## ➕ Adding New NAAC Criteria

### Step 1: Update Criteria Configuration

Add new criteria in `validation/criteria_validator.py`:

```python
self.criteria_requirements = {
    # Existing criteria...
    "4.1.1": {
        "name": "Infrastructure and Learning Resources",
        "database_model": "response_4_1_1",
        "required_fields": ["infrastructure_type", "facility_name", "year_established", "budget_allocated"],
        "validation_rules": {
            "year_established": "within_assessment_period",
            "budget_allocated": "positive_number"
        }
    }
}
```

### Step 2: Add Database Model

Update `database/models.py`:

```python
class Response_4_1_1:
    """Model for criteria 4.1.1 - Infrastructure"""
    table_name = "response_4_1_1"
    fields = [
        "id",
        "infrastructure_type",
        "facility_name", 
        "year_established",
        "budget_allocated"
    ]
```

### Step 3: Add Field Extractors

Update `core/field_extractor.py`:

```python
# Add to extract_fields_from_text() method
elif field == "infrastructure_type":
    extracted_data[field] = self._extract_infrastructure_type(text)
elif field == "facility_name":
    extracted_data[field] = self._extract_facility_name(text)

# Add extraction methods
def _extract_infrastructure_type(self, text):
    pattern = r'Infrastructure Type:\s*([^\n]+)'
    match = re.search(pattern, text)
    return match.group(1).strip() if match else ""

def _extract_facility_name(self, text):
    pattern = r'Facility Name:\s*([^\n]+)'
    match = re.search(pattern, text)
    return match.group(1).strip() if match else ""
```

## 📊 Output Format

The system generates comprehensive JSON validation reports:

```json
{
  "criteria_code": "3.1.1",
  "timestamp": "2025-11-09T20:32:36.800058",
  "total_pages": 3,
  "validation_summary": {
    "passed": 2,
    "failed": 1,
    "overall_status": "FAIL"
  },
  "page_results": [
    {
      "page_number": 1,
      "is_valid": false,
      "errors": ["Mismatch in name_of_project"],
      "matched_fields": {
        "name_of_project": false,
        "name_of_principal_investigator": true,
        "name_of_funding_agency": true,
        "amount_sanctioned": true,
        "year_of_award": true
      },
      "confidence_score": 0.8
    }
  ],
  "failed_page": 1
}
```

## ⚙️ Configuration

### Validation Threshold
Adjust validation strictness in `core/validator.py`:

```python
# Strict validation (100% match required)
validation_result["is_valid"] = validation_result["confidence_score"] >= 1.0

# Lenient validation (80% match required)  
validation_result["is_valid"] = validation_result["confidence_score"] >= 0.8
```

### Supported File Types
- PDF files (.pdf)
- Image files (.png, .jpg, .jpeg)

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check credentials in `config.py`
   - Ensure database exists

2. **OCR Not Working**
   - Install Tesseract OCR
   - Check file path exists in uploads folder

3. **Empty Field Extraction**
   - Verify regex patterns in `field_extractor.py`
   - Check document text format matches expected patterns

## 🎯 Features

- **🔧 Modular Design**: Easy to add new NAAC criteria
- **👁️ OCR Processing**: Extracts text from PDF documents
- **🗄️ Database Integration**: Validates against MySQL records
- **📄 Page-wise Validation**: Individual validation for each document page
- **📈 Detailed Reporting**: Comprehensive JSON validation reports
- **⚙️ Configurable Thresholds**: Adjustable validation confidence levels