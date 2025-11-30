# 🔧 Complete Fixtures Fix Guide

## Problem Summary
Your fixtures system has **mock/seed data** instead of real API-Football data, causing "Unknown Home" vs "Unknown Away" labels.

## Root Causes Identified
1. ✅ **fetchFixtures.ts script missing fields** - Fixed in commit 372258c
2. ⚠️ **Database contains mock data** - Needs manual cleanup
3. ⚠️ **API key might be missing/invalid** - Needs verification
4. ⚠️ **Cron job may not run on deployment** - Needs verification

---

## 🚀 Quick Fix (Recommended)

### Option 1: API Endpoint (Fastest)
```bash
# 1. Clear mock fixtures and reload real data
curl -X POST https://your-backend-url.com/api/admin/fixtures/clear-mock

# 2. Check progress (wait 2-3 minutes)
curl https://your-backend-url.com/api/admin/fixtures/count

# 3. Verify real fixtures loaded
curl https://your-backend-url.com/api/fixtures?date=2025-11-30
```

### Option 2: Direct Script Execution
```bash
# SSH into your backend server and run:
cd apps/backend
npx tsx src/scripts/clearMockFixtures.ts
```

---

## 🔍 Verification Steps

### 1. Check Database Status
```bash
curl https://your-backend-url.com/api/admin/fixtures/count
```

**Expected Response:**
```json
{
  "ok": true,
  "count": 200-500,
  "mockFixtures": 0,
  "realFixtures": 200-500,
  "latestDate": "2025-12-07T...",
  "earliestDate": "2025-11-23T..."
}
```

### 2. Verify API Key
```bash
# Check if API_FOOTBALL_KEY is set in your environment
echo $API_FOOTBALL_KEY

# Or check in your deployment platform (Render/Vercel)
```

### 3. Test Fixtures Endpoint
```bash
# Should return real team names, not "Unknown"
curl https://your-backend-url.com/api/fixtures?date=2025-11-30
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1234567,
      "date": "2025-11-30",
      "time": "15:00",
      "leagueName": "Premier League",
      "homeTeamName": "Manchester United",
      "awayTeamName": "Arsenal",
      "status": "scheduled"
    }
  ]
}
```

---

## 🛠️ Manual Fix (If API Fails)

### Step 1: Clear Mock Data
```bash
# Connect to MongoDB
mongosh "your-mongodb-connection-string"

# Delete mock fixtures
db.fixtures.deleteMany({
  $or: [
    { homeTeam: /Unknown/i },
    { awayTeam: /Unknown/i },
    { league: /Unknown/i }
  ]
})
```

### Step 2: Load Real Fixtures
```bash
# Run the fixed script
cd apps/backend
npx tsx src/scripts/fetchFixtures.ts
```

### Step 3: Trigger Cron Job
```bash
# Restart your backend server to trigger cron
# Or call the admin endpoint:
curl -X POST https://your-backend-url.com/api/admin/fixtures/load-window
```

---

## 🔧 Environment Variables Required

Ensure these are set in your deployment:

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/footy-oracle

# API-Football (CRITICAL)
API_FOOTBALL_KEY=your-api-key-here
API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io

# OpenAI (for predictions)
OPENAI_API_KEY=your-openai-key
```

---

## 📊 Expected Results

After fix:
- ✅ **200-500 real fixtures** in database (14-day window)
- ✅ **0 mock fixtures** with "Unknown" labels
- ✅ **Real team names** like "Manchester United", "Barcelona"
- ✅ **Real league names** like "Premier League", "La Liga"
- ✅ **Automatic updates** every 2 hours via cron

---

## 🐛 Troubleshooting

### Issue: "No fixtures found"
**Solution:** Check API key and run load-window endpoint

### Issue: Still seeing "Unknown" teams
**Solution:** Run clear-mock endpoint to delete old data

### Issue: Fixtures not updating
**Solution:** Verify cron job is running (check server logs)

### Issue: API rate limit errors
**Solution:** Wait 1 hour and retry (API-Football has rate limits)

---

## 📝 Files Fixed

1. ✅ `apps/backend/src/scripts/fetchFixtures.ts` - Added missing IDs
2. ✅ `apps/backend/src/cron/fixturesCron.ts` - Already correct
3. ✅ `apps/backend/src/routes/fixtures.ts` - Already correct
4. ✅ `apps/backend/src/models/Fixture.ts` - Already correct

---

## 🎯 Next Steps

1. **Run the quick fix** (Option 1 above)
2. **Wait 2-3 minutes** for fixtures to load
3. **Verify** using the verification steps
4. **Test frontend** - should show real fixtures now
5. **Monitor** server logs for any errors

---

## 📞 Support

If issues persist:
1. Check server logs for errors
2. Verify API key is valid
3. Check MongoDB connection
4. Ensure cron job is running

**All fixes are now in place. Just need to clear the database and reload!**
