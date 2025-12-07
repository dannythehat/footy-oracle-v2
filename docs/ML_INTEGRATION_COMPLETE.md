# ML Integration - Complete System Documentation

## Overview

Footy Oracle V2 integrates with the ML API (`football-betting-ai-system`) to generate AI-powered betting predictions across multiple products.

**Status**: ✅ **FULLY OPERATIONAL**

---

## System Architecture

### 1. Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     DAILY AUTOMATED PIPELINE                     │
└─────────────────────────────────────────────────────────────────┘

3:00 AM UTC  →  Load Fixtures (fixturesCron.ts)
                 ├─ Fetch today's fixtures from API-Football
                 ├─ Store in MongoDB (Fixture collection)
                 └─ Update odds data

5:00 AM UTC  →  Update Odds (oddsUpdateService.ts)
                 ├─ Refresh odds for all fixtures
                 └─ Ensure latest bookmaker data

6:00 AM UTC  →  Generate ML Predictions (mlPredictionsCron.ts) ⭐ NEW
                 ├─ Fetch today's fixtures from MongoDB
                 ├─ Call ML API for predictions
                 ├─ Generate Golden Bets (top 3 high-confidence)
                 ├─ Generate Value Bets (top 3 value opportunities)
                 ├─ Cache predictions for 24 hours
                 └─ Log cache status

6:30 AM UTC  →  Import Bet Builders (betBuilderCron.ts)
                 ├─ Call ML API for bet builder analysis
                 ├─ Select Bet Builder of the Day
                 └─ Store in MongoDB
```

### 2. Cron Jobs

**Location**: `apps/backend/src/cron/`

#### mlPredictionsCron.ts
- **Schedule**: `0 6 * * *` (6:00 AM UTC daily)
- **Purpose**: Pre-generate Golden Bets and Value Bets
- **Caching**: 24-hour cache via `predictionCache.ts`
- **Initialization**: Started in `app.ts` on server boot

```typescript
// app.ts (lines 64-67)
console.log("🚀 Initializing cron jobs...");
startLiveScoresCron();
startMLPredictionsCron(); // ← Starts ML predictions cron
console.log("✅ Cron jobs started successfully");
```

#### betBuilderCron.ts
- **Schedule**: `30 6 * * *` (6:30 AM UTC daily)
- **Purpose**: Generate Bet Builder of the Day
- **Note**: NOT initialized in app.ts (needs manual trigger or separate initialization)

#### fixturesCron.ts
- **Schedule**: `0 3 * * *` (3:00 AM UTC daily)
- **Purpose**: Load fixtures and update odds

#### liveScoresCron.ts
- **Schedule**: Every 2 minutes during match hours
- **Purpose**: Update live scores and match events

---

## Products & Endpoints

### 1. Golden Bets

**What**: Top 3 highest-confidence predictions for today

**Endpoint**: `GET /api/golden-bets`

**Route**: `apps/backend/src/routes/goldenBets.ts`

**Service**: `apps/backend/src/services/mlService.ts` → `loadGoldenBets()`

**Caching**: 24-hour cache via `predictionCache`

**Selection Criteria**:
- Confidence ≥ 70%
- Top 3 by confidence score
- Diverse markets (BTTS, Over 2.5, Corners, Cards)

**Response Format**:
```json
{
  "success": true,
  "goldenBets": [
    {
      "fixtureId": 12345,
      "homeTeam": "Arsenal",
      "awayTeam": "Chelsea",
      "league": "Premier League",
      "market": "BTTS",
      "prediction": "Yes",
      "confidence": 85.5,
      "odds": 1.75,
      "aiReasoning": "Both teams averaging 1.8 goals per game..."
    }
  ],
  "cached": true,
  "cacheAge": "2h 15m"
}
```

---

### 2. Value Bets

**What**: Top 3 bets with highest value (AI probability > Bookmaker odds)

**Endpoint**: `GET /api/value-bets`

**Route**: `apps/backend/src/routes/valueBets.ts`

**Service**: `apps/backend/src/services/mlService.ts` → `loadValueBets()`

**Caching**: 24-hour cache via `predictionCache`

**Selection Criteria**:
- Value % = (AI Probability - Implied Odds Probability) × 100
- Minimum value: 10%
- Top 3 by value percentage

**Response Format**:
```json
{
  "success": true,
  "valueBets": [
    {
      "fixtureId": 12345,
      "homeTeam": "Liverpool",
      "awayTeam": "Man City",
      "market": "Over 2.5",
      "prediction": "Over",
      "confidence": 72.0,
      "odds": 1.90,
      "value": 15.5,
      "aiReasoning": "AI predicts 75% chance, bookies only 52.6%..."
    }
  ],
  "cached": true
}
```

---

### 3. Bet Builder of the Day

**What**: Single multi-market accumulator with highest composite score

**Endpoint**: `GET /api/bet-builder/of-the-day`

**Route**: `apps/backend/src/routes/betBuilder.ts`

**Service**: `apps/backend/src/services/betBuilderOfTheDayService.ts`

**Caching**: Database-backed (BetBuilder collection)

**Selection Criteria**:
- Composite Score = (Confidence × 0.6) + (Normalized Odds × 0.4)
- Balances reliability (60%) with value (40%)
- Typically 3-4 markets per bet builder

**Response Format**:
```json
{
  "success": true,
  "betBuilder": {
    "fixtureId": 12345,
    "homeTeam": "Barcelona",
    "awayTeam": "Real Madrid",
    "markets": [
      {
        "market": "btts",
        "marketName": "Both Teams to Score",
        "confidence": 82.0,
        "probability": 0.82,
        "estimatedOdds": 1.65
      },
      {
        "market": "over25",
        "marketName": "Over 2.5 Goals",
        "confidence": 78.5,
        "probability": 0.785,
        "estimatedOdds": 1.75
      }
    ],
    "combinedConfidence": 80.0,
    "estimatedCombinedOdds": 2.89,
    "compositeScore": 62.5,
    "aiReasoning": "High-scoring El Clasico with both teams..."
  }
}
```

---

## Caching System

**File**: `apps/backend/src/services/predictionCache.ts`

**Purpose**: Avoid repeated ML API calls (expensive and slow)

**Cache Duration**: 24 hours

**Cached Data**:
- Golden Bets (3 predictions)
- Value Bets (3 predictions)

**Cache Methods**:
```typescript
// Set cache
predictionCache.setGoldenBets(goldenBets);
predictionCache.setValueBets(valueBets);

