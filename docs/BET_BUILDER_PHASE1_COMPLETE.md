# 🧠 Bet Builder Brain - Phase 1 Complete

**Date:** Nov 25, 2025  
**Status:** ✅ Backend Algorithm Implementation Complete

---

## 📦 What Was Built

### 1. Configuration System
**File:** `apps/backend/src/config/betBuilder.ts`

**Features:**
- League tier definitions (Tier 1: Top 5 leagues, Tier 2: Championship, 2. Bundesliga)
- Configurable thresholds (75% confidence, 75% probability)
- Market odds mapping (~2.0 odds per market)
- Helper functions for league validation

### 2. Database Model
**File:** `apps/backend/src/models/BetBuilder.ts`

**Schema:**
```typescript
{
  fixtureId: number,
  date: Date,
  homeTeam: string,
  awayTeam: string,
  league: string,
  kickoff: Date,
  markets: [
    {
      market: string,
      marketName: string,
      confidence: number,
      probability: number,
      estimatedOdds: number
    }
  ],
  combinedConfidence: number,
  estimatedCombinedOdds: number,
  aiReasoning: string,
  result: 'win' | 'loss' | 'pending',
  profit: number
}
```

**Indexes:**
- Date (descending)
- Combined confidence (descending)
- League + Date
- Result
- Compound: Date + Combined confidence

### 3. Core Service Logic
**File:** `apps/backend/src/services/betBuilderService.ts`

**Functions:**
- `findBetBuilders()` - Detects multi-market convergence
- `saveBetBuilders()` - Persists to database
- `getTodaysBetBuilders()` - Fetches today's builders
- `getBetBuildersByDate()` - Fetches by specific date
- `getHistoricalBetBuilders()` - Paginated historical data

**Algorithm:**
1. Filter fixtures by top-tier leagues
2. Check each market (BTTS, Goals, Corners, Cards) for 75%+ confidence
3. Require minimum 3 markets meeting threshold
4. Calculate combined confidence (weighted average)
5. Calculate combined odds (multiply individual odds)
6. Sort by combined confidence
7. Return top 5

### 4. API Endpoints
**File:** `apps/backend/src/routes/betBuilder.ts`

**Routes:**
- `GET /api/bet-builders/today` - Today's bet builders
- `GET /api/bet-builders?date=YYYY-MM-DD` - Specific date
- `GET /api/bet-builders?startDate=X&endDate=Y` - Date range (paginated)
- `GET /api/bet-builders/:id` - Single bet builder by ID
- `GET /api/bet-builders/stats/summary` - Win rate, ROI, stats
- `GET /api/bet-builders/weekly` - This week's builders

### 5. Server Integration
**File:** `apps/backend/src/server.ts`

**Changes:**
- Imported bet builder router
- Registered `/api/bet-builders` route
- Added startup log message

---

## 🎯 How It Works

### Detection Algorithm

```
For each fixture:
  ✓ Check if league is supported (Top 7 leagues)
  ✓ Check BTTS: confidence >= 75% AND probability >= 0.75
  ✓ Check Over 2.5 Goals: confidence >= 75% AND probability >= 0.75
  ✓ Check Over 9.5 Corners: confidence >= 75% AND probability >= 0.75
  ✓ Check Over 3.5 Cards: confidence >= 75% AND probability >= 0.75
  
  If 3+ markets meet threshold:
    ✓ Calculate combined confidence (average)
    ✓ Calculate combined odds (multiply)
    ✓ Add to bet builder candidates
    
Sort by combined confidence (highest first)
Return top 5
```

### Example Output

```json
{
  "success": true,
  "data": [
    {
      "fixtureId": 1001,
      "homeTeam": "Man City",
      "awayTeam": "Arsenal",
      "league": "Premier League",
      "kickoff": "2025-11-25T15:00:00Z",
      "markets": [
        {
          "market": "over_2_5_goals",
          "marketName": "Over 2.5 Goals",
          "confidence": 77,
          "probability": 0.77,
          "estimatedOdds": 2.0
        },
        {
          "market": "over_9_5_corners",
          "marketName": "Over 9.5 Corners",
          "confidence": 82,
          "probability": 0.82,
          "estimatedOdds": 2.0
        },
        {
          "market": "over_3_5_cards",
          "marketName": "Over 3.5 Cards",
          "confidence": 79,
          "probability": 0.79,
          "estimatedOdds": 2.0
        }
      ],
      "combinedConfidence": 79,
      "estimatedCombinedOdds": 8.0,
      "result": "pending"
    }
  ],
  "count": 1
}
```

