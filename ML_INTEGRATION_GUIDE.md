# 🤖 ML Integration Guide - Complete Workflow

## Overview

This guide explains how the ML prediction system integrates with the web application to power the 3 main features:
1. **Golden Bets** - Top 3 highest confidence predictions
2. **Value Bets** - Predictions with positive expected value
3. **Bet Builder of the Day** - Multi-market convergence opportunities

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FOOTY ORACLE V2 WEB APP                  │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   Frontend   │◄───│   Backend    │◄───│ API-Football │ │
│  │   (React)    │    │  (Express)   │    │   Service    │ │
│  └──────────────┘    └──────┬───────┘    └──────────────┘ │
│                             │                              │
│                             ▼                              │
│                    ┌────────────────┐                      │
│                    │ Fixture Export │                      │
│                    │    Service     │                      │
│                    └────────┬───────┘                      │
│                             │                              │
│                             ▼                              │
│                  shared/ml_inputs/                         │
│                  fixtures_today.json                       │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ (Manual or Automated)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│            FOOTBALL-BETTING-AI-SYSTEM (ML REPO)             │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ML Scripts (Python)                                 │  │
│  │  • generate_ml_outputs_v26_final.py                  │  │
│  │  • generate_golden_and_value_bets.py                 │  │
│  │  • generate_bet_builders.py (NEW)                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                             │                              │
│                             ▼                              │
│                  ┌──────────────────┐                      │
│                  │  Trained Models  │                      │
│                  │  • btts.pkl      │                      │
│                  │  • over25.pkl    │                      │
│                  │  • corners.pkl   │                      │
│                  │  • cards.pkl     │                      │
│                  └──────────────────┘                      │
│                             │                              │
│                             ▼                              │
│                  shared/ml_outputs/                        │
│                  • predictions.json                        │
│                  • golden_bets.json                        │
│                  • value_bets.json                         │
│                  • bet_builder.json                        │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ (Commit & Push)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    FOOTY ORACLE V2 WEB APP                  │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐                      │
│  │   Frontend   │◄───│   Backend    │                      │
│  │  Displays:   │    │  Reads from: │                      │
│  │  • Golden    │    │  GitHub URLs │                      │
│  │  • Value     │    │  or Local    │                      │
│  │  • Builders  │    │  Files       │                      │
│  └──────────────┘    └──────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

---

## The 4 Markets

All predictions are generated for these 4 markets (averaging ~2.0 odds each):

| Market | Description | Avg Odds | Why Selected |
|--------|-------------|----------|--------------|
| **BTTS** | Both Teams To Score | ~2.0 | Popular, balanced probability |
| **Over 2.5 Goals** | Total goals > 2.5 | ~2.0 | High liquidity, clear outcome |
| **Over 9.5 Corners** | Total corners > 9.5 | ~2.0 | Less mainstream, value opportunities |
| **Over 3.5 Cards** | Total cards > 3.5 | ~2.0 | Referee-dependent, pattern-based |

---

## Daily Workflow

### Step 1: Fixtures Loaded (Automated)
**Time:** Continuous  
**Service:** `apiFootballService.ts`

```typescript
// Backend fetches fixtures from API-Football
const fixtures = await fetchFixturesFromAPI();
await saveFixturesToDatabase(fixtures);
```

### Step 2: Export Fixtures for ML (Manual/Automated)
**Time:** 6:00 AM UTC (or manual trigger)  
**Service:** `fixtureExportService.ts`

```bash
# Manual trigger via API
POST /api/admin/export-fixtures-ml

# Or via cron job (future)
# Runs automatically at 6 AM
```

**Output:** `shared/ml_inputs/fixtures_today.json`

### Step 3: ML Generates Predictions (Manual)
**Time:** After Step 2  
**Location:** `football-betting-ai-system` repo

```bash
cd football-betting-ai-system/footy_oracle_v2

# Generate predictions for all 4 markets
python generate_ml_outputs_v26_final.py

# Generate Golden & Value bets
python generate_golden_and_value_bets.py

# Generate Bet Builders (NEW - needs creation)
python generate_bet_builders.py
```

**Outputs:**
- `shared/ml_outputs/predictions.json` - All predictions
- `shared/ml_outputs/golden_bets.json` - Top 3 highest confidence
- `shared/ml_outputs/value_bets.json` - Positive EV bets
- `shared/ml_outputs/bet_builder.json` - Multi-market opportunities

### Step 4: Commit & Push ML Outputs
**Time:** After Step 3

```bash
cd footy-oracle-v2
git add shared/ml_outputs/*.json
git commit -m "🤖 Daily ML predictions - $(date +%Y-%m-%d)"
git push origin main
```

### Step 5: Frontend Displays Results (Automatic)
**Time:** Immediate after push  
**Service:** `mlService.ts` reads from GitHub URLs

```typescript
// Backend reads from GitHub
const goldenBets = await loadGoldenBets();
const valueBets = await loadValueBets();
const betBuilder = await getBetBuilderOfTheDay();

// Frontend displays
<GoldenBetsSection />
<ValueBetsSection />
<BetBuilderSection />
```

---

## Manual Testing

### 1. Check Current Status
```bash
GET /api/admin/ml-status
```