// Get cache
const goldenBets = predictionCache.getGoldenBets();
const valueBets = predictionCache.getValueBets();

// Check status
const status = predictionCache.getStatus();
// Returns: { goldenBets: { count, age, expiresIn }, valueBets: {...} }
```

**Cache Population**:
1. **Automatic**: Daily at 6 AM via `mlPredictionsCron.ts`
2. **Manual**: `POST /api/admin/generate-predictions`

---

## Manual Triggers (Admin Endpoints)

**Base Path**: `/api/admin`

### 1. Generate ML Predictions

```bash
POST /api/admin/generate-predictions
```

**Purpose**: Manually trigger Golden Bets + Value Bets generation

**Response**:
```json
{
  "success": true,
  "message": "ML predictions generated successfully",
  "note": "Golden Bets and Value Bets have been generated and cached for 24 hours",
  "cache": {
    "goldenBets": { "count": 3, "age": "0m", "expiresIn": "24h" },
    "valueBets": { "count": 3, "age": "0m", "expiresIn": "24h" }
  }
}
```

### 2. Check Cache Status

```bash
GET /api/admin/cache-status
```

**Purpose**: Inspect prediction cache state

**Response**:
```json
{
  "success": true,
  "cache": {
    "goldenBets": { "count": 3, "age": "2h 15m", "expiresIn": "21h 45m" },
    "valueBets": { "count": 3, "age": "2h 15m", "expiresIn": "21h 45m" }
  },
  "note": "Cache expires after 24 hours. Predictions are regenerated daily at 6 AM UTC."
}
```

### 3. Import Bet Builders

```bash
POST /api/admin/import-bet-builders
```

**Purpose**: Manually trigger bet builder import

**Note**: Bet builders are NOT cached (stored in MongoDB)

---

## Database Models

### 1. Prediction Model

**File**: `apps/backend/src/models/Prediction.ts`

**Fields**:
- `fixtureId`: Match identifier
- `homeTeam`, `awayTeam`, `league`: Match details
- `market`: Bet market (BTTS, Over 2.5, etc.)
- `prediction`: Predicted outcome
- `confidence`: AI confidence (0-100)
- `odds`: Bookmaker odds
- `value`: Value percentage
- `aiReasoning`: GPT-4 generated explanation
- `result`: 'win' | 'loss' | 'pending' | 'void'
- `profit`: P&L calculation
- `isGoldenBet`: Boolean flag for Golden Bets

### 2. BetBuilder Model

**File**: `apps/backend/src/models/BetBuilder.ts`

**Fields**:
- `fixtureId`: Match identifier
- `markets`: Array of market predictions
- `combinedConfidence`: Overall confidence
- `estimatedCombinedOdds`: Accumulator odds
- `aiReasoning`: GPT-4 explanation
- `result`: 'win' | 'loss' | 'pending'
- `profit`: P&L calculation

### 3. FeaturedSelection Model

**File**: `apps/backend/src/models/FeaturedSelection.ts`

**Purpose**: Unified P&L tracking for all featured bets

**Selection Types**:
- `golden-bet`
- `bet-builder`
- `value-bet`

**Fields**:
- All prediction fields
- `selectionType`: Type of featured bet
- `featured`: Was it actually featured?
- `featuredAt`: When it was featured
- `stake`: Bet stake (default £10)
- `profit`: Calculated P&L
- `settledAt`: When result was settled

---

## P&L Tracking

**Service**: `apps/backend/src/services/pnlTrackingService.ts`

**Purpose**: Track performance of all featured selections

**Endpoints**:
- `GET /api/pnl/stats` - Overall P&L statistics
- `GET /api/pnl/breakdown` - Breakdown by selection type
- `GET /api/pnl/history` - Historical performance

**Metrics Tracked**:
- Total bets
- Wins / Losses / Pending / Voids
- Total staked
- Total profit
- Win rate (%)
- ROI (%)
- Average odds

**Breakdown By**:
- Golden Bets
- Bet Builders
- Value Bets

---

## Result Settlement

**Service**: `apps/backend/src/services/resultSettlementService.ts`

**Purpose**: Automatically settle bet results when fixtures finish

**Process**:
1. Fetch finished fixtures from MongoDB
2. Check prediction against actual result
3. Update `result` field ('win' or 'loss')
4. Calculate `profit` (stake × (odds - 1) for wins, -stake for losses)
5. Update `settledAt` timestamp

**Supported Markets**:
- Match Winner (Home/Draw/Away)
- Both Teams to Score (Yes/No)
- Over/Under 2.5 Goals
- Over/Under 9.5 Corners
- Over/Under 3.5 Cards

**Trigger**: Runs automatically via cron or manual admin endpoint

---

## ML API Integration

**ML API URL**: `https://football-ml-api.onrender.com`

