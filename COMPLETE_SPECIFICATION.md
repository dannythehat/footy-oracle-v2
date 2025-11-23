# THE FOOTY ORACLE - COMPLETE SPECIFICATION
## Single Source of Truth - Every Detail Documented

**Last Updated:** Nov 23, 2025  
**Purpose:** Crystal clear specification so ANYONE can build/fix this site perfectly

---

## 🎯 WHAT IS THIS SITE?

**The Footy Oracle** is an AI-powered sports betting platform powered by Language Models (LMs) trained on **300,000+ historical fixtures** from the past 4 years across all major leagues worldwide. The system identifies value bets while mitigating odds bias.

**Core Features:**
- **Golden Bets** - Highest probability predictions across 4 markets with GPT-5.0 AI reasoning
- **Value Bets** - Bookmaker odds vs. LM probability tracking (not P&L tracked)
- **Fixture Analysis** - Predictions across 4 specific betting markets
- **P&L Tracking** - Daily, monthly, yearly performance for Golden Bets only
- **Daily Refresh** - New predictions every morning with AI explanations

**Target Users:** Sports bettors looking for data-driven, value-focused betting insights  
**Revenue Model:** Premium subscriptions for unlimited access

---

## 🎨 DESIGN SYSTEM

### Colors - BLACK & NEON PURPLE THEME

```css
/* Primary Colors */
Background:     Black (#000000, #0A0A0A)
Neon Purple:    #A855F7 (primary accent)
Electric Purple: #9333EA (secondary accent)
Light Purple:   #C084FC (highlights)

/* Text */
Text Primary:   White (#ffffff)
Text Secondary: Gray-400 (#9ca3af)

/* Accents */
Gold Star:      #fbbf24 (Golden Bets icon)
Success:        Green-500 (#10b981)
Error:          Red-400 (#f87171)
```

**Visual Identity:** Modern, high-tech aesthetic with black background and neon purple accents throughout the interface.

### Typography
```
Font Family: Inter, system-ui, sans-serif
Headings:    Bold, 2xl-4xl
Body:        Regular, base
```

### Layout
```
Max Width:  5xl (1024px)
Padding:    px-4 (mobile), centered
Spacing:    mb-8 between sections
```

### Components Style
- **Cards:** Black background with neon purple borders, rounded corners
- **Buttons:** Neon purple solid colors, hover states with lighter purple
- **Loading:** Gray text with pulse animation
- **Errors:** Red text, centered
- **Golden Bet Cards:** Gold star icon with neon purple accents

---

## 🤖 MACHINE LEARNING SYSTEM

### Training Data
- **Total Fixtures:** 300,000+
- **Time Period:** Past 4 years (2021-2025)
- **Coverage:** All major leagues globally
- **League Bias Training:** Models trained with league-specific patterns (playing styles, referee tendencies, tactical approaches)

### The 4 Core Betting Markets

**Why These 4 Markets?**
All markets average around **2.0 odds** (50% implied probability), ensuring Golden Bets aren't weighted toward favorites.

| Market | Description | Avg Odds | Selection Reason |
|--------|-------------|----------|------------------|
| **BTTS** | Both Teams To Score | ~2.0 | Popular, balanced probability |
| **Over 2.5 Goals** | Total goals > 2.5 | ~2.0 | High liquidity, clear outcome |
| **Over 9.5 Corners** | Total corners > 9.5 | ~2.0 | Less mainstream, value opportunities |
| **Over 3.5 Cards** | Total cards > 3.5 | ~2.0 | Referee-dependent, pattern-based |

**Key Philosophy:** Our LMs find **value**, not just favorites. Example: Man United vs. Sutton - instead of predicting the obvious Man United win, our models identify which of the 4 markets offers genuine value while accounting for odds bias.

### Golden Bets System

**What is a Golden Bet?**
- The **highest probability prediction** across the 4 markets for each fixture
- Every fixture gets a Golden Bet designation
- **Top 3** Golden Bets featured on homepage
- **GPT-5.0 generates AI reasoning** for every Golden Bet

**Golden Bet Features:**
- Win Rate Target: 70-85%
- P&L Tracking: Daily, monthly, yearly
- AI Explanations: Detailed reasoning for each bet
- Homepage Display: Top 3 prominently featured

**Future Enhancement:** League-specific Golden Bets (e.g., "Best Premier League Golden Bet" or "Top La Liga Golden Bet")

### Value Bets System

**What is a Value Bet?**
- LM probability exceeds bookmaker's implied probability
- Represents market mispricing opportunities
- **Stored and logged but NOT P&L tracked**
- Purpose: Validate model accuracy and identify market inefficiencies

**Value Calculation:**
```
Value = (LM Probability × Odds) - 1

Example:
- LM Probability: 60% (0.60)
- Bookmaker Odds: 2.10
- Value = (0.60 × 2.10) - 1 = 0.26 (26% positive EV)
```

**Key Distinction:** Golden Bets tracked for P&L, Value Bets tracked for model validation.

### Daily Workflow

**Morning Refresh Process:**

1. **6:00 AM UTC** - Fixture Import
   - New daily fixtures loaded
   - Fixture metadata updated

