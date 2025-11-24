# 🤖 LM Babies Training Pipeline

**Last Updated:** Nov 24, 2025  
**Purpose:** Automated pipeline to continuously train ML models with growing fixture data

---

## 🎯 Overview

**"LM Babies"** = The 4 ML models (BTTS, Goals, Corners, Cards) that need continuous training to get smarter.

**Current Status:**
- ✅ Historical training pipeline implemented
- ✅ Automated daily training at 2am UTC
- ✅ 50 top leagues tracked
- 🎯 Target: 70%+ accuracy on all bet types
- 🔄 Training on data from 2018 backwards

---

## 🚀 NEW: Historical Training Pipeline

**What's New:**
- **Automated historical data collection** - Fetches fixtures from 2018 backwards, one year per day
- **Daily training at 2am UTC** - GitHub Actions workflow runs automatically
- **50 leagues tracked** - Top leagues worldwide (~50k fixtures per year)
- **Progress tracking** - Logs and metadata for every training run
- **Incremental learning** - Models get smarter as more historical data is added

### Quick Start

```bash
# Test the pipeline (single year, no training)
cd ml_training
python scripts/00_historical_training.py --test

# Run full pipeline (collect + train)
python scripts/00_historical_training.py

# Customize
python scripts/00_historical_training.py --start-year 2020 --leagues 30
```

**See [HISTORICAL_TRAINING.md](ml_training/HISTORICAL_TRAINING.md) for complete documentation.**

---

## 📁 Updated Folder Structure

```
footy-oracle-v2/
├── .github/
│   └── workflows/
│       └── historical-training.yml    # NEW - Daily automation
│
├── ml_training/
│   ├── data/
│   │   ├── raw/                       # Raw CSV files
│   │   ├── historical/                # NEW - Year-by-year data
│   │   │   ├── fixtures_2018.csv
│   │   │   ├── fixtures_2017.csv
│   │   │   └── ...
│   │   ├── processed/                 # Cleaned & feature-engineered
│   │   │   ├── training_data.csv
│   │   │   └── validation_data.csv
│   │   ├── incremental/               # Daily new fixtures
│   │   │   └── YYYY-MM-DD.csv
│   │   └── training_progress.json     # NEW - Tracks current year
│   │
│   ├── models/                        # Trained LM babies
│   │   ├── btts_model.pkl
│   │   ├── goals_model.pkl
│   │   ├── corners_model.pkl
│   │   ├── cards_model.pkl
│   │   └── metadata.json              # Performance metrics
│   │
│   ├── scripts/
│   │   ├── 00_historical_training.py  # NEW - Historical pipeline
│   │   ├── 01_fetch_fixtures.py       # Daily fixture fetcher
│   │   ├── 02_process_data.py         # Feature engineering
│   │   ├── 03_train_models.py         # Train LM babies
│   │   ├── 04_evaluate.py             # Test accuracy
│   │   └── 05_deploy.py               # Export to shared/ml_outputs
│   │
│   ├── logs/                          # NEW - Training logs
│   │   └── historical_training_YYYYMMDD.log
│   │
│   ├── config/
│   │   ├── training_config.yaml       # Training parameters
│   │   └── leagues.json               # Supported leagues
│   │
│   ├── notebooks/                     # Jupyter for analysis
│   │   ├── data_exploration.ipynb
│   │   └── model_tuning.ipynb
│   │
│   ├── requirements.txt               # Python dependencies
│   ├── README.md                      # Setup instructions
│   ├── HISTORICAL_TRAINING.md         # NEW - Historical training docs
│   └── pipeline.sh                    # One-command runner
│
├── shared/
│   └── ml_outputs/                    # Predictions for Oracle frontend
│       ├── predictions.json
│       └── golden_bets.json
```

---

## 🔄 Two Training Modes

### Mode 1: Historical Training (NEW)

**Purpose:** Build up training data from past years  
**Schedule:** Daily at 2am UTC  
**Script:** `00_historical_training.py`

**Workflow:**
```
Day 1: Fetch 2018 fixtures → Train on 2018 data
Day 2: Fetch 2017 fixtures → Train on 2017-2018 data
Day 3: Fetch 2016 fixtures → Train on 2016-2018 data
...
Day N: Fetch 200X fixtures → Train on 200X-2018 data
```

**Progress Tracking:**
```bash
cat ml_training/data/training_progress.json
```

### Mode 2: Daily Incremental Training

**Purpose:** Keep models updated with latest fixtures  
**Schedule:** Daily at 6am UTC  
**Script:** `01_fetch_fixtures.py` → `03_train_models.py`

