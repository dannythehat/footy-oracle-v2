#!/bin/bash

# Auto-setup script - copies API key from backend .env to ml_training .env
# Run this once to set up the ml_training environment

echo "🔧 Setting up ML Training environment..."
echo ""

# Check if backend .env exists
if [ ! -f "../apps/backend/.env" ]; then
    echo "❌ Backend .env not found at apps/backend/.env"
    echo ""
    echo "Please create it first with your API_FOOTBALL_KEY"
    exit 1
fi

# Extract API key from backend .env
API_KEY=$(grep "^API_FOOTBALL_KEY=" ../apps/backend/.env | cut -d '=' -f2)

if [ -z "$API_KEY" ]; then
    echo "❌ API_FOOTBALL_KEY not found in apps/backend/.env"
    exit 1
fi

# Create ml_training .env
echo "API_FOOTBALL_KEY=$API_KEY" > .env

echo "✅ ML Training .env created!"
echo ""
echo "You can now run:"
echo "  python scripts/00_historical_training.py --test"
echo ""
echo "Or for full training:"
echo "  python scripts/00_historical_training.py"
