# 🤖 Historical Training V2 - 3-Phase Pipeline

**Last Updated:** Nov 25, 2025  
**Status:** ✅ Implemented and Ready

---

## 🎯 Problem Solved

### ❌ Old Approach (Single-Phase)
```
2:00 AM → Download 30k fixtures + stats (3-5 hours)
         ↓ Still running...
4:00 AM → Daily training starts (CONFLICT!)
         ↓ Resource issues, delays
6:00 AM → Historical finally completes
```

**Issues:**
- Historical training took 3-5 hours (30k API calls for stats)
- Blocked daily training at 4am
- Unpredictable completion times
- Resource conflicts

### ✅ New Approach (3-Phase)
```
12:00 AM → Download fixtures + stats (2-4 hours)
          ↓ Saves raw JSON
2:00 AM  → Process + Train (~30 min)
          ↓ Fast processing
4:00 AM  → Daily training (~10 min)
          ↓ No conflicts!
```

**Benefits:**
- ✅ Separates slow download from fast processing
- ✅ No conflicts - each phase completes before next
- ✅ Predictable timing
- ✅ Can retry downloads without re-training
- ✅ Historical training: 30 min (was 3-5 hours!)

---

## 📁 Architecture

### Phase 1: Download (Midnight)
**Script:** `00a_download_historical_data.py`  
**Duration:** 2-4 hours  
**Workflow:** `.github/workflows/download-historical-data.yml`

**What it does:**
1. Reads current year from `training_progress.json`
2. Fetches all fixtures for that year (~30k fixtures)
3. Downloads detailed stats for each fixture
4. Saves raw JSON files:
   - `data/historical/raw/YYYY_fixtures.json`
   - `data/historical/raw/YYYY_stats.json`
5. Commits to Git

**Why midnight?**
- Needs 2-4 hours to complete
- Must finish before 2am training
- Runs when API traffic is low

### Phase 2: Train (2am)
**Script:** `00b_train_historical_models.py`  
**Duration:** ~30 minutes  
**Workflow:** `.github/workflows/historical-training.yml`

**What it does:**
1. Loads pre-downloaded JSON files
2. Processes fixtures with stats (fast!)
3. Creates processed CSV: `data/historical/fixtures_YYYY.csv`
4. Combines with previous years' data
5. Trains all 4 ML models
6. Updates `training_progress.json`
7. Commits models and data

**Why 2am?**
- Midnight download completes by ~4-5am worst case
- Gives 2+ hour buffer
- Completes before 4am daily training

### Phase 3: Daily Update (4am)
**Scripts:** `01_fetch_fixtures.py` → `03_train_models.py`  
**Duration:** ~10 minutes  
**Workflow:** `.github/workflows/daily-lm-training.yml`

**What it does:**
1. Fetches yesterday's fixtures (~100-200)
2. Quick incremental training
3. Generates predictions

**Why 4am?**
- Aligned with AI fixtures deployment
- Historical training already complete
- No conflicts

---

## 🚀 Usage

### Automatic (GitHub Actions)
Runs automatically every day:
- **12:00 AM UTC** - Download historical data
- **2:00 AM UTC** - Train models
- **4:00 AM UTC** - Daily update

### Manual Testing

#### Test Download
```bash
cd ml_training

# Download specific year
python scripts/00a_download_historical_data.py --year 2015

# Download fewer leagues (faster testing)
python scripts/00a_download_historical_data.py --year 2015 --leagues 10

# Auto-detect year from progress file
python scripts/00a_download_historical_data.py
```

#### Test Training
```bash
cd ml_training

# Train on specific year (must have downloaded data first!)
python scripts/00b_train_historical_models.py --year 2015

# Auto-detect year from progress file
python scripts/00b_train_historical_models.py
```

#### Full Pipeline Test
```bash
# Download 2015 data with 10 leagues (faster)
python scripts/00a_download_historical_data.py --year 2015 --leagues 10

# Wait for download to complete, then train
python scripts/00b_train_historical_models.py --year 2015
```

---

## 📊 Data Flow

### Directory Structure
```
ml_training/data/
├── historical/
│   ├── raw/                          # NEW - Raw downloads
│   │   ├── 2018_fixtures.json       # All fixtures for 2018
│   │   ├── 2018_stats.json          # All stats for 2018
│   │   ├── 2017_fixtures.json
│   │   ├── 2017_stats.json
│   │   └── ...
│   ├── fixtures_2018.csv            # Processed CSV
│   ├── fixtures_2017.csv
│   └── ...
├── processed/
│   └── training_data.csv            # Combined data for training
├── incremental/                      # Daily fixtures
│   └── YYYY-MM-DD.csv
└── training_progress.json           # Tracks current year
```

