# ML Inputs Directory

This directory contains fixture data exported from the backend for ML processing.

## Files

### `fixtures_today.json`
**Purpose:** Today's fixtures for ML prediction generation  
**Updated:** Daily at 6:00 AM UTC  
**Format:**
```json
[
  {
    "fixture_id": 12345,
    "home_team": "Arsenal",
    "away_team": "Chelsea",
    "league": "Premier League",
    "kickoff": "2025-11-29T15:00:00Z",
    "venue": "Emirates Stadium",
    "home_form": ["W", "W", "D", "W", "L"],
    "away_form": ["W", "L", "W", "W", "D"],
    "h2h": [...],
    "home_stats": {
      "goals_scored_avg": 2.1,
      "goals_conceded_avg": 0.8,
      "corners_avg": 6.5,
      "cards_avg": 2.3
    },
    "away_stats": {
      "goals_scored_avg": 1.8,
      "goals_conceded_avg": 1.2,
      "corners_avg": 5.2,
      "cards_avg": 2.8
    }
  }
]
```

### `fixtures_range.json`
**Purpose:** Fixtures for a specific date range (used for backtesting)  
**Updated:** On-demand  

## Workflow

1. **Backend exports fixtures** → `fixtures_today.json`
2. **ML scripts read fixtures** → Generate predictions
3. **ML outputs written** → `shared/ml_outputs/`
4. **Frontend reads outputs** → Display to users

## ML Scripts That Read This Data

Located in `football-betting-ai-system` repo:
- `footy_oracle_v2/generate_ml_outputs_v26_final.py` - Generates predictions for 4 markets
- `footy_oracle_v2/generate_golden_and_value_bets.py` - Selects Golden & Value bets
- `footy_oracle_v2/generate_bet_builders.py` - Finds multi-market opportunities

## The 4 Markets

ML generates predictions for:
1. **BTTS** (Both Teams To Score)
2. **Over 2.5 Goals**
3. **Over 9.5 Corners**
4. **Over 3.5 Cards**

All markets average ~2.0 odds for balanced predictions.
