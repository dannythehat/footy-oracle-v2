# System Health Checklist

Use this checklist to verify your ML integration is working correctly.

---

## Daily Health Check (5 minutes)

### 1. Cache Status ✅

```bash
GET /api/admin/cache-status
```

**Expected**:
```json
{
  "success": true,
  "cache": {
    "goldenBets": { "count": 3, "age": "Xh Xm", "expiresIn": "Xh Xm" },
    "valueBets": { "count": 3, "age": "Xh Xm", "expiresIn": "Xh Xm" }
  }
}
```

**Red Flags**:
- ❌ `count: 0` - Cache is empty
- ❌ `age: "24h+"` - Cache expired
- ❌ `expiresIn: "0h"` - Cache about to expire

**Fix**: `POST /api/admin/generate-predictions`

---

### 2. Golden Bets ✅

```bash
GET /api/golden-bets
```

**Expected**:
- 3 predictions returned
- All have `confidence >= 70`
- All have `aiReasoning` populated
- `cached: true`

**Red Flags**:
- ❌ Empty array
- ❌ `cached: false` (hitting ML API every request)
- ❌ Missing `aiReasoning`

---

### 3. Value Bets ✅

```bash
GET /api/value-bets
```

**Expected**:
- 3 predictions returned
- All have `value >= 10`
- All have `aiReasoning` populated
- `cached: true`

**Red Flags**:
- ❌ Empty array
- ❌ `value < 10` (low value bets)
- ❌ `cached: false`

---

### 4. Bet Builder ✅

```bash
GET /api/bet-builder/of-the-day
```

**Expected**:
- Single bet builder returned
- 3-4 markets included
- `combinedConfidence >= 70`
- `estimatedCombinedOdds >= 2.0`
- `aiReasoning` populated

**Red Flags**:
- ❌ No bet builder found
- ❌ Only 1-2 markets (should be 3-4)
- ❌ Low confidence (<70)

---

## Weekly Health Check (15 minutes)

### 5. P&L Statistics 📊

```bash
GET /api/pnl/stats
```

**Check**:
- Total bets increasing
- Win rate reasonable (40-60%)
- ROI positive or near breakeven
- No stuck "pending" bets from >7 days ago

**Red Flags**:
- ❌ Win rate <30% (model issues)
- ❌ Win rate >80% (data issues)
- ❌ Many old pending bets (settlement broken)

---

### 6. Result Settlement ✅

```bash
GET /api/pnl/history?days=7
```

**Check**:
- Recent bets have results ('win' or 'loss')
- Finished fixtures are settled within 24 hours
- Profit calculations correct

**Red Flags**:
- ❌ Finished fixtures still "pending"
- ❌ Incorrect profit calculations
- ❌ No settlements in past 7 days

---

### 7. Cron Job Logs 📝

**Check server logs for**:
```
✅ ML predictions cron job scheduled: 6:00 AM UTC daily
✅ Cron jobs started successfully
🤖 Running daily ML predictions generation (6:00 AM UTC)...
✅ Generated and cached 3 Golden Bets
✅ Generated and cached 3 Value Bets
```

**Red Flags**:
- ❌ No cron initialization logs
- ❌ Cron errors in logs
- ❌ No daily execution logs

---

## Monthly Health Check (30 minutes)

### 8. ML API Performance 🚀

**Check**:
- Average response time <30 seconds
- Success rate >95%
- No frequent timeouts

**Test**:
```bash
time curl -X POST /api/admin/generate-predictions
```

**Red Flags**:
- ❌ Timeouts >30 seconds
- ❌ Frequent 500 errors
- ❌ ML API downtime

---

### 9. Database Health 💾

**Check MongoDB**:
- Predictions collection growing
- BetBuilder collection updating daily
- FeaturedSelection collection tracking P&L
- No duplicate entries

**Queries**:
```javascript
// Count predictions
db.predictions.countDocuments()

// Recent bet builders
db.betbuilders.find().sort({ date: -1 }).limit(10)

// P&L tracking
db.featuredselections.find({ result: 'pending' }).count()
```