### File Formats

**Raw Fixtures JSON:**
```json
[
  {
    "fixture": {"id": 12345, "date": "2015-08-08T14:00:00+00:00"},
    "league": {"id": 39, "name": "Premier League"},
    "teams": {
      "home": {"id": 33, "name": "Manchester United"},
      "away": {"id": 34, "name": "Tottenham"}
    },
    "goals": {"home": 1, "away": 0}
  }
]
```

**Raw Stats JSON:**
```json
{
  "12345": [
    {
      "team": {"id": 33, "name": "Manchester United"},
      "statistics": [
        {"type": "Corner Kicks", "value": 6},
        {"type": "Yellow Cards", "value": 2}
      ]
    },
    {
      "team": {"id": 34, "name": "Tottenham"},
      "statistics": [...]
    }
  ]
}
```

**Processed CSV:**
```csv
fixture_id,date,league,home_team,away_team,home_goals,away_goals,btts,over_2_5_goals,home_corners,away_corners,total_corners,over_9_5_corners,...
12345,2015-08-08,Premier League,Manchester United,Tottenham,1,0,0,0,6,4,10,1,...
```

---

## 🔧 Configuration

### Environment Variables
```bash
# .env file
API_FOOTBALL_KEY=your_api_key_here
```

### GitHub Secrets
Go to: **Settings → Secrets → Actions**

Add:
- `API_FOOTBALL_KEY` - Your API-Football key

### Workflow Schedules
```yaml
# download-historical-data.yml
schedule:
  - cron: '0 0 * * *'  # Midnight UTC

# historical-training.yml
schedule:
  - cron: '0 2 * * *'  # 2am UTC

# daily-lm-training.yml
schedule:
  - cron: '0 4 * * *'  # 4am UTC
```

---

## 📈 Progress Tracking

### Check Current Status
```bash
cd ml_training
cat data/training_progress.json
```

**Example output:**
```json
{
  "current_year": 2015,
  "last_trained": "2025-11-25T02:30:00Z",
  "stats": {
    "year": 2015,
    "total_fixtures": 28543,
    "leagues_covered": 50,
    "file": "data/historical/fixtures_2015.csv"
  },
  "next_year": 2014
}
```

### Check Downloaded Data
```bash
# List downloaded years
ls -lh ml_training/data/historical/raw/

# Check file sizes
du -h ml_training/data/historical/raw/2015_*.json

# Count fixtures in JSON
cat ml_training/data/historical/raw/2015_fixtures.json | grep -o '"fixture"' | wc -l
```

### Check Processed Data
```bash
# List processed CSVs
ls -lh ml_training/data/historical/fixtures_*.csv

# Count rows in CSV
wc -l ml_training/data/historical/fixtures_2015.csv
```

---

## 🐛 Troubleshooting

### Download Failed
```bash
# Check logs
tail -f ml_training/logs/download_historical_YYYYMMDD.log

# Retry download
python scripts/00a_download_historical_data.py --year 2015
```

### Training Failed
```bash
# Check if data exists
ls ml_training/data/historical/raw/2015_*.json

# Check logs
tail -f ml_training/logs/train_historical_YYYYMMDD.log

# Retry training
python scripts/00b_train_historical_models.py --year 2015
```

### Missing Stats
If some fixtures are missing stats:
- Download script saves checkpoints every 500 fixtures
- Can resume from checkpoint
- Stats file will have fewer entries than fixtures file
- Training script skips fixtures without stats

---

## 🎯 Expected Timeline

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

## 🔄 Migration from Old System

### Old Files (Deprecated)
- ❌ `00_historical_training.py` - Single-phase approach

### New Files (Active)
- ✅ `00a_download_historical_data.py` - Download phase
- ✅ `00b_train_historical_models.py` - Training phase

### Backward Compatibility
- Old `training_progress.json` format still works
- Can continue from where old system left off
- No data migration needed

---

## 📝 Notes

### API Rate Limits
- API-Football: 100 requests/day (free tier)
- 300 requests/day (basic tier)
- 3000 requests/day (pro tier)
- Download script respects rate limits with delays

### Storage Requirements
- Raw JSON: ~50-100 MB per year
- Processed CSV: ~20-30 MB per year
- Total for 18 years: ~1-2 GB

### Cleanup Strategy
```bash
# Optional: Delete raw files after successful training
rm ml_training/data/historical/raw/2015_*.json

# Keep processed CSVs for training
# Keep training_progress.json for tracking
```

---

**Status:** ✅ Production Ready  
**Next Steps:** Monitor first automated run at midnight UTC
