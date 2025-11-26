# 🤖 Golden Betopia Automation Guide

Complete automation setup for ML predictions, fixtures, and bet settlement.

## 🚀 Overview

Three GitHub Actions workflows automate the entire Golden Betopia pipeline:

1. **Daily ML Pipeline** - Generate predictions using v27 anti-leak models
2. **Fixtures Update** - Keep fixture data fresh throughout the day
3. **Auto-Settlement** - Automatically settle bets when matches finish

## 📋 Workflows

### 1. Daily ML Pipeline (`daily-ml-pipeline.yml`)

**Schedule:** 3 AM UTC daily (before training at 4 AM)

**What it does:**
- Checks out both `footy-oracle-v2` and `football-betting-ai-system` repos
- Fetches today's fixtures from API-Football
- Runs `generate_predictions.py` with v27 anti-leak models
- Generates:
  - `golden_bets.json` - Top 3 high-confidence bets (85%+)
  - `value_bets.json` - Top 3 positive EV bets
  - `predictions.json` - All predictions
  - `metadata.json` - Timestamp and version
- Copies outputs to `shared/ml_outputs/`
- Commits and pushes to footy-oracle-v2
- Triggers frontend deployment

**Manual trigger:** Actions tab → Daily ML Pipeline → Run workflow

---

### 2. Fixtures Update (`update-fixtures.yml`)

**Schedule:** Every 2 hours

**What it does:**
- Fetches today's fixtures
- Fetches tomorrow's fixtures
- Fetches live matches
- Saves to `shared/fixtures/`:
  - `upcoming.json` - Today + tomorrow fixtures
  - `live.json` - Currently live matches
  - `metadata.json` - Update info
- Auto-commits updates

**Manual trigger:** Actions tab → Update Fixtures → Run workflow

---

### 3. Auto-Settlement (`auto-settlement.yml`)

**Schedule:** Every 5 minutes

**What it does:**
- Checks for finished matches (FT status) from last 3 hours
- Calls backend `/api/bets/settle` endpoint for each finished match
- Updates bet results (win/loss)
- Provides settlement summary

**Manual trigger:** Actions tab → Auto-Settlement → Run workflow

---

## 🔐 Required Secrets

Configure these in **Settings → Secrets and variables → Actions**:

| Secret | Description | Example |
|--------|-------------|---------|
| `PAT_TOKEN` | GitHub Personal Access Token with repo access | `ghp_xxxxxxxxxxxx` |
| `API_FOOTBALL_KEY` | API-Football API key | `your-api-key` |
| `BACKEND_URL` | Backend API URL | `https://your-backend.com` |

### Creating PAT_TOKEN

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo` (full control)
4. Copy token and add to repository secrets

---

## 📊 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    3 AM UTC - ML Pipeline                    │
├─────────────────────────────────────────────────────────────┤
│ 1. Fetch fixtures from API-Football                         │
│ 2. Run v27 anti-leak models                                 │
│ 3. Generate predictions (Golden/Value/All)                  │
│ 4. Push to shared/ml_outputs/                               │
│ 5. Trigger frontend deployment                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Every 2 Hours - Fixtures Update                 │
├─────────────────────────────────────────────────────────────┤
│ 1. Fetch today + tomorrow fixtures                          │
│ 2. Fetch live matches                                       │
│ 3. Save to shared/fixtures/                                 │
│ 4. Backend reads live data                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│            Every 5 Minutes - Auto-Settlement                 │
├─────────────────────────────────────────────────────────────┤
│ 1. Check for finished matches (FT)                          │
│ 2. Call backend settlement endpoint                         │
│ 3. Update bet results                                       │
│ 4. Calculate P&L                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Daily Schedule

| Time (UTC) | Action | Workflow |
|------------|--------|----------|
| 03:00 | Generate ML predictions | `daily-ml-pipeline.yml` |
| 04:00 | Train models | `daily-lm-training.yml` |
| Every 2h | Update fixtures | `update-fixtures.yml` |
| Every 5m | Settle bets | `auto-settlement.yml` |

---

## 🔧 Manual Triggers

All workflows support manual triggering:

1. Go to **Actions** tab
2. Select workflow from left sidebar
3. Click **Run workflow** button
4. Select branch (usually `main`)
5. Click **Run workflow**

---

## 📁 Output Directories

### `shared/ml_outputs/`
- `golden_bets.json` - Top 3 high-confidence bets
- `value_bets.json` - Top 3 value bets
- `predictions.json` - All predictions
- `metadata.json` - Generation info

### `shared/fixtures/`
- `upcoming.json` - Today + tomorrow fixtures
- `live.json` - Live matches
- `metadata.json` - Update info

---

## 🐛 Troubleshooting

### ML Pipeline fails
- Check `API_FOOTBALL_KEY` secret is set
- Verify `PAT_TOKEN` has repo access
- Check `football-betting-ai-system` repo is accessible
- Review workflow logs for Python errors

### Fixtures not updating
- Verify `API_FOOTBALL_KEY` is valid
- Check API quota (100 requests/day on free tier)
- Review workflow logs

### Settlement not working
- Check `BACKEND_URL` secret points to correct backend
- Verify backend `/api/bets/settle` endpoint exists
- Check backend is accessible from GitHub Actions

### No predictions generated
- Ensure models are trained in `football-betting-ai-system`
- Check `generate_predictions.py` script exists
- Verify fixture data is available

---

## 📈 Monitoring

### View Workflow Status
1. Go to **Actions** tab
2. See recent workflow runs
3. Click on run for detailed logs

### Check Outputs
- Browse `shared/ml_outputs/` for predictions
- Browse `shared/fixtures/` for fixture data
- Check commit history for automation updates

---

## 🚀 Next Steps

1. ✅ Set up required secrets
2. ✅ Test manual workflow triggers
3. ✅ Verify outputs are generated
4. ✅ Connect backend to read from `shared/` directories
5. ✅ Monitor first automated run at 3 AM UTC

---

## 📝 Version

**Current:** v27 anti-leak models
**Last Updated:** 2025-11-26
