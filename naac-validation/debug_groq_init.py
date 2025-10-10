#!/usr/bin/env python3
"""
Debug script to test Groq and LangChain-Groq initialization
Helps identify compatibility issues and suggests solutions
"""

import os
import sys
from pathlib import Path

# Add project root to path
sys.path.append(str(Path(__file__).parent))

def test_imports():
    """Test importing required packages"""
    print("🔍 Testing Package Imports...")
    
    try:
        import groq
        print(f"   ✅ groq package: {groq.__version__}")
    except ImportError as e:
        print(f"   ❌ groq package: {e}")
        return False
    except AttributeError:
        print(f"   ✅ groq package: imported (version not available)")
    
    try:
        import langchain_groq
        print(f"   ✅ langchain_groq package: imported")
    except ImportError as e:
        print(f"   ❌ langchain_groq package: {e}")
        return False
    
    try:
        from langchain_groq import ChatGroq
        print(f"   ✅ ChatGroq class: imported")
    except ImportError as e:
        print(f"   ❌ ChatGroq class: {e}")
        return False
    
    return True

def test_direct_groq_client():
    """Test direct Groq client initialization"""
    print("\n🤖 Testing Direct Groq Client...")
    
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("   ⚠️ GROQ_API_KEY not found in environment")
        return False
    
    try:
        import groq
        client = groq.Groq(api_key=api_key)
        print("   ✅ Direct Groq client initialized successfully")
        return True
    except Exception as e:
        print(f"   ❌ Direct Groq client failed: {e}")
        return False

def test_langchain_groq_init():
    """Test various LangChain-Groq initialization methods"""
    print("\n🔗 Testing LangChain-Groq Initialization...")
    
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("   ⚠️ GROQ_API_KEY not found in environment")
        return False
    
    from langchain_groq import ChatGroq
    
    # Test different initialization methods
    methods = [
        {
            "name": "Method 1: api_key + model",
            "params": {
                "api_key": api_key,
                "model": "llama-3.1-8b-instant",
                "temperature": 0.0
            }
        },
        {
            "name": "Method 2: groq_api_key + model_name",
            "params": {
                "groq_api_key": api_key,
                "model_name": "llama-3.1-8b-instant",
                "temperature": 0.0
            }
        },
        {
            "name": "Method 3: minimal configuration",
            "params": {
                "api_key": api_key,
                "model": "llama-3.1-8b-instant"
            }
        },
        {
            "name": "Method 4: alternative model",
            "params": {
                "api_key": api_key,
                "model": "llama3-8b-8192"
            }
        }
    ]
    
    successful_method = None
    
    for method in methods:
        try:
            print(f"   🧪 Testing {method['name']}...")
            llm = ChatGroq(**method['params'])
            print(f"   ✅ {method['name']}: SUCCESS")
            successful_method = method
            break
        except Exception as e:
            print(f"   ❌ {method['name']}: {str(e)[:100]}...")
    
    return successful_method

def test_package_versions():
    """Check package versions for compatibility issues"""
    print("\n📦 Checking Package Versions...")
    
    packages_to_check = [
        'groq',
        'langchain_groq', 
        'langchain',
        'pydantic',
        'httpx'
    ]
    
    for package in packages_to_check:
        try:
            module = __import__(package)
            version = getattr(module, '__version__', 'unknown')
            print(f"   📋 {package}: {version}")
        except ImportError:
            print(f"   ❌ {package}: not installed")
        except Exception as e:
            print(f"   ⚠️ {package}: error getting version - {e}")

def suggest_fixes():
    """Suggest potential fixes for the initialization issue"""
    print("\n🔧 Suggested Fixes:")
    print("   1. Update packages to latest versions:")
    print("      pip install --upgrade langchain-groq groq langchain")
    print()
    print("   2. If issue persists, try downgrading:")
    print("      pip install langchain-groq==0.0.3 groq==0.3.0")
    print()
    print("   3. Check for conflicting packages:")
    print("      pip list | grep -E '(httpx|groq|langchain)'")
    print()
    print("   4. Reinstall in clean environment:")
    print("      pip uninstall langchain-groq groq langchain")
    print("      pip install langchain-groq")

def main():
    """Main debug function"""
    print("🚀 GROQ INITIALIZATION DEBUG TOOL")
    print("=" * 50)
    
    # Test imports
    if not test_imports():
        print("\n❌ Package import failed. Please install required packages.")
        suggest_fixes()
        return
    
    # Test package versions
    test_package_versions()
    
    # Test direct Groq client
    if not test_direct_groq_client():
        print("\n❌ Direct Groq client failed. Check API key.")
        return
    
    # Test LangChain-Groq initialization
    successful_method = test_langchain_groq_init()
    
    if successful_method:
        print(f"\n✅ SUCCESS! Working method: {successful_method['name']}")
        print(f"   Parameters: {successful_method['params']}")
        print("\n💡 Update your content_validator.py to use these parameters.")
    else:
        print("\n❌ All LangChain-Groq initialization methods failed.")
        suggest_fixes()

if __name__ == "__main__":
    main()