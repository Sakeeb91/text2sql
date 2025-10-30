#!/bin/bash
# Setup script for text2sql project

set -e

echo "🚀 Setting up Text-to-SQL project..."

# Check Python version
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d ' ' -f 2 | cut -d '.' -f 1,2)
echo "✓ Python version: $PYTHON_VERSION"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "📦 Upgrading pip..."
pip install --upgrade pip --quiet

# Install dependencies
echo "📦 Installing backend dependencies..."
pip install -r requirements.txt --quiet

echo "📦 Installing dev dependencies..."
pip install -r requirements-dev.txt --quiet

# Install frontend dependencies (optional)
if [ -d "streamlit_app" ]; then
    echo "📦 Installing frontend dependencies..."
    pip install -r streamlit_app/requirements.txt --quiet
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env created - please add your OPENAI_API_KEY"
else
    echo "✓ .env already exists"
fi

# Create data directory
mkdir -p data

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Add your OPENAI_API_KEY to .env file"
echo "  2. Run: source venv/bin/activate"
echo "  3. Run: uvicorn app.main:app --reload"
echo ""
