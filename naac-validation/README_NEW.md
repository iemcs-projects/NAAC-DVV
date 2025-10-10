# NAAC DVV Validation System 🎓

<div align="center">

![Python](https://img.shields.io/badge/python-v3.8+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)
![AI](https://img.shields.io/badge/AI-Mistral%20%2B%20Groq-purple.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

**Advanced AI-Powered Document Validation System for NAAC Accreditation**

*Automated validation of institutional data and supporting documents with direct database integration*

[🚀 Quick Start](#-quick-start) • [📖 API Docs](#-api-documentation) • [🔧 Configuration](#️-configuration) • [🤖 AI Features](#-ai-features)

</div>

---

## 📋 Overview

The **NAAC DVV Validation System** is a comprehensive Python-based solution designed for **National Assessment and Accreditation Council (NAAC)** Data Verification and Validation (DVV) processes. This system automates the validation of institutional data against supporting documents using advanced AI models and direct database integration.

### 🎯 Key Problems Solved

- **Manual Document Verification** → Automated AI-powered validation
- **Data Entry Errors** → Direct database integration with auto-fetching
- **Inconsistent Validation** → Standardized criteria-specific rules
- **Time-Consuming Process** → Batch processing with confidence scoring
- **OCR Challenges** → Multi-model OCR with Mistral AI vision

## 🌟 Features

### 🤖 **AI-Powered Intelligence**
- **Mistral AI Vision** - Advanced OCR for scanned documents
- **Groq LLaMA 3.1** - Intelligent content validation and confidence scoring
- **Smart Document Analysis** - Context-aware validation with detailed reasoning
- **Multi-Modal Processing** - Text extraction, image analysis, and data validation

### 🗄️ **Database Integration**
- **Direct MySQL Connection** - Real-time data fetching from institutional database
- **Auto Record Retrieval** - Validate documents without manual data entry
- **Live Data Sync** - Always uses latest database information
- **Multiple Criteria Support** - All NAAC criteria tables mapped and ready

### 📄 **Document Processing**
- **Universal Format Support** - PDF, Excel (.xlsx/.xls), Word (.docx), Images
- **Intelligent OCR Detection** - Automatic text vs. scanned document recognition
- **No System Dependencies** - Pure Python solution with PyMuPDF
- **Batch Processing** - Validate multiple documents simultaneously

### ⚡ **Validation Engine**
- **Confidence Scoring** - 0.0-1.0 scale with customizable thresholds
- **Decision Framework** - ACCEPT (>0.8) / FLAG_FOR_REVIEW (0.5-0.8) / REJECT (<0.5)
- **Criteria-Specific Rules** - Tailored validation for each NAAC criteria
- **Detailed Reporting** - Comprehensive validation results with explanations

## 🏗️ Architecture

```
naac-validation/
├── 🗄️ config/                    # Configuration & Database
│   ├── database.py               # MySQL integration & record fetching
│   ├── settings.py              # System configuration
│   └── validation_rules.json    # NAAC criteria rules
├── 🤖 processors/               # Document Processing
│   └── ocr_processor.py         # Unified OCR (Mistral + PyMuPDF)
├── ✅ validation/               # Validation Engine
│   ├── content_validator.py     # AI-powered content validation
│   └── criteria/
│       └── criteria_validator.py # NAAC criteria-specific rules
├── 📋 validators/               # Basic Validation
│   ├── file_validator.py        # File format & integrity
│   └── base_validator.py        # Validation framework
├── 🌐 app.py                   # FastAPI REST API Server
├── 💻 main.py                  # CLI Interface
└── 🧪 test_*.py               # Test Suite
```

## 🚀 Quick Start

### 1️⃣ Installation

```bash
# Clone the repository
git clone <repository-url>
cd naac-validation

# Create virtual environment
python -m venv naac_env

# Activate environment
# Windows:
naac_env\Scripts\activate
# Linux/Mac:
source naac_env/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2️⃣ Configuration

Create `.env` file in the project root:

```env
# Database Configuration (Required)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=Naac_Dvv
DB_USER=root
DB_PASSWORD=your_mysql_password

# AI API Keys (Required)
GROQ_API_KEY=your_groq_api_key
MISTRAL_API_KEY=your_mistral_api_key

# Validation Settings (Optional)
CONFIDENCE_ACCEPT_THRESHOLD=0.8
CONFIDENCE_FLAG_THRESHOLD=0.5
LOG_LEVEL=INFO
```

**🔑 Get Your API Keys:**
- **Groq API**: [console.groq.com](https://console.groq.com/) (LLaMA 3.1 for validation)
- **Mistral API**: [console.mistral.ai](https://console.mistral.ai/) (Vision model for OCR)

### 3️⃣ Database Setup

Ensure your MySQL database contains NAAC response tables:
```sql
-- Required tables (examples)
response_2_1_1  -- Faculty joining data
response_3_1_1  -- Research grants
response_3_2_1  -- Publications
-- ... other criteria tables
```

### 4️⃣ Test Installation

```bash
# Test database connection
python test_database.py

# Start the server
python app.py
```

🌐 **Access Points:**
- **API Server**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 📖 API Documentation

### 🔥 **Main Validation Endpoint** (Recommended)

Validate documents against database records automatically:

```bash
curl -X POST "http://localhost:8000/validate-record" \
  -F "file=@research_grant.pdf" \
  -F "criteria_code=3.1.1" \
  -F "record_id=4"
```

**Response:**
```json
{
  "success": true,
  "message": "Database validation completed for 3.1.1",
  "data": {
    "validation_result": {
      "decision": "ACCEPT",
      "confidence_score": 0.92,
      "is_valid": true,
      "criteria_code": "3.1.1",
      "ai_analysis": {
        "reasoning": "Document clearly shows research grant details matching database record...",
        "matched_fields": ["project_name", "pi_name", "amount", "funding_agency"],
        "confidence_factors": {...}
      },
      "database_record": {
        "name_of_project": "Advanced AI Research",
        "name_of_principal_investigator": "Dr. Samnath Doe",
        "amount_sanctioned": "6.00",
        "funding_agency": "UGC"
      }
    }
  }
}
```

### 📋 **All Available Endpoints**

| Endpoint | Method | Purpose | Parameters |
|----------|--------|---------|------------|
| `/health` | GET | System status check | None |
| `/database/status` | GET | Database connection status | None |
| `/validate-record` | POST | **Main validation** (database mode) | `file`, `criteria_code`, `record_id` |
| `/validate-with-database` | POST | Validation with manual record | `file`, `criteria_code`, `database_record` |
| `/records/{criteria}` | GET | Get database records | `criteria`, `limit`, `offset` |
| `/search/{criteria}` | GET | Search records | `criteria`, search params |
| `/extract-text` | POST | Text extraction only | `file` |
| `/validate-file` | POST | File format validation | `file`, `file_type` |

### 🔍 **Database Record Management**

```bash
# Get recent records for selection
curl "http://localhost:8000/records/3.1.1?limit=10"

# Search records by PI name
curl "http://localhost:8000/search/3.1.1?pi_name=Dr.%20Smith"

# Check database connectivity
curl "http://localhost:8000/database/status"
```

## 🤖 AI Features

### 🧠 **Mistral AI Vision OCR**
- **Superior Text Recognition** - Handles complex layouts, handwritten text
- **Multi-Language Support** - English, Hindi, and regional languages
- **Image Preprocessing** - Automatic enhancement for better accuracy
- **Fallback System** - EasyOCR backup for edge cases

### 🎯 **Groq LLaMA Content Validation**
- **Context-Aware Analysis** - Understands document context and NAAC requirements
- **Confidence Scoring** - Detailed reasoning for each validation decision
- **Field-Level Matching** - Individual field validation with explanations
- **Authenticity Checks** - Detects potential document inconsistencies

### 📊 **Validation Decision Logic**

```python
# Confidence Score Interpretation
if confidence >= 0.8:
    decision = "ACCEPT"          # Automatic approval
elif confidence >= 0.5:
    decision = "FLAG_FOR_REVIEW" # Human review required  
else:
    decision = "REJECT"          # Automatic rejection
```

## 🎯 Supported NAAC Criteria

| Criteria | Description | Database Table | Key Fields |
|----------|-------------|----------------|------------|
| **2.1.1** | Teaching staff appointments | `response_2_1_1` | faculty_name, joining_date, designation |
| **3.1.1** | Research grants received | `response_3_1_1` | project_name, pi_name, amount, funding_agency |
| **3.2.1** | Publications/Innovations | `response_3_2_1` | title, authors, journal, publication_year |
| **3.2.2** | Research workshops | `response_3_2_2` | event_title, participants, date |
| **3.3.1** | Research papers | `response_3_3_1` | paper_title, journal_name, impact_factor |
| **3.4.1** | Extension activities | `response_3_4_1` | activity_title, beneficiaries, location |

## 🔧 Configuration

### ⚙️ **System Settings** (`config/settings.py`)

```python
# Confidence Thresholds
CONFIDENCE_ACCEPT_THRESHOLD = 0.8     # Auto-accept above 80%
CONFIDENCE_FLAG_THRESHOLD = 0.5       # Flag for review 50-80%
CONFIDENCE_REJECT_THRESHOLD = 0.5     # Auto-reject below 50%

# File Processing
MAX_FILE_SIZE_MB = 50
ALLOWED_FILE_TYPES = ['.pdf', '.xlsx', '.xls', '.docx', '.jpg', '.png']

# Database
CONNECTION_TIMEOUT = 30
MAX_CONNECTIONS = 10
```

### 🎨 **Validation Rules** (`config/validation_rules.json`)

Customize validation behavior for each NAAC criteria:
```json
{
  "3.1.1": {
    "required_fields": ["name_of_project", "name_of_principal_investigator"],
    "optional_fields": ["collaborating_agency", "year_of_grant"],
    "validation_focus": ["funding_amount", "sanctioning_authority"],
    "document_types": ["sanction_letter", "grant_certificate"]
  }
}
```

## 💻 Programming Examples

### 🐍 **Python Integration**

```python
from processors.ocr_processor import UnifiedOCRProcessor
from validation.content_validator import NAACContentValidator
from config.database import NAACDatabase

# Initialize components
ocr = UnifiedOCRProcessor()
validator = NAACContentValidator()
db = NAACDatabase()

# Complete validation workflow
def validate_naac_document(file_path, criteria_code, record_id):
    # Step 1: Extract text
    extraction_result = ocr.extract_text(file_path, use_ocr=True)
    
    # Step 2: Fetch database record
    db_record = db.get_record_by_id(criteria_code, record_id)
    
    # Step 3: Validate with AI
    result = validator.validate_with_database_record(
        criteria_code=criteria_code,
        database_record=db_record,
        extracted_text=extraction_result["text"]
    )
    
    return {
        "decision": result["decision"],
        "confidence": result["confidence_score"],
        "analysis": result["ai_analysis"]
    }

# Example usage
result = validate_naac_document("grant_letter.pdf", "3.1.1", 4)
print(f"Decision: {result['decision']} (Confidence: {result['confidence']:.2f})")
```

### 🌐 **Node.js Backend Integration**

```javascript
const express = require('express');
const multer = require('multer');
const FormData = require('form-data');
const fetch = require('node-fetch');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Validation endpoint
app.post('/api/validate/:recordId', upload.single('document'), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));
    formData.append('criteria_code', req.body.criteria_code);
    formData.append('record_id', req.params.recordId);
    
    const response = await fetch('http://localhost:8000/validate-record', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    res.json({
      success: true,
      validation: result.data.validation_result
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### ⚛️ **React Frontend Integration**

```jsx
import React, { useState } from 'react';

const NAACValidator = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateDocument = async (recordId, criteria) => {
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('criteria_code', criteria);
    formData.append('record_id', recordId);
    
    try {
      const response = await fetch('/api/validate-record', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      setResult(data.data.validation_result);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="naac-validator">
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files[0])}
        accept=".pdf,.xlsx,.docx"
      />
      <button onClick={() => validateDocument(4, '3.1.1')} disabled={!file || loading}>
        {loading ? 'Validating...' : 'Validate Document'}
      </button>
      
      {result && (
        <div className={`result ${result.decision.toLowerCase()}`}>
          <h3>Decision: {result.decision}</h3>
          <p>Confidence: {(result.confidence_score * 100).toFixed(1)}%</p>
          <p>{result.ai_analysis.reasoning}</p>
        </div>
      )}
    </div>
  );
};
```

## 🧪 Comprehensive Testing Guide

### 🚀 **Quick Test Verification**

Before using the system, run these verification tests:

```bash
# 1. Test Database Connection
python test_database.py

# 2. Test System Components  
python test_new_system.py

# 3. Test Real Validation Examples
python examples.py

# 4. Test Manual Validation Cases
python test_validation.py
```

### 📋 **Available Validation Types**

The NAAC Validation System supports multiple validation layers:

#### **🔍 1. File Validation**
- **Purpose**: Basic file integrity and format checks
- **Location**: `validators/file_validator.py`
- **Validates**:
  - File existence and accessibility
  - File size limits (min: 1KB, max: 50MB)
  - File formats: PDF, Excel (.xlsx/.xls), Word (.docx), Images
  - MIME type verification
  - File corruption detection
  - URL vs file path validation

```bash
# Test file validation
curl -X POST "http://localhost:8000/validate-file" \
  -F "file=@document.pdf" \
  -F "file_type=sanction_letter"
```

#### **🤖 2. OCR and Text Extraction**
- **Purpose**: Extract text from documents using AI
- **Location**: `processors/ocr_processor.py`
- **Features**:
  - **Mistral AI Vision**: Advanced OCR for scanned documents
  - **Direct PDF extraction**: For text-based PDFs
  - **Multi-language support**: English, Hindi, regional languages
  - **Image preprocessing**: Auto-enhancement for better accuracy

```bash
# Test text extraction
curl -X POST "http://localhost:8000/extract-text-mistral" \
  -F "file=@scanned_document.pdf" \
  -F "force_ocr=true"
```

#### **🎯 3. Criteria-Specific Validation**
- **Purpose**: NAAC criteria-specific document validation
- **Location**: `validation/criteria/criteria_validator.py`
- **Supported Criteria**:

| Criteria | Description | Database Table | Validation Focus |
|----------|-------------|----------------|------------------|
| **2.1.1** | Teaching staff appointments | `response_2_1_1` | Faculty details, joining dates, designations |
| **3.1.1** | Research grants received | `response_3_1_1` | Grant amounts, PI names, funding agencies |
| **3.1.2** | Departments with funded projects | `response_3_1_2` | Department counts, project distributions |
| **3.2.1** | Publications/Innovations | `response_3_2_1` | Publication details, author names, journals |
| **3.2.2** | Research workshops | `response_3_2_2` | Event details, participants, dates |
| **3.3.1** | Research papers | `response_3_3_1` | Paper titles, impact factors |
| **3.4.1** | Extension activities | `response_3_4_1` | Activity details, beneficiaries |

#### **🧠 4. AI-Powered Content Validation**
- **Purpose**: Intelligent document content analysis
- **Location**: `validation/content_validator.py`
- **Features**:
  - **Groq LLaMA 3.1**: Advanced language model for validation
  - **Confidence scoring**: 0.0-1.0 scale with decision framework
  - **Field-level matching**: Individual field validation
  - **Contextual analysis**: Understanding document context
  - **Mismatch detection**: Identifies inconsistencies

**Decision Framework:**
```python
if confidence >= 0.8:
    decision = "ACCEPT"          # ✅ Automatic approval
elif confidence >= 0.5:
    decision = "FLAG_FOR_REVIEW" # ⚠️ Human review required  
else:
    decision = "REJECT"          # ❌ Automatic rejection
```

#### **🗄️5. Database Integration Validation**
- **Purpose**: Validate documents against live database records
- **Location**: `config/database.py`
- **Features**:
  - Direct MySQL connection to institutional database
  - Auto-fetch records by criteria and ID
  - Search functionality with multiple parameters
  - Real-time data synchronization
  - Multiple criteria table support

### 🔧 **Testing Methods**

#### **Method 1: Component Testing**

```bash
# Test individual components
python -c "
from processors.ocr_processor import UnifiedOCRProcessor
ocr = UnifiedOCRProcessor()
print('OCR Status:', ocr.get_status())
"

python -c "
from validation.criteria.criteria_validator import CriteriaValidator
validator = CriteriaValidator()
print('Supported Criteria:', validator.list_supported_criteria())
"
```

#### **Method 2: API Testing**

```bash
# Start the API server first
python app.py

# Then test endpoints:

# 1. Health check
curl "http://localhost:8000/health"

# 2. Database status
curl "http://localhost:8000/database/status"

# 3. Get supported criteria
curl "http://localhost:8000/criteria"

# 4. Get records by criteria
curl "http://localhost:8000/records/3.1.1?limit=5"

# 5. Main validation endpoint
curl -X POST "http://localhost:8000/validate-record" \
  -F "file=@research_grant.pdf" \
  -F "criteria_code=3.1.1" \
  -F "record_id=4"

# 6. Validate against all records (batch mode)
curl -X POST "http://localhost:8000/validate-against-all-records" \
  -F "file=@research_grant.pdf" \
  -F "criteria_code=3.1.1" \
  -F "confidence_threshold=0.7"
```

#### **Method 3: Python Integration Testing**

```python
# Complete validation workflow test
from processors.ocr_processor import UnifiedOCRProcessor
from validation.criteria.criteria_validator import CriteriaValidator
from config.database import db

def test_complete_workflow():
    # Initialize components
    ocr = UnifiedOCRProcessor()
    validator = CriteriaValidator()
    
    # Test database connection
    db_status = db.get_database_status()
    print(f"Database: {db_status['status']}")
    
    # Test text extraction
    extraction_result = ocr.extract_text("test_document.pdf", use_ocr=True)
    print(f"Text extracted: {len(extraction_result['text'])} characters")
    
    # Test validation
    database_record = db.get_criteria_record("3.1.1", 4)
    if database_record:
        result = validator.validate_criteria_document(
            "3.1.1", database_record, extraction_result["text"]
        )
        print(f"Validation: {result['decision']} ({result['confidence_score']:.2f})")
    
    return True

# Run the test
test_complete_workflow()
```

### 🎯 **Test Data and Examples**

#### **Sample Test Records**

**Research Grant (3.1.1) Test Data:**
```json
{
  "name_of_project": "Advanced AI Research",
  "name_of_principal_investigator": "Dr. Samnath Doe",
  "department_of_principal_investigator": "Computer Science",
  "amount_sanctioned": "6.00",
  "funding_agency": "UGC",
  "year_of_award": "2024",
  "duration_of_project": "24",
  "type": "Government"
}
```

**Faculty Appointment (2.1.1) Test Data:**
```json
{
  "faculty_name": "Dr. John Smith",
  "designation": "Assistant Professor", 
  "department": "Computer Science",
  "joining_date": "2024-01-15",
  "programme_name": "B.Tech Computer Science",
  "year": "2024"
}
```

#### **Test Document Samples**

Create test documents that match your database records:

**Sample Grant Letter (for 3.1.1):**
```
RESEARCH GRANT SANCTION LETTER

Project Title: Advanced AI Research
Principal Investigator: Dr. Samnath Doe
Department: Computer Science
Funding Agency: University Grants Commission (UGC)
Sanctioned Amount: Rs. 6.00 Crore
Project Duration: 24 months
Year of Award: 2024
Project Type: Government Funded

This letter confirms the sanction of the above research project...
```

### 🔍 **Validation Testing Scenarios**

#### **Scenario 1: Perfect Match** ✅
```bash
# Document exactly matches database record
# Expected: ACCEPT (confidence > 0.8)
curl -X POST "http://localhost:8000/validate-record" \
  -F "file=@perfect_match_grant.pdf" \
  -F "criteria_code=3.1.1" \
  -F "record_id=4"
```

#### **Scenario 2: Partial Match** ⚠️
```bash
# Document has some matching fields, some missing
# Expected: FLAG_FOR_REVIEW (0.5 < confidence < 0.8)
curl -X POST "http://localhost:8000/validate-record" \
  -F "file=@partial_match_grant.pdf" \
  -F "criteria_code=3.1.1" \
  -F "record_id=4"
```

#### **Scenario 3: Mismatch** ❌
```bash
# Document doesn't match database record
# Expected: REJECT (confidence < 0.5)
curl -X POST "http://localhost:8000/validate-record" \
  -F "file=@wrong_document.pdf" \
  -F "criteria_code=3.1.1" \
  -F "record_id=4"
```

#### **Scenario 4: OCR Challenge** 🔍
```bash
# Scanned document with poor quality
# Test OCR capabilities
curl -X POST "http://localhost:8000/extract-text-mistral" \
  -F "file=@scanned_poor_quality.pdf" \
  -F "force_ocr=true"
```

### 📊 **Test Results Interpretation**

**Successful Response Example:**
```json
{
  "success": true,
  "message": "Database validation completed for 3.1.1",
  "data": {
    "validation_result": {
      "decision": "ACCEPT",
      "confidence_score": 0.92,
      "is_valid": true,
      "criteria_code": "3.1.1",
      "criteria_name": "Grants received from Government agencies",
      "ai_analysis": {
        "reasoning": "Document clearly shows research grant details matching database record perfectly...",
        "matched_fields": ["project_name", "pi_name", "amount", "funding_agency"],
        "confidence_factors": {
          "exact_name_match": 0.3,
          "amount_match": 0.2,
          "agency_match": 0.1,
          "year_match": 0.1,
          "document_authenticity": 0.22
        }
      },
      "database_record": {
        "name_of_project": "Advanced AI Research",
        "name_of_principal_investigator": "Dr. Samnath Doe",
        "amount_sanctioned": "6.00",
        "funding_agency": "UGC"
      }
    }
  }
}
```

**Error Response Example:**
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Database record not found for criteria 3.1.1, record_id 999",
  "details": {
    "criteria_code": "3.1.1",
    "available_records": 25,
    "suggested_record_ids": [1, 2, 3, 4, 5]
  }
}
```

### 🛠️ **Custom Testing**

#### **Add New Test Cases**

1. **Create custom test data:**
```python
# Add to test_validation.py
custom_record = {
    "name_of_project": "Your Project Name",
    "name_of_principal_investigator": "Your PI Name", 
    "amount_sanctioned": "Your Amount",
    "funding_agency": "Your Agency"
}

custom_text = """
Your document content here...
"""

# Test validation
result = validator.validate_criteria_document("3.1.1", custom_record, custom_text)
print(f"Result: {result}")
```

2. **Test new criteria:**
```python
# Add new criteria to criteria_validator.py
new_criteria = {
    "4.1.1": {
        "name": "Your new criteria",
        "database_model": "response_4_1_1",
        "required_fields": ["field1", "field2"],
        "validation_rules": {"field1": "validation_rule"}
    }
}
```

### 🐛 **Debugging and Troubleshooting**

#### **Enable Debug Mode**
```bash
# Set debug logging
export LOG_LEVEL=DEBUG
python app.py

# Or in .env file
LOG_LEVEL=DEBUG
```

#### **Common Test Issues**

**Issue 1: Database Connection Failed**
```bash
# Check MySQL service
net start mysql  # Windows
# or
sudo systemctl start mysql  # Linux

# Test connection
python test_database.py
```

**Issue 2: ChatGroq Initialization Failed (proxies error)**
```bash
# This error occurs due to package version incompatibility:
# TypeError: Client.__init__() got an unexpected keyword argument 'proxies'

# Fix by installing compatible versions:
pip install groq==0.4.1 langchain-groq==0.0.3 httpx==0.25.0 --force-reinstall

# Test the fix:
python debug_groq_init.py
```

**Issue 3: API Keys Not Working**
```bash
# Verify API keys in .env
python -c "
import os
from dotenv import load_dotenv
load_dotenv()
print('GROQ_API_KEY:', 'GROQ_API_KEY' in os.environ)
print('MISTRAL_API_KEY:', 'MISTRAL_API_KEY' in os.environ)
"
```

**Issue 3: Low Confidence Scores**
```python
# Adjust confidence thresholds in config/settings.py
CONFIDENCE_ACCEPT_THRESHOLD = 0.7  # Lower for more lenient validation
CONFIDENCE_FLAG_THRESHOLD = 0.4    # Lower threshold for review
```

**Issue 4: Package Compatibility Problems**
```bash
# If you encounter package compatibility issues, use this debug tool:
python debug_groq_init.py

# For clean reinstallation:
pip uninstall langchain-groq groq httpx -y
pip install langchain-groq==0.0.3 groq==0.4.1 httpx==0.25.0
```

### 🎯 **Performance Testing**

```bash
# Test multiple validations
for i in {1..10}; do
  curl -X POST "http://localhost:8000/validate-record" \
    -F "file=@test_doc_$i.pdf" \
    -F "criteria_code=3.1.1" \
    -F "record_id=$i" &
done
wait

# Monitor system performance
python -c "
import psutil
import time
print('CPU:', psutil.cpu_percent())
print('Memory:', psutil.virtual_memory().percent)
"
```

### 🎯 **Sample Test Data**

**Research Grant (3.1.1):**
```json
{
  "name_of_project": "Advanced AI Research",
  "name_of_principal_investigator": "Dr. Samnath Doe", 
  "amount_sanctioned": "6.00",
  "funding_agency": "UGC",
  "year_of_sanction": "2024"
}
```

**Faculty Appointment (2.1.1):**
```json
{
  "faculty_name": "Dr. John Smith",
  "designation": "Assistant Professor",
  "department": "Computer Science",
  "joining_date": "2024-01-15"
}
```

### 🧪 **Testing Checklist**

Before deploying or using the system in production:

- [ ] **Database Connection** - Run `python test_database.py`
- [ ] **Component Status** - Run `python test_new_system.py`
- [ ] **API Endpoints** - Test all endpoints with `curl` or Postman
- [ ] **File Validation** - Test with various file formats and sizes
- [ ] **OCR Functionality** - Test with both text and scanned PDFs
- [ ] **AI Validation** - Test with matching and non-matching documents
- [ ] **Error Handling** - Test with invalid inputs and missing data
- [ ] **Performance** - Test with multiple concurrent requests
- [ ] **Security** - Verify file upload restrictions and validation

## 🚀 Production Deployment

### 🐳 **Docker Deployment**

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
# Build and run
docker build -t naac-validator .
docker run -p 8000:8000 --env-file .env naac-validator
```

### 🌩️ **Cloud Deployment**

**Environment Variables for Production:**
```env
DB_HOST=production-mysql-host
DB_NAME=Naac_Dvv_Prod
GROQ_API_KEY=prod_groq_key
MISTRAL_API_KEY=prod_mistral_key
LOG_LEVEL=WARNING
```

### 📊 **Performance Monitoring**

```python
# Add to your monitoring setup
import time
import logging

@app.middleware("http")
async def log_requests(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    logger.info(f"{request.method} {request.url} - {process_time:.2f}s")
    return response
```

## 🔧 Troubleshooting

### 🔍 **Common Issues**

**Database Connection Failed:**
```bash
# Check MySQL service
sudo systemctl status mysql

# Test connection manually
mysql -h localhost -u root -p
```

**OCR Not Working:**
```python
# Check API keys
python -c "import os; print('MISTRAL_API_KEY' in os.environ)"

# Test extraction manually
from processors.ocr_processor import UnifiedOCRProcessor
ocr = UnifiedOCRProcessor()
result = ocr.extract_text("test.pdf", use_ocr=True)
```

**Low Confidence Scores:**
```python
# Adjust thresholds in config/settings.py
CONFIDENCE_ACCEPT_THRESHOLD = 0.7  # Lower for stricter validation
CONFIDENCE_FLAG_THRESHOLD = 0.4    # Lower threshold for review
```

### 📋 **Debug Mode**

```bash
# Enable detailed logging
export LOG_LEVEL=DEBUG
python app.py
```

## 🤝 Contributing

### 🛠️ **Development Setup**

```bash
# Fork and clone
git clone https://github.com/yourusername/naac-validation.git

# Install dev dependencies
pip install -r requirements-dev.txt

# Run tests
pytest tests/

# Format code
black . && flake8 .
```

### 📝 **Adding New Criteria**

1. **Update database mapping** in `config/database.py`
2. **Add validation rules** in `config/validation_rules.json`  
3. **Create AI instructions** in `validation/criteria/criteria_validator.py`
4. **Add tests** in `tests/test_criteria_*.py`

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NAAC** for accreditation standards and criteria
- **Mistral AI** for advanced vision OCR capabilities
- **Groq** for fast LLaMA inference
- **FastAPI** for modern API framework
- **PyMuPDF** for reliable PDF processing

---

<div align="center">

**Built with ❤️ for Educational Excellence**

[🐛 Report Bug](../../issues) • [🚀 Request Feature](../../issues) • [📧 Contact](mailto:your-email@domain.com)

</div>