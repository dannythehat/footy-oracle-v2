# 🚨 EXECUTE THIS NOW - Fixtures Fix

## Your Problem
Fixtures showing "Unknown Home" vs "Unknown Away" instead of real team names.

## The Fix (Choose ONE)

### ⚡ FASTEST - API Endpoint
```bash
# Replace with your actual backend URL
BACKEND_URL="https://your-backend-url.com"

# 1. Clear mock data and reload (takes 2-3 minutes)
curl -X POST $BACKEND_URL/api/admin/fixtures/clear-mock

# 2. Wait 3 minutes, then check
sleep 180
curl $BACKEND_URL/api/admin/fixtures/count

# 3. Verify real fixtures
curl "$BACKEND_URL/api/fixtures?date=$(date +%Y-%m-%d)"
```

### 🔧 ALTERNATIVE - Direct Script
```bash
# SSH into your backend server
ssh your-server

# Navigate to backend
cd /path/to/footy-oracle-v2/apps/backend

# Run cleanup script
npx tsx src/scripts/clearMockFixtures.ts
```

---

## What This Does

1. **Deletes** all mock fixtures with "Unknown" labels
2. **Loads** real fixtures from API-Football (14-day window)
3. **Saves** proper data with team names, league names, IDs
4. **Enables** frontend to display correctly

---

## Expected Results

**Before:**
```json
{
  "homeTeamName": "Unknown Home",
  "awayTeamName": "Unknown Away",
  "leagueName": "Unknown League"
}
```

**After:**
```json
{
  "homeTeamName": "Manchester United",
  "awayTeamName": "Arsenal",
  "leagueName": "Premier League"
}
```

---

## Verification Commands

```bash
# Check fixture count (should be 200-500)
curl $BACKEND_URL/api/admin/fixtures/count

# Check today's fixtures (should show real teams)
curl "$BACKEND_URL/api/fixtures?date=$(date +%Y-%m-%d)"

# Check tomorrow's fixtures
curl "$BACKEND_URL/api/fixtures?date=$(date -d '+1 day' +%Y-%m-%d)"
```

---

## If It Fails

### Check API Key
```bash
# Verify API_FOOTBALL_KEY is set
echo $API_FOOTBALL_KEY

# Or check in Render/Vercel dashboard
```

### Check MongoDB Connection
```bash
# Verify MONGODB_URI is set
echo $MONGODB_URI
```

### Check Server Logs
```bash
# Look for errors in backend logs
# Should see: "✅ Fixtures loaded: X new, Y updated"
```

---

## Environment Variables Required

```env
MONGODB_URI=mongodb+srv://...
API_FOOTBALL_KEY=your-key-here
API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io
```

---

## Timeline

- **0 min:** Execute command
- **2-3 min:** Fixtures loading (check logs)
- **3 min:** Verify with count endpoint
- **Done:** Frontend shows real fixtures

---

## Support

If still broken after this:
1. Check issue #55 for updates
2. See FIXTURES_COMPLETE_FIX.md for detailed troubleshooting
3. Verify all environment variables are set

**JUST RUN THE COMMAND ABOVE. THAT'S IT.** 🚀