**Workflow:**
```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Fetch Yesterday's Fixtures (01_fetch_fixtures.py)  │
│ ✅ API-Football: Get completed fixtures                     │
│ ✅ Fetch: Teams, scores, stats, corners, cards             │
│ ✅ Save: ml_training/data/incremental/2025-11-23.csv       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Process & Merge Data (02_process_data.py)          │
│ ✅ Clean new data                                           │
│ ✅ Calculate 133+ features                                  │
│ ✅ Append to training_data.csv                              │
│ ✅ Update validation split                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Retrain Models (03_train_models.py)                │
│ ✅ Load updated training_data.csv                           │
│ ✅ Train 4 LM babies (BTTS, Goals, Corners, Cards)         │
│ ✅ Save improved models                                     │
│ ✅ Log performance metrics                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Evaluate Performance (04_evaluate.py)              │
│ ✅ Test on validation set                                   │
│ ✅ Calculate accuracy per market                            │
│ ✅ Compare vs previous version                              │
│ ✅ Only deploy if accuracy improves                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Deploy to Production (05_deploy.py)                │
│ ✅ Copy models to shared/ml_outputs/                        │
│ ✅ Generate today's predictions                             │
│ ✅ Update metadata.json                                     │
│ ✅ Commit to Git (auto-deploy)                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Expected Timeline & Results

### Historical Training Progress

| Day | Year | Cumulative Fixtures | Expected Accuracy |
|-----|------|---------------------|-------------------|
| 1   | 2018 | ~50,000            | 62-65%           |
| 2   | 2017 | ~100,000           | 64-67%           |
| 3   | 2016 | ~150,000           | 66-68%           |
| 5   | 2014 | ~250,000           | 68-70%           |
| 10  | 2009 | ~500,000           | 70-72%           |
| 18  | 2001 | ~900,000           | 72-75%           |

**Target:** 70%+ accuracy on all bet types

---

## 🛠️ Setup & Configuration

### 1. Prerequisites

```bash
cd ml_training
pip install -r requirements.txt
```

### 2. Environment Variables

Create `.env` file:
```bash
API_FOOTBALL_KEY=your_api_key_here
```

### 3. GitHub Secrets (for automation)

Go to: **Settings → Secrets → Actions**

Add:
- `API_FOOTBALL_KEY` - Your API-Football key

### 4. Enable GitHub Actions

The workflow is already configured in `.github/workflows/historical-training.yml`

It will run automatically daily at 2am UTC.

**Manual trigger:**
1. Go to **Actions** tab
2. Select "Historical Training Pipeline"
3. Click "Run workflow"

---

## 📊 Monitoring & Logs

### Check Training Progress

```bash
# Current year being trained
cat ml_training/data/training_progress.json

# Model performance
cat ml_training/models/metadata.json

# Latest training log
tail -f ml_training/logs/historical_training_$(date +%Y%m%d).log
```

### GitHub Actions Dashboard

View training runs:
1. Go to **Actions** tab
2. Click on latest "Historical Training Pipeline" run
3. View logs and artifacts

### Model Performance Tracking

```json
{
  "trained_at": "2025-11-24T02:30:00",
  "total_models": 4,
  "models": {
    "btts": {
      "val_accuracy": 0.6842,
      "val_auc_roc": 0.7234
    },
    "over_2_5_goals": {
      "val_accuracy": 0.6923,
      "val_auc_roc": 0.7456
    },
    "over_9_5_corners": {
      "val_accuracy": 0.6534,
      "val_auc_roc": 0.7012
    },
    "over_3_5_cards": {
      "val_accuracy": 0.6712,
      "val_auc_roc": 0.7123
    }
  }
}
```

---

## 🚨 Important Notes

### API Usage

- **Free tier:** 100 requests/day (not enough for historical training)
- **Recommended:** Paid plan for historical data collection
- **Rate limiting:** Built into script (0.5s between requests)

### Storage Requirements

- Each year: ~50MB CSV
- 18 years: ~900MB total
- Models: ~100MB
- Logs: ~10MB/day

### Training Time

- Increases with dataset size
- Day 1 (50k fixtures): ~2 hours
- Day 10 (500k fixtures): ~10 hours
- Consider cloud GPU for faster training

### Data Quality

- Older years may have incomplete stats
- Script handles missing data gracefully
- Validation ensures data quality

---

## 🎯 Success Metrics

### Current Performance

- ✅ BTTS: 68.4% → **Target: 70%+**
- ✅ Over 2.5 Goals: 69.2% → **Target: 70%+**
- 🎯 Over 9.5 Corners: 65.3% → **Target: 70%+**
- 🎯 Over 3.5 Cards: 67.1% → **Target: 70%+**

### Improvement Strategy

1. **More data** - Historical training adds ~50k fixtures/day
2. **Feature engineering** - 133+ features calculated
3. **Model tuning** - XGBoost hyperparameters optimized
4. **Ensemble methods** - Combine multiple models

---

## 📚 Documentation

- **[HISTORICAL_TRAINING.md](ml_training/HISTORICAL_TRAINING.md)** - Complete historical training guide
- **[SETUP_GUIDE.md](ml_training/SETUP_GUIDE.md)** - Initial setup instructions
- **[TRAINING_GUIDE.md](ml_training/TRAINING_GUIDE.md)** - Model training details

---

## 🐛 Troubleshooting

### Historical Training Issues

**"No fixtures collected"**
- Check API key in `.env`
- Verify API quota
- Check internet connection

**"Training failed"**
- Ensure dependencies installed
- Check logs in `logs/` directory
- Verify data quality

**"Out of memory"**
- Reduce `--leagues` parameter
- Use cloud instance with more RAM
- Consider batch processing

### GitHub Actions Issues

**Workflow not running**
- Check GitHub Actions enabled
- Verify secrets configured
- Check workflow syntax

**Training timeout**
- Increase `timeout-minutes` in workflow
- Use faster runner (paid plan)
- Reduce dataset size

---

## 🚀 Next Steps

1. ✅ **Historical training pipeline** - COMPLETE
2. ✅ **Automated daily execution** - COMPLETE
3. 🎯 **Feature engineering improvements** - IN PROGRESS
4. 🎯 **Model ensemble** - PLANNED
5. 🎯 **Real-time predictions** - PLANNED

---

**Last Updated:** Nov 24, 2025  
**Status:** ✅ Historical training pipeline deployed and running
