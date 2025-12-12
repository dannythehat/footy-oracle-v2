# Quick Start: Enhanced AI Reasoning

**5-minute guide to using contextual AI reasoning in your code**

---

## 🚀 Setup (One-time)

### 1. Add API Key

Add to `apps/backend/.env`:

```env
OPENWEATHER_API_KEY=your_key_here
```

Get free key: https://openweathermap.org/api (1,000 calls/day)

### 2. Install Dependencies

```bash
cd apps/backend
npm install
```

Done! The services are ready to use.

---

## 💡 Usage

### Option 1: Simple (Recommended)

Use the all-in-one service:

```typescript
import { enhancedReasoningService } from './services/enhancedReasoningService';

const result = await enhancedReasoningService.generateEnhancedReasoning(
  bet,      // { fixtureId, homeTeam, awayTeam, market, prediction, odds, confidence }
  fixture,  // { fixtureId, homeTeam: { id, name, city }, awayTeam: { id, name }, matchDate }
  stats     // { homeForm, awayForm, homeGoalsAvg, awayGoalsAvg, ... }
);

// Use the result
console.log(result.reasoning);           // "Arsenal's high press vs Chelsea's..."
console.log(result.contextHighlights);   // ["heavy rain", "Chelsea missing Silva"]
console.log(result.hasSignificantContext); // true
```

### Option 2: Manual Control

For more control over the process:

```typescript
import { contextAggregationService } from './services/contextAggregationService';
import { generateAIReasoning } from './services/aiService';

// Step 1: Gather context
const context = await contextAggregationService.gatherFullContext(fixture);

// Step 2: Generate reasoning with context
const reasoning = await generateAIReasoning({
  homeTeam: bet.homeTeam,
  awayTeam: bet.awayTeam,
  league: bet.league,
  market: bet.market,
  prediction: bet.prediction,
  odds: bet.odds,
  confidence: bet.confidence,
  
  // Add context
  weather: context.weather,
  weatherImpact: context.weatherImpact,
  homeAbsences: context.homeAbsences,
  awayAbsences: context.awayAbsences,
  homeTactical: context.homeTactical,
  awayTactical: context.awayTactical,
  
  // Add stats
  homeForm: stats.homeForm,
  awayForm: stats.awayForm,
  homeGoalsAvg: stats.homeGoalsAvg,
  awayGoalsAvg: stats.awayGoalsAvg
});
```

---

## 📋 Data Structures

### Bet Object

```typescript
{
  fixtureId: 12345,
  homeTeam: 'Arsenal',
  awayTeam: 'Chelsea',
  league: 'Premier League',
  market: 'Both Teams to Score',
  prediction: 'Yes',
  odds: 1.75,
  confidence: 78
}
```

### Fixture Object

```typescript
{
  fixtureId: 12345,
  homeTeam: {
    id: 42,
    name: 'Arsenal',
    city: 'London'  // Optional but recommended
  },
  awayTeam: {
    id: 49,
    name: 'Chelsea'
  },
  league: 'Premier League',
  matchDate: new Date('2025-12-15T15:00:00Z'),
  venue: 'Emirates Stadium'  // Optional
}
```

### Stats Object

```typescript
{
  homeForm: 'WWDWL',
  awayForm: 'LWWDW',
  homeGoalsAvg: { scored: 2.1, conceded: 1.2 },
  awayGoalsAvg: { scored: 1.8, conceded: 1.4 },
  homeCardsAvg: 2.3,
  awayCardsAvg: 2.1,
  homeCornersAvg: 5.2,
  awayCornersAvg: 4.8,
  h2h: {
    stats: {
      totalMatches: 10,
      over25Rate: 0.7,
      btsRate: 0.6,
      avgGoals: 2.8,
      avgCorners: 10.2,
      avgCards: 4.5
    }
  }
}
```

---

## 🎯 Common Use Cases

### Use Case 1: Golden Bets

```typescript
// In your Golden Bets generation
const goldenBets = await getTopPredictions();

for (const bet of goldenBets) {
  const fixture = await getFixtureData(bet.fixtureId);
  const stats = await getStatisticalContext(bet.fixtureId);
  
  const result = await enhancedReasoningService.generateEnhancedReasoning(
    bet,
    fixture,
    stats
  );
  
  bet.reasoning = result.reasoning;
  bet.contextHighlights = result.contextHighlights;
}
```

### Use Case 2: Bet Builder

