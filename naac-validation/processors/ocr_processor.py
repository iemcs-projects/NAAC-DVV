"""
Unified OCR Processor using Mistral AI and PyMuPDF
Handles all text extraction from documents including scanned PDFs
"""
import logging
import tempfile
import os
import io
import base64
import requests
from pathlib import Path
from typing import Union, List, Optional, Dict, Any
import json

logger = logging.getLogger(__name__)

# Required imports with graceful handling
try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    logger.warning("PIL (Pillow) not available. Install with: pip install Pillow")

try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False
    logger.warning("PyMuPDF not available. Install with: pip install PyMuPDF")

try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False
    logger.warning("pdfplumber not available. Install with: pip install pdfplumber")

try:
    import PyPDF2
    PYPDF2_AVAILABLE = True
except ImportError:
    PYPDF2_AVAILABLE = False
    logger.warning("PyPDF2 not available. Install with: pip install PyPDF2")

try:
    import easyocr
    EASYOCR_AVAILABLE = True
except ImportError:
    EASYOCR_AVAILABLE = False
    logger.warning("EasyOCR not available. Install with: pip install easyocr")

class UnifiedOCRProcessor:
    """Unified OCR processor using Mistral AI as primary method with PyMuPDF"""
    
    def __init__(self):
        self.mistral_api_key = os.getenv("MISTRAL_API_KEY")
        self.mistral_api_url = "https://api.mistral.ai/v1/chat/completions"
        
        # Configure available methods in priority order
        self.ocr_methods = []
        
        if self.mistral_api_key:
            self.ocr_methods.append("mistral")
            logger.info("[SUCCESS] Mistral OCR configured as primary method")
        
        if EASYOCR_AVAILABLE:
            self.ocr_methods.append("easyocr")
            logger.info("✅ EasyOCR available as fallback")
            
        logger.info(f"[TOOLS] OCR methods available: {', '.join(self.ocr_methods)}")

    def extract_text(self, file_path: Union[str, Path], use_ocr: bool = True) -> Dict[str, Any]:
        """
        Main text extraction method - intelligently chooses between text extraction and OCR
        
        Args:
            file_path: Path to document file
            use_ocr: Whether to use OCR for scanned documents
            
        Returns:
            Dictionary with extracted text and metadata
        """
        file_path = Path(file_path)
        
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        result = {
            "text": "",
            "pages_processed": 0,
            "ocr_used": False,
            "ocr_method": "none",
            "errors": [],
            "confidence_scores": []
        }
        
        try:
            file_ext = file_path.suffix.lower()
            
            if file_ext == '.pdf':
                return self._extract_from_pdf(file_path, use_ocr, result)
            elif file_ext in ['.xlsx', '.xls']:
                return self._extract_from_excel(file_path, result)
            elif file_ext in ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']:
                if use_ocr:
                    return self._extract_from_image(file_path, result)
                else:
                    result["errors"].append("Image file requires OCR processing")
                    return result
            else:
                result["errors"].append(f"Unsupported file format: {file_ext}")
                return result
                
        except Exception as e:
            result["errors"].append(f"Text extraction failed: {str(e)}")
            logger.error(f"Text extraction error for {file_path}: {str(e)}")
            return result

    def _extract_from_pdf(self, pdf_path: Path, use_ocr: bool, result: Dict[str, Any]) -> Dict[str, Any]:
        """Extract text from PDF using text extraction first, OCR if needed"""
        
        # First try regular text extraction
        text_content = self._extract_pdf_text(pdf_path)
        
        if self._is_meaningful_text(text_content):
            result["text"] = text_content
            result["pages_processed"] = "all"
            logger.info("[SUCCESS] PDF text extracted without OCR")
            return result
        
        # PDF appears to be scanned - use OCR if enabled
        if use_ocr and self.ocr_methods:
            logger.info("🔍 PDF appears scanned, using OCR")
            return self._extract_with_ocr(pdf_path, result)
        else:
            result["text"] = text_content  # Return whatever we got
            result["errors"].append("PDF appears to be scanned but OCR is disabled")
            return result

    def _extract_pdf_text(self, pdf_path: Path) -> str:
        """Extract text from PDF using available libraries"""
        text_content = []
        
        # Try PyMuPDF first (fastest and most accurate)
        if PYMUPDF_AVAILABLE:
            try:
                doc = fitz.open(str(pdf_path))
                for page in doc:
                    page_text = page.get_text()
                    if page_text.strip():
                        text_content.append(page_text)
                doc.close()
                
                if text_content:
                    logger.debug("✅ Text extracted using PyMuPDF")
                    return '\n'.join(text_content)
            except Exception as e:
                logger.debug(f"PyMuPDF extraction failed: {str(e)}")
        
        # Fallback to pdfplumber
        if PDFPLUMBER_AVAILABLE:
            try:
                with pdfplumber.open(pdf_path) as pdf:
                    for page in pdf.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text_content.append(page_text)
                
                if text_content:
                    logger.debug("✅ Text extracted using pdfplumber")
                    return '\n'.join(text_content)
            except Exception as e:
                logger.debug(f"pdfplumber extraction failed: {str(e)}")
        
        # Final fallback to PyPDF2
        if PYPDF2_AVAILABLE:
            try:
                with open(pdf_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    for page in pdf_reader.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text_content.append(page_text)
                
                if text_content:
                    logger.debug("✅ Text extracted using PyPDF2")
                    return '\n'.join(text_content)
            except Exception as e:
                logger.debug(f"PyPDF2 extraction failed: {str(e)}")
        
        return '\n'.join(text_content)

    def _extract_from_excel(self, excel_path: Path, result: Dict[str, Any]) -> Dict[str, Any]:
        """Extract text from Excel files"""
        try:
            import pandas as pd
            import openpyxl
            
            # Determine engine
            engine = 'openpyxl' if excel_path.suffix.lower() == '.xlsx' else 'xlrd'
            
            # Read all sheets
            all_sheets = pd.read_excel(excel_path, sheet_name=None, engine=engine)
            
            text_parts = []
            for sheet_name, df in all_sheets.items():
                text_parts.append(f"=== Sheet: {sheet_name} ===")
                
                # Convert DataFrame to text
                for col in df.columns:
                    text_parts.append(f"Column: {col}")
                    for value in df[col].dropna():
                        text_parts.append(str(value))
            
            result["text"] = '\n'.join(text_parts)
            result["pages_processed"] = len(all_sheets)
            logger.info(f"✅ Excel text extracted from {len(all_sheets)} sheets")
            
        except Exception as e:
            result["errors"].append(f"Excel extraction failed: {str(e)}")
            logger.error(f"Excel extraction error: {str(e)}")
        
        return result

    def _extract_with_ocr(self, pdf_path: Path, result: Dict[str, Any]) -> Dict[str, Any]:
        """Extract text using OCR methods"""
        
        # Convert PDF to images first
        try:
            images = self._convert_pdf_to_images(pdf_path)
        except Exception as e:
            result["errors"].append(f"PDF to image conversion failed: {str(e)}")
            return result
        
        # Try Mistral OCR first
        if "mistral" in self.ocr_methods:
            try:
                return self._extract_with_mistral_ocr(images, result)
            except Exception as e:
                logger.warning(f"Mistral OCR failed: {str(e)}")
        
        # Fallback to EasyOCR
        if "easyocr" in self.ocr_methods:
            try:
                return self._extract_with_easyocr(images, result)
            except Exception as e:
                logger.warning(f"EasyOCR failed: {str(e)}")
        
        result["errors"].append("All OCR methods failed")
        return result

    def _convert_pdf_to_images(self, pdf_path: Path):
        """Convert PDF to images using PyMuPDF"""
        if not PYMUPDF_AVAILABLE:
            raise Exception("PyMuPDF not available for PDF to image conversion")
        
        images = []
        doc = fitz.open(str(pdf_path))
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            mat = fitz.Matrix(2.0, 2.0)  # High resolution
            pix = page.get_pixmap(matrix=mat)
            
            # Convert to PIL Image
            if PIL_AVAILABLE:
                img_data = pix.tobytes("ppm")
                pil_image = Image.open(io.BytesIO(img_data))
                images.append(pil_image)
            else:
                # Save as temporary file
                temp_path = Path(tempfile.mktemp(suffix='.png'))
                pix.save(str(temp_path))
                images.append(temp_path)
        
        doc.close()
        logger.info(f"✅ Converted {len(images)} pages to images")
        return images

    def _extract_with_mistral_ocr(self, images, result: Dict[str, Any]) -> Dict[str, Any]:
        """Extract text using Mistral Vision API"""
        
        extracted_texts = []
        confidence_scores = []
        
        for i, image in enumerate(images):
            try:
                # Convert image to base64
                if isinstance(image, Path):
                    with open(image, 'rb') as f:
                        image_data = f.read()
                else:
                    # PIL Image
                    buffer = io.BytesIO()
                    image.save(buffer, format='PNG')
                    image_data = buffer.getvalue()
                
                base64_image = base64.b64encode(image_data).decode('utf-8')
                
                # Prepare Mistral API request
                headers = {
                    "Authorization": f"Bearer {self.mistral_api_key}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "model": "pixtral-12b-2409",
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": "Extract all text from this image. Provide only the extracted text without any additional commentary or formatting."
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/png;base64,{base64_image}"
                                    }
                                }
                            ]
                        }
                    ],
                    "temperature": 0.1,
                    "max_tokens": 4000
                }
                
                response = requests.post(
                    self.mistral_api_url,
                    headers=headers,
                    json=payload,
                    timeout=30
                )
                
                if response.status_code == 200:
                    response_data = response.json()
                    text = response_data['choices'][0]['message']['content']
                    extracted_texts.append(text)
                    confidence_scores.append(0.95)  # High confidence for Mistral
                    logger.debug(f"✅ Mistral OCR processed page {i+1}")
                else:
                    logger.error(f"Mistral API error: {response.status_code} - {response.text}")
                    extracted_texts.append("")
                    confidence_scores.append(0.0)
                    
            except Exception as e:
                logger.error(f"Mistral OCR error on page {i+1}: {str(e)}")
                extracted_texts.append("")
                confidence_scores.append(0.0)
        
        result["text"] = '\n'.join(extracted_texts)
        result["pages_processed"] = len(images)
        result["ocr_used"] = True
        result["ocr_method"] = "mistral"
        result["confidence_scores"] = confidence_scores
        
        logger.info(f"✅ Mistral OCR completed for {len(images)} pages")
        return result

    def _extract_with_easyocr(self, images, result: Dict[str, Any]) -> Dict[str, Any]:
        """Extract text using EasyOCR as fallback"""
        
        if not EASYOCR_AVAILABLE:
            result["errors"].append("EasyOCR not available")
            return result
        
        try:
            reader = easyocr.Reader(['en'], gpu=False)
            extracted_texts = []
            confidence_scores = []
            
            for i, image in enumerate(images):
                try:
                    if isinstance(image, Path):
                        ocr_result = reader.readtext(str(image))
                    else:
                        # Convert PIL Image to numpy array
                        import numpy as np
                        image_array = np.array(image)
                        ocr_result = reader.readtext(image_array)
                    
                    # Extract text and confidence scores
                    page_text = []
                    page_confidences = []
                    
                    for (bbox, text, confidence) in ocr_result:
                        if confidence > 0.5:  # Filter low confidence results
                            page_text.append(text)
                            page_confidences.append(confidence)
                    
                    extracted_texts.append(' '.join(page_text))
                    confidence_scores.append(np.mean(page_confidences) if page_confidences else 0.0)
                    
                except Exception as e:
                    logger.error(f"EasyOCR error on page {i+1}: {str(e)}")
                    extracted_texts.append("")
                    confidence_scores.append(0.0)
            
            result["text"] = '\n'.join(extracted_texts)
            result["pages_processed"] = len(images)
            result["ocr_used"] = True
            result["ocr_method"] = "easyocr"
            result["confidence_scores"] = confidence_scores
            
            logger.info(f"✅ EasyOCR completed for {len(images)} pages")
            
        except Exception as e:
            result["errors"].append(f"EasyOCR processing failed: {str(e)}")
        
        return result

    def _extract_from_image(self, image_path: Path, result: Dict[str, Any]) -> Dict[str, Any]:
        """Extract text from image file"""
        
        if "mistral" in self.ocr_methods:
            try:
                return self._extract_with_mistral_ocr([image_path], result)
            except Exception as e:
                logger.warning(f"Mistral OCR failed for image: {str(e)}")
        
        if "easyocr" in self.ocr_methods:
            try:
                return self._extract_with_easyocr([image_path], result)
            except Exception as e:
                logger.warning(f"EasyOCR failed for image: {str(e)}")
        
        result["errors"].append("No OCR method available for image processing")
        return result

    def _is_meaningful_text(self, text: str, min_words: int = 20) -> bool:
        """Check if extracted text is meaningful"""
        if not text or len(text.strip()) < 50:
            return False
        
        words = text.split()
        if len(words) < min_words:
            return False
        
        # Check if text contains reasonable words
        reasonable_words = sum(1 for word in words if 2 <= len(word.strip('.,!?;:')) <= 20)
        word_ratio = reasonable_words / len(words) if words else 0
        
        return word_ratio > 0.5

    def get_status(self) -> Dict[str, Any]:
        """Get OCR processor status"""
        return {
            "ocr_methods": self.ocr_methods,
            "primary_method": self.ocr_methods[0] if self.ocr_methods else "none",
            "mistral_configured": bool(self.mistral_api_key),
            "pymupdf_available": PYMUPDF_AVAILABLE,
            "easyocr_available": EASYOCR_AVAILABLE,
            "pil_available": PIL_AVAILABLE
        }