# 🚀 Quick Start - One-Time Setup

**Goal:** Train on your 100k fixtures once, then everything runs automatically!

---

## ✅ Step 1: Put Your 100k Fixtures in Place (2 minutes)

Your CSV file with 100k fixtures should go here:

```
ml_training/data/processed/training_data.csv
```

**Required columns:**
- `fixture_id`, `date`, `league`, `home_team`, `away_team`
- `home_goals`, `away_goals`, `total_goals`
- `btts`, `over_2_5_goals`, `over_9_5_corners`, `over_3_5_cards`
- `home_corners`, `away_corners`, `total_corners`
- `home_yellow_cards`, `away_yellow_cards`, `home_red_cards`, `away_red_cards`, `total_cards`

---

## ✅ Step 2: Run First Training (10 minutes)

```bash
cd ml_training

# Install dependencies (first time only)
pip install -r requirements.txt

# Train the 4 ML babies on your 100k fixtures
python scripts/03_train_models.py

# Update the analytics hub
python scripts/06_update_analytics_hub.py
```

**What this does:**
- Trains BTTS, Goals, Corners, Cards models
- Saves models to `ml_training/models/`
- Creates `metadata.json` with accuracy stats
- Updates analytics hub dashboard

---

## ✅ Step 3: Enable GitHub Actions (2 minutes)

### 3a. Enable Actions
1. Go to: https://github.com/dannythehat/footy-oracle-v2/settings/actions
2. Under "Actions permissions":
   - ✅ Select "Allow all actions and reusable workflows"
3. Under "Workflow permissions":
   - ✅ Select "Read and write permissions"
4. Click **Save**

### 3b. Add API Key
1. Go to: https://github.com/dannythehat/footy-oracle-v2/settings/secrets/actions
2. Click **New repository secret**
3. Name: `API_FOOTBALL_KEY`
4. Value: Your API-Football key
5. Click **Add secret**

---

## ✅ Step 4: Commit and Push (1 minute)

```bash
# From repository root
git add ml_training/data/processed/training_data.csv
git add ml_training/models/*
git add analytics_hub/metrics/*
git commit -m "🤖 Initial training on 100k fixtures"
git push
```

---

## 🎉 Done! Everything is Now Automated

### What Happens Automatically Every Day at 4am UTC:

1. ✅ **Fetches yesterday's fixtures** (~100-200 matches)
2. ✅ **Adds them to training data** (100k → 100.1k → 100.2k...)
3. ✅ **Retrains all 4 ML babies** (~10 minutes)
4. ✅ **Updates analytics hub** (new metrics, charts)
5. ✅ **Generates predictions** (Golden Bets, Value Bets)
6. ✅ **Commits to Git** (auto-deploy)

**You do NOTHING!** Just check the dashboard daily.

---

## 📊 Your Daily Dashboard

### Option 1: GitHub Pages (Recommended)

**Enable GitHub Pages:**
1. Go to: https://github.com/dannythehat/footy-oracle-v2/settings/pages
2. Source: Deploy from a branch
3. Branch: `main`
4. Folder: `/analytics_hub/dashboard`
5. Click **Save**

**Your live dashboard:**
```
https://dannythehat.github.io/footy-oracle-v2/
```

### Option 2: Local File

Open in browser:
```
file:///path/to/footy-oracle-v2/analytics_hub/dashboard/index.html
```

### Option 3: GitHub Actions Tab

Check training runs:
```
https://github.com/dannythehat/footy-oracle-v2/actions
```

---

## 📈 What You'll See on the Dashboard

### Summary Cards
```
⚽ BTTS                    🎯 Over 2.5 Goals
68.4%                     69.2%
↑ +0.2% (7d)             ↑ +0.3% (7d)

🚩 Over 9.5 Corners       🟨 Over 3.5 Cards
65.3%                     67.1%
↑ +0.1% (7d)             ↑ +0.4% (7d)
```

### Evolution Chart
Line graph showing 30-day accuracy trends for all 4 models

### Model Performance
Detailed stats for each model:
- Current accuracy
- 7-day average
- 30-day average
- Best ever

### Accuracy Comparison
Bar chart comparing current vs best performance

---

## 🔍 Daily Monitoring (5 minutes)

### Morning Routine (5am UTC):

**1. Check GitHub Actions** (30 seconds)
- Go to: https://github.com/dannythehat/footy-oracle-v2/actions
- See green ✅ = training successful
- Click to see: "Trained on 156 new fixtures"

**2. Check Dashboard** (2 minutes)
- Open: https://dannythehat.github.io/footy-oracle-v2/
- See updated accuracy
- See 30-day trends
- See model improvements

**3. Check Predictions** (2 minutes)
- File: `shared/ml_outputs/predictions.json`
- Golden Bets for today
- Value Bets for today

---

## 📊 Growth Tracking

### Expected Progress:

| Week | Total Fixtures | BTTS Accuracy | Goals Accuracy |
|------|---------------|---------------|----------------|
| 1    | 100,700       | 68.4%         | 69.2%          |
| 2    | 101,400       | 68.6%         | 69.4%          |
| 4    | 102,800       | 68.9%         | 69.7%          |
| 8    | 105,600       | 69.3%         | 70.1%          |
| 12   | 108,400       | 69.7%         | 70.5%          |

**Target:** 70%+ accuracy on all markets

---

## 🎯 Optional: Historical Training

Want to add MORE historical data (2018, 2017, 2016...)?

**Enable it once:**
```bash
# Create progress file
echo '{"current_year": 2018}' > ml_training/data/training_progress.json
git add ml_training/data/training_progress.json
git commit -m "Enable historical training"
git push
```

**Then it runs automatically:**
- Midnight: Downloads 2018 fixtures (~30k)
- 2am: Trains on them
- Next day: Downloads 2017
- And so on...

**You do nothing!** It goes back year by year.

---

## 🚨 Troubleshooting

### Training Failed?
1. Check: https://github.com/dannythehat/footy-oracle-v2/actions
2. Click failed run
3. See error message
4. Usually: API key issue or no fixtures found

### Dashboard Not Updating?
1. Check if `analytics_hub/metrics/` has files
2. Run manually: `python scripts/06_update_analytics_hub.py`
3. Check GitHub Pages is enabled

### No Predictions?
1. Check: `ml_training/data/incremental/`
2. Should have yesterday's date CSV
3. If empty: No fixtures yesterday (rare)

---

## 📝 Summary

**You do (ONE TIME):**
1. ✅ Put 100k fixtures in `data/processed/training_data.csv`
2. ✅ Run `python scripts/03_train_models.py`
3. ✅ Run `python scripts/06_update_analytics_hub.py`
4. ✅ Enable GitHub Actions
5. ✅ Add API key to secrets
6. ✅ Enable GitHub Pages
7. ✅ Commit and push

**System does (DAILY):**
- ✅ Fetches new fixtures
- ✅ Trains models
- ✅ Updates dashboard
- ✅ Generates predictions
- ✅ Commits everything

**You check (DAILY):**
- 📊 Dashboard: https://dannythehat.github.io/footy-oracle-v2/
- ✅ Actions: https://github.com/dannythehat/footy-oracle-v2/actions
- 🎲 Predictions: `shared/ml_outputs/predictions.json`

**Zero manual work!** 🎉
