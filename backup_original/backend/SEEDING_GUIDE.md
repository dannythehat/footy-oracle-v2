# 3-Day Historical Seeding Guide

## Overview
Seeds MongoDB with **EXACTLY 3 Golden Bets per day** for the past 3 days (Nov 22-24, 2025).

## Features
- ✅ Real odds from API-Football
- ✅ Proper value bet calculation: `AI% - Bookie% = Value%`
- ✅ Unique AI reasoning per bet
- ✅ Specified win pattern:
  - **Day 1 (Nov 22)**: 3/3 wins → **ACCA WIN** 🌟
  - **Day 2 (Nov 23)**: 2/3 wins
  - **Day 3 (Nov 24)**: 2/3 wins

## Value Bet Formula
```
AI Probability % - Bookie Implied Probability % = Value %

Example:
- AI Confidence: 85%
- Odds: 1.85
- Bookie Implied: (1 / 1.85) × 100 = 54.05%
- Value: 85% - 54.05% = 30.95% ✅
```

## Usage

### 1. Run the Script
```bash
cd apps/backend
npx tsx src/scripts/seedHistoricalPredictions.ts
```

### 2. Expected Output
```
🚀 Starting 3-Day Historical Seeding...

✅ Connected to MongoDB

🗑️  Cleared X existing predictions

📥 Fetching fixtures with REAL ODDS from past 3 days...

  📅 2025-11-22: Processing...
  📊 2025-11-22: Found 20 fixtures with odds
  ✅ 2025-11-22: 3/3 wins 🌟 ACCA WIN - Day P&L: £XX.XX | Total: £XX.XX
  
  📅 2025-11-23: Processing...
  📊 2025-11-23: Found 20 fixtures with odds
  ✅ 2025-11-23: 2/3 wins - Day P&L: £XX.XX | Total: £XX.XX
  
  📅 2025-11-24: Processing...
  📊 2025-11-24: Found 20 fixtures with odds
  ✅ 2025-11-24: 2/3 wins - Day P&L: £XX.XX | Total: £XX.XX

✅ Generated 9 Golden Bets with UNIQUE AI predictions

📊 GOLDEN BETS STATISTICS (REAL ODDS):
  Total Golden Bets: 9
  Wins: 7 | Losses: 2
  Win Rate: 77.8%
  Total Staked: £90.00
  Total Profit: £XX.XX
  ROI: XX.X%

💎 VALUE BET STATISTICS:
  Total Value Bets (>5%): X
  Value Bet Wins: X
  Value Bet Win Rate: XX.X%
  Average Value: XX.XX%

🎯 ACCA (TREBLE) STATISTICS:
  Total ACCAs: 3 days
  ACCA Wins: 1 days
  ACCA Losses: 2 days
  ACCA Win Rate: 33.3%
  ACCA Profit: £XX.XX

💾 Inserting Golden Bets into MongoDB...
✅ Inserted 9 Golden Bets with UNIQUE predictions

🎉 Historical seeding complete!
```

## Data Structure

Each Golden Bet includes:
```typescript
{
  fixtureId: number,
  date: Date,
  homeTeam: string,
  awayTeam: string,
  league: string,
  market: string,
  prediction: string,
  odds: number,
  confidence: number,        // AI confidence (75-95%)
  value: number,             // Value % (AI% - Bookie%)
  aiReasoning: string,       // Unique AI explanation
  isGoldenBet: true,
  result: 'win' | 'loss',
  profit: number             // £8.50 or -£10.00
}
```

## Markets Covered
- Both Teams to Score (Yes/No)
- Over/Under 2.5 Goals
- Over/Under 9.5 Corners
- Over/Under 3.5 Cards

## Profit Calculation
- **Win**: `(odds - 1) × £10`
- **Loss**: `-£10`

Example:
- Odds 1.85 win: `(1.85 - 1) × £10 = £8.50` ✅
- Loss: `-£10.00` ❌

## ACCA Calculation
- **3 bets per day = 1 ACCA**
- **ACCA Win**: All 3 bets win → Profit = `(odds1 × odds2 × odds3 × £10) - £10`
- **ACCA Loss**: Any bet loses → Loss = `-£10`

## Verification

Check MongoDB data:
```bash
mongosh
use footy-oracle
db.predictions.find().pretty()
db.predictions.countDocuments({ isGoldenBet: true })
```

Check via API:
```bash
curl http://localhost:3001/api/golden-bets
curl http://localhost:3001/api/stats/pnl
```

## Notes
- Script clears ALL existing predictions before seeding
- Uses real API-Football data with actual odds
- AI reasoning is dynamically generated (no templates)
- Value bets are properly calculated and stored
- Each bet has unique fixture ID to avoid conflicts
