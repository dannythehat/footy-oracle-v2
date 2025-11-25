# ⚡ Quick Automation Setup (2 Minutes)

**Get fully automated cloud-based training in 2 minutes. Zero local setup!**

---

## ✅ Step 1: Add API Key (1 minute)

1. Go to: https://github.com/dannythehat/footy-oracle-v2/settings/secrets/actions
2. Click **New repository secret**
3. Name: `API_FOOTBALL_KEY`
4. Value: `[paste your API-Football key]`
5. Click **Add secret**

---

## ✅ Step 2: Enable Actions (30 seconds)

1. Go to: https://github.com/dannythehat/footy-oracle-v2/actions
2. If you see a button, click **I understand my workflows, go ahead and enable them**

---

## ✅ Step 3: Test It (30 seconds)

### Test Main Training:
1. Go to: https://github.com/dannythehat/footy-oracle-v2/actions/workflows/daily-lm-training.yml
2. Click **Run workflow** → **Run workflow**
3. Wait 5-10 minutes
4. Check for green checkmark ✅

### Test Experimental Training:
1. Go to: https://github.com/dannythehat/footy-oracle-v2/actions/workflows/experimental-lm-training.yml
2. Click **Run workflow** → **Run workflow**
3. Wait 5-10 minutes
4. Check for green checkmark ✅

---

## 🎉 Done!

Your training is now **fully automated**:

### What Happens Automatically:

**Every Day at 4 AM UTC:**
- ✅ Fetches yesterday's fixtures
- ✅ Trains 4 main models
- ✅ Updates analytics hub
- ✅ Commits results to GitHub

**Every Sunday at 5 AM UTC:**
- ✅ Trains experimental models
- ✅ Tracks performance
- ✅ Commits results to GitHub

---

## 📊 View Results

### Check Training Status:
https://github.com/dannythehat/footy-oracle-v2/actions

### View Model Performance:
- Main models: `ml_training/models/metadata.json`
- Experimental: `ml_training/models/experimental/experimental_metadata.json`

### View Analytics Hub:
Download and open: `analytics_hub/dashboard/index.html`

---

## 🔧 Optional: Customize Schedule

Want different training times? Edit these files:

**Main Training:**
`.github/workflows/daily-lm-training.yml` - Line 4

**Experimental Training:**
`.github/workflows/experimental-lm-training.yml` - Line 4

Change the cron expression:
- `0 4 * * *` = 4 AM daily
- `0 12 * * *` = 12 PM daily
- `0 5 * * 0` = 5 AM every Sunday
- `0 5 * * 1-5` = 5 AM Monday-Friday

Use [crontab.guru](https://crontab.guru) to create custom schedules.

---

## 💡 Pro Tips

### 1. Monitor First Week
Check Actions tab daily to ensure everything runs smoothly.

### 2. Manual Triggers
You can manually trigger training anytime from the Actions tab.

### 3. View Logs
Click any workflow run to see detailed logs and debug issues.

### 4. Performance Tracking
Download the analytics hub weekly to track model improvements.

---

## 🐛 Troubleshooting

### "Workflow not running"
- Check if Actions are enabled (Step 2)
- Verify API key is added (Step 1)
- Try manual trigger (Step 3)

### "Training failed"
- Click the failed run in Actions tab
- Expand the failed step to see error
- Common issue: Invalid API key

### "No experimental models trained"
- This is normal if data is missing required columns
- Models will train once data is available
- Check logs for details

---

## 📚 Full Documentation

- **[AUTOMATION_GUIDE.md](AUTOMATION_GUIDE.md)** - Complete automation guide
- **[EXPERIMENTAL_MODELS.md](EXPERIMENTAL_MODELS.md)** - Experimental models details
- **[README.md](README.md)** - General overview

---

## ✨ That's It!

You now have:
- ✅ Fully automated daily training
- ✅ Weekly experimental model training
- ✅ Zero local setup required
- ✅ Cloud-based execution
- ✅ Automatic commits and updates

**Just sit back and watch your models get smarter!** 🚀

---

**Setup Time**: 2 minutes  
**Local Setup**: None required  
**Cost**: Free (GitHub Actions)  
**Maintenance**: Zero
