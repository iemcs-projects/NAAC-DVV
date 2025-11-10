import pytesseract
from PIL import Image
import PyPDF2
import cv2
import numpy as np

class OCRProcessor:
    def __init__(self):
        pass
    
    def extract_text_from_pdf_page(self, pdf_path, page_num):
        """Extract text from specific PDF page"""
        try:
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                page = reader.pages[page_num]
                text = page.extract_text()
                return text
        except Exception as e:
            print(f"Error extracting text from page {page_num}: {e}")
            return ""
    
    def extract_text_from_image(self, image_path):
        """Extract text from image using OCR"""
        try:
            image = Image.open(image_path)
            text = pytesseract.image_to_string(image)
            return text
        except Exception as e:
            print(f"Error extracting text from image: {e}")
            return ""