```typescript
// In your Bet Builder generation
const betBuilder = await getBetBuilderOfTheDay();

const fixture = {
  fixtureId: betBuilder.fixtureId,
  homeTeam: { id: betBuilder.homeTeamId, name: betBuilder.homeTeam },
  awayTeam: { id: betBuilder.awayTeamId, name: betBuilder.awayTeam },
  league: betBuilder.league,
  matchDate: betBuilder.matchDate
};

const result = await enhancedReasoningService.generateEnhancedReasoning(
  {
    fixtureId: betBuilder.fixtureId,
    homeTeam: betBuilder.homeTeam,
    awayTeam: betBuilder.awayTeam,
    league: betBuilder.league,
    market: 'Bet Builder',
    prediction: betBuilder.markets.join(' + '),
    odds: betBuilder.combinedOdds,
    confidence: betBuilder.confidence
  },
  fixture,
  betBuilder.stats
);

betBuilder.reasoning = result.reasoning;
```

### Use Case 3: Preview Context

```typescript
// Check what context is available before generating
const preview = await enhancedReasoningService.getContextPreview(fixture);

console.log(preview);
// {
//   hasWeather: true,
//   hasInjuries: true,
//   hasTactical: true,
//   summary: "⛅ Weather: heavy rain...",
//   highlights: ["heavy rain", "Chelsea missing Silva"]
// }

if (preview.hasWeather || preview.hasInjuries) {
  // Generate enhanced reasoning
} else {
  // Use basic reasoning
}
```

---

## ⚡ Performance Tips

### 1. Batch Processing

```typescript
// Process multiple bets in parallel
const results = await enhancedReasoningService.generateBulkEnhancedReasoning(
  bets,
  fixturesMap,
  statsMap
);
```

### 2. Cache Context

```typescript
// Reuse context for multiple bets on same fixture
const context = await contextAggregationService.gatherFullContext(fixture);

// Use for multiple markets
const btsReasoning = await generateAIReasoning({ ...bet1, ...context });
const over25Reasoning = await generateAIReasoning({ ...bet2, ...context });
```

### 3. Check Before Fetching

```typescript
// Only fetch context if needed
const preview = await enhancedReasoningService.getContextPreview(fixture);

if (preview.hasWeather || preview.hasInjuries || preview.hasTactical) {
  // Full enhanced reasoning
  const result = await enhancedReasoningService.generateEnhancedReasoning(...);
} else {
  // Basic reasoning (faster)
  const reasoning = await generateBasicReasoning(...);
}
```

---

## 🐛 Troubleshooting

### No Weather Data

**Problem:** Weather is always `undefined`

**Solutions:**
1. Check `OPENWEATHER_API_KEY` is set
2. Verify city is in supported list (see `weatherService.ts`)
3. Check match is within 5 days (forecast limit)
4. Test API key: `curl "https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_KEY"`

### No Injury Data

**Problem:** Injuries array is empty

**Solutions:**
1. Check `API_FOOTBALL_KEY` is set
2. Verify team has recent matches
3. Check API quota: `curl -H "x-rapidapi-key: YOUR_KEY" "https://v3.football.api-sports.io/status"`
4. Clear cache: `injuryService.clearCache()`

### Slow Performance

**Problem:** Context gathering takes >1 second

**Solutions:**
1. Use bulk processing for multiple bets
2. Cache context for same fixture
3. Check network latency
4. Verify caching is working (should be fast on 2nd call)

---

## 📊 What You Get

### Without Context (Basic)
```
"Both teams averaging 2+ goals/game. Their H2H shows 70% BTS rate. 
Solid value at these odds. 🟡"
```

### With Context (Enhanced)
```
"Arsenal's high press (4-3-3) vs Chelsea's short build-up? Turnovers 
guaranteed. Add in heavy rain (slippery conditions) and both teams 
averaging 2+ goals/game. Chelsea missing Thiago Silva too. This 
screams goals. 🔥"
```

**Additions:**
- ✅ Weather: "heavy rain (slippery conditions)"
- ✅ Tactics: "high press (4-3-3) vs short build-up"
- ✅ Injuries: "Chelsea missing Thiago Silva"
- ✅ Personality: "This screams goals"

---

## 🔗 Resources

- **Full Documentation:** [`docs/ENHANCED_AI_REASONING.md`](ENHANCED_AI_REASONING.md)
- **Implementation Summary:** [`IMPLEMENTATION_SUMMARY_ISSUE_150.md`](../IMPLEMENTATION_SUMMARY_ISSUE_150.md)
- **Issue:** [#150](https://github.com/dannythehat/footy-oracle-v2/issues/150)

---

## ✅ Checklist

Before using in production:

- [ ] `OPENWEATHER_API_KEY` added to `.env`
- [ ] `API_FOOTBALL_KEY` verified working
- [ ] `OPENAI_API_KEY` verified working
- [ ] Dependencies installed (`npm install`)
- [ ] Test with sample fixture
- [ ] Monitor API usage
- [ ] Check performance (<500ms per bet)

---

**Ready to go!** 🚀

Start with Option 1 (Simple) and you'll have enhanced reasoning in minutes.
