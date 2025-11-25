# 🧠 Bet Builder Brain - LM System Integration

**Feature:** Multi-Market Convergence Detection  
**Purpose:** How the LM System generates and Oracle consumes Bet Builder predictions  
**Last Updated:** November 25, 2025

---

## 🎯 Overview

The Bet Builder Brain identifies fixtures where **3+ betting markets** show **75%+ AI confidence** simultaneously. This requires the LM System to:

1. Generate predictions for all 4 markets (BTTS, Over 2.5 Goals, Over 9.5 Corners, Over 3.5 Cards)
2. Calculate confidence scores for each market
3. Identify multi-market convergence opportunities
4. Provide data in a format Oracle can consume

---

## 🔗 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  FOOTBALL BETTING AI SYSTEM (LM Engine)                      │
│                                                               │
│  1. Fetch fixtures from API-Football                         │
│  2. Calculate 133+ features per fixture                      │
│  3. Run 4 ML models (BTTS, Goals, Corners, Cards)           │
│  4. Calculate confidence scores                              │
│  5. Identify multi-market convergence (3+ markets @ 75%+)   │
│  6. Generate bet_builders.json output                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    bet_builders.json
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  FOOTY ORACLE V2 (Presentation Layer)                        │
│                                                               │
│  1. Backend reads bet_builders.json                          │
│  2. Saves to MongoDB (BetBuilder model)                      │
│  3. Generates AI reasoning via GPT-4                         │
│  4. Exposes via /api/bet-builders endpoints                  │
│  5. Frontend displays with BetBuilderCard component          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 LM System Output Format

### File: `shared/ml_outputs/bet_builders.json`

The LM System should generate this file daily with bet builder opportunities:

```json
{
  "generated_at": "2025-11-25T06:00:00Z",
  "date": "2025-11-25",
  "total_fixtures_analyzed": 45,
  "bet_builders_found": 5,
  "bet_builders": [
    {
      "fixture_id": 1234567,
      "home_team": "Arsenal",
      "away_team": "Chelsea",
      "league": "Premier League",
      "kickoff": "2025-11-25T15:00:00Z",
      "predictions": {
        "btts": {
          "yes_probability": 0.82,
          "no_probability": 0.18,
          "confidence": 82
        },
        "over_2_5_goals": {
          "over_probability": 0.78,
          "under_probability": 0.22,
          "confidence": 78
        },
        "over_9_5_corners": {
          "over_probability": 0.76,
          "under_probability": 0.24,
          "confidence": 76
        },
        "over_3_5_cards": {
          "over_probability": 0.68,
          "under_probability": 0.32,
          "confidence": 68
        }
      },
      "high_confidence_markets": [
        {
          "market": "btts",
          "market_name": "Both Teams To Score",
          "selection": "Yes",
          "probability": 0.82,
          "confidence": 82,
          "estimated_odds": 1.75
        },
        {
          "market": "over_2_5_goals",
          "market_name": "Over 2.5 Goals",
          "selection": "Over",
          "probability": 0.78,
          "confidence": 78,
          "estimated_odds": 1.85
        },
        {
          "market": "over_9_5_corners",
          "market_name": "Over 9.5 Corners",
          "selection": "Over",
          "probability": 0.76,
          "confidence": 76,
          "estimated_odds": 1.90
        }
      ],
      "combined_confidence": 79,
      "estimated_combined_odds": 6.15,
      "market_count": 3
    }
  ]
}
```

---

## 🔧 LM System Implementation

### 1. Bet Builder Detection Algorithm

**File:** `ml_training/bet_builder_detector.py` (in LM System)

