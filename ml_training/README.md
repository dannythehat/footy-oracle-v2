# 🤖 LM Training & Analytics Hub

**Complete automated training pipeline and intelligence dashboard for Footy Oracle LM babies.**

---

## 🎯 What This Does

✅ **Trains 4 ML models** daily (BTTS, Goals, Corners, Cards)  
✅ **Trains 4+ experimental models** separately (Red Cards, Bookings, Win by 2+, HT/FT)  
✅ **Tracks performance** with beautiful analytics dashboard  
✅ **Automates everything** - runs at 2 AM UTC daily  
✅ **Proves intelligence** - shows measurable improvement over time  
✅ **Production ready** - deploys models automatically  

---

## 🚀 Quick Start (3 Steps)

### 1. Upload Your 100k Data
```bash
# Copy your CSV files
cp /path/to/your/fixtures_*.csv data/raw/

# Or use the helper
python upload_data.py
```

### 2. Train Locally
```bash
# Install dependencies
pip install -r requirements.txt

# Run complete pipeline (main 4 models)
bash pipeline.sh

# OR train experimental models separately
python scripts/02b_process_experimental_targets.py
python scripts/03b_train_experimental_models.py
```

### 3. View Analytics Hub
```bash
# Open the dashboard
open ../analytics_hub/dashboard/index.html
```

**That's it!** Your LM babies are now training and you can see their progress in the stunning analytics hub.

---

## 🧪 Experimental Models (NEW!)

In addition to the main 4 production models, we're training **experimental learning machines** that are getting smart for future deployment:

### Experimental Models:
1. **🔴 Red Card in Game** - Predicts if any red card will be shown
2. **📒 Player Booking** - Predicts booking activity (team-level)
3. **⚽ Win by +2 Goals** - Predicts dominant victories (home/away/either)
4. **🕐 Halftime/Fulltime** - Predicts HT/FT combined outcomes (9 patterns)

### Key Features:
- ✅ **Completely separate** from main 4 models
- ✅ **No interference** with production pipeline
- ✅ **Independent training** and storage
- ✅ **Future deployment ready**

### Train Experimental Models:
```bash
# Check data availability
python scripts/02b_process_experimental_targets.py

# Train all experimental models
python scripts/03b_train_experimental_models.py
```

**Models saved to**: `models/experimental/`

**Documentation**: See [EXPERIMENTAL_MODELS.md](EXPERIMENTAL_MODELS.md) for full details.

---

## 📊 Analytics Hub Preview

The dashboard shows:
- **📈 Real-time accuracy** for all 4 models
- **📊 30-day evolution** charts
- **🎯 Performance breakdown** per model
- **🚀 Improvement trends** (7-day and 30-day)

**Features:**
- Beautiful purple/black theme
- Interactive Chart.js visualizations
- Responsive design
- Auto-updating metrics

---

## 🔄 Automated Daily Training

Once set up, GitHub Actions will:
1. Fetch yesterday's fixtures (2 AM UTC)
2. Process and merge with existing data
3. Train all 4 models
4. Evaluate performance
5. Deploy if improved
6. Update analytics hub
7. Commit changes

**Setup:**
1. Go to repo Settings → Secrets → Actions
2. Add: `API_FOOTBALL_KEY` = your API key
3. Done!

---

## 📁 What's Included

### Main Training Scripts
- `01_fetch_fixtures.py` - Daily fixture fetcher
- `02_process_data.py` - Data processing & feature engineering
- `03_train_models.py` - Model training (4 XGBoost models)
- `04_evaluate.py` - Performance evaluation & tracking
- `05_deploy.py` - Production deployment

### Experimental Training Scripts (NEW!)
- `02b_process_experimental_targets.py` - Add experimental targets
- `03b_train_experimental_models.py` - Train experimental models

### Analytics Hub
- `../analytics_hub/dashboard/index.html` - Stunning dashboard
- `../analytics_hub/metrics/` - Performance data (JSON)

### Automation
- `../.github/workflows/daily-lm-training.yml` - GitHub Actions

