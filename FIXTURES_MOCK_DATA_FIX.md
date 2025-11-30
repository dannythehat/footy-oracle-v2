# Fixtures Mock Data Fix Guide

## 🚨 Problem

Database contains **mock/seed fixtures** with "Unknown Home" vs "Unknown Away" instead of real team names from API-Football.

### Evidence
```json
{
  "fixtureId": 1478029,
  "homeTeam": "Unknown Home",
  "awayTeam": "Unknown Away",
  "league": "Unknown",
  "country": "Unknown"
}
```

## 🔍 Root Cause

1. **Mock data was seeded** during development/testing
2. **Real fixtures never loaded** from API-Football
3. **API key may not be configured** in Render environment variables

## ✅ Solution - Quick Fix (5 minutes)

### Step 1: Check Current Status

```bash
curl https://footy-oracle-backend.onrender.com/api/admin/fixtures/count
```

**Expected Response:**
```json
{
  "ok": true,
  "count": 150,
  "mockFixtures": 150,  // ⚠️ This should be 0
  "realFixtures": 0,    // ⚠️ This should be > 0
  "latestDate": "2025-12-07T00:00:00.000Z",
  "earliestDate": "2025-11-23T00:00:00.000Z"
}
```

If `mockFixtures > 0`, proceed to Step 2.

### Step 2: Clear Mock Data and Load Real Fixtures

```bash
curl -X POST https://footy-oracle-backend.onrender.com/api/admin/fixtures/clear-mock
```

**Expected Response:**
```json
{
  "ok": true,
  "message": "Mock fixtures cleared and real fixtures loading started",
  "deleted": 150,
  "note": "Real fixtures loading in background (takes 2-3 minutes)"
}
```

### Step 3: Wait 2-3 Minutes

The backend is now:
1. Fetching fixtures from API-Football for 14 days (7 back + 7 ahead)
2. Saving real team names, leagues, and match data
3. Rate-limiting API calls (1 second between dates)

### Step 4: Verify Real Data Loaded

```bash
# Check count again
curl https://footy-oracle-backend.onrender.com/api/admin/fixtures/count

# Should now show:
# "mockFixtures": 0
# "realFixtures": 100-200
```

```bash
# Check actual fixtures
curl "https://footy-oracle-backend.onrender.com/api/fixtures?date=2025-11-30"
```

**Expected Response (Real Data):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1234567,
      "date": "2025-11-30",
      "time": "15:00",
      "leagueId": 39,
      "leagueName": "Premier League",
      "homeTeamName": "Arsenal",
      "awayTeamName": "Chelsea",
      "homeTeamId": 42,
      "awayTeamId": 49,
      "status": "NS"
    }
  ],
  "count": 15
}
```

### Step 5: Test Frontend

1. Open: https://footy-oracle-v2.vercel.app
2. Navigate to **Fixtures** page
3. Should now show **real team names** like Arsenal, Chelsea, Real Madrid, etc.

## 🔧 Alternative: Manual Script Execution

If you have SSH access to the backend server:

```bash
# Navigate to backend directory
cd apps/backend

# Run cleanup script
npx tsx src/scripts/clearMockFixtures.ts
```

This script will:
- Delete all mock fixtures
- Load 14 days of real fixtures
- Show progress and sample data

## 🛡️ Prevention - Ensure API Key is Set

### Check Render Environment Variables

1. Go to Render Dashboard
2. Select your backend service
3. Navigate to **Environment** tab
4. Verify `API_FOOTBALL_KEY` is set

**Required Environment Variables:**
```bash
API_FOOTBALL_KEY=your-api-football-key-here
MONGODB_URI=your-mongodb-connection-string
NODE_ENV=production
CORS_ORIGIN=https://footy-oracle-v2.vercel.app
```

### Get API-Football Key

1. Sign up at: https://www.api-football.com/
2. Free tier: 100 requests/day (sufficient for testing)
3. Copy your API key
4. Add to Render environment variables

## 🔄 Automatic Fixture Updates

Once real data is loaded, fixtures update automatically:

- **Every 2 hours**: Update existing fixtures (scores, odds, status)
- **2am daily**: Load new fixtures window (7 days back + 7 ahead)
- **On startup**: Initial load to ensure fixtures available

## 🐛 Troubleshooting

### Issue: "No fixtures found" after clearing

**Cause:** API key not configured or API rate limit exceeded

**Solution:**
1. Check API key in Render environment variables
2. Wait 5 minutes and try again
3. Check Render logs for API errors

### Issue: Still seeing "Unknown" teams

**Cause:** Frontend is caching old data

**Solution:**
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Try incognito/private window

### Issue: API-Football rate limit exceeded

**Cause:** Free tier limit (100 requests/day) exceeded

**Solution:**
1. Wait 24 hours for limit reset
2. Upgrade to paid API-Football plan
3. Use existing fixtures until limit resets

## 📊 Monitoring

### Daily Health Check

```bash
# Check fixture count and freshness
curl https://footy-oracle-backend.onrender.com/api/admin/fixtures/count

# Verify no mock data
# mockFixtures should always be 0
# realFixtures should be 100-200
```

### Keep Backend Warm

Set up UptimeRobot or similar to ping every 10 minutes:
```
https://footy-oracle-backend.onrender.com/ping
```

This prevents Render cold starts and ensures fixtures stay fresh.

## 🎯 Success Criteria

✅ `mockFixtures: 0` in count endpoint  
✅ `realFixtures: 100-200` in count endpoint  
✅ Fixtures show real team names (Arsenal, Chelsea, etc.)  
✅ Leagues show real names (Premier League, La Liga, etc.)  
✅ Frontend displays fixtures correctly  

## 📝 Related Files

- **Admin Endpoint:** `apps/backend/src/routes/fixturesAdmin.ts`
- **Cleanup Script:** `apps/backend/src/scripts/clearMockFixtures.ts`
- **Cron Jobs:** `apps/backend/src/cron/fixturesCron.ts`
- **API Service:** `apps/backend/src/services/apiFootballService.ts`
- **Fixture Model:** `apps/backend/src/models/Fixture.ts`

## 🆘 Need Help?

If fixtures still don't load after following this guide:

1. Check Render logs for errors
2. Verify API key is valid
3. Check MongoDB connection
4. Create GitHub issue with error details
