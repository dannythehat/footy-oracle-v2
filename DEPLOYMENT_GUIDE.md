# 🚀 Deployment Guide - Footy Oracle v2

## 🎯 IMMEDIATE FIX REQUIRED

### **CRITICAL: Add ML_API_URL to Render Backend**

**This is the #1 issue preventing Golden Bets and Value Bets from working!**

1. Go to [Render Dashboard - Backend Service](https://dashboard.render.com/web/srv-d4jvnhili9vc73ddva60)
2. Click **Environment** tab
3. Click **Add Environment Variable**
4. Add:
   ```
   Key: ML_API_URL
   Value: https://football-ml-api.onrender.com
   ```
5. Click **Save Changes**
6. Service will auto-redeploy (takes ~2 minutes)

**This fixes:** #143, #142, #141, #139 - Golden Bets, Value Bets, and ML predictions not loading.

---

## 📋 Required Environment Variables

### Backend Service (Render)

Service: `footy-oracle-backend`  
URL: https://footy-oracle-backend.onrender.com

```bash
# Server
PORT=3001
NODE_ENV=production

# API-Football (REQUIRED)
API_FOOTBALL_KEY=<your_key>
API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io

# OpenAI (REQUIRED)
OPENAI_API_KEY=<your_key>
OPENAI_MODEL=gpt-4

# Database (REQUIRED)
MONGODB_URI=<your_mongodb_connection_string>

# ML API (REQUIRED - CURRENTLY MISSING!)
ML_API_URL=https://football-ml-api.onrender.com

# CORS
CORS_ORIGIN=https://footy-oracle-v2.vercel.app
```

### Frontend Service (Vercel)

Project: `footy-oracle-v2`  
URL: https://footy-oracle-v2.vercel.app

```bash
VITE_API_BASE_URL=https://footy-oracle-backend.onrender.com
```

---

## ✅ Verification Checklist

Run these commands to verify everything is working:

```bash
# 1. Backend Health
curl https://footy-oracle-backend.onrender.com/health
# Expected: {"status":"ok"}

# 2. ML API Health
curl https://football-ml-api.onrender.com/api/health
# Expected: {"status":"healthy"}

# 3. Fixtures Loading
curl "https://footy-oracle-backend.onrender.com/api/fixtures?date=2025-12-08&limit=5"
# Expected: JSON with fixtures array

# 4. Golden Bets
curl https://footy-oracle-backend.onrender.com/api/golden-bets/today
# Expected: JSON with golden bets (may be empty if not 6 AM UTC yet)

# 5. Value Bets
curl https://footy-oracle-backend.onrender.com/api/value-bets
# Expected: JSON with value bets
```

---

## ⏰ Cron Job Schedule (UTC)

| Time | Job | Description |
|------|-----|-------------|
| 3:00 AM | Fixtures Window | Load 7 days back + 7 days ahead |
| 5:00 AM | Odds Update | Update today's fixture odds |
| 6:00 AM | ML Predictions | Generate Golden + Value Bets |
| Every 2 min | Live Scores | Update live match scores |
| Every 10 min | ML Keep-Alive | Ping ML API (6 AM - 11 PM) |

**Note:** Render free tier sleeps after 15 min inactivity. Keep-alive prevents ML API downtime.

---

## 🐛 Troubleshooting

### Golden Bets Not Loading

**Symptoms:**
- Empty Golden Bets page
- API returns `{"data": [], "count": 0}`

**Diagnosis:**
```bash
# Check ML API connection
curl https://football-ml-api.onrender.com/api/health

# Check if ML_API_URL is set (look in Render dashboard Environment tab)

# Check backend logs for errors
# Look for: "ML API error" or "ECONNREFUSED"
```

**Fix:**
1. Add `ML_API_URL` environment variable (see top of this guide)
2. Redeploy backend
3. Wait for 6 AM UTC cron or trigger manually:
   ```bash
   curl -X POST https://footy-oracle-backend.onrender.com/api/admin/generate-predictions
   ```

### Fixtures Not Loading

**Symptoms:**
- Empty fixtures page
- 500 error from API
- "API_FOOTBALL_KEY not set" in logs

**Diagnosis:**
```bash
# Test fixtures endpoint
curl "https://footy-oracle-backend.onrender.com/api/fixtures?date=2025-12-08"

# Check API-Football quota
# Login to: https://dashboard.api-football.com/
```

**Fix:**
1. Verify `API_FOOTBALL_KEY` is set in Render Environment
2. Check API-Football quota not exceeded
3. Verify headers are `x-apisports-key` (not `x-rapidapi-key`)

### Odds Showing "N/A"

**Symptoms:**
- Fixtures load but odds are null
- "No odds available from any bookmaker" in logs

**Fix:**
1. Verify API-Football subscription includes odds
2. Fallback bookmakers (Bet365, Bwin, Williamhill) should work
3. Some fixtures may not have odds available yet

---

## 🔄 Manual Operations

### Clear Cache
```bash
curl -X POST https://footy-oracle-backend.onrender.com/api/admin/clear-cache
```

### Load Fixtures for Date
```bash
curl -X POST https://footy-oracle-backend.onrender.com/api/admin/load-fixtures \
  -H "Content-Type: application/json" \
  -d '{"date": "2025-12-08"}'
```

### Generate ML Predictions
```bash
curl -X POST https://footy-oracle-backend.onrender.com/api/admin/generate-predictions
```

### Check Cache Status
```bash
curl https://footy-oracle-backend.onrender.com/api/admin/cache-status
```

---

## 📊 Architecture

```
┌─────────────────────┐
│  Vercel Frontend    │  React + Vite
│  Port: 5173 (dev)   │  https://footy-oracle-v2.vercel.app
└──────────┬──────────┘
           │ VITE_API_BASE_URL
           ↓
┌─────────────────────────────────┐
│  Render Backend                 │  Node.js + Express
│  Port: 3001                     │  https://footy-oracle-backend.onrender.com
│  - REST API                     │
│  - MongoDB (fixtures, bets)     │
│  - Cron jobs (3 AM, 5 AM, 6 AM) │
└──────────┬──────────────────────┘
           │ ML_API_URL (MISSING!)
           ↓
┌─────────────────────────────────┐
│  Render ML API                  │  Python + FastAPI
│  Port: 8000                     │  https://football-ml-api.onrender.com
│  - ML models                    │
│  - Golden Bets algorithm        │
│  - Value Bets algorithm         │
└─────────────────────────────────┘
```

---

## 🚨 Emergency Recovery

If everything is broken:

1. **Check all services are running:**
   - Render: footy-oracle-backend (green)
   - Render: football-ml-api (green)
   - Vercel: footy-oracle-v2 (deployed)

2. **Verify environment variables:**
   - Backend: ML_API_URL, API_FOOTBALL_KEY, MONGODB_URI, OPENAI_API_KEY
   - Frontend: VITE_API_BASE_URL

3. **Clear cache and regenerate:**
   ```bash
   curl -X POST https://footy-oracle-backend.onrender.com/api/admin/clear-cache
   curl -X POST https://footy-oracle-backend.onrender.com/api/admin/generate-predictions
   ```

4. **Check logs:**
   - Render Dashboard → Logs tab
   - Look for startup errors, cron job execution, API errors

---

## 📞 Support Resources

- **GitHub Issues:** https://github.com/dannythehat/footy-oracle-v2/issues
- **Render Dashboard:** https://dashboard.render.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **API-Football:** https://dashboard.api-football.com/
