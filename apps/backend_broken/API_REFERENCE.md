# 🚀 Footy Oracle v2 - API Quick Reference

## Base URL
```
http://localhost:3001/api
```

---

## 🏆 Golden Bets

### Get Today's Golden Bets
```bash
GET /golden-bets/today
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "fixtureId": 1001,
      "homeTeam": "Manchester City",
      "awayTeam": "Liverpool",
      "league": "Premier League",
      "market": "Match Winner",
      "prediction": "Home Win",
      "odds": 2.1,
      "confidence": 85,
      "aiReasoning": "...",
      "result": "pending"
    }
  ],
  "count": 3
}
```

### Get Historical Golden Bets
```bash
GET /golden-bets?startDate=2025-11-01&endDate=2025-11-24&result=win
```

---

## 📊 Statistics

### Get P&L Stats
```bash
GET /stats/pnl?period=monthly
```
**Periods:** `daily`, `weekly`, `monthly`, `yearly`, `all`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalBets": 90,
    "wins": 63,
    "losses": 27,
    "totalProfit": 245.50,
    "winRate": 70.00,
    "roi": 27.28
  }
}
```

### Get Today's Treble
```bash
GET /stats/treble/today
```
**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2025-11-24",
    "bets": [
      {
        "match": "Man City vs Liverpool",
        "prediction": "Home Win",
        "odds": 2.1,
        "confidence": 85
      }
    ],
    "trebleOdds": 9.26,
    "stake": 10,
    "potentialReturn": 92.60,
    "potentialProfit": 82.60,
    "status": "pending"
  }
}
```

### Get Treble Stats
```bash
GET /stats/treble?period=monthly
```

### Get Historical Trebles
```bash
GET /stats/treble/history?status=won
```

### Get Overview Stats
```bash
GET /stats/overview
```
**Response includes:** Total predictions, Golden Bets, win rate, settlement stats, treble stats

### Get Performance by League
```bash
GET /stats/by-league
```

### Get Performance by Market
```bash
GET /stats/by-market
```

---

## 🎯 Predictions

### Get All Predictions (Advanced Filters)
```bash
GET /predictions?league=Premier League&minConfidence=80&result=win&page=1&limit=20
```

**Available Filters:**
- `date` - Specific date (YYYY-MM-DD)
- `startDate` - Start of date range
- `endDate` - End of date range
- `league` - League name
- `market` - Market type
- `minConfidence` - Minimum confidence (0-100)
- `maxConfidence` - Maximum confidence (0-100)
- `result` - Result status (`win`, `loss`, `pending`)
- `isGoldenBet` - Filter Golden Bets (`true`, `false`)
- `search` - Search by team name
- `sortBy` - Sort field (default: `confidence`)
- `sortOrder` - Sort order (`asc`, `desc`)
- `page` - Page number
- `limit` - Results per page

### Get Historical Results
```bash
GET /predictions/history?startDate=2025-11-01&league=Premier League
```
**Response includes:** Predictions + summary stats (wins, losses, profit, win rate)

### Get Available Leagues
```bash
GET /predictions/leagues
```

### Get Available Markets
```bash
GET /predictions/markets
```

### Get Predictions by Fixture
```bash
GET /predictions/fixture/1001
```

---

## ⚽ Fixtures

### Get Fixtures by Date
```bash
GET /fixtures?date=2025-11-24
```

### Get Upcoming Fixtures
```bash
GET /fixtures/upcoming
```

### Get Fixture Details
```bash
GET /fixtures/1001
```

### Analyze Single Fixture (AI)
```bash
POST /fixtures/analyze
Content-Type: application/json

{
  "id": "1",
  "homeTeam": "Manchester City",
  "awayTeam": "Arsenal",
  "league": "Premier League",
  "date": "2025-11-24T15:00:00Z"
}
```

### Analyze Multiple Fixtures (AI)
```bash
POST /fixtures/analyze-bulk
Content-Type: application/json

{
  "fixtures": [
    {
      "id": "1",
      "homeTeam": "Man City",
      "awayTeam": "Arsenal",
      "league": "Premier League",
      "date": "2025-11-24T15:00:00Z"
    }
  ]
}
```

### Find Golden Bets
```bash
POST /fixtures/golden-bets
Content-Type: application/json

{
  "fixtures": [...]
}
```

### Find Value Bets
```bash
POST /fixtures/value-bets
Content-Type: application/json

{
  "fixtures": [...]
}
```

---

## 🎲 Betting Insights

### Get Fixture Insights
```bash
GET /betting-insights/fixture/1001
```

### Get Upcoming Insights
```bash
GET /betting-insights/upcoming
```

### Generate Insights
```bash
POST /betting-insights/generate/1001
```

---

## 🏥 Health Check

```bash
GET /health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-24T09:00:00.000Z",
  "environment": "development"
}
```

---

## 📝 Example Usage Scenarios

### Scenario 1: Get Today's Betting Recommendations
```bash
# 1. Get today's Golden Bets
curl http://localhost:3001/api/golden-bets/today

# 2. Get today's treble
curl http://localhost:3001/api/stats/treble/today

# 3. Get betting insights
curl http://localhost:3001/api/betting-insights/upcoming
```

### Scenario 2: Check Performance
```bash
# 1. Get monthly P&L
curl http://localhost:3001/api/stats/pnl?period=monthly

# 2. Get treble stats
curl http://localhost:3001/api/stats/treble?period=monthly

# 3. Get performance by league
curl http://localhost:3001/api/stats/by-league
```

### Scenario 3: View Historical Results
```bash
# 1. Get historical predictions
curl "http://localhost:3001/api/predictions/history?startDate=2025-11-01&result=win"

# 2. Get historical trebles
curl "http://localhost:3001/api/stats/treble/history?status=won"

# 3. Get overall overview
curl http://localhost:3001/api/stats/overview
```

### Scenario 4: Search & Filter
```bash
# Search for Liverpool matches
curl "http://localhost:3001/api/predictions?search=Liverpool&minConfidence=80"

# Filter by league and market
curl "http://localhost:3001/api/predictions?league=Premier%20League&market=Match%20Winner"

# Get high confidence pending bets
curl "http://localhost:3001/api/predictions?minConfidence=85&result=pending"
```

---

## 🔄 Automated Cron Jobs

The backend runs these jobs automatically:

1. **5:00 AM** - Generate AI betting insights (48h before matches)
2. **6:00 AM** - Fetch fixtures, generate predictions, select Golden Bets
3. **Every 2 hours** - Settle finished fixtures, update results

---

## 💡 Tips

1. **Pagination:** Use `page` and `limit` parameters for large datasets
2. **Filtering:** Combine multiple filters for precise results
3. **Sorting:** Use `sortBy` and `sortOrder` to customize result order
4. **Date Ranges:** Use `startDate` and `endDate` for historical analysis
5. **Search:** Use `search` parameter to find specific teams

---

## 🚨 Error Responses

All endpoints return consistent error format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `404` - Not found
- `500` - Server error

---

**Last Updated:** November 24, 2025  
**Version:** 2.0  
**Status:** Production Ready