```python
import json
from datetime import datetime

# Configuration
MIN_CONFIDENCE = 75  # Minimum confidence per market
MIN_MARKETS = 3      # Minimum markets required
MAX_DAILY_BUILDERS = 5  # Top N bet builders per day

# Market odds mapping (typical bookmaker odds)
MARKET_ODDS = {
    'btts': 1.75,
    'over_2_5_goals': 1.85,
    'over_9_5_corners': 1.90,
    'over_3_5_cards': 2.00
}

def detect_bet_builders(predictions):
    """
    Identify fixtures with multi-market convergence
    
    Args:
        predictions: List of fixture predictions with all 4 markets
        
    Returns:
        List of bet builder opportunities
    """
    bet_builders = []
    
    for fixture in predictions:
        high_confidence_markets = []
        
        # Check each market for high confidence
        for market, data in fixture['predictions'].items():
            # Get the positive outcome probability and confidence
            if market == 'btts':
                prob = data['yes_probability']
            else:  # over markets
                prob = data['over_probability']
            
            confidence = data['confidence']
            
            # Filter: High confidence and high probability
            if confidence >= MIN_CONFIDENCE and prob >= 0.70:
                high_confidence_markets.append({
                    'market': market,
                    'market_name': get_market_name(market),
                    'selection': get_selection(market),
                    'probability': prob,
                    'confidence': confidence,
                    'estimated_odds': MARKET_ODDS[market]
                })
        
        # Bet Builder requires minimum number of markets
        if len(high_confidence_markets) >= MIN_MARKETS:
            # Calculate combined stats
            combined_confidence = sum(m['confidence'] for m in high_confidence_markets) / len(high_confidence_markets)
            combined_odds = 1.0
            for market in high_confidence_markets:
                combined_odds *= market['estimated_odds']
            
            bet_builders.append({
                'fixture_id': fixture['fixture_id'],
                'home_team': fixture['home_team'],
                'away_team': fixture['away_team'],
                'league': fixture['league'],
                'kickoff': fixture['kickoff'],
                'predictions': fixture['predictions'],
                'high_confidence_markets': high_confidence_markets,
                'combined_confidence': round(combined_confidence),
                'estimated_combined_odds': round(combined_odds, 2),
                'market_count': len(high_confidence_markets)
            })
    
    # Sort by combined confidence (highest first)
    bet_builders.sort(key=lambda x: x['combined_confidence'], reverse=True)
    
    # Return top N
    return bet_builders[:MAX_DAILY_BUILDERS]

def get_market_name(market):
    """Convert market key to display name"""
    names = {
        'btts': 'Both Teams To Score',
        'over_2_5_goals': 'Over 2.5 Goals',
        'over_9_5_corners': 'Over 9.5 Corners',
        'over_3_5_cards': 'Over 3.5 Cards'
    }
    return names.get(market, market)

def get_selection(market):
    """Get the selection for the market"""
    if market == 'btts':
        return 'Yes'
    return 'Over'

def save_bet_builders(bet_builders, output_path='shared/ml_outputs/bet_builders.json'):
    """Save bet builders to JSON file"""
    output = {
        'generated_at': datetime.utcnow().isoformat() + 'Z',
        'date': datetime.utcnow().strftime('%Y-%m-%d'),
        'total_fixtures_analyzed': len(predictions),
        'bet_builders_found': len(bet_builders),
        'bet_builders': bet_builders
    }
    
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"✅ Saved {len(bet_builders)} bet builders to {output_path}")

# Main execution
if __name__ == '__main__':
    # Load predictions from your ML pipeline
    predictions = load_predictions()  # Your existing function
    
    # Detect bet builders
    bet_builders = detect_bet_builders(predictions)
    
    # Save to file
    save_bet_builders(bet_builders)
```

### 2. Integration with Existing Pipeline

**File:** `ml_training/daily_pipeline.py` (in LM System)

```python
from bet_builder_detector import detect_bet_builders, save_bet_builders

def run_daily_pipeline():
    """Main daily prediction pipeline"""
    
    # 1. Fetch fixtures
    fixtures = fetch_todays_fixtures()
    
    # 2. Generate predictions (existing)
    predictions = generate_predictions(fixtures)
    
    # 3. Save regular predictions (existing)
    save_predictions(predictions)
    
    # 4. Generate Golden Bets (existing)
    golden_bets = generate_golden_bets(predictions)
    save_golden_bets(golden_bets)
    
    # 5. NEW: Detect Bet Builders
    bet_builders = detect_bet_builders(predictions)
    save_bet_builders(bet_builders)
    
    print("✅ Daily pipeline complete")
```

