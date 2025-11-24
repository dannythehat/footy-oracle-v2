#!/bin/bash

# ML Training Pipeline
# Runs daily at 6 AM UTC to fetch new fixtures and retrain models

set -e  # Exit on error

echo "🚀 Starting ML Training Pipeline..."
echo "📅 Date: $(date)"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to script directory
cd "$(dirname "$0")"

# Activate virtual environment
if [ -d "venv" ]; then
    echo -e "${BLUE}🔧 Activating virtual environment...${NC}"
    source venv/bin/activate
else
    echo -e "${YELLOW}⚠️  Virtual environment not found. Creating...${NC}"
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
fi

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}⚠️  .env file not found. Using .env.example...${NC}"
    cp .env.example .env
    echo "Please edit .env with your API keys and run again."
    exit 1
fi

# Create necessary directories
mkdir -p data/{raw,processed,incremental}
mkdir -p models
mkdir -p logs

# Step 1: Fetch yesterday's fixtures
echo ""
echo -e "${BLUE}📥 Step 1: Fetching yesterday's fixtures...${NC}"
python scripts/01_fetch_fixtures.py 2>&1 | tee -a logs/pipeline.log

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Fixtures fetched successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Fixture fetch had issues${NC}"
fi

# Step 2: Process and merge data
echo ""
echo -e "${BLUE}🔧 Step 2: Processing data and engineering features...${NC}"
python scripts/02_process_data.py 2>&1 | tee -a logs/pipeline.log

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Data processed successfully${NC}"
else
    echo "❌ Error processing data"
    exit 1
fi

# Step 3: Train models (only on Sundays for full retrain)
DAY_OF_WEEK=$(date +%u)  # 1=Monday, 7=Sunday

if [ "$DAY_OF_WEEK" -eq 7 ]; then
    echo ""
    echo -e "${BLUE}🤖 Step 3: Training LM babies (Sunday full retrain)...${NC}"
    python scripts/03_train_models.py 2>&1 | tee -a logs/pipeline.log
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Models trained successfully${NC}"
    else
        echo "❌ Error training models"
        exit 1
    fi
    
    # Step 4: Evaluate models
    echo ""
    echo -e "${BLUE}📊 Step 4: Evaluating model performance...${NC}"
    python scripts/04_evaluate.py 2>&1 | tee -a logs/pipeline.log
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Evaluation complete${NC}"
    else
        echo "❌ Error evaluating models"
        exit 1
    fi
    
    # Step 5: Deploy if improved
    echo ""
    echo -e "${BLUE}🚀 Step 5: Deploying improved models...${NC}"
    python scripts/05_deploy.py 2>&1 | tee -a logs/pipeline.log
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Deployment complete${NC}"
    else
        echo "❌ Error deploying models"
        exit 1
    fi
else
    echo ""
    echo -e "${YELLOW}ℹ️  Skipping model training (only runs on Sundays)${NC}"
    echo "   Next training: Sunday at 6 AM UTC"
fi

# Generate today's predictions (always run)
echo ""
echo -e "${BLUE}🔮 Generating today's predictions...${NC}"
python scripts/generate_predictions.py 2>&1 | tee -a logs/pipeline.log

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Predictions generated${NC}"
else
    echo "❌ Error generating predictions"
    exit 1
fi

# Summary
echo ""
echo -e "${GREEN}✅ Pipeline complete!${NC}"
echo ""
echo "📊 Summary:"
echo "  - Fixtures fetched: ✅"
echo "  - Data processed: ✅"
if [ "$DAY_OF_WEEK" -eq 7 ]; then
    echo "  - Models trained: ✅"
    echo "  - Models evaluated: ✅"
    echo "  - Models deployed: ✅"
fi
echo "  - Predictions generated: ✅"
echo ""
echo "📁 Check logs/pipeline.log for details"
echo "📈 Check models/metadata.json for accuracy metrics"
echo ""
echo "🍼 LM babies are getting smarter!"
