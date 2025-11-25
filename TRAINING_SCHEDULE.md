# ⏰ LM Training Schedule

**Last Updated:** Nov 25, 2025

## 🕐 Daily Training Schedule

### 12:00 AM (Midnight) UTC - Historical Data Download ⭐ NEW
**Purpose:** Download fixtures and stats for historical year (pre-download strategy)  
**Workflow:** `.github/workflows/download-historical-data.yml`  
**Action:** 
- Fetches all fixtures for target year (~30,000 fixtures)
- Downloads detailed stats for each fixture
- Saves raw JSON data for processing at 2am
- **Duration:** 2-4 hours (completes by ~4-5am)

**Output:** 
- `ml_training/data/historical/raw/YYYY_fixtures.json`
- `ml_training/data/historical/raw/YYYY_stats.json`

**Why Midnight?**
- Stats download takes 2-4 hours for ~30k fixtures
- Must complete before 2am training starts
- Separates slow download from fast processing

---

### 2:00 AM UTC - Historical Model Training ⭐ UPDATED
**Purpose:** Process pre-downloaded data and train models  
**Workflow:** `.github/workflows/historical-training.yml`  
**Action:** 
- Processes pre-downloaded fixtures and stats (fast!)
- Creates processed CSV file
- Trains models on cumulative historical data
- **Duration:** ~30 minutes (was 3-5 hours before!)

**Output:** 
- `ml_training/data/historical/fixtures_YYYY.csv`
- Updated models in `ml_training/models/`
- Progress tracking in `training_progress.json`

**Why 2am?**
- Midnight download completes by ~4-5am worst case
- Gives 2+ hour buffer for download to finish
- Completes before 4am daily training

---

### 4:00 AM UTC - Daily Incremental Training
**Purpose:** Train models with yesterday's completed fixtures  
**Workflow:** `.github/workflows/daily-lm-training.yml`  
**Action:**
1. Fetch yesterday's completed fixtures (~100-200 fixtures)
2. Process and merge with training data
3. Retrain all 4 LM babies (BTTS, Goals, Corners, Cards)
4. Evaluate performance
5. Deploy updated models
6. Generate today's predictions

**Duration:** ~10 minutes (small dataset)

**Output:**
- Updated models: `ml_training/models/*.pkl`
- New predictions: `shared/ml_outputs/predictions.json`
- Golden bets: `shared/ml_outputs/golden_bets.json`
- Value bets: `shared/ml_outputs/value_bets.json`

**⚡ Aligned with AI Fixtures Deployment at 4am UTC**

---

### 4:30 AM UTC - Oracle Backend Processing
**Action:**
- Read new prediction files
- Validate data structure
- Store in MongoDB for P&L tracking
- Generate GPT-4 AI reasoning for Golden Bets
- Update API endpoints

---

### 5:00 AM UTC - Frontend Refresh
**Action:**
- Homepage displays new Top 3 Golden Bets
- Fixture page shows all predictions
- P&L dashboard updates with previous day's results

---

## 📊 New 3-Phase Training Pipeline

```
12:00 AM → Download Historical Data (2-4 hours)
    ↓      Fixtures + Stats for ~30k fixtures
    ↓      Saves raw JSON files
    ↓
2:00 AM → Process & Train Models (~30 min)
    ↓      Fast processing of pre-downloaded data
    ↓      Model training on cumulative data
    ↓
4:00 AM → Daily Training (~10 min)
    ↓      Yesterday's fixtures only
    ↓      Quick incremental update
    ↓
4:30 AM → Oracle Processing (AI reasoning + MongoDB)
    ↓
5:00 AM → Frontend Update (New predictions live)
```

---

## 🎯 Why This Approach?

### ❌ Old Problem (Single-Phase)
```
2:00 AM → Start downloading 30k fixtures
         ↓ (takes 3-5 hours)
4:00 AM → Daily training starts (CONFLICT!)
         ↓ (both running simultaneously)
6:00 AM → Historical finally completes
```

**Issues:**
- Historical training blocked daily training
- Resource conflicts
- Unpredictable completion times
- Daily predictions delayed

### ✅ New Solution (3-Phase)
```
12:00 AM → Download only (slow, 2-4 hours)
2:00 AM  → Process + Train (fast, 30 min)
4:00 AM  → Daily update (fast, 10 min)
```

**Benefits:**
- ✅ No conflicts - each phase completes before next starts
- ✅ Predictable timing - daily training always at 4am
- ✅ Faster training - processing pre-downloaded data is quick
- ✅ Better separation - download vs processing vs daily update
- ✅ Can retry downloads without re-training

---

## 🔧 Configuration Files

### GitHub Actions Workflows
- **Download Data:** `.github/workflows/download-historical-data.yml` (12am UTC) ⭐ NEW
- **Train Models:** `.github/workflows/historical-training.yml` (2am UTC) ⭐ UPDATED
- **Daily Training:** `.github/workflows/daily-lm-training.yml` (4am UTC)

### Training Scripts
- **Download:** `ml_training/scripts/00a_download_historical_data.py` ⭐ NEW
- **Train:** `ml_training/scripts/00b_train_historical_models.py` ⭐ NEW
- **Daily Fetch:** `ml_training/scripts/01_fetch_fixtures.py`
- **Process:** `ml_training/scripts/02_process_data.py`
- **Train:** `ml_training/scripts/03_train_models.py`
- **Evaluate:** `ml_training/scripts/04_evaluate.py`
- **Deploy:** `ml_training/scripts/05_deploy.py`

---

## 📈 Expected Results

**Historical Training Progress:**
- Day 1: Year 2018 (~50k fixtures) - 62-65% accuracy
- Day 2: Year 2017 (~100k total) - 64-67% accuracy
- Day 5: Year 2014 (~250k total) - 68-70% accuracy
- Day 10: Year 2009 (~500k total) - 70-72% accuracy
- Day 18: Year 2001 (~900k total) - 72-75% accuracy

**Daily Training Improvements:**
- Models get smarter with each day's data
- Accuracy improves incrementally
- Golden Bets confidence increases
- Value Bets ROI optimizes

**Current Performance:**
- BTTS: 68.4% accuracy
- Over 2.5 Goals: 69.2% accuracy
- Over 9.5 Corners: 65.3% accuracy
- Over 3.5 Cards: 67.1% accuracy

**Target Performance:**
- All markets: 70%+ accuracy
- Golden Bets: 85%+ win rate
- Value Bets: 15%+ ROI

---

## 🚀 Manual Triggers

### Download Historical Data
```bash
# Download specific year
cd ml_training
python scripts/00a_download_historical_data.py --year 2015

# Download with fewer leagues (faster testing)
python scripts/00a_download_historical_data.py --year 2015 --leagues 10
```

### Train on Downloaded Data
```bash
# Train on specific year
cd ml_training
python scripts/00b_train_historical_models.py --year 2015

# Or let it auto-detect from progress file
python scripts/00b_train_historical_models.py
```

### Run Daily Training
```bash
cd ml_training
./pipeline.sh
```

---

**Status:** ✅ 3-phase schedule implemented and deployed
