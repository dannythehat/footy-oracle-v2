# 🤖 Automation Guide - Cloud-Based Training

**Zero local setup required!** Everything runs automatically in GitHub Actions.

---

## 🎯 What's Automated

### 1. **Main Production Models** (Daily)
- ⏰ Runs at **4 AM UTC** every day
- 🔄 Fetches yesterday's fixtures
- 🤖 Trains 4 main models (BTTS, Goals, Corners, Cards)
- 📊 Updates analytics hub
- 🚀 Auto-deploys if improved

### 2. **Experimental Models** (Weekly)
- ⏰ Runs at **5 AM UTC** every Sunday
- 🧪 Trains experimental models (Red Cards, Bookings, Win by 2+, HT/FT)
- 💾 Saves to separate directory
- 📈 Tracks performance independently

---

## ⚙️ Setup (One-Time)

### Step 1: Add API Key Secret
1. Go to your repo: https://github.com/dannythehat/footy-oracle-v2
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `API_FOOTBALL_KEY`
5. Value: Your API-Football key
6. Click **Add secret**

### Step 2: Enable GitHub Actions
1. Go to **Actions** tab
2. If prompted, click **I understand my workflows, go ahead and enable them**

**That's it!** ✅ Everything else is automated.

---

## 🚀 Manual Triggers

You can manually trigger training anytime:

### Trigger Main Training
1. Go to **Actions** tab
2. Click **🤖 Daily LM Training Pipeline**
3. Click **Run workflow** → **Run workflow**

### Trigger Experimental Training
1. Go to **Actions** tab
2. Click **🧪 Experimental LM Training Pipeline**
3. Click **Run workflow** → **Run workflow**

---

## 📊 Monitoring

### View Training Logs
1. Go to **Actions** tab
2. Click on any workflow run
3. Expand steps to see detailed logs

### Check Model Performance
After training completes, check:
- `ml_training/models/metadata.json` - Main models
- `ml_training/models/experimental/experimental_metadata.json` - Experimental models

### View Analytics Hub
Open: `analytics_hub/dashboard/index.html` (download and open locally, or use GitHub Pages)

---

## 📅 Training Schedule

| Pipeline | Frequency | Time (UTC) | What It Does |
|----------|-----------|------------|--------------|
| **Main Production** | Daily | 4:00 AM | Trains 4 main models with yesterday's data |
| **Experimental** | Weekly | 5:00 AM Sunday | Trains experimental models with full dataset |

### Why These Times?
- **4 AM UTC**: After most matches finish globally
- **Sunday 5 AM**: Weekly batch training for experimental models
- **Aligned**: Main training finishes before experimental starts

---

## 🔧 Customization

### Change Training Time

**Main Models:**
Edit `.github/workflows/daily-lm-training.yml`:
```yaml
schedule:
  - cron: '0 4 * * *'  # Change to your preferred time
```

**Experimental Models:**
Edit `.github/workflows/experimental-lm-training.yml`:
```yaml
schedule:
  - cron: '0 5 * * 0'  # Change to your preferred time
```

**Cron Format**: `minute hour day month weekday`
- `0 4 * * *` = 4 AM daily
- `0 5 * * 0` = 5 AM every Sunday
- `0 12 * * 1-5` = 12 PM Monday-Friday

### Change Training Frequency

**Train Experimental Models Daily:**
```yaml
schedule:
  - cron: '0 5 * * *'  # Remove the '0' at the end
```

**Train Main Models Twice Daily:**
```yaml
schedule:
  - cron: '0 4,16 * * *'  # 4 AM and 4 PM
```

---

## 🐛 Troubleshooting

### "Workflow not running"
**Check:**
1. GitHub Actions enabled? (Actions tab)
2. API key added? (Settings → Secrets)
3. Correct cron syntax? (Use [crontab.guru](https://crontab.guru))

**Fix:**
- Manually trigger once to test
- Check workflow file syntax

### "Training failed"
**Check logs:**
1. Go to Actions tab
2. Click failed run
3. Expand failed step

**Common issues:**
- Missing API key
- Invalid data format
- Insufficient data

### "No experimental models trained"
**This is normal if:**
- Data missing required columns (e.g., `ht_home_goals`)
- First run before data is available

**Fix:**
- Wait for more data to accumulate
- Check data availability: Run experimental workflow manually

### "Models not updating"
**Check:**
1. Workflow completed successfully?
2. Changes committed? (Check commits)
3. Files in correct location?

**Fix:**
- Check git commit step in logs
- Verify file paths in workflow

---

## 📈 What Happens During Training

### Main Pipeline (Daily)
```
1. Fetch Fixtures (01_fetch_fixtures.py)
   ↓
2. Process Data (02_process_data.py)
   ↓
3. Train Models (03_train_models.py)
   ↓
4. Evaluate (04_evaluate.py)
   ↓
5. Deploy (05_deploy.py)
   ↓
6. Update Analytics (06_update_analytics_hub.py)
   ↓
7. Commit & Push
```

### Experimental Pipeline (Weekly)
```
1. Check Data Availability (02b_process_experimental_targets.py)
   ↓
2. Train Experimental Models (03b_train_experimental_models.py)
   ↓
3. Commit & Push
```

---

## 💡 Best Practices

### 1. **Monitor First Week**
- Check Actions tab daily
- Verify models are training
- Review performance metrics

### 2. **Review Logs Weekly**
- Check for errors or warnings
- Monitor accuracy trends
- Adjust if needed

### 3. **Update Data Sources**
- Ensure API key is valid
- Monitor API rate limits
- Add more leagues if needed

### 4. **Performance Tracking**
- Download analytics hub weekly
- Compare model improvements
- Document significant changes

---

## 🎯 Success Metrics

### After 1 Week:
- ✅ 7 successful daily runs
- ✅ 1 successful experimental run
- ✅ Models improving or stable
- ✅ No critical errors

### After 1 Month:
- ✅ 30 successful daily runs
- ✅ 4 successful experimental runs
- ✅ +2-5% accuracy improvement
- ✅ Analytics hub showing trends

### After 3 Months:
- ✅ 90 successful daily runs
- ✅ 12 successful experimental runs
- ✅ +5-10% accuracy improvement
- ✅ Experimental models ready for production

---

## 🚀 Next Steps

1. ✅ **Setup Complete**: API key added, Actions enabled
2. ⏳ **Wait for First Run**: 4 AM UTC tomorrow
3. 📊 **Check Results**: Actions tab after run
4. 🎉 **Enjoy**: Fully automated training!

---

## 📞 Need Help?

### Check These First:
1. **Actions Tab**: See workflow runs and logs
2. **EXPERIMENTAL_MODELS.md**: Experimental models guide
3. **README.md**: General overview

### Common Questions:

**Q: Do I need to run anything locally?**  
A: No! Everything runs in GitHub Actions automatically.

**Q: How do I know if training worked?**  
A: Check Actions tab for green checkmarks, or view model metadata files.

**Q: Can I change the schedule?**  
A: Yes! Edit the workflow files (see Customization section above).

**Q: What if I want to train immediately?**  
A: Use manual trigger (see Manual Triggers section above).

**Q: How much does this cost?**  
A: GitHub Actions is free for public repos, and has generous free tier for private repos.

---

**🎉 You're all set!** Your models will train automatically in the cloud. No local setup needed!

---

**Last Updated**: 2025-11-25  
**Status**: Fully Automated  
**Local Setup Required**: None ✅
