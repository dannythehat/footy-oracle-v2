# 🔴 Live Scores - Quick Reference

## TL;DR
✅ **System is LIVE and working!** Scores update automatically every 60 seconds.

---

## 🎯 Key Files

### Backend
- `apps/backend/src/services/liveScoresService.ts` - Core live scores logic
- `apps/backend/src/services/cronService.ts` - Auto-update jobs (every 60s)
- `apps/backend/src/routes/liveFixtures.ts` - Live fixtures API
- `apps/backend/src/routes/fixtures.ts` - Fixtures API with refresh
- `apps/backend/src/models/Fixture.ts` - Database schema

### Frontend
- `apps/frontend/src/components/FixturesView.tsx` - Main fixtures display
- `apps/frontend/src/components/LiveScoreBadge.tsx` - Live score widget
- `apps/frontend/src/services/api.ts` - API client

---

## 🔌 API Endpoints

```bash
# Get all live fixtures
GET /api/live-fixtures

# Get fixture statistics
GET /api/live-fixtures/:fixtureId/statistics

# Force update all live scores
POST /api/live-fixtures/update

# Refresh scores for a specific date
POST /api/fixtures/refresh-scores
Body: { "date": "2025-12-02" }

# Get fixtures by date
GET /api/fixtures?date=2025-12-02

# Get fixture by ID
GET /api/fixtures/:fixtureId

# Get fixture stats
GET /api/fixtures/:fixtureId/stats

# Get head-to-head
GET /api/fixtures/h2h?homeTeamId=42&awayTeamId=49
```

---

## ⏱️ Update Schedule

| What | Frequency | Trigger |
|------|-----------|---------|
| Live scores | Every 60 seconds | Cron job |
| Recently finished | Every 5 minutes | Cron job |
| Frontend polling | Every 30 seconds | React useEffect |
| Statistics cache | 2 minutes | Service logic |

---

## 🗄️ Database Fields

```typescript
{
  status: 'live',           // Match status
  statusShort: '2H',        // API-Football code
  elapsed: 67,              // Minutes played
  homeScore: 2,             // Home team score
  awayScore: 1,             // Away team score
  score: {                  // Alternative format
    home: 2,
    away: 1
  },
  statistics: {             // Match stats
    home: { /* 16 fields */ },
    away: { /* 16 fields */ }
  },
  lastUpdated: Date         // Last update timestamp
}
```

---

## 🎨 Status Codes

| Code | Meaning | Display |
|------|---------|---------|
| NS | Not Started | Time (e.g., "14:30") |
| 1H | First Half | Red dot + "45'" |
| HT | Half Time | Orange "HT" |
| 2H | Second Half | Red dot + "67'" |
| ET | Extra Time | Red dot + "105'" |
| FT | Full Time | Gray "FT" |
| PST | Postponed | Yellow "PST" |
| CANC | Cancelled | Red "CANC" |

---

## 🧪 Quick Tests

```bash
# Test live fixtures endpoint
curl http://localhost:10000/api/live-fixtures

# Test refresh endpoint
curl -X POST http://localhost:10000/api/fixtures/refresh-scores \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-12-02"}'

# Watch live updates in logs
tail -f logs/server.log | grep "🔴"
```

---

## 🔧 Common Commands

```bash
# Start development server
npm run dev

# Check if cron jobs are running
# Look for: "✅ Cron jobs scheduled"
# Look for: "🔴 Live scores updated: X/Y fixtures"

# Force restart cron jobs
# Restart the server

# Check database for live fixtures
# MongoDB query: db.fixtures.find({ status: 'live' })
```

---

## 🐛 Troubleshooting

### Scores showing "-"
1. Check cron job logs for errors
2. Verify API-Football key is valid
3. Check rate limits on API-Football dashboard
4. Manually trigger: `POST /api/live-fixtures/update`

### No live fixtures
1. Verify matches are actually live (check API-Football)
2. Check database: `db.fixtures.find({ status: 'live' })`
3. Check cron job is running (look for logs)

### Stale scores
1. Check `lastUpdated` timestamp in database
2. Verify cron job is executing (every 60s)
3. Check frontend polling (every 30s)
4. Restart server if needed

---

## 📊 Statistics Available

**16 stats per team:**
- Shots (on goal, off goal, inside/outside box, blocked, total)
- Ball possession (%)
- Passes (total, accurate, %)
- Fouls
- Corner kicks
- Offsides
- Cards (yellow, red)
- Goalkeeper saves

---

## 🚀 Recent Updates

**Dec 2, 2025:**
- ✅ Fixed homeScore/awayScore fields
- ✅ Implemented refresh-scores endpoint
- ✅ FlashScore-style UI redesign
- ✅ Added "Live Now" section
- ✅ Auto-refresh before fetching

**Dec 1, 2025:**
- ✅ Initial live scores implementation
- ✅ Cron jobs for auto-updates
- ✅ Statistics tracking
- ✅ API endpoints

---

## 📝 Code Snippets

### Fetch Live Fixtures (Frontend)
```typescript
const response = await fixturesApi.getByDate('2025-12-02');
const liveFixtures = response.data.filter(f => f.status === 'live');
```

### Manual Refresh (Frontend)
```typescript
await fixturesApi.refreshScores('2025-12-02');
const updated = await fixturesApi.getByDate('2025-12-02');
```

### Check Live Status (Backend)
```typescript
const liveFixtures = await Fixture.find({ status: 'live' });
console.log(`${liveFixtures.length} matches currently live`);
```

---

## 🎯 Key Features

✅ **Automatic Updates** - Every 60 seconds via cron  
✅ **Real-time Stats** - 16 statistics per team  
✅ **FlashScore UI** - Modern, compact design  
✅ **Auto-refresh** - Frontend polls every 30s  
✅ **Manual Refresh** - User-triggered updates  
✅ **Status Tracking** - Live, HT, FT indicators  
✅ **Elapsed Time** - Minutes played display  
✅ **Error Handling** - Graceful failures  
✅ **Rate Limiting** - 100ms between requests  
✅ **Caching** - 2-minute statistics cache  

---

## 📞 Need Help?

1. Check `LIVE_SCORES_SUMMARY.md` for detailed docs
2. Check `LIVE_SCORES_IMPLEMENTATION.md` for technical details
3. Review logs: `tail -f logs/server.log | grep "🔴"`
4. Test endpoints with curl commands above
5. Check API-Football dashboard for rate limits

---

**Status**: 🟢 **FULLY OPERATIONAL**
