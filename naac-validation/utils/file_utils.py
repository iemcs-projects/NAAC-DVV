import os
import pandas as pd
import PyPDF2
import pdfplumber
from pathlib import Path
from typing import Dict, Any, List, Optional, Union
import logging


logger = logging.getLogger(__name__)

class FileProcessor:
    """Utility class for processing different file types"""
    
    @staticmethod
    def extract_pdf_text(pdf_path: Union[str, Path], method: str = "pdfplumber") -> str:
        """
        Extract text from PDF file
        
        Args:
            pdf_path: Path to PDF file
            method: Method to use ('pdfplumber' or 'pypdf2')
        
        Returns:
            Extracted text content
        """
        pdf_path = Path(pdf_path)
        
        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")
        
        try:
            if method == "pdfplumber":
                return FileProcessor._extract_with_pdfplumber(pdf_path)
            else:
                return FileProcessor._extract_with_pypdf2(pdf_path)
        
        except Exception as e:
            logger.error(f"Error extracting text from PDF {pdf_path}: {str(e)}")
            raise
    
    @staticmethod
    def _extract_with_pdfplumber(pdf_path: Path) -> str:
        """Extract text using pdfplumber (better for complex layouts)"""
        text_content = []
        
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_content.append(page_text)
        
        return "\n".join(text_content)
    
    @staticmethod
    def _extract_with_pypdf2(pdf_path: Path) -> str:
        """Extract text using PyPDF2"""
        text_content = []
        
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_content.append(page_text)
        
        return "\n".join(text_content)
    
    @staticmethod
    def read_excel_file(excel_path: Union[str, Path], sheet_name: Optional[str] = None) -> pd.DataFrame:
        """
        Read Excel file and return DataFrame
        
        Args:
            excel_path: Path to Excel file
            sheet_name: Specific sheet name to read (None for first sheet)
        
        Returns:
            DataFrame with Excel data
        """
        excel_path = Path(excel_path)
        
        if not excel_path.exists():
            raise FileNotFoundError(f"Excel file not found: {excel_path}")
        
        try:
            # Determine file type
            if excel_path.suffix.lower() == '.xlsx':
                engine = 'openpyxl'
            else:
                engine = 'xlrd'
            
            df = pd.read_excel(
                excel_path, 
                sheet_name=sheet_name, 
                engine=engine
            )
            
            # Clean column names (remove extra spaces, etc.)
            df.columns = df.columns.str.strip()
            
            return df
            
        except Exception as e:
            logger.error(f"Error reading Excel file {excel_path}: {str(e)}")
            raise
    
    @staticmethod
    def get_excel_sheet_names(excel_path: Union[str, Path]) -> List[str]:
        """Get all sheet names from Excel file"""
        excel_path = Path(excel_path)
        
        try:
            if excel_path.suffix.lower() == '.xlsx':
                engine = 'openpyxl'
            else:
                engine = 'xlrd'
            
            # Read only to get sheet names
            excel_file = pd.ExcelFile(excel_path, engine=engine)
            return excel_file.sheet_names
            
        except Exception as e:
            logger.error(f"Error getting sheet names from {excel_path}: {str(e)}")
            return []
    
    @staticmethod
    def validate_excel_structure(df: pd.DataFrame, required_columns: List[str]) -> Dict[str, Any]:
        """
        Validate Excel DataFrame structure
        
        Args:
            df: DataFrame to validate
            required_columns: List of required column names
        
        Returns:
            Validation result with missing columns and basic stats
        """
        result = {
            "is_valid": True,
            "errors": [],
            "warnings": [],
            "stats": {
                "total_rows": len(df),
                "total_columns": len(df.columns),
                "empty_rows": df.isnull().all(axis=1).sum(),
                "columns_found": list(df.columns)
            }
        }
        
        # Check for required columns
        missing_columns = []
        for col in required_columns:
            if col not in df.columns:
                # Try case-insensitive match
                col_lower = col.lower()
                found = False
                for df_col in df.columns:
                    if df_col.lower() == col_lower:
                        found = True
                        result["warnings"].append(f"Column '{col}' found as '{df_col}' (case mismatch)")
                        break
                
                if not found:
                    missing_columns.append(col)
        
        if missing_columns:
            result["is_valid"] = False
            result["errors"].append(f"Missing required columns: {missing_columns}")
        
        # Check for completely empty DataFrame
        if len(df) == 0:
            result["is_valid"] = False
            result["errors"].append("Excel file is empty (no data rows)")
        
        # Check for too many empty rows
        empty_ratio = result["stats"]["empty_rows"] / len(df) if len(df) > 0 else 1
        if empty_ratio > 0.5:
            result["warnings"].append(f"High percentage of empty rows: {empty_ratio:.1%}")
        
        return result
    
    @staticmethod
    def clean_excel_data(df: pd.DataFrame) -> pd.DataFrame:
        """Clean common issues in Excel data"""
        # Create a copy to avoid modifying original
        cleaned_df = df.copy()
        
        # Remove completely empty rows
        cleaned_df = cleaned_df.dropna(how='all')
        
        # Strip whitespace from string columns
        for col in cleaned_df.columns:
            if cleaned_df[col].dtype == 'object':
                cleaned_df[col] = cleaned_df[col].astype(str).str.strip()
                # Replace 'nan' strings with actual NaN
                cleaned_df[col] = cleaned_df[col].replace('nan', pd.NA)
        
        # Reset index after removing rows
        cleaned_df = cleaned_df.reset_index(drop=True)
        
        return cleaned_df
    
    @staticmethod
    def get_file_metadata(file_path: Union[str, Path]) -> Dict[str, Any]:
        """Get comprehensive file metadata"""
        file_path = Path(file_path)
        
        if not file_path.exists():
            return {"error": "File does not exist"}
        
        try:
            stat = file_path.stat()
            metadata = {
                "file_name": file_path.name,
                "file_extension": file_path.suffix.lower(),
                "file_size_bytes": stat.st_size,
                "file_size_mb": round(stat.st_size / (1024*1024), 4),
                "created_timestamp": stat.st_ctime,
                "modified_timestamp": stat.st_mtime,
                "is_readable": os.access(file_path, os.R_OK),
                "is_writable": os.access(file_path, os.W_OK),
            }
            
            # Add file-type specific metadata
            if file_path.suffix.lower() == '.pdf':
                metadata.update(FileProcessor._get_pdf_metadata(file_path))
            elif file_path.suffix.lower() in ['.xlsx', '.xls']:
                metadata.update(FileProcessor._get_excel_metadata(file_path))
            
            return metadata
            
        except Exception as e:
            return {"error": f"Could not get file metadata: {str(e)}"}
    
    @staticmethod
    def _get_pdf_metadata(pdf_path: Path) -> Dict[str, Any]:
        """Get PDF-specific metadata"""
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                metadata = {
                    "pdf_pages": len(pdf_reader.pages),
                    "pdf_encrypted": pdf_reader.is_encrypted,
                }
                
                # Try to get PDF info
                if pdf_reader.metadata:
                    info = pdf_reader.metadata
                    metadata.update({
                        "pdf_title": info.get('/Title', ''),
                        "pdf_author": info.get('/Author', ''),
                        "pdf_creator": info.get('/Creator', ''),
                        "pdf_producer": info.get('/Producer', ''),
                    })
                
                return metadata
                
        except Exception as e:
            return {"pdf_error": f"Could not read PDF metadata: {str(e)}"}
    
    @staticmethod
    def _get_excel_metadata(excel_path: Path) -> Dict[str, Any]:
        """Get Excel-specific metadata"""
        try:
            # Get sheet names
            sheet_names = FileProcessor.get_excel_sheet_names(excel_path)
            
            metadata = {
                "excel_sheets": sheet_names,
                "excel_sheet_count": len(sheet_names),
            }
            
            # Get basic info from first sheet
            if sheet_names:
                try:
                    df = FileProcessor.read_excel_file(excel_path, sheet_names[0])
                    metadata.update({
                        "excel_rows": len(df),
                        "excel_columns": len(df.columns),
                        "excel_column_names": list(df.columns)
                    })
                except:
                    pass
            
            return metadata
            
            
        except Exception as e:
            return {"excel_error": f"Could not read Excel metadata: {str(e)}"}