---

## 🔄 Oracle Backend Integration

### 1. Import Bet Builders

**File:** `apps/backend/src/services/betBuilderImporter.ts`

```typescript
import fs from 'fs';
import path from 'path';
import { BetBuilder } from '../models/BetBuilder.js';
import { generateAIReasoning } from './aiReasoning.js';

interface LMBetBuilder {
  fixture_id: number;
  home_team: string;
  away_team: string;
  league: string;
  kickoff: string;
  predictions: any;
  high_confidence_markets: Array<{
    market: string;
    market_name: string;
    selection: string;
    probability: number;
    confidence: number;
    estimated_odds: number;
  }>;
  combined_confidence: number;
  estimated_combined_odds: number;
  market_count: number;
}

/**
 * Import bet builders from LM System output
 */
export async function importBetBuilders(): Promise<void> {
  try {
    // Read bet_builders.json from shared ML outputs
    const filePath = path.join(__dirname, '../../../shared/ml_outputs/bet_builders.json');
    
    if (!fs.existsSync(filePath)) {
      console.log('⚠️ No bet_builders.json found. Skipping import.');
      return;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const betBuilders: LMBetBuilder[] = data.bet_builders || [];

    console.log(`📥 Importing ${betBuilders.length} bet builders...`);

    for (const bb of betBuilders) {
      // Check if already exists
      const existing = await BetBuilder.findOne({ fixtureId: bb.fixture_id });

      if (existing) {
        console.log(`⏭️ Bet builder for fixture ${bb.fixture_id} already exists`);
        continue;
      }

      // Generate AI reasoning
      const aiReasoning = await generateAIReasoning(bb);

      // Create new bet builder
      const betBuilder = new BetBuilder({
        fixtureId: bb.fixture_id,
        date: new Date(bb.kickoff),
        homeTeam: bb.home_team,
        awayTeam: bb.away_team,
        league: bb.league,
        kickoff: new Date(bb.kickoff),
        markets: bb.high_confidence_markets.map(m => ({
          market: m.market,
          marketName: m.market_name,
          confidence: m.confidence,
          probability: m.probability,
          estimatedOdds: m.estimated_odds,
        })),
        combinedConfidence: bb.combined_confidence,
        estimatedCombinedOdds: bb.estimated_combined_odds,
        aiReasoning,
      });

      await betBuilder.save();
      console.log(`✅ Imported bet builder: ${bb.home_team} vs ${bb.away_team}`);
    }

    console.log('✅ Bet builder import complete');
  } catch (error) {
    console.error('❌ Error importing bet builders:', error);
    throw error;
  }
}
```

### 2. AI Reasoning Generation

**File:** `apps/backend/src/services/aiReasoning.ts`

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate AI reasoning for bet builder using GPT-4
 */
