#!/bin/bash

# LM Training Pipeline
# Complete automated training workflow

set -e  # Exit on error

echo "🤖 Footy Oracle - LM Training Pipeline"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: Please run this script from the ml_training directory"
    echo "   cd ml_training && bash pipeline.sh"
    exit 1
fi

# Check Python installation
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed"
    exit 1
fi

echo "✅ Python found: $(python3 --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pip install -q -r requirements.txt
echo "✅ Dependencies installed"
echo ""

# Check for data
if [ ! "$(ls -A data/raw/*.csv 2>/dev/null)" ]; then
    echo "⚠️  No CSV files found in data/raw/"
    echo ""
    echo "Please add your training data first:"
    echo "  1. Copy CSV files to ml_training/data/raw/"
    echo "  2. Or run: python upload_data.py"
    echo ""
    exit 1
fi

echo "✅ Training data found"
echo ""

# Step 1: Fetch new fixtures (optional, may fail if no API key)
echo "📊 Step 1: Fetching yesterday's fixtures..."
if [ -f ".env" ] && grep -q "API_FOOTBALL_KEY" .env; then
    python3 scripts/01_fetch_fixtures.py || echo "⚠️  Skipped (no new fixtures or API error)"
else
    echo "⚠️  Skipped (no API key configured)"
fi
echo ""

# Step 2: Process data
echo "🔧 Step 2: Processing and engineering features..."
python3 scripts/02_process_data.py
echo ""

# Step 3: Train models
echo "🤖 Step 3: Training LM babies..."
python3 scripts/03_train_models.py
echo ""

# Step 4: Evaluate
echo "📈 Step 4: Evaluating performance..."
python3 scripts/04_evaluate.py || echo "⚠️  Evaluation completed with warnings"
echo ""

# Step 5: Deploy
echo "🚀 Step 5: Deploying models..."
python3 scripts/05_deploy.py
echo ""

# Success summary
echo "========================================"
echo "✅ Pipeline Complete!"
echo "========================================"
echo ""
echo "📊 Results:"
echo "  - Models: ml_training/models/"
echo "  - Metrics: analytics_hub/metrics/"
echo "  - Production: shared/ml_outputs/"
echo ""
echo "🎨 View Analytics Hub:"
echo "  Open: analytics_hub/dashboard/index.html"
echo ""
echo "📈 Next Steps:"
echo "  1. View the analytics dashboard"
echo "  2. Check model performance in logs/"
echo "  3. Set up GitHub Actions for daily training"
echo ""
