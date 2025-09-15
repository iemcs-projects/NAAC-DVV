@echo off
REM Start NAAC Validation FastAPI Server (Windows)

echo 🚀 Starting NAAC Validation FastAPI Server...
echo ================================================

REM Check if virtual environment exists
if not exist "naac_env" (
    echo ⚠️  Virtual environment not found. Creating naac_env...
    python -m venv naac_env
)

REM Activate virtual environment
echo 📦 Activating virtual environment...
call naac_env\Scripts\activate.bat

REM Install/update dependencies
echo 📥 Installing dependencies...
pip install -r requirements.txt

REM Start server
echo 🌐 Starting FastAPI server on http://localhost:8000
echo 📖 API Documentation: http://localhost:8000/docs
echo 🔍 Alternative docs: http://localhost:8000/redoc
echo.
echo Press Ctrl+C to stop the server
echo.

python app.py

pause