**Timeout**: 30 seconds

### Endpoints Used

#### 1. Golden Bets
```
POST /api/v1/predictions/golden-bets
```

**Payload**:
```json
{
  "matches": [
    {
      "id": "12345",
      "home_team": "Arsenal",
      "away_team": "Chelsea",
      "date": "2025-12-07T15:00:00Z",
      "league": "Premier League",
      "stats": { ... },
      "odds": { ... }
    }
  ]
}
```

#### 2. Value Bets
```
POST /api/v1/predictions/value-bets
```

**Payload**: Same as Golden Bets

#### 3. Bet Builder of the Day
```
POST /api/v1/predictions/bet-builder-of-the-day
```

**Payload**: Same as Golden Bets

**Response**:
```json
{
  "bet_builder": {
    "fixture_id": "12345",
    "markets": [
      {
        "market": "btts",
        "confidence": 82.0,
        "probability": 0.82,
        "estimated_odds": 1.65
      }
    ],
    "combined_confidence": 80.0,
    "combined_odds": 2.89
  }
}
```

---

## AI Reasoning Generation

**Service**: `apps/backend/src/services/aiService.ts`

**Model**: GPT-4o-latest

**Purpose**: Generate friendly, detailed explanations for predictions

**Bulk Generation**: Processes multiple predictions in parallel

**Prompt Template**:
```
You are a friendly football betting expert. Explain why this bet is recommended:

Match: {homeTeam} vs {awayTeam}
Market: {market}
Prediction: {prediction}
Confidence: {confidence}%
Odds: {odds}

Provide a concise, friendly explanation (2-3 sentences) focusing on:
- Key stats and trends
- Why this bet offers value
- Risk factors to consider
```

---

## Troubleshooting

### Issue: No Golden Bets or Value Bets

**Check**:
1. Cache status: `GET /api/admin/cache-status`
2. ML status: `GET /api/admin/ml-status`
3. Cron logs in server console

**Fix**:
```bash
# Manual trigger
POST /api/admin/generate-predictions

# Check if cron is running
# Look for: "✅ ML predictions cron job scheduled: 6:00 AM UTC daily"
```

### Issue: Bet Builder Not Updating

**Check**:
1. BetBuilder cron is NOT auto-started in app.ts
2. Database for existing bet builders

**Fix**:
```bash
# Manual trigger
POST /api/admin/import-bet-builders
```

### Issue: Predictions Not Settling

**Check**:
1. Fixture status in database
2. Result settlement service logs

**Fix**:
```bash
# Manual settlement trigger (if endpoint exists)
POST /api/admin/settle-results
```

