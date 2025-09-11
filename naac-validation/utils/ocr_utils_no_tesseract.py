"""
OCR utilities without Tesseract dependency
Provides multiple alternatives for text extraction from images and scanned PDFs
"""

import logging
from pathlib import Path
from typing import Union, Dict, Any, Optional
import tempfile
import os

from config.settings import settings

logger = logging.getLogger(__name__)

class OCRProcessor:
    """OCR processing utilities using cloud services or python-only libraries"""
    
    def __init__(self, ocr_method: str = "text_only"):
        """
        Initialize OCR processor
        
        Args:
            ocr_method: 'text_only', 'easyocr', 'cloud' (requires API keys)
        """
        self.ocr_method = ocr_method
        self.ocr_available = False
        
        # Try to initialize selected OCR method
        self._initialize_ocr_method()
    
    def _initialize_ocr_method(self):
        """Initialize the selected OCR method"""
        if self.ocr_method == "text_only":
            self.ocr_available = True  # Always available
            logger.info("OCR disabled - using text-only extraction")
            
        elif self.ocr_method == "easyocr":
            try:
                import easyocr
                self.easyocr_reader = easyocr.Reader(['en'], gpu=False)
                self.ocr_available = True
                logger.info("EasyOCR initialized successfully")
            except ImportError:
                logger.warning("EasyOCR not available. Install with: pip install easyocr")
                self.ocr_method = "text_only"
                self.ocr_available = True
                
        elif self.ocr_method == "paddleocr":
            try:
                from paddleocr import PaddleOCR
                self.paddle_ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
                self.ocr_available = True
                logger.info("PaddleOCR initialized successfully")
            except ImportError:
                logger.warning("PaddleOCR not available. Install with: pip install paddlepaddle paddleocr")
                self.ocr_method = "text_only"
                self.ocr_available = True
                
        elif self.ocr_method == "cloud":
            # Check for cloud API keys
            google_key = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
            azure_key = os.getenv("AZURE_COMPUTER_VISION_KEY")
            aws_key = os.getenv("AWS_ACCESS_KEY_ID")
            
            if google_key or azure_key or aws_key:
                self.ocr_available = True
                logger.info("Cloud OCR configured")
            else:
                logger.warning("No cloud OCR credentials found")
                self.ocr_method = "text_only"
                self.ocr_available = True
    
    def extract_text_from_pdf(self, pdf_path: Union[str, Path], 
                             use_ocr: bool = True, 
                             pages: Optional[list] = None) -> Dict[str, Any]:
        """
        Extract text from PDF - intelligently handles text-based vs scanned PDFs
        
        Args:
            pdf_path: Path to PDF file
            use_ocr: Whether to attempt OCR for scanned PDFs
            pages: Specific pages to process (None for all pages)
        
        Returns:
            Dictionary with extracted text and metadata
        """
        pdf_path = Path(pdf_path)
        
        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")
        
        result = {
            "text": "",
            "pages_processed": 0,
            "ocr_used": False,
            "method": "text_extraction",
            "errors": [],
            "confidence_scores": []
        }
        
        try:
            # First, try regular text extraction
            text = self._extract_text_from_pdf_advanced(pdf_path)
            
            if self._is_meaningful_text(text):
                # Good text extraction - no OCR needed
                result["text"] = text
                result["method"] = "pdf_text_extraction"
                result["pages_processed"] = "all"
                logger.info("Successfully extracted text from PDF without OCR")
                
            elif use_ocr and self.ocr_available and self.ocr_method != "text_only":
                # Try OCR for scanned PDF
                logger.info(f"PDF appears to be scanned, attempting OCR with {self.ocr_method}")
                ocr_result = self._extract_with_ocr(pdf_path, pages)
                result.update(ocr_result)
                result["ocr_used"] = True
                
            else:
                # No OCR available or requested - return what we have
                result["text"] = text
                result["method"] = "limited_text_extraction"
                if not self._is_meaningful_text(text):
                    result["errors"].append("PDF appears to be scanned but OCR is not available")
                    logger.warning("Scanned PDF detected but OCR not available")
        
        except Exception as e:
            error_msg = f"Error extracting text from PDF: {str(e)}"
            result["errors"].append(error_msg)
            logger.error(error_msg)
        
        return result
    
    def _extract_text_from_pdf_advanced(self, pdf_path: Path) -> str:
        """Advanced PDF text extraction using multiple methods"""
        text_content = []
        
        # Method 1: Try PyMuPDF (fastest and most accurate)
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(pdf_path)
            for page in doc:
                page_text = page.get_text()
                if page_text.strip():
                    text_content.append(page_text)
            doc.close()
            
            if text_content:
                logger.debug("Successfully extracted text using PyMuPDF")
                return '\n'.join(text_content)
        except ImportError:
            logger.debug("PyMuPDF not available, trying pdfplumber")
        except Exception as e:
            logger.debug(f"PyMuPDF extraction failed: {str(e)}")
        
        # Method 2: Try pdfplumber
        try:
            import pdfplumber
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text and page_text.strip():
                        text_content.append(page_text)
            
            if text_content:
                logger.debug("Successfully extracted text using pdfplumber")
                return '\n'.join(text_content)
        except Exception as e:
            logger.debug(f"pdfplumber extraction failed: {str(e)}")
        
        # Method 3: Fallback to PyPDF2
        try:
            import PyPDF2
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text and page_text.strip():
                        text_content.append(page_text)
            
            if text_content:
                logger.debug("Successfully extracted text using PyPDF2")
                return '\n'.join(text_content)
        except Exception as e:
            logger.debug(f"PyPDF2 extraction failed: {str(e)}")
        
        return '\n'.join(text_content)
    
    def _is_meaningful_text(self, text: str, min_words: int = 20) -> bool:
        """Check if extracted text is meaningful (not just garbage characters)"""
        if not text or len(text.strip()) < 50:
            return False
        
        words = text.split()
        if len(words) < min_words:
            return False
        
        # Check if text contains reasonable English words
        # Simple heuristic: most words should be reasonable length
        reasonable_words = sum(1 for word in words if 2 <= len(word.strip('.,!?;:')) <= 20)
        word_ratio = reasonable_words / len(words) if words else 0
        
        return word_ratio > 0.5
    
    def _extract_with_ocr(self, pdf_path: Path, pages: Optional[list] = None) -> Dict[str, Any]:
        """Extract text using OCR methods"""
        result = {
            "text": "",
            "pages_processed": 0,
            "method": f"ocr_{self.ocr_method}",
            "errors": [],
            "confidence_scores": []
        }
        
        try:
            if self.ocr_method == "easyocr":
                result = self._extract_with_easyocr(pdf_path, pages, result)
            elif self.ocr_method == "paddleocr":
                result = self._extract_with_paddleocr(pdf_path, pages, result)
            elif self.ocr_method == "cloud":
                result = self._extract_with_cloud_ocr(pdf_path, pages, result)
            else:
                result["errors"].append(f"Unknown OCR method: {self.ocr_method}")
        
        except Exception as e:
            error_msg = f"OCR extraction failed: {str(e)}"
            result["errors"].append(error_msg)
            logger.error(error_msg)
        
        return result
    
    def _extract_with_easyocr(self, pdf_path: Path, pages: Optional[list], result: Dict[str, Any]) -> Dict[str, Any]:
        """Extract text using EasyOCR"""
        try:
            from pdf2image import convert_from_path
            
            # Convert PDF to images
            with tempfile.TemporaryDirectory() as temp_dir:
                images = convert_from_path(
                    pdf_path,
                    first_page=pages[0] if pages else None,
                    last_page=pages[-1] if pages else None,
                    output_folder=temp_dir
                )
                
                extracted_texts = []
                
                for i, image in enumerate(images):
                    try:
                        # Save image temporarily
                        temp_image_path = Path(temp_dir) / f"page_{i}.jpg"
                        image.save(temp_image_path)
                        
                        # Extract text
                        ocr_results = self.easyocr_reader.readtext(str(temp_image_path))
                        page_text = ' '.join([result[1] for result in ocr_results])
                        
                        if page_text.strip():
                            extracted_texts.append(page_text)
                        
                        # Calculate confidence
                        confidences = [result[2] for result in ocr_results if result[2] > 0]
                        if confidences:
                            avg_confidence = sum(confidences) / len(confidences) * 100
                            result["confidence_scores"].append(avg_confidence)
                        
                        result["pages_processed"] += 1
                        
                    except Exception as e:
                        result["errors"].append(f"Error processing page {i+1}: {str(e)}")
                
                result["text"] = '\n\n'.join(extracted_texts)
        
        except ImportError:
            result["errors"].append("pdf2image not available for EasyOCR")
        except Exception as e:
            result["errors"].append(f"EasyOCR processing failed: {str(e)}")
        
        return result
    
    def _extract_with_paddleocr(self, pdf_path: Path, pages: Optional[list], result: Dict[str, Any]) -> Dict[str, Any]:
        """Extract text using PaddleOCR"""
        # Similar implementation to EasyOCR but using PaddleOCR
        try:
            from pdf2image import convert_from_path
            
            with tempfile.TemporaryDirectory() as temp_dir:
                images = convert_from_path(pdf_path, output_folder=temp_dir)
                
                extracted_texts = []
                
                for i, image in enumerate(images):
                    temp_image_path = Path(temp_dir) / f"page_{i}.jpg"
                    image.save(temp_image_path)
                    
                    ocr_results = self.paddle_ocr.ocr(str(temp_image_path), cls=True)
                    
                    if ocr_results and ocr_results[0]:
                        page_text = ' '.join([line[1][0] for line in ocr_results[0]])
                        if page_text.strip():
                            extracted_texts.append(page_text)
                        
                        # Calculate confidence
                        confidences = [line[1][1] for line in ocr_results[0] if line[1][1] > 0]
                        if confidences:
                            avg_confidence = sum(confidences) / len(confidences) * 100
                            result["confidence_scores"].append(avg_confidence)
                    
                    result["pages_processed"] += 1
                
                result["text"] = '\n\n'.join(extracted_texts)
        
        except Exception as e:
            result["errors"].append(f"PaddleOCR processing failed: {str(e)}")
        
        return result
    
    def _extract_with_cloud_ocr(self, pdf_path: Path, pages: Optional[list], result: Dict[str, Any]) -> Dict[str, Any]:
        """Extract text using cloud OCR services"""
        result["errors"].append("Cloud OCR not implemented in this version")
        return result
    
    def is_scanned_pdf(self, pdf_path: Union[str, Path]) -> bool:
        """
        Determine if PDF is scanned (image-based) or text-based
        """
        try:
            text = self._extract_text_from_pdf_advanced(Path(pdf_path))
            return not self._is_meaningful_text(text, min_words=10)
        except Exception:
            return True  # Assume scanned if we can't determine
    
    def get_ocr_info(self) -> Dict[str, Any]:
        """Get OCR configuration and system information"""
        return {
            "ocr_method": self.ocr_method,
            "ocr_available": self.ocr_available,
            "supported_methods": ["text_only", "easyocr", "paddleocr", "cloud"],
            "current_capabilities": {
                "text_extraction": True,
                "ocr_processing": self.ocr_available and self.ocr_method != "text_only",
                "cloud_ocr": self.ocr_method == "cloud"
            }
            
        }