---

## 🧪 Testing

### Manual Testing

**1. Test Configuration:**
```bash
cd apps/backend
node -e "import('./src/config/betBuilder.js').then(c => console.log(c.BET_BUILDER_CONFIG))"
```

**2. Test API Endpoints:**
```bash
# Start server
npm run dev

# Test today's bet builders
curl http://localhost:3001/api/bet-builders/today

# Test specific date
curl http://localhost:3001/api/bet-builders?date=2025-11-25

# Test stats
curl http://localhost:3001/api/bet-builders/stats/summary
```

### Integration with ML Pipeline

**Required:** ML output must match this structure:

```json
{
  "fixtures": [
    {
      "fixture_id": 1001,
      "home_team": "Man City",
      "away_team": "Arsenal",
      "kickoff": "2025-11-25T15:00:00Z",
      "league": "Premier League",
      "predictions": {
        "btts": {
          "yes_probability": 0.77,
          "confidence": 77
        },
        "over_2_5_goals": {
          "over_probability": 0.82,
          "confidence": 82
        },
        "over_9_5_corners": {
          "over_probability": 0.79,
          "confidence": 79
        },
        "over_3_5_cards": {
          "over_probability": 0.75,
          "confidence": 75
        }
      }
    }
  ]
}
```

---

## 📊 Expected Results

### Weekly Output
- **Target:** 3-5 bet builders per week
- **Rarity:** Multi-market convergence at 75%+ is statistically rare
- **Quality:** Only top-tier leagues with best data quality

### Performance Targets
- **Win Rate:** 60-70% (lower than single bets due to multi-market risk)
- **Average Odds:** 5.0-8.0 (massive returns when they hit)
- **ROI Target:** 30-50% (higher than single bets due to odds multiplication)

---

## ✅ Phase 1 Checklist

- [x] Create configuration file with league tiers and thresholds
- [x] Create BetBuilder database model with indexes
- [x] Implement bet builder detection algorithm
- [x] Add combined confidence calculation
- [x] Add combined odds calculation
- [x] Create database save/retrieve functions
- [x] Create API endpoints (today, date, historical, stats, weekly)
- [x] Register routes in server
- [x] Add startup log message
- [x] Document implementation

---

## 🚀 Next Steps (Phase 2)

### Frontend UI Development

**Tasks:**
1. Create `BetBuilderBrain.tsx` component
2. Add to homepage between Golden Bets and All Fixtures
3. Create dedicated `/bet-builders` page
4. Design card layout with purple/gold gradient
5. Add confidence bars and odds display
6. Integrate AI reasoning display
7. Add "View Full Analysis" and "Add to Betslip" buttons

**Files to Create:**
- `apps/frontend/src/components/BetBuilderBrain.tsx`
- `apps/frontend/src/pages/BetBuilders.tsx`
- `apps/frontend/src/services/betBuilderService.ts`

---

## 🔧 Configuration Options

### Adjustable Thresholds

**File:** `apps/backend/src/config/betBuilder.ts`

```typescript
// Increase for stricter filtering (fewer, higher quality)
MIN_CONFIDENCE: 80,  // Default: 75

// Decrease for more bet builders (more quantity, lower quality)
MIN_CONFIDENCE: 70,  // Default: 75

// Require all 4 markets (ultra-rare, ultra-high confidence)
MIN_MARKETS: 4,  // Default: 3

// Allow more bet builders per day
MAX_DAILY_BUILDERS: 10,  // Default: 5
```

### Adding New Leagues

```typescript
TIER_2_LEAGUES: [
  'Championship',
  '2. Bundesliga',
  'Eredivisie',  // Add new league
  'Primeira Liga',  // Add new league
],
```

---

## 📝 Notes

- **Philosophy:** Quality over quantity - 3-5 rare, high-confidence builders beat 20 mediocre ones
- **League Focus:** Top-tier only ensures data quality and bookmaker liquidity
- **Odds Balance:** All markets target ~2.0 odds to maintain value focus
- **Rarity = Value:** Multi-market convergence at 75%+ is statistically significant
- **Database Ready:** All bet builders are stored for historical tracking and P&L analysis

---

**Phase 1 Status:** ✅ COMPLETE  
**Ready for:** Phase 2 (Frontend UI Development)  
**Estimated Phase 2 Time:** 1-2 weeks