### Issue: ML API Timeout

**Symptoms**: 30-second timeout errors

**Causes**:
- ML API cold start (Render free tier)
- Large fixture dataset
- ML model loading time

**Fix**:
- Retry request
- Check ML API health
- Consider increasing timeout in production

---

## Environment Variables

**Required**:
```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# ML API
ML_API_URL=https://football-ml-api.onrender.com

# OpenAI (for AI reasoning)
OPENAI_API_KEY=sk-...

# API Football (for fixtures)
API_FOOTBALL_KEY=...
```

---

## File Structure

```
apps/backend/src/
├── cron/
│   ├── mlPredictionsCron.ts       ⭐ ML predictions cron (6 AM)
│   ├── betBuilderCron.ts          🧠 Bet builder cron (6:30 AM)
│   ├── fixturesCron.ts            📅 Fixtures cron (3 AM)
│   └── liveScoresCron.ts          🔴 Live scores cron (every 2min)
│
├── services/
│   ├── mlService.ts               🤖 ML API integration
│   ├── predictionCache.ts         💾 24-hour cache
│   ├── betBuilderOfTheDayService.ts  🎯 Bet builder selection
│   ├── pnlTrackingService.ts      📊 P&L calculations
│   ├── resultSettlementService.ts ✅ Result settlement
│   └── aiService.ts               🧠 GPT-4 reasoning
│
├── routes/
│   ├── goldenBets.ts              🏆 Golden Bets endpoint
│   ├── valueBets.ts               💰 Value Bets endpoint
│   ├── betBuilder.ts              🎲 Bet Builder endpoint
│   ├── pnl.ts                     📈 P&L endpoints
│   └── admin.ts                   🔧 Admin triggers
│
├── models/
│   ├── Prediction.ts              📝 Prediction schema
│   ├── BetBuilder.ts              🎯 Bet builder schema
│   ├── FeaturedSelection.ts       ⭐ P&L tracking schema
│   └── Fixture.ts                 ⚽ Fixture schema
│
└── app.ts                         🚀 Cron initialization
```

---

## Testing

### Manual Testing

```bash
# 1. Generate predictions
curl -X POST http://localhost:3001/api/admin/generate-predictions

# 2. Check cache
curl http://localhost:3001/api/admin/cache-status

# 3. Get Golden Bets
curl http://localhost:3001/api/golden-bets

# 4. Get Value Bets
curl http://localhost:3001/api/value-bets

# 5. Get Bet Builder
curl http://localhost:3001/api/bet-builder/of-the-day

# 6. Check P&L
curl http://localhost:3001/api/pnl/stats
```

### Automated Testing

**Test Files**:
- `apps/backend/test-fixtures.ts`
- `apps/backend/test-api-integration.ts`

---

## Performance Optimization

### 1. Caching Strategy
- **Golden Bets**: 24-hour cache (regenerated daily at 6 AM)
- **Value Bets**: 24-hour cache (regenerated daily at 6 AM)
- **Bet Builders**: Database-backed (no cache expiry)

### 2. Bulk Processing
- AI reasoning generated in parallel (bulk requests)
- Reduces OpenAI API calls from N to 1

### 3. Database Indexing
- Compound indexes on `date`, `confidence`, `result`
- Optimized queries for featured selections

---

## Future Enhancements

### 1. Real-time Updates
- WebSocket integration for live prediction updates
- Push notifications for featured bets

### 2. Advanced Analytics
- Win rate by league
- ROI by market type
- Confidence calibration analysis

### 3. User Personalization
- Custom stake amounts
- Favorite leagues/teams
- Risk tolerance settings

### 4. Bet Builder Caching
- Add 24-hour cache for bet builders
- Initialize bet builder cron in app.ts

---

## Support & Maintenance

**Monitoring**:
- Check cron logs daily
- Monitor cache hit rates
- Track ML API response times

**Regular Tasks**:
- Weekly P&L review
- Monthly confidence calibration
- Quarterly ML model updates

**Alerts**:
- ML API downtime
- Cache expiry without refresh
- Result settlement failures

---

## Conclusion

The ML integration is **fully operational** with:
- ✅ Automated daily predictions (6 AM UTC)
- ✅ 24-hour caching system
- ✅ Manual admin triggers
- ✅ Comprehensive P&L tracking
- ✅ Result settlement automation
- ✅ AI-powered reasoning

**Next Steps**:
1. Initialize bet builder cron in `app.ts`
2. Add bet builder caching
3. Implement real-time updates
4. Build analytics dashboard

---

**Last Updated**: December 7, 2025  
**Version**: 2.0  
**Status**: Production Ready ✅