**Red Flags**:
- ❌ No new predictions in 7+ days
- ❌ Duplicate bet builders for same fixture
- ❌ Growing pending results (settlement broken)

---

### 10. Cache Hit Rate 📈

**Monitor**:
- Golden Bets cache hits vs misses
- Value Bets cache hits vs misses
- Cache expiry patterns

**Expected**:
- >95% cache hit rate during the day
- Cache refresh at 6 AM UTC
- No mid-day cache misses

**Red Flags**:
- ❌ Low cache hit rate (<80%)
- ❌ Frequent cache misses
- ❌ Cache not refreshing at 6 AM

---

## Emergency Procedures

### Cache Empty or Expired

```bash
# 1. Check status
GET /api/admin/cache-status

# 2. Force regenerate
POST /api/admin/generate-predictions

# 3. Verify
GET /api/golden-bets
GET /api/value-bets
```

---

### No Bet Builder

```bash
# 1. Check database
GET /api/bet-builder/of-the-day

# 2. Force import
POST /api/admin/import-bet-builders

# 3. Verify
GET /api/bet-builder/of-the-day
```

---

### ML API Down

**Symptoms**:
- Timeouts on all ML endpoints
- 500 errors
- Empty predictions

**Fix**:
1. Check ML API health: `https://football-ml-api.onrender.com/health`
2. Wait for Render cold start (30-60 seconds)
3. Retry request
4. If persistent, check ML API logs

---

### Cron Not Running

**Symptoms**:
- No cache updates at 6 AM
- No new bet builders daily
- Stale predictions

**Fix**:
1. Check server logs for cron initialization
2. Verify `app.ts` calls `startMLPredictionsCron()`
3. Restart backend server
4. Manual trigger: `POST /api/admin/generate-predictions`

---

### Results Not Settling

**Symptoms**:
- Old finished fixtures still "pending"
- No profit calculations
- P&L stats frozen

**Fix**:
1. Check fixture status in database
2. Verify result settlement service
3. Manual settlement (if endpoint exists)
4. Check for missing fixture data (scores, stats)

---

## Monitoring Dashboard (Future)

**Metrics to Track**:
- Cache hit rate (%)
- ML API response time (ms)
- Daily predictions generated
- Win rate by product
- ROI by product
- Settlement lag (hours)
- Cron execution success rate

**Alerts**:
- Cache empty for >1 hour
- ML API timeout rate >10%
- Win rate <30% or >80%
- No cron execution in 24 hours
- Settlement lag >48 hours

---

## Quick Reference

| Check | Frequency | Endpoint | Expected |
|-------|-----------|----------|----------|
| Cache Status | Daily | `GET /api/admin/cache-status` | 3 Golden + 3 Value |
| Golden Bets | Daily | `GET /api/golden-bets` | 3 predictions, cached |
| Value Bets | Daily | `GET /api/value-bets` | 3 predictions, cached |
| Bet Builder | Daily | `GET /api/bet-builder/of-the-day` | 1 builder, 3-4 markets |
| P&L Stats | Weekly | `GET /api/pnl/stats` | Win rate 40-60% |
| Settlement | Weekly | `GET /api/pnl/history?days=7` | Recent results settled |
| Cron Logs | Weekly | Server logs | Daily execution at 6 AM |
| ML API | Monthly | `POST /api/admin/generate-predictions` | <30s response |
| Database | Monthly | MongoDB queries | Growing collections |
| Cache Hits | Monthly | Logs | >95% hit rate |

---

## Status Indicators

### 🟢 Healthy
- Cache populated with 3+3 predictions
- All endpoints returning data
- Cron running daily at 6 AM
- Win rate 40-60%
- Results settling within 24h

### 🟡 Warning
- Cache hit rate 80-95%
- ML API response time 20-30s
- Win rate 30-40% or 60-70%
- Settlement lag 24-48h

### 🔴 Critical
- Cache empty or expired
- ML API timeouts >30s
- Win rate <30% or >80%
- Cron not executing
- Settlement lag >48h
- No new predictions in 24h

---

**Last Updated**: December 7, 2025  
**Version**: 1.0
