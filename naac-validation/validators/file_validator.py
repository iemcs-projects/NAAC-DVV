import os
import mimetypes
from pathlib import Path
from typing import Union, List, Optional
import validators
import magic

from .base_validator import BaseValidator, ValidationResult
from config.settings import settings

class FileValidator(BaseValidator):
    """Validator for basic file validation checks"""
    
    def __init__(self):
        super().__init__()
        self.file_rules = self.validation_rules.get("file_validation", {})
        
        
        # MIME type mapping for better validation
        self.mime_type_mapping = {
            'application/pdf': ['pdf'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
            'application/vnd.ms-excel': ['xls'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
            'application/msword': ['doc'],
        }
    
    def validate(self, file_path: Union[str, Path], file_type: str = "general") -> ValidationResult:
        """
        Validate a file based on basic criteria
        
        Args:
            file_path: Path to the file
            file_type: Type of file (sanction_letter, data_template, etc.)
        """
        result = ValidationResult()
        file_path = Path(file_path)
        
        try:
            # Check if it's actually a file path (not a URL)
            self._validate_not_link(str(file_path), result)
            
            # Check file existence
            self._validate_file_exists(file_path, result)
            
            if not result.is_valid:
                return result
            
            # Check file size
            self._validate_file_size(file_path, result)
            
            # Check file extension and MIME type
            self._validate_file_format(file_path, result, file_type)
            
            # Check if file is readable and not corrupted
            self._validate_file_integrity(file_path, result)
            
            # Log validation result
            self._log_validation("FileValidator", result, file_path=str(file_path))
            
        except Exception as e:
            result.add_error(f"Unexpected error during file validation: {str(e)}")
            self.logger.error(f"File validation error for {file_path}: {str(e)}")
        
        return result
    
    def _validate_not_link(self, file_path: str, result: ValidationResult):
        """Check if the provided path is not a URL"""
        if validators.url(file_path):
            result.add_error("File path cannot be a URL/link. Please provide a local file path.")
        
        # Additional check for common URL patterns
        url_patterns = ['http://', 'https://', 'ftp://', 'www.']
        if any(pattern in file_path.lower() for pattern in url_patterns):
            result.add_error("File path appears to be a URL. Please provide a local file path.")
    
    def _validate_file_exists(self, file_path: Path, result: ValidationResult):
        """Check if file exists and is actually a file"""
        if not file_path.exists():
            result.add_error(f"File does not exist: {file_path}")
            return
        
        if not file_path.is_file():
            result.add_error(f"Path is not a file: {file_path}")
    
    def _validate_file_size(self, file_path: Path, result: ValidationResult):
        """Validate file size constraints"""
        try:
            file_size = file_path.stat().st_size
            
            # Check minimum size
            min_size = self.file_rules.get("min_size_bytes", settings.MIN_FILE_SIZE_BYTES)
            if file_size < min_size:
                result.add_error(f"File is too small. Minimum size: {min_size} bytes, actual: {file_size} bytes")
            
            # Check maximum size
            max_size = settings.MAX_FILE_SIZE_BYTES
            if file_size > max_size:
                result.add_error(f"File exceeds maximum size limit. Maximum: {settings.MAX_FILE_SIZE_MB}MB, actual: {file_size / (1024*1024):.2f}MB")
            
            # Add file size to extracted data
            result.extracted_data['file_size_bytes'] = file_size
            result.extracted_data['file_size_mb'] = round(file_size / (1024*1024), 2)
            
            
        except Exception as e:
            result.add_error(f"Could not determine file size: {str(e)}")
    
    def _validate_file_format(self, file_path: Path, result: ValidationResult, file_type: str):
        """Validate file format/extension"""
        file_extension = file_path.suffix.lower().lstrip('.')
        
        # Get allowed formats for this file type
        allowed_formats = self._get_allowed_formats(file_type)
        
        if file_extension not in allowed_formats:
            result.add_error(f"Invalid file format: .{file_extension}. Allowed formats: {allowed_formats}")
        
        # Check forbidden extensions
        forbidden_extensions = self.file_rules.get("forbidden_extensions", [])
        if f".{file_extension}" in forbidden_extensions:
            result.add_error(f"File format .{file_extension} is not allowed for security reasons")
        
        # Validate MIME type
        self._validate_mime_type(file_path, file_extension, result)
        
        result.extracted_data['file_extension'] = file_extension
    
    def _get_allowed_formats(self, file_type: str) -> List[str]:
        """Get allowed file formats for specific file type"""
        required_types = self.file_rules.get("required_file_types", {})
        
        if file_type in required_types:
            return required_types[file_type]
        
        # Default allowed formats
        return self.file_rules.get("allowed_formats", settings.ALLOWED_FILE_TYPES)
    
    def _validate_mime_type(self, file_path: Path, expected_extension: str, result: ValidationResult):
        """Validate file MIME type matches extension"""
        try:
            # Try to get MIME type using python-magic (more reliable)
            try:
                mime_type = magic.from_file(str(file_path), mime=True)
            except:
                # Fallback to mimetypes module
                mime_type, _ = mimetypes.guess_type(str(file_path))
            
            if mime_type:
                # Check if MIME type matches expected extension
                expected_extensions = self.mime_type_mapping.get(mime_type, [])
                
                if expected_extensions and expected_extension not in expected_extensions:
                    result.add_warning(f"File MIME type ({mime_type}) may not match extension (.{expected_extension})")
                
                result.extracted_data['mime_type'] = mime_type
            
        except Exception as e:
            result.add_warning(f"Could not verify file MIME type: {str(e)}")
    
    def _validate_file_integrity(self, file_path: Path, result: ValidationResult):
        """Basic file integrity check"""
        try:
            # Try to open and read first few bytes
            with open(file_path, 'rb') as f:
                first_bytes = f.read(1024)  # Read first 1KB
                
                if not first_bytes:
                    result.add_error("File appears to be empty or corrupted")
                    return
                
                # Basic checks for common file types
                file_extension = file_path.suffix.lower()
                
                if file_extension == '.pdf':
                    if not first_bytes.startswith(b'%PDF'):
                        result.add_warning("File may not be a valid PDF (missing PDF header)")
                
                elif file_extension in ['.xlsx', '.xls']:
                    # Excel files start with specific byte patterns
                    if file_extension == '.xlsx' and not (b'PK' in first_bytes[:10]):
                        result.add_warning("File may not be a valid Excel file")
                
                result.extracted_data['file_readable'] = True
                
        except PermissionError:
            result.add_error("Permission denied: Cannot read the file")
        except Exception as e:
            result.add_error(f"File integrity check failed: {str(e)}")
    
    def validate_multiple_files(self, file_paths: List[Union[str, Path]], 
                              file_types: List[str] = None) -> List[ValidationResult]:
        """Validate multiple files"""
        results = []
        file_types = file_types or ["general"] * len(file_paths)
        
        for i, file_path in enumerate(file_paths):
            file_type = file_types[i] if i < len(file_types) else "general"
            result = self.validate(file_path, file_type)
            results.append(result)
        
        return results
    
    def get_file_info(self, file_path: Union[str, Path]) -> dict:
        """Get detailed file information"""
        file_path = Path(file_path)
        
        if not file_path.exists():
            return {"error": "File does not exist"}
        
        try:
            stat = file_path.stat()
            return {
                "name": file_path.name,
                "extension": file_path.suffix.lower(),
                "size_bytes": stat.st_size,
                "size_mb": round(stat.st_size / (1024*1024), 2),
                "created": stat.st_ctime,
                "modified": stat.st_mtime,
                "is_file": file_path.is_file(),
                "is_readable": os.access(file_path, os.R_OK),
            }
        except Exception as e:
            return {"error": f"Could not get file info: {str(e)}"}