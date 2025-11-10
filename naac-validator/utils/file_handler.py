import os
from PyPDF2 import PdfReader

class FileHandler:
    def __init__(self):
        self.upload_folder = "uploads"
    
    def get_pdf_page_count(self, pdf_path):
        """Get number of pages in PDF"""
        try:
            with open(pdf_path, 'rb') as file:
                reader = PdfReader(file)
                return len(reader.pages)
        except Exception as e:
            print(f"Error reading PDF: {e}")
            return 0
    
    def file_exists(self, file_path):
        """Check if file exists"""
        return os.path.exists(file_path)
    
    def create_uploads_dir(self):
        """Create uploads directory if it doesn't exist"""
        if not os.path.exists(self.upload_folder):
            os.makedirs(self.upload_folder)