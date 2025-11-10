"""
Core processing modules for NAAC document validation
"""
from .ocr_processor import OCRProcessor
from .field_extractor import FieldExtractor
from .validator import DocumentValidator

__all__ = ['OCRProcessor', 'FieldExtractor', 'DocumentValidator']