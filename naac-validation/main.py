#!/usr/bin/env python3
"""
NAAC Validation System - Simple CLI Demo

This is a basic CLI interface for the NAAC validation system.
For full API functionality, use: python app.py

Usage:
    python main.py              # Show system status
    python main.py --help       # Show help information
"""

import sys
import json
from pathlib import Path
import argparse

# Add project root to path
sys.path.append(str(Path(__file__).parent))

try:
    from config.settings import settings
    from validators.file_validator import FileValidator
    from utils.file_utils import FileProcessor
    from utils.ocr_utils_no_tesseract import FlexibleOCRProcessor
    
    # Check if LLM utils are available
    try:
        from utils.llm_utils import LLMValidator
        LLM_AVAILABLE = True
    except (ImportError, ValueError):
        LLM_AVAILABLE = False
        
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please ensure all dependencies are installed: pip install -r requirements.txt")
    sys.exit(1)

def get_system_status():
    """Get system status information"""
    try:
        file_validator = FileValidator()
        file_processor = FileProcessor()
        ocr_processor = FlexibleOCRProcessor(ocr_method="text_only")
        
        status = {
            "system_status": "operational",
            "components": {
                "file_validator": "available",
                "file_processor": "available",
                "ocr_processor": ocr_processor.ocr_method,
                "llm_validator": "available" if LLM_AVAILABLE else "not_configured",
            },
            "configuration": {
                "allowed_file_types": getattr(settings, 'ALLOWED_FILE_TYPES', ['.pdf', '.xlsx', '.xls']),
                "max_file_size_mb": getattr(settings, 'MAX_FILE_SIZE_MB', 50),
            },
            "api_server": {
                "available": True,
                "start_command": "python app.py",
                "documentation": "http://localhost:8000/docs"
            }
        }
        
        return status
        
    except Exception as e:
        return {
            "system_status": "error",
            "error": str(e),
            "suggestion": "Check configuration and dependencies"
        }


def validate_file(file_path: str, criteria: str = "3.1.1"):
    """Simple file validation demo"""
    try:
        file_validator = FileValidator()
        result = file_validator.validate(file_path, "sanction_letter")
        
        print(f"\n📄 File Validation Results for: {file_path}")
        print(f"✅ Valid: {result.is_valid}")
        
        if result.errors:
            print("❌ Errors:")
            for error in result.errors:
                print(f"  - {error}")
                
        if result.warnings:
            print("⚠️  Warnings:")
            for warning in result.warnings:
                print(f"  - {warning}")
                
        return result.is_valid
        
    except Exception as e:
        print(f"❌ Validation error: {str(e)}")
        return False


def main():
    """Main CLI function"""
    parser = argparse.ArgumentParser(
        description="NAAC Validation System CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    python main.py                          # Show system status
    python main.py --file sample.pdf       # Validate a file
    python main.py --status                 # Detailed system status

For full API functionality:
    python app.py                           # Start FastAPI server
    """
    )
    
    parser.add_argument('--file', '-f', help='File to validate')
    parser.add_argument('--criteria', '-c', default='3.1.1', help='NAAC criteria (default: 3.1.1)')
    parser.add_argument('--status', '-s', action='store_true', help='Show detailed system status')
    
    args = parser.parse_args()
    
    print("🚀 NAAC Validation System CLI")
    print("=" * 50)
    
    if args.file:
        # Validate specific file
        if not Path(args.file).exists():
            print(f"❌ File not found: {args.file}")
            return 1
            
        is_valid = validate_file(args.file, args.criteria)
        return 0 if is_valid else 1
        
    elif args.status or len(sys.argv) == 1:
        # Show system status (default behavior)
        status = get_system_status()
        print("\n📋 System Status:")
        print(json.dumps(status, indent=2))
        
        if status["system_status"] == "operational":
            print("\n🌐 To start the full API server:")
            print("   python app.py")
            print("   Then visit: http://localhost:8000/docs")
        
        return 0
        
    else:
        parser.print_help()
        return 0


if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        print("\nFor full functionality, use: python app.py")
        sys.exit(1)
