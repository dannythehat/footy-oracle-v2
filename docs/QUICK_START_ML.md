# ML Integration - Quick Start Guide

## TL;DR

Your ML integration is **fully working**! Here's what you need to know:

---

## Daily Automation (No Action Required)

Every day at **6:00 AM UTC**, the system automatically:
1. ✅ Fetches today's fixtures
2. ✅ Calls ML API for predictions
3. ✅ Generates **3 Golden Bets** (highest confidence)
4. ✅ Generates **3 Value Bets** (best value opportunities)
5. ✅ Caches predictions for 24 hours
6. ✅ Generates **Bet Builder of the Day** (at 6:30 AM)

**You don't need to do anything** - it runs automatically!

---

## Manual Triggers (When You Need Them)

### Force Regenerate Predictions Right Now

```bash
POST https://footy-oracle-backend.onrender.com/api/admin/generate-predictions
```

**Use when**:
- Testing new features
- Cache expired and you need fresh data
- ML API was down during scheduled run

### Check Cache Status

```bash
GET https://footy-oracle-backend.onrender.com/api/admin/cache-status
```

**Shows**:
- How many predictions are cached
- How old the cache is
- When it expires

### Import Bet Builders Manually

```bash
POST https://footy-oracle-backend.onrender.com/api/admin/import-bet-builders
```

---

## User-Facing Endpoints

### Golden Bets
```bash
GET /api/golden-bets
```
Returns top 3 highest-confidence predictions

### Value Bets
```bash
GET /api/value-bets
```
Returns top 3 best value opportunities

### Bet Builder of the Day
```bash
GET /api/bet-builder/of-the-day
```
Returns single multi-market accumulator

---

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│                   DAILY PIPELINE                         │
└─────────────────────────────────────────────────────────┘

3:00 AM  →  Load fixtures from API-Football
5:00 AM  →  Update odds
6:00 AM  →  Generate ML predictions (Golden + Value Bets)
6:30 AM  →  Generate Bet Builder of the Day

All predictions cached for 24 hours
```

---

## Caching Explained

**Why cache?**
- ML API is slow (10-30 seconds)
- Expensive API calls
- Same predictions valid all day

**Cache duration**: 24 hours

**Cache refresh**: Automatic at 6 AM UTC daily

**Manual refresh**: `POST /api/admin/generate-predictions`

---

## Troubleshooting

### "No Golden Bets found"

**Check**:
```bash
GET /api/admin/cache-status
```

**Fix**:
```bash
POST /api/admin/generate-predictions
```

### "Bet Builder not updating"

**Fix**:
```bash
POST /api/admin/import-bet-builders
```

### "ML API timeout"

**Cause**: ML API cold start (Render free tier)

**Fix**: Retry request after 30 seconds

---

## Key Files

| File | Purpose |
|------|---------|
| `apps/backend/src/cron/mlPredictionsCron.ts` | Daily 6 AM predictions |
| `apps/backend/src/services/mlService.ts` | ML API integration |
| `apps/backend/src/services/predictionCache.ts` | 24-hour cache |
| `apps/backend/src/routes/admin.ts` | Manual triggers |

---

## Environment Variables

```env
ML_API_URL=https://football-ml-api.onrender.com
OPENAI_API_KEY=sk-...
MONGODB_URI=mongodb+srv://...
```

---

## Testing Locally

```bash
# 1. Start backend
cd apps/backend
npm run dev

# 2. Trigger predictions
curl -X POST http://localhost:3001/api/admin/generate-predictions

# 3. Get Golden Bets
curl http://localhost:3001/api/golden-bets

# 4. Get Value Bets
curl http://localhost:3001/api/value-bets

# 5. Get Bet Builder
curl http://localhost:3001/api/bet-builder/of-the-day
```

---

## Production URLs

**Backend**: https://footy-oracle-backend.onrender.com  
**Frontend**: https://footy-oracle-v2.vercel.app  
**ML API**: https://football-ml-api.onrender.com

---

## What's Next?

### Immediate Improvements
1. ✅ Initialize bet builder cron in `app.ts`
2. ✅ Add bet builder caching
3. ✅ Monitor cache hit rates

### Future Features
- Real-time prediction updates
- User-specific stake amounts
- Advanced analytics dashboard
- Win rate by league/market

---

## Support

**Full Documentation**: `docs/ML_INTEGRATION_COMPLETE.md`

**Questions?** Check the comprehensive docs for:
- Detailed architecture
- Database schemas
- P&L tracking
- Result settlement
- Performance optimization

---

**Status**: ✅ Production Ready  
**Last Updated**: December 7, 2025
