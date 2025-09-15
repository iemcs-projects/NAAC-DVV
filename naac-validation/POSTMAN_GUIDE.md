# 📮 Postman Guide for NAAC Validation API

## 🚀 Setup

1. **Start the server:**
   ```bash
   python app.py
   ```

2. **Base URL:** `http://localhost:8000`

3. **Import to Postman:** Use the endpoints below or visit `http://localhost:8000/docs` for OpenAPI spec

---

## 📋 API Endpoints for Postman

### 1. **Health Check** ✅
```
GET http://localhost:8000/health
```
**Headers:** None required  
**Body:** None  
**Response:** System status information

---

### 2. **File Validation Only** 📄

```
POST http://localhost:8000/validate-file
```

**Headers:**
- `Content-Type: multipart/form-data`

**Body (form-data):**
- `file`: [Select File] - Your PDF/Excel file
- `file_type`: `sanction_letter` (text field)

**Example form-data:**
```
file: sample.pdf
file_type: sanction_letter
```

---

### 3. **Complete Validation (File + Data)** 🎯

```
POST http://localhost:8000/validate-submission
```

**Headers:**
- `Content-Type: multipart/form-data`

**Body (form-data):**
- `file`: [Select File] - Your supporting document
- `submission_data`: `{"project_name":"AI Research","amount":500000,"year":2023}` (text field)
- `criteria`: `3.1.1` (text field)
- `file_type`: `sanction_letter` (text field)

**Example form-data for 3.1.1:**
```
file: grant_letter.pdf
submission_data: {
  "project_name": "AI Research in Healthcare",
  "pi_name": "Dr. John Doe", 
  "amount": 500000,
  "year": 2023,
  "funding_agency": "Department of Science and Technology",
  "department_name": "Computer Science and Engineering"
}
criteria: 3.1.1
file_type: sanction_letter
```

**Example form-data for 7.1.10:**
```
file: ethics_document.pdf
submission_data: {
  "session": 2024,
  "options": 2,
  "code_published": "Institution has published code of conduct",
  "monitoring_committee": "Ethics committee established",
  "ethics_programs": "Regular ethics workshops conducted",
  "awareness_programs": "Annual awareness campaigns"
}
criteria: 7.1.10
file_type: sanction_letter
```

---

### 4. **Text Extraction Only** 📝

```
POST http://localhost:8000/extract-text
```

**Headers:**
- `Content-Type: multipart/form-data`

**Body (form-data):**
- `file`: [Select File] - Your document

---

## 🎯 Quick Postman Collection

Create a new collection called "NAAC Validation" with these requests:

### Collection Structure:
```
📁 NAAC Validation API
├── 🟢 Health Check (GET)
├── 📄 Validate File Only (POST)
├── 🎯 Complete Validation - 3.1.1 (POST) 
├── 🎯 Complete Validation - 7.1.10 (POST)
└── 📝 Extract Text Only (POST)
```

---

## 📊 Sample Test Data

### For 3.1.1 (Research Grants):
```json
{
  "project_name": "Machine Learning for Healthcare Diagnostics",
  "pi_name": "Dr. Sarah Johnson",
  "amount": 750000,
  "year": 2024,
  "funding_agency": "National Science Foundation", 
  "department_name": "Computer Science and Engineering"
}
```

### For 7.1.10 (Ethics & Values):
```json
{
  "session": 2024,
  "options": 3,
  "code_published": "Comprehensive code of conduct published and disseminated",
  "monitoring_committee": "Active ethics monitoring committee with quarterly reviews",
  "ethics_programs": "Monthly ethics workshops and training sessions",
  "awareness_programs": "Campus-wide ethics awareness campaigns and seminars"
}
```

---

## 🔍 Console Logs You'll See

When testing with Postman, watch the console for detailed logs:

```
🔍 [VALIDATE-FILE] Processing: sample.pdf | Type: sanction_letter | Size: 1024KB
📄 [TEXT-EXTRACT] Method: pdf_text_extraction | Length: 2450 chars
🎯 [VALIDATION-RESULT] ✅ PASSED | Errors: 0 | File: sample.pdf
```

```
🔍 [COMPLETE-VALIDATION] File: grant_letter.pdf | Criteria: 3.1.1 | Type: sanction_letter  
📊 [SUBMISSION-DATA] Fields: ['project_name', 'pi_name', 'amount', 'year', 'funding_agency']
🎯 [VALIDATION-COMPLETE] ✅ ACCEPT | Confidence: 0.90 | Errors: 0
```

---

## 🚨 Common Errors & Solutions

### 1. **File Upload Error**
```json
{"detail": "Failed to process uploaded file"}
```
**Solution:** Ensure file is not corrupted and under size limit

### 2. **JSON Parse Error**
```json
{"detail": "Invalid JSON in submission_data: Expecting ',' delimiter"}
```
**Solution:** Check JSON syntax in `submission_data` field

### 3. **Validation Errors**
```json
{
  "success": false,
  "errors": ["Year 2018 outside valid range (2020-2025)"]
}
```
**Solution:** Fix data according to validation rules

---

## 💡 Pro Tips

1. **Use Variables:** Set `{{base_url}}` = `http://localhost:8000` in Postman environment

2. **Save Sample Files:** Keep test PDFs ready for consistent testing

3. **Check Console:** Always monitor the Python console for detailed processing logs

4. **Test Different Scenarios:**
   - Valid files with correct data
   - Invalid files (wrong format, too large)
   - Valid files with invalid data
   - Missing required fields

5. **Use Pre-request Scripts:** Auto-generate test data if needed

---

## 🔧 Environment Variables for Postman

Create an environment with:
```
base_url: http://localhost:8000
criteria_311: 3.1.1  
criteria_7110: 7.1.10
file_type: sanction_letter
```

Then use `{{base_url}}/validate-file` in your requests.

---

This guide should get you started with comprehensive API testing using Postman! 🚀