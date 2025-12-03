# 🔍 Diagnostic Checklist - 404 Error Fix

## Issue
Frontend shows: "Request failed with status code 404"

## Root Cause Analysis

### ✅ What's Correct
1. Frontend `.env.production` has correct URL: `https://footy-oracle-backend.onrender.com/api`
2. Backend routes are mounted at `/api/fixtures`
3. Code structure is correct

### ❓ What to Check

#### 1. Is Render Backend Running?
- Go to: https://dashboard.render.com
- Check if `footy-oracle-backend` service is **Active** (not suspended/sleeping)
- If sleeping, it needs to wake up on first request (takes 30-60 seconds)

#### 2. Is Vercel Deployment Updated?
- Go to: https://vercel.com/dashboard
- Check latest deployment timestamp
- Should show deployment AFTER commit `681753f` (the /api fix)
- If not, manually trigger redeploy

#### 3. Does MongoDB Have Data?
Check if fixtures collection has documents:
```bash
# Connect to MongoDB and run:
db.fixtures.countDocuments()
# Should return > 0
```

#### 4. Are Environment Variables Set on Render?
Backend needs these env vars on Render:
- `MONGODB_URI` - Your MongoDB connection string
- `API_FOOTBALL_KEY` - Your API-Football key
- `NODE_ENV=production`
- `PORT=10000` (or whatever Render assigns)

## Quick Fix Steps

### Step 1: Wake Up Render Backend
Visit: https://footy-oracle-backend.onrender.com/health
- Should return: `{"status":"ok","timestamp":"...","environment":"production"}`
- If 404 or timeout, backend is down

### Step 2: Check Vercel Deployment
1. Go to Vercel dashboard
2. Find `footy-oracle-v2` project
3. Check latest deployment
4. If needed, click "Redeploy" button

### Step 3: Test API Directly
Try these URLs in browser:
1. https://footy-oracle-backend.onrender.com/health (should work)
2. https://footy-oracle-backend.onrender.com/api/fixtures (should return JSON)

### Step 4: Check MongoDB Data
If API works but returns empty data, run seeding script:
```bash
cd apps/backend
npm run seed:fixtures
```

## Expected Behavior After Fix
- Frontend loads without 404 error
- Fixtures page shows list of matches
- Data loads from MongoDB via Render backend
