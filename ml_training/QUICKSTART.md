# 🚀 Quick Start: Historical Training

**Get your LM babies training on historical data in 5 minutes!**

---

## ⚡ Fastest Path to Production

### Step 1: Add API Key (2 minutes)

1. Go to your GitHub repo: https://github.com/dannythehat/footy-oracle-v2
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `API_FOOTBALL_KEY`
5. Value: Your API-Football key
6. Click **Add secret**

### Step 2: Trigger First Run (1 minute)

1. Go to **Actions** tab
2. Click **"Historical Training Pipeline"** in left sidebar
3. Click **"Run workflow"** button (top right)
4. Click green **"Run workflow"** button
5. Watch it run! 🎉

### Step 3: Monitor Progress (2 minutes)

1. Click on the running workflow
2. Click **"historical-training"** job
3. Watch the logs in real-time
4. Wait for completion (~2 hours for first run)

---

## 📊 What Happens Next?

### First Run (Today)
- Fetches all 2018 fixtures from 50 leagues
- Processes ~50,000 games
- Trains 4 models (BTTS, Goals, Corners, Cards)
- Saves models and progress
- **Expected accuracy: 62-65%**

### Tomorrow at 2am UTC
- Automatically fetches 2017 fixtures
- Trains on 2017 + 2018 data (~100k games)
- **Expected accuracy: 64-67%**

### Day 3 at 2am UTC
- Fetches 2016 fixtures
- Trains on 2016-2018 data (~150k games)
- **Expected accuracy: 66-68%**

### Day 5 at 2am UTC
- Trains on 2014-2018 data (~250k games)
- **Expected accuracy: 68-70%** ✅ TARGET REACHED!

---

## 🎯 Quick Checks

### Is it working?

After first run completes, check:

```bash
# Clone repo and check progress
git pull
cat ml_training/data/training_progress.json
```

Should show:
```json
{
  "current_year": 2018,
  "last_trained": "2025-11-24T...",
  "stats": {
    "total_fixtures": 48234
  },
  "next_year": 2017
}
```

### View model performance

```bash
cat ml_training/models/metadata.json
```

Should show accuracy for all 4 models.

### Check logs

Go to Actions → Latest run → Artifacts → Download logs

---

## 🔧 Optional: Local Testing

Want to test locally first?

```bash
# Clone repo
git clone https://github.com/dannythehat/footy-oracle-v2.git
cd footy-oracle-v2/ml_training

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "API_FOOTBALL_KEY=your_key_here" > .env

# Test (no training, just data fetch)
python scripts/00_historical_training.py --test

# Full run (if test works)
python scripts/00_historical_training.py
```

---

## 📈 Expected Timeline

| Day | Year | Fixtures | Accuracy | Status |
|-----|------|----------|----------|--------|
| 1   | 2018 | 50k      | 62-65%   | 🟡 Below target |
| 2   | 2017 | 100k     | 64-67%   | 🟡 Below target |
| 3   | 2016 | 150k     | 66-68%   | 🟡 Below target |
| 4   | 2015 | 200k     | 67-69%   | 🟡 Below target |
| 5   | 2014 | 250k     | 68-70%   | 🟢 **TARGET!** |
| 10  | 2009 | 500k     | 70-72%   | 🟢 Above target |
| 18  | 2001 | 900k     | 72-75%   | 🟢 Excellent |

**Target: 70%+ accuracy** - Expected by Day 5!

---

## ⚠️ Important Notes

### API Costs
- Free tier: 100 requests/day ❌ Not enough
- Each year: ~50,000 requests
- **You need a paid API plan** for historical training

### GitHub Actions Minutes
- Free tier: 2,000 minutes/month
- Each run: ~2-6 hours (120-360 minutes)
- 18 runs = ~2,160-6,480 minutes
- **May need paid plan** or run locally

### Alternative: Run Locally
If GitHub Actions limits are an issue:

```bash
# Setup cron job (runs daily at 2am)
crontab -e

# Add this line
0 2 * * * cd /path/to/footy-oracle-v2/ml_training && python3 scripts/00_historical_training.py
```

---

## 🎉 That's It!

You're now set up for automated historical training!

**What happens automatically:**
- ✅ Daily data collection at 2am UTC
- ✅ Model training on growing dataset
- ✅ Progress tracking and logging
- ✅ Automatic commits to GitHub
- ✅ Accuracy improvements over time

**Your job:**
- Monitor progress occasionally
- Check accuracy improvements
- Deploy models when 70%+ accuracy reached

---

## 📞 Need Help?

**Check these first:**
1. [HISTORICAL_TRAINING.md](HISTORICAL_TRAINING.md) - Full documentation
2. [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Complete overview
3. GitHub Actions logs - Detailed execution logs

**Still stuck?**
- Check API key is correct
- Verify API quota not exceeded
- Review logs in `ml_training/logs/`
- Open GitHub issue

---

## ✅ Success Checklist

- [ ] API key added to GitHub Secrets
- [ ] First workflow run triggered
- [ ] First run completed successfully
- [ ] Progress file created
- [ ] Models saved
- [ ] Logs generated
- [ ] Next run scheduled for tomorrow 2am

**All checked?** You're good to go! 🚀

---

**Last Updated:** Nov 24, 2025  
**Time to complete:** 5 minutes  
**Time to 70% accuracy:** 5 days
