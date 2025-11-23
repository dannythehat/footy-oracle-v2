# 🤖 ML Outputs Directory

This directory contains machine learning model predictions and outputs.

## 📁 Files

### `predictions.json`
Daily ML predictions for football fixtures.

**Format:**
```json
[
  {
    "fixtureId": 1001,
    "homeTeam": "Manchester City",
    "awayTeam": "Liverpool",
    "league": "Premier League",
    "market": "Match Winner",
    "prediction": "Home Win",
    "confidence": 85
  }
]
```

**Fields:**
- `fixtureId` - Unique fixture identifier from API-Football
- `homeTeam` - Home team name
- `awayTeam` - Away team name
- `league` - League/competition name
- `market` - Betting market (Match Winner, BTTS, Over/Under 2.5)
- `prediction` - Predicted outcome
- `confidence` - Confidence score (0-100)

## 🔄 Update Schedule

Predictions are updated daily at 6 AM via the backend cron job.

## 📊 ML Model

The predictions are generated from a model trained on 300k+ historical fixtures with features including:
- Team form and statistics
- Head-to-head records
- Home/away performance
- League standings
- Player availability
- Historical odds movements

## 🎯 Golden Bets Selection

Golden Bets are selected from predictions with:
- Confidence ≥ 80%
- Top 3 highest confidence scores
- Valid odds from bookmakers
- AI reasoning generated via GPT-4