**Response:**
```json
{
  "ml_integration": {
    "input": {
      "file_exists": true,
      "fixtures_count": 45,
      "status": "✅ Ready"
    },
    "outputs": {
      "predictions": {
        "count": 45,
        "has_data": true,
        "status": "✅ Generated"
      },
      "golden_bets": {
        "count": 3,
        "status": "✅ Generated"
      },
      "value_bets": {
        "count": 12,
        "status": "✅ Generated"
      }
    }
  }
}
```

### 2. Export Fixtures
```bash
POST /api/admin/export-fixtures-ml
```

### 3. Run ML Scripts
```bash
# In football-betting-ai-system repo
cd footy_oracle_v2
python generate_ml_outputs_v26_final.py
python generate_golden_and_value_bets.py
```

### 4. Verify Outputs
```bash
# Check files were created
ls -lh ../footy-oracle-v2/shared/ml_outputs/

# View content
cat ../footy-oracle-v2/shared/ml_outputs/golden_bets.json
```

### 5. Commit & Push
```bash
cd ../footy-oracle-v2
git add shared/ml_outputs/*.json
git commit -m "🤖 ML predictions update"
git push
```

### 6. Check Frontend
Visit homepage and verify:
- ✅ Golden Bets section shows 3 bets
- ✅ Value Bets section shows bets
- ✅ Bet Builder section shows data

---

## Future Automation (GitHub Actions)

**File:** `.github/workflows/daily-ml-predictions.yml`

```yaml
name: Daily ML Predictions

on:
  schedule:
    - cron: '0 6 * * *'  # 6 AM UTC daily
  workflow_dispatch:  # Manual trigger

jobs:
  generate-predictions:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout footy-oracle-v2
        uses: actions/checkout@v3
        with:
          repository: dannythehat/footy-oracle-v2
          path: footy-oracle-v2
          
      - name: Checkout football-betting-ai-system
        uses: actions/checkout@v3
        with:
          repository: dannythehat/football-betting-ai-system
          path: football-betting-ai-system
          
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
          
      - name: Install dependencies
        run: |
          cd football-betting-ai-system
          pip install -r requirements.txt
          
      - name: Export fixtures from app
        run: |
          cd footy-oracle-v2/apps/backend
          npm install
          npm run export-fixtures
          
      - name: Generate ML predictions
        run: |
          cd football-betting-ai-system/footy_oracle_v2
          python generate_ml_outputs_v26_final.py
          python generate_golden_and_value_bets.py
          python generate_bet_builders.py
          
      - name: Commit ML outputs
        run: |
          cd footy-oracle-v2
          git config user.name "ML Bot"
          git config user.email "ml-bot@footyoracle.com"
          git add shared/ml_outputs/*.json
          git commit -m "🤖 Daily ML predictions - $(date +%Y-%m-%d)"
          git push
```

---

## Troubleshooting

### Issue: Empty ML Outputs
**Symptoms:** `golden_bets.json` is `[]`

**Solution:**
1. Check `fixtures_today.json` exists and has data
2. Verify ML models exist in `footy_oracle_v2/models/`
3. Run ML scripts manually and check for errors
4. Ensure predictions.json has non-null values

### Issue: Frontend Shows "No Data"
**Symptoms:** Homepage sections empty

**Solution:**
1. Check `/api/admin/ml-status` endpoint
2. Verify GitHub URLs are accessible
3. Check browser console for fetch errors
4. Ensure ML outputs were committed and pushed

### Issue: ML Scripts Can't Find Fixtures
**Symptoms:** Python error "File not found"

**Solution:**
1. Verify `shared/ml_inputs/fixtures_today.json` exists
2. Check file paths in Python scripts
3. Ensure both repos are in same parent directory
4. Run export endpoint first

---

## Success Criteria

✅ **Fixtures Export:** `shared/ml_inputs/fixtures_today.json` populated  
✅ **ML Predictions:** `predictions.json` has non-null probabilities  
✅ **Golden Bets:** `golden_bets.json` has 3 entries  
✅ **Value Bets:** `value_bets.json` has entries  
✅ **Bet Builder:** `bet_builder.json` has entries  
✅ **Frontend:** All 3 sections display data  
✅ **Automation:** Daily updates work without manual intervention

---

## Related Files

### Backend Services
- `apps/backend/src/services/fixtureExportService.ts` - Export fixtures
- `apps/backend/src/services/mlService.ts` - Read ML outputs
- `apps/backend/src/routes/admin.ts` - Admin endpoints

### ML Scripts (Other Repo)
- `footy_oracle_v2/generate_ml_outputs_v26_final.py` - Generate predictions
- `footy_oracle_v2/generate_golden_and_value_bets.py` - Select bets
- `footy_oracle_v2/generate_bet_builders.py` - Find multi-market opportunities

### Data Files
- `shared/ml_inputs/fixtures_today.json` - Input for ML
- `shared/ml_outputs/predictions.json` - All predictions
- `shared/ml_outputs/golden_bets.json` - Top 3 bets
- `shared/ml_outputs/value_bets.json` - Positive EV bets
- `shared/ml_outputs/bet_builder.json` - Multi-market bets

---

## Contact

For issues or questions about ML integration, see [Issue #50](https://github.com/dannythehat/footy-oracle-v2/issues/50)