2. **6:30 AM UTC** - LM Prediction Generation
   - Models analyze each fixture across 4 markets
   - Probability scores calculated
   - League bias factors applied

3. **7:00 AM UTC** - Golden Bet Selection
   - Highest probability market identified per fixture
   - Top 3 overall Golden Bets selected
   - AI reasoning generated via GPT-5.0

4. **7:15 AM UTC** - Value Bet Identification
   - Bookmaker odds fetched
   - Value calculations performed
   - Positive EV opportunities flagged

5. **7:30 AM UTC** - Frontend Update
   - New predictions pushed to frontend
   - Homepage updated with Top 3 Golden Bets
   - User notifications sent (premium users)

---

## 🏗️ ARCHITECTURE

### Tech Stack
```
Frontend: React 18 + TypeScript + Vite + TailwindCSS
Backend:  Node.js + Express (simple REST API)
Data:     JSON files (ML outputs)
Deploy:   Vercel (frontend) + Railway/Render (backend)
ML:       Language Models trained on 300k fixtures
AI:       GPT-5.0 for Golden Bet reasoning
```

### Folder Structure
```
the-footy-oracle/
├── apps/
│   ├── frontend/          # React app
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── types/
│   │   ├── .env           # MUST EXIST
│   │   └── package.json
│   │
│   └── backend/           # Express API
│       ├── api/           # Route handlers
│       ├── storage/       # Read ML files
│       ├── .env           # Backend config
│       └── server.js      # Main entry
│
└── shared/
    └── ml_outputs/        # ML prediction data (JSON)
        ├── predictions.json
        ├── golden_bets.json
        └── value_bets.json
```

---

## 📊 DATA STRUCTURE

### Golden Bets JSON (`shared/ml_outputs/golden_bets.json`)
```json
{
  "golden_bets": [
    {
      "bet_id": "GB001",
      "fixture_id": "FIX001",
      "home_team": "Man City",
      "away_team": "Arsenal",
      "league": "Premier League",
      "market": "Over 2.5 Goals",
      "selection": "Over 2.5",
      "odds": 2.10,
      "confidence": 85,
      "lm_probability": 0.85,
      "expected_value": 12.5,
      "reasoning": "Both teams averaging 3+ goals per game in last 5 matches. High-scoring fixture history.",
      "ai_explanation": "Generated by GPT-5.0 with detailed analysis"
    }
  ]
}
```

**Rules:**
- Every fixture has a Golden Bet (highest probability across 4 markets)
- **Top 3** Golden Bets displayed on homepage
- Confidence: 70-85%+
- Markets: BTTS, Over 2.5 Goals, Over 9.5 Corners, Over 3.5 Cards only
- Updated daily by ML pipeline
- AI reasoning via GPT-5.0 for each bet

### Fixtures JSON (`shared/ml_outputs/predictions.json`)
```json
{
  "fixtures": [
    {
      "fixture_id": "FIX001",
      "home_team": "Man City",
      "away_team": "Arsenal",
      "kickoff": "2025-11-24T15:00:00Z",
      "league": "Premier League",
      "predictions": {
        "btts": {
          "yes": 0.58,
          "no": 0.42
        },
        "over_2_5_goals": {
          "over": 0.72,
          "under": 0.28
        },
        "over_9_5_corners": {
          "over": 0.65,
          "under": 0.35
        },
        "over_3_5_cards": {
          "over": 0.48,
          "under": 0.52
        }
      },
      "golden_bet": {
        "market": "over_2_5_goals",
        "selection": "over",
        "probability": 0.72,
        "reasoning": "High-scoring teams, recent form suggests goals"
      }
    }
  ]
}
```

**Note:** Each fixture includes predictions for all 4 markets, with the Golden Bet being the highest probability market.

### Value Bets JSON (`shared/ml_outputs/value_bets.json`)
```json
{
  "value_bets": [
    {
      "bet_id": "VB001",
      "fixture_id": "FIX001",
      "home_team": "Man City",
      "away_team": "Arsenal",
      "league": "Premier League",
      "market": "Over 2.5 Goals",
      "selection": "Over 2.5",
      "bookmaker_odds": 1.85,
      "lm_probability": 0.72,
      "bookmaker_implied_probability": 0.54,
      "expected_value": 8.2,
      "value_percentage": 33.3,
      "kelly_stake": 5.5
    }
  ]
}
```

**Purpose:** Track bookmaker odds vs. LM probability for model validation. NOT tracked for P&L.

---

**END OF SPECIFICATION**

This document is the **single source of truth**. If something isn't documented here, it doesn't exist. If you need to change something, update this document first, then code.

**Key Points:**
- 300,000+ fixtures training data
- 4 specific markets only (BTTS, O2.5, O9.5 Corners, O3.5 Cards)
- Black & neon purple color scheme
- Golden Bets: P&L tracked (daily/monthly/yearly)
- Value Bets: Model validation only (not P&L)
- Daily refresh at 7:30 AM UTC
- GPT-5.0 AI reasoning for every Golden Bet
- Top 3 Golden Bets featured on homepage

**Questions? Issues? Refer to this document first.**
