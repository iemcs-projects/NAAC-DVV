# NAAC Validation System

A comprehensive Python-based validation system for NAAC (National Assessment and Accreditation Council) DVV (Data Verification and Validation) processes. This system automates the validation of institutional data and supporting documents using AI-assisted analysis.

## 🚀 Features

- **Multi-layered Validation**: Basic file validation, criteria-specific checks, and AI-powered content verification
- **File Type Support**: PDF, Excel (.xlsx, .xls), Word documents
- **OCR Integration**: Extract text from scanned documents
- **AI-Powered Analysis**: Use Groq LLM for intelligent document content validation
- **Batch Processing**: Validate multiple submissions efficiently
- **Configurable Thresholds**: Customizable confidence levels for accept/flag/reject decisions
- **Comprehensive Reporting**: Detailed validation reports with confidence scores

## 📋 Requirements

### System Dependencies

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr poppler-utils
```

**macOS:**
```bash
brew install tesseract poppler
```

**Windows:**
- Download Tesseract from: https://github.com/UB-Mannheim/tesseract/wiki
- Download Poppler from: https://github.com/oschwartz10612/poppler-windows/releases

### Python Dependencies
```bash
pip install -r requirements.txt
```

## ⚙️ Installation

1. **Clone/Download the project:**
```bash
# Create project directory
mkdir naac_validation
cd naac_validation

# Copy all project files here
```

2. **Create virtual environment:**
```bash
python -m venv naac_env
source naac_env/bin/activate  # On Windows: naac_env\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env file with your configuration
```

Required environment variables in `.env`:
```bash
GROQ_API_KEY=your_groq_api_key_here
MAX_FILE_SIZE_MB=5
ALLOWED_FILE_TYPES=pdf,xlsx,xls
CONFIDENCE_ACCEPT_THRESHOLD=0.8
CONFIDENCE_FLAG_THRESHOLD=0.5
```

5. **Test the installation:**
```bash
python main.py
```

## 🎯 Quick Start

### Basic File Validation

```python
from validators.file_validator import FileValidator

validator = FileValidator()
result = validator.validate("document.pdf", "sanction_letter")

print(f"Valid: {result.is_valid}")
print(f"Decision: {result.decision}")
print(f"Errors: {result.errors}")
```

### Single Submission Validation

```python
from main import NaacValidationSystem

system = NaacValidationSystem()

# Sample data
data_row = {
    "project_name": "AI Research Project",
    "pi_name": "Dr. John Doe",
    "amount": 500000,
    "year": 2023,
    "funding_agency": "DST"
}

result = system.validate_single_submission(
    data_row=data_row,
    supporting_file_path="sanction_letter.pdf",
    criteria="3.1.1"
)

print(f"Decision: {result['overall_decision']}")
print(f"Confidence: {result['confidence_score']:.2f}")
```

### Bulk Validation

```python
# Validate multiple submissions from Excel file
results = system.validate_bulk_submissions(
    excel_file_path="data_template.xlsx",
    supporting_files_dir="supporting_documents/",
    criteria="3.1.1"
)

print(f"Total: {results['total_submissions']}")
print(f"Accepted: {results['summary']['accepted']}")
print(f"Flagged: {results['summary']['flagged']}")
print(f"Rejected: {results['summary']['rejected']}")
```

## 📁 Project Structure

```
naac_validation/
├── config/
│   ├── settings.py              # Configuration management
│   └── validation_rules.json    # Validation rules and thresholds
├── validators/
│   ├── base_validator.py        # Base validation class
│   └── file_validator.py        # File validation logic
├── utils/
│   ├── file_utils.py           # PDF/Excel processing
│   ├── ocr_utils.py            # OCR functionality
│   └── llm_utils.py            # LLM integration
├── tests/
│   ├── test_validators.py       # Unit tests
│   └── sample_files/           # Sample test files
├── requirements.txt
├── .env
└── main.py                     # Main application
```

## 🔧 Configuration

### Validation Rules (config/validation_rules.json)

```json
{
  "file_validation": {
    "max_size_mb": 5,
    "allowed_formats": ["pdf", "xlsx", "xls"],
    "min_size_bytes": 1024
  },
  "criteria_3_1_1": {
    "required_fields": ["project_name", "pi_name", "amount", "year", "funding_agency"],
    "year_range": 5,
    "min_amount": 1000
  }
}
```

### Confidence Thresholds

- **Accept (≥0.8)**: High confidence, auto-approve
- **Flag (0.5-0.8)**: Medium confidence, human review needed
- **Reject (<0.5)**: Low confidence, clear issues found

## 📊 Supported NAAC Criteria

Currently supports:
- **3.1.1**: Total Grants received from Government and non-governmental agencies
- **3.1.2**: Number of departments having Research projects funded by government and non-government agencies

Easy to extend for additional criteria by adding validation rules.