export async function generateAIReasoning(betBuilder: any): Promise<string> {
  const prompt = `You are a professional football betting analyst. Analyze this multi-market bet builder opportunity:

Fixture: ${betBuilder.home_team} vs ${betBuilder.away_team}
League: ${betBuilder.league}

High Confidence Markets:
${betBuilder.high_confidence_markets.map((m: any) => 
  `- ${m.market_name}: ${m.confidence}% confidence`
).join('\n')}

Combined Confidence: ${betBuilder.combined_confidence}%
Combined Odds: ${betBuilder.estimated_combined_odds}x

Provide a concise 2-3 sentence analysis explaining WHY these markets converge with high confidence. Consider:
- Team form and playing styles
- Historical head-to-head data
- Tactical factors
- Any relevant context (injuries, referee, weather)

Keep it professional, insightful, and under 150 words.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0].message.content || 'Analysis unavailable';
  } catch (error) {
    console.error('Error generating AI reasoning:', error);
    return 'AI analysis temporarily unavailable';
  }
}
```

### 3. Cron Job Setup

**File:** `apps/backend/src/cron/betBuilderCron.ts`

```typescript
import cron from 'node-cron';
import { importBetBuilders } from '../services/betBuilderImporter.js';

/**
 * Schedule daily bet builder import
 * Runs at 6:30 AM UTC (after LM System generates predictions at 6:00 AM)
 */
export function scheduleBetBuilderImport(): void {
  cron.schedule('30 6 * * *', async () => {
    console.log('🧠 Running daily bet builder import...');
    try {
      await importBetBuilders();
      console.log('✅ Bet builder import completed successfully');
    } catch (error) {
      console.error('❌ Bet builder import failed:', error);
    }
  });

  console.log('✅ Bet builder cron job scheduled (6:30 AM UTC daily)');
}
```

---

## 🔧 Configuration

### LM System Environment Variables

Add to `.env` in LM System:

```bash
# Bet Builder Configuration
BET_BUILDER_MIN_CONFIDENCE=75
BET_BUILDER_MIN_MARKETS=3
BET_BUILDER_MAX_DAILY=5

# Output path
BET_BUILDER_OUTPUT_PATH=shared/ml_outputs/bet_builders.json
```

### Oracle Backend Environment Variables

Add to `.env` in Oracle:

```bash
# Bet Builder Import
BET_BUILDER_IMPORT_PATH=shared/ml_outputs/bet_builders.json
BET_BUILDER_CRON_SCHEDULE=30 6 * * *

# OpenAI for AI Reasoning
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-4
```

---

## 📅 Daily Workflow

### 6:00 AM UTC - LM System
1. Fetch today's fixtures from API-Football
2. Generate predictions for all 4 markets
3. Run bet builder detection algorithm
4. Save `bet_builders.json` to shared folder

### 6:30 AM UTC - Oracle Backend
1. Cron job triggers bet builder import
2. Read `bet_builders.json` from shared folder
3. Generate AI reasoning via GPT-4
4. Save to MongoDB (BetBuilder collection)
5. Expose via API endpoints

### All Day - Oracle Frontend
1. Users visit homepage or history page
2. Frontend fetches from `/api/bet-builders/today`
3. Display with BetBuilderCard component
4. Users can share, export, subscribe to notifications

---

## 🧪 Testing

### 1. Test LM System Output

```bash
# In LM System repo
cd ml_training
python bet_builder_detector.py

# Check output
cat ../shared/ml_outputs/bet_builders.json
```

### 2. Test Oracle Import

```bash
# In Oracle repo
cd apps/backend
npm run import:bet-builders

# Or trigger via API
curl -X POST http://localhost:3001/api/admin/import-bet-builders
```

### 3. Test Frontend Display

```bash
# Visit in browser
http://localhost:5173

# Check API
curl http://localhost:3001/api/bet-builders/today
```

---

## 📊 Monitoring

### LM System Logs
```
✅ Analyzed 45 fixtures
✅ Found 5 bet builders with 3+ markets @ 75%+ confidence
✅ Saved to shared/ml_outputs/bet_builders.json
```

### Oracle Backend Logs
```
📥 Importing 5 bet builders...
✅ Imported bet builder: Arsenal vs Chelsea
✅ Imported bet builder: Man City vs Liverpool
✅ Bet builder import complete
```

### Oracle Frontend
- Check `/api/bet-builders/today` returns data
- Verify BetBuilderCard displays correctly
- Test social sharing functionality
- Confirm email notifications work

---

## 🚀 Deployment Checklist

- [ ] LM System generates `bet_builders.json` daily
- [ ] Shared folder accessible to both systems
- [ ] Oracle cron job scheduled (6:30 AM UTC)
- [ ] OpenAI API key configured
- [ ] MongoDB connection working
- [ ] Frontend displays bet builders
- [ ] Email notifications configured
- [ ] Social sharing tested
- [ ] CSV export working

---

## 🔗 Related Documentation

- [BET_BUILDER_IMPLEMENTATION.md](./BET_BUILDER_IMPLEMENTATION.md) - Full Phase 1-3 implementation
- [ORACLE_LM_INTEGRATION.md](./ORACLE_LM_INTEGRATION.md) - General LM System integration
- [API_KEYS_REFERENCE.md](./API_KEYS_REFERENCE.md) - API key configuration

---

**Status:** ✅ Ready for LM System implementation and Oracle integration testing
