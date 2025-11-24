# 🤖 Historical Training Pipeline

## Overview

This pipeline trains your LM babies (BTTS, Goals, Corners, Cards models) on historical football data, going back year by year from 2018 to as far back as data is available.

**Strategy:**
- Start with 2018 fixtures from 50 top leagues (~50k games)
- Train models daily at 2am
- Each day, go back one year (2017, 2016, 2015, etc.)
- Continue until no more historical data is available
- Log everything and track progress

## 📁 Files Created

```
ml_training/
├── scripts/
│   └── 00_historical_training.py    # NEW - Historical training pipeline
├── data/
│   ├── historical/                  # NEW - Year-by-year fixture data
│   │   ├── fixtures_2018.csv
│   │   ├── fixtures_2017.csv
│   │   └── ...
│   └── training_progress.json       # NEW - Tracks current year
└── logs/
    └── historical_training_YYYYMMDD.log  # Daily logs
```

## 🚀 Quick Start

### 1. Test the Pipeline (Single Year)

```bash
cd ml_training
python scripts/00_historical_training.py --test
```

This will:
- Fetch fixtures for the current training year (starts at 2018)
- Save to `data/historical/fixtures_2018.csv`
- NOT train models (test mode only)

### 2. Run Full Pipeline (One Day)

```bash
python scripts/00_historical_training.py
```

This will:
- Fetch all fixtures for current year
- Train models on all data collected so far
- Save progress
- Move to next year (2017, 2016, etc.)

### 3. Customize Settings

```bash
# Start from different year
python scripts/00_historical_training.py --start-year 2020

# Use fewer leagues (faster testing)
python scripts/00_historical_training.py --leagues 10
```

## ⏰ Automated Daily Execution

### Option 1: Cron (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2am)
0 2 * * * cd /path/to/footy-oracle-v2/ml_training && /usr/bin/python3 scripts/00_historical_training.py >> logs/cron.log 2>&1
```

### Option 2: Task Scheduler (Windows)

1. Open Task Scheduler
2. Create Basic Task
3. Name: "LM Historical Training"
4. Trigger: Daily at 2:00 AM
5. Action: Start a program
   - Program: `python`
   - Arguments: `scripts/00_historical_training.py`
   - Start in: `C:\path\to\footy-oracle-v2\ml_training`

### Option 3: GitHub Actions (Recommended)

Create `.github/workflows/historical-training.yml`:

```yaml
name: Historical Training Pipeline

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2am UTC
  workflow_dispatch:  # Manual trigger

jobs:
  train:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      
      - name: Install dependencies
        run: |
          cd ml_training
          pip install -r requirements.txt
      
      - name: Run historical training
        env:
          API_FOOTBALL_KEY: ${{ secrets.API_FOOTBALL_KEY }}
        run: |
          cd ml_training
          python scripts/00_historical_training.py
      
      - name: Commit updated models
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add ml_training/data/historical/
          git add ml_training/data/training_progress.json
          git add ml_training/models/
          git add ml_training/logs/
          git commit -m "🤖 Daily historical training: $(date +'%Y-%m-%d')" || echo "No changes"
          git push
```

**Setup:**
1. Go to GitHub repo → Settings → Secrets
2. Add `API_FOOTBALL_KEY` secret
3. Commit the workflow file
4. It will run automatically daily at 2am UTC

## 📊 Progress Tracking

### Check Current Status

```bash
cat data/training_progress.json
```

Example output:
```json
{
  "current_year": 2017,
  "last_trained": "2025-11-24T02:00:00",
  "stats": {
    "year": 2017,
    "total_fixtures": 48234,
    "leagues_covered": 50,
    "file": "data/historical/fixtures_2017.csv"
  },
  "next_year": 2016
}
```

### View Logs

```bash
# Latest log
tail -f logs/historical_training_$(date +%Y%m%d).log

# All logs
ls -lh logs/
```

## 🎯 Expected Timeline

| Day | Year | Cumulative Fixtures | Training Time |
|-----|------|---------------------|---------------|
| 1   | 2018 | ~50,000            | ~2 hours      |
| 2   | 2017 | ~100,000           | ~3 hours      |
| 3   | 2016 | ~150,000           | ~4 hours      |
| 4   | 2015 | ~200,000           | ~5 hours      |
| 5   | 2014 | ~250,000           | ~6 hours      |
| ... | ...  | ...                | ...           |
| 18  | 2001 | ~900,000           | ~15 hours     |

**Note:** Training time increases as dataset grows. Consider running on a powerful machine or cloud instance.

## 🔧 Configuration

### Top 50 Leagues Tracked

The script tracks these leagues (edit `TOP_50_LEAGUES` in script to customize):

1. Premier League (England)
2. La Liga (Spain)
3. Bundesliga (Germany)
4. Serie A (Italy)
5. Ligue 1 (France)
6. Primeira Liga (Portugal)
7. Eredivisie (Netherlands)
8. Belgian Pro League
9. Super Lig (Turkey)
10. Russian Premier League
... and 40 more

### API Rate Limits

- API-Football free tier: 100 requests/day
- Script includes rate limiting (0.5s between requests)
- For 50 leagues × ~1000 fixtures/year = ~50,000 API calls
- **Recommendation:** Use paid API plan for historical data collection

## 🐛 Troubleshooting

### "No fixtures collected"
- Check API key in `.env`
- Verify API quota not exceeded
- Check internet connection

### "Training failed"
- Ensure `02_process_data.py` ran successfully
- Check for missing dependencies: `pip install -r requirements.txt`
- Review logs in `logs/` directory

### "Out of memory"
- Reduce `--leagues` parameter
- Use a machine with more RAM
- Consider cloud training (AWS, GCP, Azure)

## 📈 Model Performance Tracking

After each training run, check model performance:

```bash
cat models/metadata.json
```

Example:
```json
{
  "trained_at": "2025-11-24T02:30:00",
  "total_models": 4,
  "models": {
    "btts": {
      "val_accuracy": 0.6842,
      "val_auc_roc": 0.7234,
      "val_log_loss": 0.5621
    },
    "over_2_5_goals": {
      "val_accuracy": 0.6923,
      "val_auc_roc": 0.7456,
      "val_log_loss": 0.5432
    }
  }
}
```

## 🎯 Success Criteria

**Target Accuracy:** 70%+ on all bet types

Current progress:
- ✅ BTTS: 68.4% → Target: 70%+
- ✅ Over 2.5 Goals: 69.2% → Target: 70%+
- 🎯 Over 9.5 Corners: TBD
- 🎯 Over 3.5 Cards: TBD

## 🚨 Important Notes

1. **API Costs:** Historical data collection requires many API calls. Monitor your API usage.

2. **Storage:** Each year = ~50MB CSV. 18 years = ~900MB total.

3. **Training Time:** Increases linearly with data size. Consider cloud GPU for faster training.

4. **Data Quality:** Older years may have incomplete statistics. Script handles missing data gracefully.

5. **Backup:** Models are saved to `models/` directory. Commit to Git after each successful run.

## 📞 Support

Issues? Check:
1. Logs in `logs/` directory
2. Progress in `data/training_progress.json`
3. API quota at api-football.com
4. GitHub Issues for bug reports

---

**Last Updated:** Nov 24, 2025  
**Status:** ✅ Ready for deployment