### Helpers
- `pipeline.sh` - One-command training
- `upload_data.py` - Data upload helper

### Documentation
- `COMPLETE_SETUP_GUIDE.md` - Full walkthrough
- `TRAINING_GUIDE.md` - Training details
- `EXPERIMENTAL_MODELS.md` - Experimental models guide (NEW!)
- `SUMMARY.md` - Quick overview

---

## 📈 Expected Performance

### Main Production Models (Initial Training - 100k fixtures)
- BTTS: **70-72%** accuracy
- Over 2.5 Goals: **73-76%** accuracy
- Over 9.5 Corners: **68-71%** accuracy
- Over 3.5 Cards: **69-72%** accuracy

### Experimental Models (Initial Training)
- Red Card: **65-75%** accuracy
- Player Booking: **70-80%** accuracy
- Win by 2+: **70-75%** accuracy
- HT/FT: **40-50%** accuracy (multi-class)

### After 30 Days
- **+2-5%** improvement across all models
- **+1,000-2,000** new fixtures
- Better pattern recognition

### After 90 Days
- **75-80%** target accuracy
- **+3,000-6,000** new fixtures
- Proven improvement track record

---

## 🎯 Business Value

### For Investors
Show provable intelligence growth:
- Daily improvement tracking
- Professional analytics dashboard
- Measurable performance metrics
- Automated, scalable system

### For Feature Expansion
Track new capabilities:
- Bet builders (combo bets)
- Referee pattern analysis
- Weather impact predictions
- New market additions
- **Experimental models ready for deployment**

### For Quality Assurance
Monitor performance:
- Daily accuracy tracking
- Trend analysis
- Anomaly detection
- Historical comparison

---

## 🔧 Customization

### Change Training Time
Edit `../.github/workflows/daily-lm-training.yml`:
```yaml
schedule:
  - cron: '0 2 * * *'  # Change time here
```

### Adjust Model Parameters
Edit `scripts/03_train_models.py` or `scripts/03b_train_experimental_models.py`:
```python
self.model_params = {
    'n_estimators': 300,      # More = better accuracy
    'max_depth': 7,           # Deeper = more complex
    'learning_rate': 0.05,    # Lower = more careful
}
```

### Add Custom Features
Edit `scripts/02_process_data.py`:
```python
def engineer_features(df):
    # Add your features here
    df['my_feature'] = ...
    return df
```

---

## 📚 Documentation

- **[COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)** - Full setup walkthrough
- **[TRAINING_GUIDE.md](TRAINING_GUIDE.md)** - Training pipeline details
- **[EXPERIMENTAL_MODELS.md](EXPERIMENTAL_MODELS.md)** - Experimental models guide
- **[SUMMARY.md](SUMMARY.md)** - Quick overview

---

## 🐛 Troubleshooting

### "No CSV files found"
```bash
# Check data location
ls data/raw/

# Copy your files
cp /path/to/fixtures_*.csv data/raw/
```

### "Training failed"
```bash
# Validate your data
python upload_data.py

# Check for required columns
# fixture_id, date, home_team, away_team, home_goals, away_goals
```

### "Analytics hub shows no data"
```bash
# Run training first
bash pipeline.sh

# Check metrics exist
ls ../analytics_hub/metrics/
```

### "Experimental models missing data"
```bash
# Check what data is available
python scripts/02b_process_experimental_targets.py

# Script will show which models can be trained
# based on available data columns
```

---

## 🎉 You're All Set!

Your LM babies are ready to:
- ✅ Train automatically every day
- ✅ Improve with every match
- ✅ Track performance beautifully
- ✅ Deploy to production
- ✅ **Train experimental models separately**

**Main Pipeline:**
```bash
bash pipeline.sh
```

**Experimental Pipeline:**
```bash
python scripts/02b_process_experimental_targets.py
python scripts/03b_train_experimental_models.py
```

Then open `../analytics_hub/dashboard/index.html` to see your intelligence hub! 🚀

---

**Built with ❤️ for Footy Oracle**  
*Making your LM babies smarter, one match at a time*
