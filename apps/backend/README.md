# 🚀 Footy Oracle Backend API

**Status:** ✅ **PRODUCTION READY**  
Production-ready Express API for AI-powered sports betting predictions with automated result settlement and treble calculations.

---

## 🏗️ Architecture

- **Framework:** Express + TypeScript
- **Database:** MongoDB with Mongoose
- **External APIs:** API-Football, OpenAI GPT-4
- **Cron Jobs:** 3 automated jobs (predictions, insights, settlement)
- **Deployment:** Railway/Render ready

---

## 📦 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Add your API keys to .env
```

### 3. Start Development Server
```bash
npm run dev
```

Server runs on `http://localhost:3001`

---

## ⚙️ Environment Variables

Required configuration in `.env`:

```env
# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/footy-oracle

# API-Football
API_FOOTBALL_KEY=your_api_key_here
API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io

# OpenAI
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-4

# ML Model
ML_MODEL_PATH=../../shared/ml_outputs/predictions.json

# Cron Schedule
PREDICTION_CRON_SCHEDULE=0 6 * * *
```

---

## 📡 API Endpoints (30+)

### 🏆 Golden Bets
- `GET /api/golden-bets/today` - Today's top 3 Golden Bets
- `GET /api/golden-bets/:id` - Get specific Golden Bet
- `GET /api/golden-bets` - Historical Golden Bets with filters

### 🎯 Predictions
- `GET /api/predictions` - All predictions with advanced filters
- `GET /api/predictions/history` - Historical results with summary
- `GET /api/predictions/leagues` - Available leagues for filters
- `GET /api/predictions/markets` - Available markets for filters
- `GET /api/predictions/fixture/:id` - Predictions for specific fixture

### 📊 Statistics
- `GET /api/stats/pnl?period=monthly` - P&L statistics
- `GET /api/stats/treble/today` - Today's treble calculator
- `GET /api/stats/treble?period=monthly` - Treble statistics
- `GET /api/stats/treble/history` - Historical trebles
- `GET /api/stats/overview` - Overall platform statistics
- `GET /api/stats/by-league` - Performance breakdown by league
- `GET /api/stats/by-market` - Performance breakdown by market

### ⚽ Fixtures
- `GET /api/fixtures?date=2025-11-24` - Get fixtures by date
- `GET /api/fixtures/upcoming` - Get upcoming fixtures
- `GET /api/fixtures/:id` - Get specific fixture details
- `POST /api/fixtures/analyze` - AI analysis of single fixture
- `POST /api/fixtures/analyze-bulk` - Bulk AI analysis

### 🎲 Betting Insights
- `GET /api/betting-insights/fixture/:id` - AI insights for fixture
- `GET /api/betting-insights/upcoming` - Upcoming fixture insights
- `POST /api/betting-insights/generate/:id` - Generate insights

### 🏥 Health Check
- `GET /health` - Server health status

---

## 🔄 Automated Cron Jobs

The backend runs 3 automated jobs:

1. **5:00 AM** - Generate AI betting insights (48h before matches)
2. **6:00 AM** - Fetch fixtures, generate predictions, select Golden Bets
3. **Every 2 hours** - Settle finished fixtures, update results

---

## 🎯 Key Features

### ✅ Result Settlement System
- Automatically settles finished fixtures
- Validates predictions against actual results
- Calculates profit/loss (£10 stake per bet)
- Supports all 4 markets (Match Winner, BTTS, O/U 2.5, Corners, Cards)
- Runs every 2 hours

### ✅ Treble Calculator
- Daily 3-bet accumulators from top Golden Bets
- Automatic odds multiplication
- Win/loss tracking
- Historical treble performance
- Statistics by period

### ✅ Advanced Filtering
- Filter by date/date range, league, market, confidence, result
- Search by team name
- Sort by any field
- Pagination support

### ✅ Performance Analytics
- P&L tracking by period
- Win rate calculations
- ROI calculations
- Performance by league
- Performance by market

---

## 🗄️ Database Models

### Prediction Model
- Fixture details (teams, league, date)
- Market and prediction
- Odds and confidence score
- AI reasoning
- Golden Bet flag
- Result tracking (win/loss/pending)
- Profit calculation

### Fixture Model
- Match information
- Odds for 4 markets
- Live status updates
- Score tracking
- AI betting insights

---

## 🚀 Running

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Testing
```bash
npm test
```

---

## 📚 Documentation

- **[BACKEND_COMPLETE.md](./BACKEND_COMPLETE.md)** - Comprehensive build documentation
- **[API_REFERENCE.md](./API_REFERENCE.md)** - Quick API reference with examples
- **[FIXTURES_SERVICE.md](./FIXTURES_SERVICE.md)** - Fixtures API documentation
- **[SETUP.md](./SETUP.md)** - Detailed setup guide

---

## 🚢 Deployment

### Railway
```bash
railway up
```

### Render
Connect GitHub repo and deploy automatically.

### Docker
```bash
docker build -t footy-oracle-backend .
docker run -p 3001:3001 footy-oracle-backend
```

---

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3001/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-24T09:00:00.000Z",
  "environment": "development"
}
```

### Example API Calls
```bash
# Get today's Golden Bets
curl http://localhost:3001/api/golden-bets/today

# Get today's treble
curl http://localhost:3001/api/stats/treble/today

# Get monthly P&L
curl http://localhost:3001/api/stats/pnl?period=monthly

# Search predictions
curl "http://localhost:3001/api/predictions?search=Liverpool&minConfidence=80"
```

---

## 🎊 Summary

**Backend Status:** ✅ Production Ready  
**Total Services:** 8  
**Total Endpoints:** 30+  
**Cron Jobs:** 3  
**Documentation:** Complete  

**Features:**
- ✅ Automated predictions
- ✅ Result settlement
- ✅ Treble calculator
- ✅ Advanced filtering
- ✅ Performance analytics
- ✅ AI insights
- ✅ P&L tracking

**Ready to deploy and start making predictions! 🚀⚽💰**

---

**Last Updated:** November 24, 2025  
**Version:** 2.0  
**Status:** Production Ready
