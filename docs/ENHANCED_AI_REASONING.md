# 🧠 Enhanced AI Reasoning System

## Overview

The Enhanced AI Reasoning System integrates **weather conditions**, **detailed injury/suspension data**, and **tactical analysis** into AI-generated betting insights. This creates contextual, witty, and highly accurate reasoning that goes beyond basic statistics.

## Features

### 🌤️ Weather Integration
- Real-time and forecast weather data for match locations
- Temperature, wind, precipitation analysis
- Impact assessment on playing conditions
- Covers 50+ major football cities across Europe

### 🏥 Injury & Suspension Tracking
- Detailed player absence information
- Position-based impact analysis (Goalkeeper, Defender, Midfielder, Attacker)
- Severity classification (minor, moderate, major)
- Key player identification
- Team impact levels (low, medium, high)

### ⚔️ Tactical Analysis
- Formation tracking and analysis
- Playing style profiling (possession, tempo, pressing, build-up)
- Formation matchup analysis
- Tactical advantage prediction
- Key battle identification

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Enhanced Reasoning Flow                     │
└─────────────────────────────────────────────────────────────┘

1. Fixture Data
   ↓
2. Context Aggregation Service
   ├── Weather Service → OpenWeatherMap API
   ├── Injury Service → API-Football Injuries
   └── Tactical Service → API-Football Lineups
   ↓
3. Enhanced Match Context
   ↓
4. AI Service (OpenAI GPT-4o)
   ↓
5. Contextual Reasoning Output
```

## Services

### 1. Weather Service (`weatherService.ts`)

**Purpose:** Fetch and analyze weather conditions for matches

**Key Methods:**
- `getMatchWeather(city, matchDate)` - Get forecast for specific match
- `getCurrentWeather(city)` - Get current conditions
- `getWeatherImpact(weather)` - Generate impact summary
- `isSignificantWeather(weather)` - Check if weather affects play

**Supported Cities:** 50+ major football cities including:
- England: London, Manchester, Liverpool, Birmingham, Newcastle, etc.
- Spain: Madrid, Barcelona, Seville, Valencia, Bilbao, etc.
- Italy: Rome, Milan, Turin, Naples, Florence, etc.
- Germany: Berlin, Munich, Dortmund, Hamburg, Frankfurt, etc.
- France: Paris, Marseille, Lyon, Lille, Nice, etc.

**Weather Impact Factors:**
- Temperature < 5°C or > 30°C
- Wind speed > 25 km/h
- Rain > 2mm precipitation

### 2. Injury Service (`injuryService.ts`)

**Purpose:** Track player injuries and suspensions

**Key Methods:**
- `getTeamAbsences(teamId, season)` - Get all absences for a team
- `getAbsencesSummary(absences)` - Human-readable summary
- `getDetailedInjuryList(absences)` - Detailed list for AI context
- `compareTeamAbsences(home, away)` - Compare impact between teams

**Data Structure:**
```typescript
interface TeamAbsences {
  injuries: InjuryData[];
  suspensions: InjuryData[];
  totalOut: number;
  keyPlayersOut: string[];
  impactLevel: 'low' | 'medium' | 'high';
}
```

**Impact Calculation:**
- **High:** 3+ key players or 5+ total players out
- **Medium:** 1-2 key players or 3-4 total players out
- **Low:** Minimal absences

### 3. Tactical Service (`tacticalService.ts`)

**Purpose:** Analyze team formations and playing styles

**Key Methods:**
- `getTeamTacticalProfile(teamId, season)` - Get tactical profile
- `analyzeMatchup(homeTeamId, awayTeamId)` - Analyze tactical matchup
- `getTacticalSummary(profile)` - Summary for AI context

**Supported Formations:**
- 4-3-3 (Attacking, width-focused)
- 4-2-3-1 (Balanced, creative)
- 4-4-2 (Traditional, solid)
- 3-5-2 (Wing-back system)
- 3-4-3 (Aggressive, attacking)
- 5-3-2 (Defensive, counter-attacking)
- 4-1-4-1 (Defensive midfielder anchor)
- 4-3-1-2 (Diamond midfield)

**Playing Style Attributes:**
- **Possession:** high, medium, low
- **Tempo:** fast, medium, slow
- **Pressing:** high, medium, low
- **Build-up:** short, mixed, long

### 4. Context Aggregation Service (`contextAggregationService.ts`)

**Purpose:** Combine all context sources into unified data

**Key Methods:**
- `gatherFullContext(fixture, season)` - Fetch all context data
- `formatForAIPrompt(context)` - Format for AI consumption
- `getContextHighlights(context)` - Get key highlights
- `hasSignificantContext(context)` - Check if context is notable

**Output:**
```typescript
interface EnhancedMatchContext {
  fixture: FixtureContext;
  weather?: WeatherData;
  weatherImpact?: string;
  homeAbsences: TeamAbsences;
  awayAbsences: TeamAbsences;
  absencesComparison: string;
  homeTactical: TacticalProfile;
  awayTactical: TacticalProfile;
  tacticalMatchup: MatchupAnalysis;
  contextSummary: string;
}
```

### 5. Enhanced Reasoning Service (`enhancedReasoningService.ts`)

**Purpose:** Orchestrate context gathering and AI reasoning generation

**Key Methods:**
- `generateEnhancedReasoning(bet, fixture, stats)` - Generate full reasoning
- `generateBetTypeReasoning(betType, percentage, fixture, stats)` - Type-specific reasoning
- `generateBulkEnhancedReasoning(bets, fixtures, stats)` - Bulk processing
- `getContextPreview(fixture)` - Preview available context

## Setup

### 1. Install Dependencies

```bash
cd apps/backend
npm install axios openai
```

### 2. Configure Environment Variables

Add to `apps/backend/.env`:

```env
# Required
API_FOOTBALL_KEY=your_api_football_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Optional (enhances reasoning)
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

