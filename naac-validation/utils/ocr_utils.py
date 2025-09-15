import pytesseract
from PIL import Image
from pdf2image import convert_from_path
from pathlib import Path
from typing import Union, List, Optional, Dict, Any
import logging
import tempfile
import os


from config.settings import settings

logger = logging.getLogger(__name__)

class OCRProcessor:
    """OCR processing utilities for extracting text from images and scanned PDFs"""
    
    def __init__(self):
        self.language = settings.OCR_LANGUAGE
        self.timeout = settings.OCR_TIMEOUT
        
        # Configure tesseract if needed
        self._configure_tesseract()
    
    def _configure_tesseract(self):
        """Configure tesseract executable path if needed"""
        try:
            # Test if tesseract is accessible
            pytesseract.get_tesseract_version()
        except Exception:
            # Try common installation paths
            possible_paths = [
                r'C:\Program Files\Tesseract-OCR\tesseract.exe',
                r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
                '/usr/bin/tesseract',
                '/usr/local/bin/tesseract',
                '/opt/homebrew/bin/tesseract'
            ]
            
            for path in possible_paths:
                if os.path.exists(path):
                    pytesseract.pytesseract.tesseract_cmd = path
                    logger.info(f"Tesseract found at: {path}")
                    break
            else:
                logger.warning("Tesseract OCR not found. OCR functionality may not work.")
    
    def extract_text_from_pdf(self, pdf_path: Union[str, Path], 
                             use_ocr: bool = True, 
                             pages: Optional[List[int]] = None) -> Dict[str, Any]:
        """
        Extract text from PDF using OCR
        
        Args:
            pdf_path: Path to PDF file
            use_ocr: Whether to use OCR for scanned PDFs
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
            "ocr_used": use_ocr,
            "errors": [],
            "confidence_scores": []
        }
        
        try:
            if use_ocr:
                result = self._extract_with_ocr(pdf_path, pages, result)
            else:
                # Use regular text extraction (implemented in file_utils.py)
                from utils.file_utils import FileProcessor
                result["text"] = FileProcessor.extract_pdf_text(pdf_path)
                result["pages_processed"] = "unknown"
        
        except Exception as e:
            error_msg = f"Error extracting text from PDF: {str(e)}"
            result["errors"].append(error_msg)
            logger.error(error_msg)
        
        return result
    
    def _extract_with_ocr(self, pdf_path: Path, pages: Optional[List[int]], result: Dict[str, Any]) -> Dict[str, Any]:
        """Extract text using OCR from PDF images"""
        try:
            # Convert PDF to images
            with tempfile.TemporaryDirectory() as temp_dir:
                images = convert_from_path(
                    pdf_path,
                    first_page=pages[0] if pages else None,
                    last_page=pages[-1] if pages else None,
                    output_folder=temp_dir,
                    fmt='jpeg',
                    jpegopt={'quality': 95}
                )
                
                extracted_texts = []
                confidence_scores = []
                
                for i, image in enumerate(images):
                    try:
                        # Extract text with confidence data
                        ocr_data = pytesseract.image_to_data(
                            image,
                            lang=self.language,
                            output_type=pytesseract.Output.DICT,
                            timeout=self.timeout
                        )
                        
                        # Extract text
                        page_text = pytesseract.image_to_string(
                            image,
                            lang=self.language,
                            timeout=self.timeout
                        )
                        
                        if page_text.strip():
                            extracted_texts.append(page_text)
                        
                        # Calculate confidence score for this page
                        confidences = [int(conf) for conf in ocr_data['conf'] if int(conf) > 0]
                        if confidences:
                            avg_confidence = sum(confidences) / len(confidences)
                            confidence_scores.append(avg_confidence)
                        
                        result["pages_processed"] += 1
                        
                    except Exception as e:
                        error_msg = f"Error processing page {i+1}: {str(e)}"
                        result["errors"].append(error_msg)
                        logger.warning(error_msg)
                
                result["text"] = "\n\n".join(extracted_texts)
                result["confidence_scores"] = confidence_scores
        
        except Exception as e:
            error_msg = f"Error in OCR processing: {str(e)}"
            result["errors"].append(error_msg)
            logger.error(error_msg)
        
        return result
    
    def extract_text_from_image(self, image_path: Union[str, Path]) -> Dict[str, Any]:
        """
        Extract text from image file
        
        Args:
            image_path: Path to image file
        
        Returns:
            Dictionary with extracted text and confidence data
        """
        image_path = Path(image_path)
        
        if not image_path.exists():
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        result = {
            "text": "",
            "confidence_score": 0.0,
            "word_count": 0,
            "errors": []
        }
        
        try:
            # Open and preprocess image
            image = Image.open(image_path)
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Extract text
            text = pytesseract.image_to_string(
                image,
                lang=self.language,
                timeout=self.timeout
            )
            
            # Get confidence data
            ocr_data = pytesseract.image_to_data(
                image,
                lang=self.language,
                output_type=pytesseract.Output.DICT,
                timeout=self.timeout
            )
            
            # Calculate confidence score
            confidences = [int(conf) for conf in ocr_data['conf'] if int(conf) > 0]
            if confidences:
                result["confidence_score"] = sum(confidences) / len(confidences)
            
            result["text"] = text.strip()
            result["word_count"] = len(text.split())
            
        except Exception as e:
            error_msg = f"Error extracting text from image: {str(e)}"
            result["errors"].append(error_msg)
            logger.error(error_msg)
        
        return result
    
    def preprocess_image(self, image: Image.Image) -> Image.Image:
        """
        Preprocess image to improve OCR accuracy
        
        Args:
            image: PIL Image object
        
        Returns:
            Preprocessed image
        """
        try:
            # Convert to grayscale
            if image.mode != 'L':
                image = image.convert('L')
            
            # You can add more preprocessing here:
            # - Noise removal
            # - Deskewing
            # - Contrast enhancement
            # - Binarization
            
            return image
            
        except Exception as e:
            logger.warning(f"Image preprocessing failed: {str(e)}")
            return image
    
    def is_scanned_pdf(self, pdf_path: Union[str, Path]) -> bool:
        """
        Determine if PDF is scanned (image-based) or text-based
        
        Args:
            pdf_path: Path to PDF file
        
        Returns:
            True if PDF appears to be scanned, False otherwise
        """
        try:
            from utils.file_utils import FileProcessor
            
            # Try to extract text normally
            text = FileProcessor.extract_pdf_text(pdf_path)
            
            # If very little text is extracted, it's likely scanned
            word_count = len(text.split())
            
            # Heuristic: if less than 10 words per page on average, consider it scanned
            # This is a simple heuristic and can be improved
            
            if word_count < 10:
                return True
            
            # Check for common indicators of scanned documents
            text_lower = text.lower()
            scanned_indicators = [
                'scanned', 'image', 'digitized', 'photocopy'
            ]
            
            if any(indicator in text_lower for indicator in scanned_indicators):
                return True
            
            return False
            
        except Exception as e:
            logger.warning(f"Could not determine if PDF is scanned: {str(e)}")
            return True  # Assume scanned if we can't determine
    
    def get_ocr_info(self) -> Dict[str, Any]:
        """Get OCR configuration and system information"""
        info = {
            "language": self.language,
            "timeout": self.timeout,
            "tesseract_available": False,
            "tesseract_version": None,
            "tesseract_path": None
        }
        
        try:
            info["tesseract_version"] = pytesseract.get_tesseract_version()
            info["tesseract_available"] = True
            info["tesseract_path"] = pytesseract.pytesseract.tesseract_cmd
            
        except Exception as e:
            info["error"] = str(e)
        
        
        return info