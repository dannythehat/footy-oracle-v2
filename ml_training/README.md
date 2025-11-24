# ML Training Pipeline

Automated pipeline for training and improving the 4 LM babies (BTTS, Goals, Corners, Cards).

## 🎯 Goal

Get all models to **70%+ accuracy** through continuous learning from growing fixture data.

## 📊 Current Status

- **Data:** 100k+ fixtures in CSV format
- **API Limit:** 150k requests/day
- **Target:** 70%+ accuracy on all bet types

## 🚀 Quick Start

### 1. Install Dependencies

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API_FOOTBALL_KEY
```

### 3. Initial Setup

```bash
# Process your existing 100k fixtures
python scripts/02_process_data.py

# Train initial models
python scripts/03_train_models.py
```

### 4. Run Daily Pipeline

```bash
# Manual run
./pipeline.sh

# Or set up cron (runs daily at 6 AM UTC)
crontab -e
# Add: 0 6 * * * cd /path/to/ml_training && ./pipeline.sh
```

## 📁 Folder Structure

```
ml_training/
├── data/
│   ├── raw/              # Your 100k+ CSV files
│   ├── processed/        # Feature-engineered data
│   └── incremental/      # Daily new fixtures
├── models/               # Trained LM babies
├── scripts/              # Pipeline scripts
├── config/               # Configuration files
└── notebooks/            # Jupyter analysis
```

## 🔄 Daily Workflow

1. **6:00 AM UTC** - Fetch yesterday's completed fixtures
2. **6:15 AM UTC** - Process data & calculate features
3. **6:30 AM UTC** - Retrain models (Sundays only)
4. **6:45 AM UTC** - Generate today's predictions
5. **7:00 AM UTC** - Deploy to Oracle frontend

## 📈 Performance Tracking

Check `models/metadata.json` for current accuracy:

```json
{
  "btts": {"accuracy": 0.68, "target": 0.70},
  "goals": {"accuracy": 0.71, "target": 0.75},
  "corners": {"accuracy": 0.65, "target": 0.70},
  "cards": {"accuracy": 0.63, "target": 0.70}
}
```

## 🛠️ Scripts

- `01_fetch_fixtures.py` - Daily fixture fetcher
- `02_process_data.py` - Feature engineering
- `03_train_models.py` - Train LM babies
- `04_evaluate.py` - Test accuracy
- `05_deploy.py` - Export to production

## 📚 Documentation

See [ML_TRAINING_PIPELINE.md](../ML_TRAINING_PIPELINE.md) for complete documentation.

## 🤖 The LM Babies

1. **BTTS Baby** - Both Teams To Score predictions
2. **Goals Baby** - Over/Under 2.5 Goals predictions
3. **Corners Baby** - Over/Under 9.5 Corners predictions
4. **Cards Baby** - Over/Under 3.5 Cards predictions

Each baby learns from every new fixture and gets smarter over time! 🍼
