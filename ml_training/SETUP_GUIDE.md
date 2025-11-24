# 🚀 ML Training Pipeline - Complete Setup Guide

**Goal:** Set up automated pipeline to train LM babies and reach 70%+ accuracy

---

## 📋 Prerequisites

- Python 3.8+
- Your 100k+ fixtures in CSV format
- API-Football key (already have: 150k daily limit)
- 10GB+ disk space

---

## 🎯 Quick Setup (5 Steps)

### Step 1: Clone & Navigate

```bash
cd footy-oracle-v2/ml_training
```

### Step 2: Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your API key
nano .env  # or use your preferred editor
```

Add your API-Football key:
```bash
API_FOOTBALL_KEY=your_actual_key_here
```

### Step 5: Import Your 100k Fixtures

```bash
# Copy your CSV files to data/raw/
cp /path/to/your/fixtures/*.csv data/raw/

# Or if you have a single large CSV:
cp /path/to/your/fixtures.csv data/raw/all_fixtures.csv
```

---

## 📊 Initial Training

### Process Your Historical Data

```bash
# This will:
# 1. Load your 100k fixtures
# 2. Calculate 133+ features
# 3. Create training_data.csv
python scripts/02_process_data.py
```

**Expected output:**
```
🔧 Engineering features...
✅ Added 133 new features
✅ Training data created: 100,000 fixtures
📁 Saved to: data/processed/training_data.csv
```

### Train Initial Models

```bash
# This will:
# 1. Train 4 LM babies (BTTS, Goals, Corners, Cards)
# 2. Use ensemble (XGBoost + LightGBM + CatBoost)
# 3. Save models to models/
python scripts/03_train_models.py
```

**Expected output:**
```
🤖 Training btts baby...
  Training xgboost...
  ✅ xgboost accuracy: 66.3%
  Training lightgbm...
  ✅ lightgbm accuracy: 67.1%
  Training catboost...
  ✅ catboost accuracy: 66.8%
  🎯 Ensemble accuracy: 68.2%

🤖 Training goals baby...
  🎯 Ensemble accuracy: 71.4%

🤖 Training corners baby...
  🎯 Ensemble accuracy: 65.1%

🤖 Training cards baby...
  🎯 Ensemble accuracy: 63.7%

✅ All LM babies trained successfully!

📊 Results:
  btts: 68.20%
  goals: 71.40%
  corners: 65.10%
  cards: 63.70%
```

---

## 🔄 Automated Daily Pipeline

### Set Up Cron Job

```bash
# Make pipeline executable
chmod +x pipeline.sh

# Edit crontab
crontab -e

# Add this line (runs daily at 6 AM UTC):
0 6 * * * cd /path/to/footy-oracle-v2/ml_training && ./pipeline.sh >> logs/cron.log 2>&1
```

### What Happens Daily

**6:00 AM UTC:**
1. ✅ Fetches yesterday's completed fixtures from API-Football
2. ✅ Processes data and calculates features
3. ✅ Appends to training_data.csv
4. ✅ Generates today's predictions

**Sundays at 6:00 AM UTC (Weekly Retrain):**
1. ✅ All of the above, PLUS:
2. ✅ Retrains all 4 models with updated data
3. ✅ Evaluates performance
4. ✅ Deploys if accuracy improves
5. ✅ Commits to Git (auto-deploy to production)

---

## 📈 Monitoring Performance

### Check Current Accuracy

```bash
cat models/metadata.json
```

**Example output:**
```json
{
  "btts": {
    "accuracy": 0.682,
    "training_samples": 100000,
    "validation_samples": 25000,
    "timestamp": "2025-11-24T06:00:00Z",
    "improvement": "+2.3%",
    "target": 0.70,
    "status": "🟡 Close to target"
  },
  "goals": {
    "accuracy": 0.714,
    "target": 0.75,
    "status": "✅ Above 70%"
  },
  "corners": {
    "accuracy": 0.651,
    "target": 0.70,
    "status": "🔴 Needs improvement"
  },
  "cards": {
    "accuracy": 0.637,
    "target": 0.70,
    "status": "🔴 Needs improvement"
  }
}
```

### View Training Logs

```bash
# Latest pipeline run
tail -f logs/pipeline.log

# All cron runs
tail -f logs/cron.log
```

### Check Data Growth

```bash
# Count total fixtures
wc -l data/processed/training_data.csv

# View latest additions
tail -20 data/processed/training_data.csv
```

---

## 🎯 Reaching 70%+ Accuracy

### Current Status → Target

| Market | Current | Target | Gap | Strategy |
|--------|---------|--------|-----|----------|
| BTTS | 68.2% | 70% | -1.8% | More H2H features |
| Goals | 71.4% | 75% | -3.6% | Add xG data |
| Corners | 65.1% | 70% | -4.9% | Possession style |
| Cards | 63.7% | 70% | -6.3% | Referee history |

### Improvement Strategies

**1. Collect More Historical Data**

```bash
# Fetch fixtures from 2020-2024 (use your 150k daily limit)
python scripts/backfill_historical.py --start-year 2020 --end-year 2024
```

This will:
- Fetch ~50k fixtures per year
- Total: 250k+ fixtures (vs current 100k)
- More data = smarter babies

**2. Add Advanced Features**

Edit `scripts/02_process_data.py` to add:
- xG (expected goals) data
- Team tactical style metrics
- Referee tendency analysis
- Weather conditions
- Injury reports

**3. League-Specific Models**

Train separate models per league:
```bash
python scripts/03_train_models.py --league-specific
```

**4. Hyperparameter Tuning**

```bash
# Run grid search for optimal parameters
python scripts/tune_hyperparameters.py
```

---

## 🛠️ Manual Operations

### Fetch Specific Date Range

```bash
python scripts/01_fetch_fixtures.py --start-date 2024-01-01 --end-date 2024-12-31
```

### Retrain Without Waiting for Sunday

```bash
python scripts/03_train_models.py --force
```

### Generate Predictions for Specific Date

```bash
python scripts/generate_predictions.py --date 2025-11-25
```

### Export Models to Production

```bash
python scripts/05_deploy.py
```

---

## 📁 Folder Structure After Setup

```
ml_training/
├── data/
│   ├── raw/
│   │   ├── fixtures_2021.csv        # Your historical data
│   │   ├── fixtures_2022.csv
│   │   ├── fixtures_2023.csv
│   │   └── fixtures_2024.csv
│   ├── processed/
│   │   └── training_data.csv        # 100k+ fixtures with features
│   └── incremental/
│       ├── 2025-11-23.csv           # Daily additions
│       └── 2025-11-24.csv
│
├── models/
│   ├── btts_xgboost.pkl             # Trained models
│   ├── btts_lightgbm.pkl
│   ├── btts_catboost.pkl
│   ├── goals_xgboost.pkl
│   ├── ... (12 models total)
│   └── metadata.json                # Performance metrics
│
├── logs/
│   ├── pipeline.log                 # Daily pipeline logs
│   ├── cron.log                     # Cron job logs
│   └── training.log                 # Training details
│
├── scripts/
│   ├── 01_fetch_fixtures.py         # ✅ Created
│   ├── 02_process_data.py           # ✅ Created
│   ├── 03_train_models.py           # ✅ Created
│   ├── 04_evaluate.py               # 🔄 Next
│   ├── 05_deploy.py                 # 🔄 Next
│   └── generate_predictions.py      # 🔄 Next
│
├── config/
│   ├── training_config.yaml         # ✅ Created
│   └── leagues.json                 # ✅ Created
│
├── .env                             # Your API keys
├── requirements.txt                 # ✅ Created
├── pipeline.sh                      # ✅ Created
└── README.md                        # ✅ Created
```

---

## 🐛 Troubleshooting

### Issue: "API rate limit exceeded"

**Solution:**
- You have 150k requests/day
- Each fixture = 2 requests (fixture + statistics)
- Max ~75k fixtures/day
- Spread historical backfill over multiple days

### Issue: "Not enough memory"

**Solution:**
```bash
# Process data in chunks
python scripts/02_process_data.py --chunk-size 10000
```

### Issue: "Models not improving"

**Checklist:**
- [ ] Enough training data? (Need 50k+ fixtures)
- [ ] Features calculated correctly?
- [ ] Data quality issues? (Check for nulls)
- [ ] Try different hyperparameters

### Issue: "Predictions not deploying"

**Check:**
```bash
# Verify models exist
ls -lh models/*.pkl

# Check metadata
cat models/metadata.json

# Test deployment manually
python scripts/05_deploy.py --verbose
```

---

## 📊 Expected Timeline

### Week 1: Setup & Initial Training
- Day 1-2: Setup environment, import 100k fixtures
- Day 3-4: Initial training (current accuracy)
- Day 5-7: Monitor daily pipeline

### Week 2-4: Data Collection
- Backfill 2020-2024 data (150k+ more fixtures)
- Daily additions continue automatically
- Total: 250k+ fixtures

### Week 5-8: Feature Engineering
- Add xG data
- Referee analysis
- Team style metrics
- Weather conditions

### Week 9-12: Optimization
- Hyperparameter tuning
- League-specific models
- Ensemble optimization

**Target: 70%+ accuracy by Week 12**

---

## ✅ Success Metrics

### Short Term (1 Month)
- [ ] Pipeline running daily without errors
- [ ] 150k+ total fixtures in training data
- [ ] All models > 65% accuracy

### Medium Term (3 Months)
- [ ] 250k+ total fixtures
- [ ] BTTS & Goals > 70% accuracy
- [ ] Advanced features implemented

### Long Term (6 Months)
- [ ] All 4 models > 70% accuracy
- [ ] League-specific models deployed
- [ ] Automated hyperparameter tuning

---

## 🎓 Next Steps

1. **Run initial setup** (Steps 1-5 above)
2. **Train initial models** with your 100k fixtures
3. **Set up cron job** for daily automation
4. **Monitor performance** via metadata.json
5. **Backfill historical data** to reach 250k+ fixtures
6. **Add advanced features** to improve accuracy
7. **Celebrate** when all babies hit 70%+ 🎉

---

## 📚 Additional Resources

- [ML_TRAINING_PIPELINE.md](../ML_TRAINING_PIPELINE.md) - Full architecture
- [ORACLE_LM_INTEGRATION.md](../ORACLE_LM_INTEGRATION.md) - How Oracle uses predictions
- [API_KEYS_REFERENCE.md](../API_KEYS_REFERENCE.md) - API configuration

---

**The babies are ready to learn! 🍼**

Run `./pipeline.sh` to start the journey to 70%+ accuracy.
