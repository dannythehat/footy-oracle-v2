# 🧪 FlashScore Setup Test Guide

## Quick Test

Run the comprehensive FlashScore setup verification:

```bash
cd apps/backend
npm run test:flashscore
```

## What Gets Tested

### 1. ✅ Environment Variables
- `API_FOOTBALL_KEY` - Required for fixture data
- `MONGODB_URI` - Required for database storage
- `OPENAI_API_KEY` - Required for AI reasoning

### 2. ✅ Database Connection
- MongoDB connection test
- Fixture count check
- Query verification

### 3. ✅ API-Football Connection
- Fetch today's fixtures
- Verify API key works
- Check response format

### 4. ✅ Odds Fetching
- Fetch fixtures with odds
- Verify 4 key markets (homeWin, draw, awayWin, btts, over25, over35cards, over95corners)
- Check odds data structure

### 5. ✅ Fixture Storage
- Store fixtures in MongoDB
- Retrieve fixtures from database
- Verify data integrity

### 6. ✅ H2H & Stats (FlashScore Features)
- Verify H2H endpoints exist
- Verify Stats endpoints exist
- Check implementation status

### 7. ✅ Fixture Model Schema
- Basic fields (teams, league, date)
- Odds data structure
- Timestamps
- Status tracking

---

## Expected Output

```
🧪 FLASHSCORE SETUP VERIFICATION TEST

Testing all components for 8am refresh...

=== 1. Environment Variables ===
✅ API_FOOTBALL_KEY is set
✅ MONGODB_URI is set
✅ OPENAI_API_KEY is set

=== 2. Database Connection ===
✅ MongoDB connected successfully
ℹ️  Current fixtures in database: 150

=== 3. API-Football Connection ===
ℹ️  Fetching fixtures for 2025-11-27...
✅ API-Football working: 45 fixtures found
ℹ️  Sample: Manchester City vs Arsenal (Premier League)

=== 4. Odds Fetching ===
ℹ️  Fetching fixtures with odds for 2025-11-27...
✅ Odds fetching working: 45 fixtures with odds
ℹ️  Sample odds: Home 1.85, Draw 3.50, Away 4.20
ℹ️  Markets available: 8

=== 5. Fixture Storage ===
ℹ️  Testing fixture storage for 2025-11-27...
✅ Stored 45 fixtures in database
✅ Retrieved 45 fixtures from database
ℹ️  Sample stored fixture: Manchester City vs Arsenal
ℹ️  Has odds: Yes
ℹ️  Status: scheduled

=== 6. H2H & Stats (FlashScore Features) ===
ℹ️  Testing with: Manchester City vs Arsenal
⚠️  H2H/Stats require team IDs - skipping detailed test
ℹ️  H2H/Stats endpoints are implemented and ready

=== 7. Fixture Model Schema ===
✅ Basic fields present
✅ Odds data present
✅ Timestamps present
ℹ️  Fixture ID: 12345
ℹ️  Date: 2025-11-27T15:00:00.000Z
ℹ️  Status: scheduled

=== TEST SUMMARY ===

✅ Environment Variables
✅ Database Connection
✅ API-Football Connection
✅ Odds Fetching
✅ Fixture Storage
✅ H2H & Stats
✅ Fixture Model

=== FINAL VERDICT ===

✅ ALL TESTS PASSED ✨
✅ FlashScore setup is ready for 8am refresh! 🚀

=== 8AM REFRESH SCHEDULE ===

ℹ️  3:00 AM UTC - Daily ML Pipeline (GitHub Actions)
ℹ️  5:00 AM UTC - AI Betting Insights (Backend Cron)
ℹ️  6:00 AM UTC - Daily Predictions Update (Backend Cron)
ℹ️  Every 2 hours - Fixtures Update (GitHub Actions)
ℹ️  Every 2 hours - Result Settlement (Backend Cron)
```

---

## Troubleshooting

### ❌ API_FOOTBALL_KEY is MISSING
**Solution:** Add to `.env` file:
```bash
API_FOOTBALL_KEY=your_key_here
```

### ❌ Database connection failed
**Solution:** Check MongoDB URI:
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/footy-oracle
```

### ❌ API-Football failed
**Possible causes:**
1. Invalid API key
2. Rate limit exceeded
3. Network issues

**Solution:** Verify API key at https://www.api-football.com/

### ❌ Odds fetching failed
**Possible causes:**
1. API rate limits
2. No fixtures available for today
3. Odds not available yet

**Solution:** Try again later or test with a different date

---

## Manual Verification

### Check Database Directly
```bash
mongosh $MONGODB_URI
> use footy-oracle
> db.fixtures.countDocuments()
> db.fixtures.findOne()
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:3001/health

# Get today's fixtures
curl http://localhost:3001/api/fixtures?date=2025-11-27

# Get available leagues
curl http://localhost:3001/api/fixtures/meta/leagues
```

### Check GitHub Actions
1. Go to: https://github.com/dannythehat/footy-oracle-v2/actions
2. Check recent workflow runs
3. Verify "Daily ML Pipeline" and "Update Fixtures" are passing

---

## 8AM Refresh Flow

### 3:00 AM UTC - Daily ML Pipeline
**GitHub Action:** `.github/workflows/daily-ml-pipeline.yml`
- Fetches today's fixtures from API-Football
- Generates ML predictions
- Saves to `shared/ml_outputs/`
- Commits to repository

### 5:00 AM UTC - AI Betting Insights
**Backend Cron:** `cronService.ts`
- Processes fixtures 48 hours before kickoff
- Generates AI betting insights
- Updates fixture records with AI predictions

### 6:00 AM UTC - Daily Predictions Update
**Backend Cron:** `cronService.ts`
- Fetches fixtures from API-Football
- Stores in MongoDB
- Loads ML predictions
- Selects Golden Bets (top 3)
- Generates AI reasoning
- Saves predictions

### Every 2 Hours - Fixtures Update
**GitHub Action:** `.github/workflows/update-fixtures.yml`
- Fetches today + tomorrow fixtures
- Fetches live matches
- Updates `shared/fixtures/`
- Commits to repository

### Every 2 Hours - Result Settlement
**Backend Cron:** `cronService.ts`
- Checks finished matches
- Settles pending predictions
- Calculates P&L
- Updates records

---

## Pre-8AM Checklist

- [ ] Run `npm run test:flashscore` - All tests pass
- [ ] Check `.env` file - All keys present
- [ ] Verify MongoDB connection - Database accessible
- [ ] Check GitHub Actions - Recent runs successful
- [ ] Verify API-Football quota - Sufficient requests remaining
- [ ] Check backend logs - No errors in recent runs
- [ ] Test frontend - Fixtures displaying correctly

---

## Success Criteria

✅ **All 7 tests pass**
✅ **Database has fixtures**
✅ **API-Football returns data**
✅ **Odds are being fetched**
✅ **Storage/retrieval works**
✅ **GitHub Actions are green**
✅ **Backend server is running**

When all criteria are met, the system is **READY FOR 8AM REFRESH** 🚀
