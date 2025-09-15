# 🔧 Windows Poppler Setup Guide

## The Issue
`pdf2image` requires **Poppler** to convert PDFs to images for OCR processing. On Windows, this needs manual installation.

## 🚀 Quick Fix for Windows

### Option 1: Install Poppler (Recommended)

1. **Download Poppler for Windows:**
   - Visit: https://github.com/oschwartz10612/poppler-windows/releases/
   - Download the latest `Release-xx.xx.x-0.zip` file

2. **Extract and Setup:**
   ```bash
   # Extract to a folder like:
   C:\poppler-xx.xx.x\Library\bin\
   
   # Add to your PATH environment variable:
   C:\poppler-xx.xx.x\Library\bin
   ```

3. **Add to PATH:**
   - Open System Properties → Environment Variables
   - Add `C:\poppler-xx.xx.x\Library\bin` to your PATH
   - Restart VS Code/Terminal

### Option 2: Use Conda (Alternative)

```bash
# If you use conda:
conda install -c conda-forge poppler
```

### Option 3: Use Chocolatey (Alternative)

```bash
# If you have chocolatey:
choco install poppler
```

## 🧪 Test Installation

```bash
# Test if poppler is available:
pdftoppm -h

# Test our OCR:
python -c "
from utils.ocr_utils import OCRProcessor
processor = OCRProcessor()
print('OCR Status:', processor.get_ocr_info())
"
```

## 💡 Fallback Solution

If you can't install Poppler, the system will:
1. ✅ Still work for **text-based PDFs** (direct extraction)  
2. ✅ Use **Mistral OCR** for images (`.jpg`, `.png`)
3. ⚠️ Skip OCR for **scanned PDFs** (with warning)

## 🔍 Current Workaround

The system now gracefully handles missing Poppler with informative error messages and fallback behavior.

---

**Once Poppler is installed, restart your FastAPI server and try uploading the scanned PDF again!** 🎉