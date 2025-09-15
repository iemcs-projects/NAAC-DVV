#!/bin/bash
# Start NAAC Validation FastAPI Server

echo "🚀 Starting NAAC Validation FastAPI Server..."
echo "================================================"

# Check if virtual environment exists
if [ ! -d "naac_env" ]; then
    echo "⚠️  Virtual environment not found. Creating naac_env..."
    python -m venv naac_env
fi

# Activate virtual environment
echo "📦 Activating virtual environment..."
source naac_env/bin/activate

# Install/update dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Start server
echo "🌐 Starting FastAPI server on http://localhost:8000"
echo "📖 API Documentation: http://localhost:8000/docs"
echo "🔍 Alternative docs: http://localhost:8000/redoc"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python app.py