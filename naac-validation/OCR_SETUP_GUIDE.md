# 🤖 OCR Setup Guide - Mistral OCR Integration

## 🎯 Overview

The NAAC Validation system now supports intelligent OCR for scanned documents using **Mistral AI** as the primary OCR engine with EasyOCR and Tesseract as fallbacks.

---

## 🔧 Quick Setup

### 1. **Mistral API Key** (Recommended - Best Results)

1. **Get Mistral API Key:**
   - Visit: https://console.mistral.ai/
   - Sign up and get your API key
   - Copy your API key

2. **Add to `.env` file:**
   ```bash
   MISTRAL_API_KEY=your_mistral_api_key_here
   ```

### 2. **Install OCR Dependencies** (Optional but recommended)

```bash
# Activate your virtual environment first
naac_env\Scripts\Activate.ps1

# Install OCR packages
pip install pdf2image Pillow easyocr

# Optional: Install Tesseract (requires system binary)
# pip install pytesseract
```

---

## 🚀 How It Works

### **Intelligent OCR Priority:**

1. 🥇 **Mistral OCR** (Primary) - Best accuracy, handles complex layouts
2. 🥈 **EasyOCR** (Fallback) - Good performance, no system dependencies  
3. 🥉 **Tesseract** (Last resort) - Basic OCR, requires system installation

### **Smart Document Detection:**

- ✅ **Text-based PDFs**: Direct text extraction (fast)
- 🔍 **Scanned PDFs**: Automatic OCR processing 
- 📊 **Mixed Documents**: Intelligent method selection per page

---

## 📋 Current Configuration Status

Check your OCR setup:

```bash
# Test OCR configuration
python -c "
from utils.ocr_utils import OCRProcessor
import json
processor = OCRProcessor()
print(json.dumps(processor.get_ocr_info(), indent=2))
"
```

---

## 🎯 Usage Examples

### **API Usage:**
```bash
# Upload scanned PDF via Postman
POST http://localhost:8000/validate-submission

# Body (form-data):
file: scanned_document.pdf
criteria: 3.1.1
file_type: sanction_letter
submission_data: {"project_name": "AI Research", "amount": 500000}
```

### **Console Logs You'll See:**
```
🔍 Using OCR for scanned PDF with method: mistral
🤖 Mistral OCR extraction successful
✅ Page 1 processed with mistral
📄 [TEXT-EXTRACT] Method: ocr_mistral | Length: 2450 chars
```

---

## 🛠️ Troubleshooting

### **No OCR Methods Available**
```
⚠️ No OCR methods available! Install easyocr or tesseract for better results
```
**Solution:** Install EasyOCR: `pip install easyocr`

### **Mistral API Issues**
```
⚠️ MISTRAL_API_KEY not found - set it in .env for best OCR results
```
**Solutions:**
1. Add `MISTRAL_API_KEY=your_key` to `.env` file
2. Restart the FastAPI server
3. Check API key is valid at https://console.mistral.ai/

### **PDF Conversion Issues**
```
pdf2image library not available for PDF conversion
```
**Solution:** Install pdf2image: `pip install pdf2image`

---

## 📊 Performance Comparison

| OCR Method | Accuracy | Speed | Dependencies | Cost |
|------------|----------|-------|--------------|------|
| **Mistral OCR** | 🟢 Excellent | 🟡 Moderate | API Key only | 💰 Pay-per-use |
| **EasyOCR** | 🟡 Good | 🟢 Fast | Python only | 🆓 Free |
| **Tesseract** | 🟠 Basic | 🟢 Fast | System binary | 🆓 Free |

---

## 🔍 Advanced Configuration

### **Custom OCR Settings** (Optional)

Add to `.env` file:
```bash
# OCR Configuration
OCR_LANGUAGE=eng          # Language for OCR processing
OCR_TIMEOUT=30           # API timeout in seconds
```

### **For System Administrators**

Install Tesseract system-wide (Windows):
```bash
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
# Add to system PATH
# Install: pip install pytesseract
```

---

## ✅ Validation

Test your setup:

1. **Start the server:** `python app.py`
2. **Upload a scanned PDF** via Postman
3. **Check console logs** for OCR method used
4. **Verify extracted text** in API response

---

## 🎉 Ready to Use!

Your NAAC Validation system now has **intelligent OCR capabilities**! 

- 📄 **Text-based PDFs**: Lightning fast extraction
- 🔍 **Scanned documents**: High-quality Mistral OCR  
- 🎯 **Smart detection**: Automatic method selection
- 📊 **Fallback support**: Multiple OCR engines

**Upload your scanned documents and watch the magic happen!** ✨