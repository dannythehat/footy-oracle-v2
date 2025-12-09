# 🔴 CRITICAL FIX PLAN - Footy Oracle v2

**Date:** December 8, 2025  
**Branch:** `fix/critical-ml-and-fixtures`  
**Issues:** #143, #142, #141, #139, #137

## 🎯 PROBLEMS IDENTIFIED

### 1. **ML_API_URL Not Set on Render Backend** ⚠️
- **Impact:** Golden Bets and Value Bets cannot connect to ML API
- **Root Cause:** Environment variable `ML_API_URL` missing on Render
- **Current State:** Backend defaults to `https://football-ml-api.onrender.com` but may not be configured

### 2. **Fixtures Loading Issues** ⚠️
- **Impact:** No fixtures = No predictions = Empty Golden Bets
- **Recent Fix:** API headers changed from `x-rapidapi-key` to `x-apisports-key` (commit 94246a6)
- **Status:** Fix deployed but needs verification

### 3. **Golden Bets & Value Bets Not Populating** 🔴
- **Impact:** Core features completely broken
- **Dependencies:**
  - Fixtures must load successfully
  - ML API must be accessible
  - Cron jobs must run (3 AM fixtures → 5 AM odds → 6 AM ML)
  - Cache must work properly

## 🔧 SOLUTION STEPS

### Step 1: Configure Render Backend Environment
```bash
# Add to Render service: footy-oracle-backend
ML_API_URL=https://football-ml-api.onrender.com
```

### Step 2: Verify API-Football Integration
- ✅ Headers fixed (x-apisports-key)
- ✅ Fallback bookmakers added (Bet365, Bwin, Williamhill)
- ⏳ Need to verify fixtures are loading

### Step 3: Test ML API Connection
```bash
# Test ML API health
curl https://football-ml-api.onrender.com/api/health

# Test Golden Bets endpoint
curl -X POST https://football-ml-api.onrender.com/api/v1/predictions/golden-bets \
  -H "Content-Type: application/json" \
  -d '{"matches": []}'
```

### Step 4: Verify Cron Jobs
Current schedule:
- **3 AM UTC:** Load fixtures window (7 days back + 7 days ahead)
- **5 AM UTC:** Update odds for today's fixtures
- **6 AM UTC:** Generate ML predictions (Golden Bets + Value Bets)
- **Every 2 min:** Update live scores
- **Every 10 min:** Keep ML API awake

### Step 5: Check Cache System
- Golden Bets: 24-hour cache
- Value Bets: 24-hour cache
- Endpoint: `/api/admin/cache-status` for debugging

## 📊 ARCHITECTURE OVERVIEW

```
┌─────────────────┐
│  Vercel Frontend│
│  (React + Vite) │
└────────┬────────┘
         │ VITE_API_BASE_URL
         ↓
┌─────────────────────────────────┐
│  Render Backend (Node.js)       │
│  - Express API                  │
│  - MongoDB (fixtures, bets)     │
│  - Cron jobs (fixtures, odds)   │
└────────┬────────────────────────┘
         │ ML_API_URL
         ↓
┌─────────────────────────────────┐
│  Render ML API (Python)         │
│  - FastAPI                      │
│  - ML models (predictions)      │
│  - Golden Bets algorithm        │
│  - Value Bets algorithm         │
└─────────────────────────────────┘
```

## 🔍 DEBUGGING CHECKLIST

### Backend Health
- [ ] `/health` returns 200 OK
- [ ] MongoDB connection successful
- [ ] Cron jobs started on boot
- [ ] ML_API_URL environment variable set

### Fixtures
- [ ] `/api/fixtures?date=2025-12-08` returns fixtures
- [ ] Fixtures have odds data
- [ ] API-Football headers correct (x-apisports-key)

### ML Integration
- [ ] ML API health check passes
- [ ] `/api/golden-bets/today` returns data
- [ ] `/api/value-bets` returns data
- [ ] Cache status shows valid data

### Frontend
- [ ] VITE_API_BASE_URL points to Render backend
- [ ] API calls use shared axios client
- [ ] No hardcoded URLs in components

## 🚀 DEPLOYMENT SEQUENCE

1. **Set Render Environment Variables**
   - Add `ML_API_URL` to backend service
   - Verify all other env vars present

2. **Deploy Backend**
   - Trigger manual deploy on Render
   - Watch logs for cron job initialization
   - Verify ML API connection

3. **Deploy Frontend**
   - Vercel auto-deploys on push to main
   - Verify VITE_API_BASE_URL is set

4. **Test End-to-End**
   - Load fixtures page
   - Check Golden Bets page
   - Check Value Bets page
   - Verify Bet Builder works

## 📝 NOTES

- **Render Free Tier:** Services sleep after 15 min inactivity
- **Keep-Alive:** ML API pinged every 10 min (6 AM - 11 PM UTC)
- **Cache:** 24-hour TTL prevents excessive ML API calls
- **Fallback:** Database fallback if ML API unavailable

## 🔗 RELATED ISSUES

- #143: Golden Bets, Value Bets, Bet Builder & P&L Not Loading
- #142: Broken Pipeline - Backend → ML Engine
- #141: Critical Bug - Features Not Loading
- #139: Golden Bets Not Populating
- #137: Odds showing "N/A"
