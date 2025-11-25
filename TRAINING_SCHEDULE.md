# ⏰ LM Training Schedule

**Last Updated:** Nov 25, 2025

## 🕐 Daily Training Schedule

### 2:00 AM UTC - Historical Training
**Purpose:** Build historical training data year-by-year  
**Workflow:** `.github/workflows/historical-training.yml`  
**Action:** Fetches fixtures from past years (2018 → backwards)  
**Output:** `ml_training/data/historical/fixtures_YYYY.csv`

### 4:00 AM UTC - Daily Incremental Training ⭐ NEW
**Purpose:** Train models with yesterday's completed fixtures  
**Workflow:** `.github/workflows/daily-lm-training.yml`  
**Action:**
1. Fetch yesterday's completed fixtures
2. Process and merge with training data
3. Retrain all 4 LM babies (BTTS, Goals, Corners, Cards)
4. Evaluate performance
5. Deploy updated models
6. Generate today's predictions

**Output:**
- Updated models: `ml_training/models/*.pkl`
- New predictions: `shared/ml_outputs/predictions.json`
- Golden bets: `shared/ml_outputs/golden_bets.json`
- Value bets: `shared/ml_outputs/value_bets.json`

**⚡ Aligned with AI Fixtures Deployment at 4am UTC**

### 4:30 AM UTC - Oracle Backend Processing
**Action:**
- Read new prediction files
- Validate data structure
- Store in MongoDB for P&L tracking
- Generate GPT-4 AI reasoning for Golden Bets
- Update API endpoints

### 5:00 AM UTC - Frontend Refresh
**Action:**
- Homepage displays new Top 3 Golden Bets
- Fixture page shows all predictions
- P&L dashboard updates with previous day's results

---

## 📊 Training Pipeline Flow

```
2:00 AM → Historical Training (Year-by-year data collection)
    ↓
4:00 AM → Daily Training (Yesterday's fixtures + model retraining)
    ↓
4:30 AM → Oracle Processing (AI reasoning + MongoDB storage)
    ↓
5:00 AM → Frontend Update (New predictions live)
```

---

## 🎯 Why 4am UTC?

**Synchronized Deployment:**
- AI fixtures and golden bets deployment happens at 4am
- Daily training now runs at the same time
- Ensures fresh predictions are available immediately
- Reduces latency between training and deployment

**Previous Schedule:**
- ❌ Training at 6am (2 hour delay after fixtures)
- ✅ Training at 4am (synchronized with fixtures)

---

## 🔧 Configuration Files

### GitHub Actions Workflows
- **Historical Training:** `.github/workflows/historical-training.yml` (2am UTC)
- **Daily Training:** `.github/workflows/daily-lm-training.yml` (4am UTC) ⭐ UPDATED

### Backend Cron (if needed)
```bash
# apps/backend/.env
PREDICTION_CRON_SCHEDULE=0 4 * * *  # 4am UTC
```

---

## 📈 Expected Results

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

**Status:** ✅ Schedule updated and deployed
