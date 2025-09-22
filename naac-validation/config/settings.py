import os
import json
import logging
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging for Windows Unicode support
def setup_logging():
    """Setup logging configuration with Windows Unicode support"""
    log_level = os.getenv("LOG_LEVEL", "INFO")
    log_file = os.getenv("LOG_FILE", "naac_validation.log")
    
    # Create formatter without emojis for Windows compatibility
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # File handler with UTF-8 encoding
    file_handler = logging.FileHandler(log_file, encoding='utf-8')
    file_handler.setFormatter(formatter)
    
    # Console handler with safe encoding
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    
    # Configure root logger
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        handlers=[file_handler, console_handler],
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

# Setup logging
setup_logging()

class Settings:
    """Configuration settings for NAAC validation system"""
    
    
    # API Keys
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
    
    # File validation settings
    MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", 5))
    MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
    MIN_FILE_SIZE_BYTES = int(os.getenv("MIN_FILE_SIZE_BYTES", 1024))
    
    ALLOWED_FILE_TYPES = os.getenv("ALLOWED_FILE_TYPES", "pdf,xlsx,xls").split(",")
    
    # OCR settings
    OCR_LANGUAGE = os.getenv("OCR_LANGUAGE", "eng")
    OCR_TIMEOUT = int(os.getenv("OCR_TIMEOUT", 30))
    
    # Confidence thresholds
    CONFIDENCE_ACCEPT_THRESHOLD = float(os.getenv("CONFIDENCE_ACCEPT_THRESHOLD", 0.8))
    CONFIDENCE_FLAG_THRESHOLD = float(os.getenv("CONFIDENCE_FLAG_THRESHOLD", 0.5))
    
    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE = os.getenv("LOG_FILE", "naac_validation.log")
    
    # Project paths
    PROJECT_ROOT = Path(__file__).parent.parent
    CONFIG_DIR = PROJECT_ROOT / "config"
    
    @classmethod
    def load_validation_rules(cls):
        """Load validation rules from JSON file"""
        rules_file = cls.CONFIG_DIR / "validation_rules.json"
        if rules_file.exists():
            with open(rules_file, 'r') as f:
                return json.load(f)
        return {}
    
    @classmethod
    def validate_setup(cls):
        """Validate that all required settings are present"""
        errors = []
        
        if not cls.GROQ_API_KEY:
            errors.append("GROQ_API_KEY is not set in environment variables")
        
        if not cls.MISTRAL_API_KEY:
            errors.append("MISTRAL_API_KEY is not set in environment variables")
        
        if cls.MAX_FILE_SIZE_MB <= 0:
            errors.append("MAX_FILE_SIZE_MB must be positive")
        
        if not cls.ALLOWED_FILE_TYPES:
            errors.append("ALLOWED_FILE_TYPES cannot be empty")
        
        return errors

# Create settings instance
settings = Settings()