**Get API Keys:**
- **API-Football:** https://www.api-football.com/
- **OpenAI:** https://platform.openai.com/api-keys
- **OpenWeather:** https://openweathermap.org/api (Free tier: 1000 calls/day)

### 3. Update Existing Services

The enhanced services are **backward compatible**. They work with or without the new context data.

**Without Weather API:**
- System works normally
- AI reasoning uses statistical data only
- No weather context in prompts

**With Weather API:**
- Enhanced reasoning with weather context
- More accurate predictions for weather-sensitive markets
- Better user engagement

## Usage Examples

### Example 1: Generate Enhanced Reasoning for Golden Bet

```typescript
import { enhancedReasoningService } from './services/enhancedReasoningService';

const bet = {
  fixtureId: 12345,
  homeTeam: 'Arsenal',
  awayTeam: 'Chelsea',
  league: 'Premier League',
  market: 'Both Teams to Score',
  prediction: 'Yes',
  odds: 1.75,
  confidence: 78
};

const fixture = {
  fixtureId: 12345,
  homeTeam: { id: 42, name: 'Arsenal', city: 'London' },
  awayTeam: { id: 49, name: 'Chelsea' },
  league: 'Premier League',
  matchDate: new Date('2025-12-15T15:00:00Z'),
  venue: 'Emirates Stadium'
};

const stats = {
  homeForm: 'WWDWL',
  awayForm: 'LWWDW',
  homeGoalsAvg: { scored: 2.1, conceded: 1.2 },
  awayGoalsAvg: { scored: 1.8, conceded: 1.4 }
};

const result = await enhancedReasoningService.generateEnhancedReasoning(
  bet,
  fixture,
  stats
);

console.log(result.reasoning);
// "Arsenal's high press (4-3-3) vs Chelsea's short build-up? 
// Turnovers guaranteed. Add in heavy rain (slippery conditions) 
// and both teams averaging 2+ goals/game. Chelsea missing their 
// top defender too. This screams goals. 🔥"

console.log(result.contextHighlights);
// ["heavy rain expected", "Chelsea missing Thiago Silva", "Tactical edge: home"]
```

### Example 2: Get Context Preview

```typescript
const preview = await enhancedReasoningService.getContextPreview(fixture);

console.log(preview);
// {
//   hasWeather: true,
//   hasInjuries: true,
//   hasTactical: true,
//   summary: "⛅ Weather: heavy rain expected (12°C, 35km/h wind)\n
//             🏥 Absences: Away team heavily depleted (3 out) vs full-strength home side\n
//             ⚔️ Tactical: home team has advantage",
//   highlights: ["heavy rain expected", "Chelsea missing 3 key players", "Tactical edge: home"]
// }
```

### Example 3: Bulk Processing

```typescript
const bets = [bet1, bet2, bet3];
const fixtures = new Map([
  [12345, fixture1],
  [12346, fixture2],
  [12347, fixture3]
]);
const stats = new Map([
  [12345, stats1],
  [12346, stats2],
  [12347, stats3]
]);

const results = await enhancedReasoningService.generateBulkEnhancedReasoning(
  bets,
  fixtures,
  stats
);

// Process all bets in parallel
results.forEach((result, fixtureId) => {
  console.log(`Fixture ${fixtureId}: ${result.reasoning}`);
});
```

## AI Prompt Examples

### With Full Context

```
Match: Arsenal vs Chelsea
League: Premier League
Market: Both Teams to Score
Prediction: Yes
Odds: 1.75
Confidence: 78% (HOT 🔥)

FORM:
Home: WWDWL
Away: LWWDW

GOALS AVERAGE:
Home: 2.1 scored, 1.2 conceded
Away: 1.8 scored, 1.4 conceded

🌤️ WEATHER:
Light rain (12°C)
Wind: 35km/h NW
Rain: 3mm expected
Impact: light rain, breezy conditions

🏥 TEAM NEWS:
Home: Full squad available
Away: 3 out (Thiago Silva, Reece James)

⚔️ TACTICS:
Home: 4-3-3 (high possession, high press)
Away: 4-2-3-1 (medium possession, medium press)
```

