# Fixtures Service - AI-Powered Football Predictions

## Overview
The Fixtures Service uses OpenAI's GPT-4 to analyze football fixtures and generate intelligent predictions, Golden Bets, and Value Bets.

## Features
- 🤖 **AI-Powered Analysis**: Uses GPT-4 for intelligent match predictions
- 🏆 **Golden Bets**: High-confidence bets with favorable odds (75%+ confidence, 1.5+ odds)
- 💎 **Value Bets**: Identifies betting opportunities with 10%+ edge
- 📊 **Bulk Processing**: Analyze multiple fixtures efficiently
- 🎯 **Multiple Markets**: Predictions for winner, score, Over/Under, BTTS, and more

## API Endpoints

### 1. Analyze Single Fixture
```bash
POST /api/fixtures/analyze
Content-Type: application/json

{
  "id": "12345",
  "homeTeam": "Manchester United",
  "awayTeam": "Liverpool",
  "league": "Premier League",
  "date": "2025-11-24T15:00:00Z",
  "venue": "Old Trafford",
  "homeForm": ["W", "W", "D", "L", "W"],
  "awayForm": ["W", "W", "W", "D", "W"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fixtureId": "12345",
    "homeTeam": "Manchester United",
    "awayTeam": "Liverpool",
    "prediction": {
      "winner": "away",
      "confidence": 65,
      "scorePrediction": "1-2"
    },
    "markets": [
      {
        "market": "Over 2.5 Goals",
        "prediction": "Yes",
        "odds": 1.85,
        "confidence": 70
      }
    ],
    "reasoning": "Liverpool's strong form...",
    "goldenBet": {
      "market": "Liverpool to Win",
      "prediction": "Yes",
      "odds": 2.10,
      "confidence": 75,
      "reasoning": "..."
    }
  }
}
```

### 2. Analyze Multiple Fixtures
```bash
POST /api/fixtures/analyze-bulk
Content-Type: application/json

{
  "fixtures": [
    {
      "id": "12345",
      "homeTeam": "Manchester United",
      "awayTeam": "Liverpool",
      "league": "Premier League",
      "date": "2025-11-24T15:00:00Z"
    },
    {
      "id": "12346",
      "homeTeam": "Arsenal",
      "awayTeam": "Chelsea",
      "league": "Premier League",
      "date": "2025-11-24T17:30:00Z"
    }
  ]
}
```

### 3. Find Golden Bets
```bash
POST /api/fixtures/golden-bets
Content-Type: application/json

{
  "fixtures": [...]
}
```

Returns only fixtures with Golden Bet opportunities (75%+ confidence, 1.5+ odds).

### 4. Find Value Bets
```bash
POST /api/fixtures/value-bets
Content-Type: application/json

{
  "fixtures": [...]
}
```

Returns bets with 10%+ edge over bookmaker odds.

### 5. Health Check
```bash
GET /api/fixtures/health
```

**Response:**
```json
{
  "success": true,
  "service": "fixtures",
  "openai": true,
  "timestamp": "2025-11-23T16:00:00.000Z"
}
```

## Configuration

### Environment Variables
```bash
# Required
OPENAI_API_KEY=sk-proj-your-key-here

# Optional
OPENAI_MODEL=gpt-4  # Default: gpt-4
```

### Rate Limiting
- Bulk analysis processes 5 fixtures at a time
- 1-second delay between batches
- Prevents OpenAI rate limit issues

## Usage Examples

### Node.js/TypeScript
```typescript
import axios from 'axios';

const analyzeFixture = async () => {
  const response = await axios.post('http://localhost:3001/api/fixtures/analyze', {
    id: '12345',
    homeTeam: 'Manchester United',
    awayTeam: 'Liverpool',
    league: 'Premier League',
    date: '2025-11-24T15:00:00Z'
  });
  
  console.log(response.data);
};
```

### cURL
```bash
curl -X POST http://localhost:3001/api/fixtures/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "id": "12345",
    "homeTeam": "Manchester United",
    "awayTeam": "Liverpool",
    "league": "Premier League",
    "date": "2025-11-24T15:00:00Z"
  }'
```

## Service Architecture

### fixturesService.ts
Core service handling AI analysis:
- `analyzeFixture()`: Single fixture analysis
- `analyzeBulkFixtures()`: Batch processing
- `findGoldenBets()`: Filter high-confidence bets
- `findValueBets()`: Calculate betting edge

### routes/fixtures.ts
Express routes exposing the service via REST API.

## Error Handling
- Invalid input: 400 Bad Request
- OpenAI errors: 500 Internal Server Error with details
- Missing API key: Service fails gracefully with error message

## Performance
- Single fixture: ~2-3 seconds
- Bulk (10 fixtures): ~15-20 seconds
- Optimized for GPT-4 token usage

## Future Enhancements
- [ ] Cache predictions to reduce API calls
- [ ] Add historical accuracy tracking
- [ ] Implement confidence calibration
- [ ] Support for more betting markets
- [ ] Real-time odds integration
