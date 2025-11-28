# 🚀 API-Football Integration - Quick Start Guide

## ✅ What's Been Built

### 1. **Complete API-Football Service** (`apiFootballService.ts`)
- ✅ Fetch fixtures by date
- ✅ Fetch odds for 4 markets (BTTS, Over 2.5, Over 9.5 Corners, Over 3.5 Cards)
- ✅ Fetch fixtures with odds (combined)
- ✅ Fetch H2H data
- ✅ Fetch team statistics
- ✅ Fetch fixture results
- ✅ Rate limiting (100ms between requests)
- ✅ Error handling and logging
- ✅ Top 30 leagues filtering

### 2. **Fixture Storage Service** (`fixtureStorageService.ts`)
- ✅ Store fixtures in MongoDB
- ✅ Fetch and store by date
- ✅ Fetch and store by date range
- ✅ Retrieve fixtures from database
- ✅ Update fixture results
- ✅ Get available leagues
- ✅ Get fixture counts by status

### 3. **Test Suite** (`test-api-integration.ts`)
- ✅ Test API connection
- ✅ Test fixture fetching
- ✅ Test odds fetching
- ✅ Test database storage
- ✅ Test data retrieval

---

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
cd apps/backend
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
# API-Football Configuration
API_FOOTBALL_KEY=your_api_key_here
API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/footy-oracle

# OpenAI Configuration (for later)
OPENAI_API_KEY=your_openai_key_here
```

### 3. Get API-Football Key
1. Go to https://www.api-football.com/
2. Sign up for free account (100 requests/day)
3. Get your API key from dashboard
4. Add to `.env` file

### 4. Start MongoDB
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Get connection string from https://cloud.mongodb.com
```

---

## 🧪 Testing

### Test API Connection Only
```bash
npm run test:api
```
This will:
- Test API-Football connection
- Fetch today's fixtures (basic)
- Fetch fixtures with odds (first 3 only)

### Test Database Storage
```bash
npm run test:db
```
This will:
- Connect to MongoDB
- Fetch and store today's fixtures
- Retrieve fixtures from database
- Show available leagues
- Show fixture counts by status

### Run All Tests
```bash
npm run test:all
```

---

## 📊 Expected Output

### Successful API Test:
```
🧪 Testing API-Football Integration
============================================================

📌 TEST 1: API Connection
------------------------------------------------------------
🔌 Testing API-Football connection...
✅ API-Football connection successful

📌 TEST 2: Fetch Fixtures (Basic)
------------------------------------------------------------
📥 Fetching fixtures for 2025-11-24...
✅ Found 45 fixtures in top 30 leagues

📌 TEST 3: Fetch Fixtures with Odds
------------------------------------------------------------
📊 Fetching odds for 3 fixtures...
✅ Successfully fetched odds for 3/3 fixtures

✅ API-Football integration tests passed!
```

### Successful Database Test:
```
🧪 Testing Database Storage
============================================================

📌 Connecting to MongoDB...
✅ Database connected

📌 TEST 1: Fetch and Store Fixtures
------------------------------------------------------------
💾 Storing 45 fixtures in database...
✅ Stored 45 fixtures in database

📌 TEST 2: Retrieve Fixtures from Database
------------------------------------------------------------
✅ Retrieved 45 fixtures from database

📌 TEST 3: Get Available Leagues
------------------------------------------------------------
✅ Found 12 leagues in database:
Premier League, La Liga, Bundesliga, Serie A, Ligue 1...

✅ Database storage tests passed!
```

---

## 🎯 What's Next

Once your ML model is trained, we'll integrate it with:

1. **ML Prediction Service** - Load predictions from JSON
2. **Golden Bet Selector** - Match predictions with fixtures, select top 3
3. **AI Reasoning Service** - Generate explanations with OpenAI
4. **Cron Jobs** - Automate daily updates
5. **API Endpoints** - Expose data to frontend

---

## 📝 API-Football Endpoints Used

| Endpoint | Purpose | Rate Limit |
|----------|---------|------------|
| `/fixtures` | Get fixtures by date | 100/day (free) |
| `/odds` | Get odds for fixture | 100/day (free) |
| `/fixtures/headtohead` | Get H2H data | 100/day (free) |
| `/teams/statistics` | Get team stats | 100/day (free) |
| `/status` | Check API status | Unlimited |

**Note:** Free tier = 100 requests/day. Upgrade to paid plan for production.

---

## 🐛 Troubleshooting

### "API connection failed"
- Check your API key in `.env`
- Verify API key is active on api-football.com
- Check you haven't exceeded rate limit (100/day)

### "MongoDB connection error"
- Ensure MongoDB is running (`mongod`)
- Check connection string in `.env`
- For Atlas, check IP whitelist

### "No fixtures found"
- Try a different date (some days have no matches)
- Check if date is in correct format (YYYY-MM-DD)
- Verify top 30 leagues have matches that day

---

## 💡 Tips

1. **Save API Calls:** Use `test:api` first (doesn't store in DB)
2. **Rate Limiting:** Free tier = 100 requests/day, plan accordingly
3. **Best Times:** Fetch fixtures in morning before matches start
4. **Odds Availability:** Odds appear ~24-48 hours before kickoff

---

## ✅ Ready for ML Integration

Once you've tested the API integration successfully, we can integrate your ML predictions:

1. You provide: `shared/ml_outputs/predictions.json`
2. We'll build: ML service to load and match predictions
3. We'll create: Golden Bet selector (top 3 highest confidence)
4. We'll add: OpenAI reasoning generation
5. We'll expose: API endpoints for frontend

**Let me know when your ML model is trained and I'll build the integration!** 🚀