### AI Output Example

```
Arsenal's high press (4-3-3) is perfect for exploiting Chelsea's 
short build-up, especially with their top defender Silva out. 
Both teams averaging 2+ goals/game, and light rain means slippery 
conditions = more mistakes. Their last 5 H2H? All had BTS. 
This one's a banker. 🔥
```

## Performance Considerations

### Caching Strategy

All services implement intelligent caching:

- **Weather Service:** 6-hour cache (weather doesn't change rapidly)
- **Injury Service:** 6-hour cache (updated twice daily)
- **Tactical Service:** 24-hour cache (formations change slowly)

### API Rate Limits

**OpenWeather Free Tier:**
- 1,000 calls/day
- 60 calls/minute
- Sufficient for ~100 matches/day

**API-Football:**
- Varies by plan
- Injuries endpoint: 1 call per team
- Lineups endpoint: 1 call per team

**Optimization:**
- Batch requests where possible
- Cache aggressively
- Only fetch for significant matches

### Parallel Processing

Context aggregation uses `Promise.all()` for parallel fetching:

```typescript
const [weather, homeAbsences, awayAbsences, homeTactical, awayTactical] = 
  await Promise.all([
    weatherService.getMatchWeather(city, matchDate),
    injuryService.getTeamAbsences(homeTeamId, season),
    injuryService.getTeamAbsences(awayTeamId, season),
    tacticalService.getTeamTacticalProfile(homeTeamId, season),
    tacticalService.getTeamTacticalProfile(awayTeamId, season)
  ]);
```

**Result:** ~200ms total vs ~1000ms sequential

## Testing

### Manual Testing

```bash
# Test weather service
curl "http://localhost:3001/api/test/weather?city=London"

# Test injury service
curl "http://localhost:3001/api/test/injuries?teamId=42"

# Test tactical service
curl "http://localhost:3001/api/test/tactical?teamId=42"

# Test full context
curl "http://localhost:3001/api/test/context?fixtureId=12345"
```

### Unit Tests

```typescript
// Test weather impact
const weather = {
  temp: 3,
  windSpeed: 45,
  rain: true,
  precipitation: 8
};
const impact = weatherService.getWeatherImpact(weather);
expect(impact).toContain('freezing conditions');
expect(impact).toContain('heavy rain');
expect(impact).toContain('strong winds');

// Test injury impact
const absences = {
  injuries: [/* ... */],
  suspensions: [],
  totalOut: 5,
  keyPlayersOut: ['Salah', 'Van Dijk', 'Alexander-Arnold'],
  impactLevel: 'high'
};
expect(absences.impactLevel).toBe('high');
```

## Troubleshooting

### Weather Data Not Showing

**Check:**
1. `OPENWEATHER_API_KEY` is set in `.env`
2. API key is valid (test at openweathermap.org)
3. City name is in supported list
4. Match is within 5 days (forecast limit)

**Solution:**
```bash
# Test API key
curl "https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_KEY"
```

### Injury Data Missing

**Check:**
1. `API_FOOTBALL_KEY` is set
2. Team ID is correct
3. Season parameter is current year
4. API quota not exceeded

**Solution:**
```bash
# Check API quota
curl -H "x-rapidapi-key: YOUR_KEY" \
  "https://v3.football.api-sports.io/status"
```

### Tactical Data Incomplete

**Check:**
1. Team has played recent matches
2. Lineup data is available
3. Cache is not stale

**Solution:**
```typescript
// Clear cache and retry
tacticalService.clearCache();
const profile = await tacticalService.getTeamTacticalProfile(teamId);
```

## Future Enhancements

### Planned Features

1. **Historical Weather Correlation**
   - Track how teams perform in different conditions
   - "Arsenal averages 0.5 fewer goals in rain"

2. **Injury Impact Modeling**
   - Statistical impact of specific player absences
   - "Liverpool scores 0.8 fewer goals without Salah"

3. **Tactical Trend Analysis**
   - Formation change patterns
   - Manager tactical preferences

4. **News Integration**
   - Recent manager comments
   - Transfer news impact
   - Team morale indicators

5. **Advanced Metrics**
   - xG (Expected Goals) integration
   - Pressing intensity metrics
   - Possession quality analysis

## Contributing

When adding new context sources:

1. Create service in `apps/backend/src/services/`
2. Implement caching strategy
3. Add to `contextAggregationService.ts`
4. Update AI prompts in `aiService.ts` and `openaiService.ts`
5. Add tests
6. Update documentation

## License

MIT License - Part of The Footy Oracle v2 project
