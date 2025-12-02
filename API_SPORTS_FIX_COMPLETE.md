# API-Sports Complete Fix Documentation

## 🎯 Problem Summary

The API-Sports endpoints were returning empty data because of **incorrect parameter names** and **wrong endpoint usage**. This has been completely fixed.

## ✅ What Was Fixed

### 1. **Fixture Statistics** ❌ → ✅
- **WRONG**: `fixture_id` parameter
- **CORRECT**: `fixture` parameter
- **Endpoint**: `/fixtures/statistics?fixture={fixtureId}`

### 2. **Fixture Events** ❌ → ✅
- **WRONG**: `fixture_id` parameter
- **CORRECT**: `fixture` parameter
- **Endpoint**: `/fixtures/events?fixture={fixtureId}`

### 3. **Head-to-Head** ❌ → ✅
- **WRONG**: `team1` and `team2` parameters
- **CORRECT**: `h2h` parameter with format `homeId-awayId`
- **Endpoint**: `/fixtures/headtohead?h2h={homeId}-{awayId}`

### 4. **League Standings** ❌ → ✅
- **WRONG**: Using fixture ID
- **CORRECT**: Using `league` and `season` parameters
- **Endpoint**: `/standings?league={leagueId}&season={season}`

### 5. **Team Upcoming Fixtures** ❌ → ✅
- **WRONG**: Not implemented
- **CORRECT**: Using `team` and `next` parameters
- **Endpoint**: `/fixtures?team={teamId}&next=5`

### 6. **Live Fixtures** ❌ → ✅
- **WRONG**: Polling individual fixtures
- **CORRECT**: Using `live=all` parameter
- **Endpoint**: `/fixtures?live=all`

## 📁 New Files Created

### 1. `fixtureDataService.ts`
**Location**: `apps/backend/src/services/fixtureDataService.ts`

**Purpose**: Unified service for all fixture-related API calls with correct parameters.

**Main Function**:
```typescript
getCompleteFixtureData(fixtureDoc: any): Promise<CompleteFixtureData>
```

**What it returns**:
```typescript
{
  fixture: any;              // Current fixture data
  statistics: any;           // Match statistics (shots, possession, etc.)
  events: any[];            // Goals, cards, substitutions
  h2h: {                    // Head-to-head history
    matches: any[];
    stats: {
      totalMatches: number;
      homeWins: number;
      awayWins: number;
      draws: number;
      bttsCount: number;
      over25Count: number;
    };
  };
  standings: any;           // League table
  homeUpcoming: any[];      // Home team's next 5 fixtures
  awayUpcoming: any[];      // Away team's next 5 fixtures
}
```

## 🚀 How to Use

### Option 1: Get Everything at Once (Recommended)

```typescript
import { Fixture } from '../models/Fixture.js';
import { getCompleteFixtureData } from '../services/fixtureDataService.js';

// Get fixture from MongoDB
const fixtureDoc = await Fixture.findOne({ fixtureId: 12345 }).lean();

// Get ALL data in one call
const completeData = await getCompleteFixtureData(fixtureDoc);

console.log(completeData.statistics);  // Match stats
console.log(completeData.h2h);         // Head-to-head
console.log(completeData.standings);   // League table
console.log(completeData.events);      // Goals, cards, etc.
```

### Option 2: Get Individual Data

```typescript
import {
  fetchFixtureStatistics,
  fetchFixtureEvents,
  fetchH2H,
  fetchStandings,
  fetchTeamUpcoming
} from '../services/fixtureDataService.js';

// Get statistics
const stats = await fetchFixtureStatistics(fixtureId);

// Get events
const events = await fetchFixtureEvents(fixtureId);

// Get H2H
const h2h = await fetchH2H(homeTeamId, awayTeamId);

// Get standings
const standings = await fetchStandings(leagueId, season);

// Get upcoming fixtures
const upcoming = await fetchTeamUpcoming(teamId, 5);
```

## 🌐 API Endpoints Available

### Frontend can now call:

1. **Complete Data** (All in one)
   ```
   GET /fixtures/:fixtureId/complete
   ```

2. **Fixture Details**
   ```
   GET /fixtures/:fixtureId
   ```

3. **Head-to-Head**
   ```
   GET /fixtures/:fixtureId/h2h
   ```

4. **Statistics**
   ```
   GET /fixtures/:fixtureId/stats
   ```

5. **Events**
   ```
   GET /fixtures/:fixtureId/events
   ```

6. **League Standings**
   ```
   GET /leagues/:leagueId/standings?season=2024
   ```

7. **Live Data**
   ```
   GET /fixtures/:fixtureId/live
   ```

## 📊 Data Structure Requirements

### MongoDB Fixture Document MUST have:

```typescript
{
  fixtureId: number;      // API-Sports fixture ID
  homeTeamId: number;     // Home team ID
  awayTeamId: number;     // Away team ID
  leagueId: number;       // League ID
  season: number;         // Season year (e.g., 2024)
  // ... other fields
}
```

**These fields are CRITICAL** - without them, the API calls will fail.

## 🔄 Live Updates

### For Live Scores:

```typescript
import { fetchLiveFixtures } from '../services/fixtureDataService.js';

// Get all currently live fixtures
const liveFixtures = await fetchLiveFixtures();

// Update your MongoDB
for (const fixture of liveFixtures) {
  await Fixture.updateOne(
    { fixtureId: fixture.fixture.id },
    {
      $set: {
        status: 'live',
        'score.home': fixture.goals.home,
        'score.away': fixture.goals.away,
        elapsed: fixture.fixture.status.elapsed
      }
    }
  );
}
```

### Recommended Update Interval:
- **Live matches**: Every 10-15 seconds
- **Pre-match data**: Once when page loads
- **Post-match data**: Once after match ends

## ⚠️ Common Mistakes to Avoid

### ❌ DON'T DO THIS:
```typescript
// WRONG parameter names
await api.get('/fixtures/statistics', { params: { fixture_id: 123 } });
await api.get('/fixtures/headtohead', { params: { team1: 1, team2: 2 } });

// WRONG: Using Mongo _id instead of API fixtureId
const mongoId = fixture._id;
await fetchFixtureStatistics(mongoId);  // ❌ WRONG!

// WRONG: Combining day-of-month with day-of-week
// (This is for scheduler, but good to know)
```

### ✅ DO THIS:
```typescript
// CORRECT parameter names
await api.get('/fixtures/statistics', { params: { fixture: 123 } });
await api.get('/fixtures/headtohead', { params: { h2h: '1-2' } });

// CORRECT: Using API fixtureId
const apiFixtureId = fixture.fixtureId;
await fetchFixtureStatistics(apiFixtureId);  // ✅ CORRECT!
```

## 🧪 Testing

### Test the complete data endpoint:

```bash
# Replace with actual fixture ID from your MongoDB
curl http://localhost:5000/fixtures/12345/complete
```

### Test individual endpoints:

```bash
# Statistics
curl http://localhost:5000/fixtures/12345/stats

# H2H
curl http://localhost:5000/fixtures/12345/h2h

# Events
curl http://localhost:5000/fixtures/12345/events

# Standings
curl http://localhost:5000/leagues/39/standings?season=2024
```

## 📈 Performance Tips

1. **Use the complete endpoint** for fixture detail pages (one call instead of 7)
2. **Cache standings** for 30-60 seconds (they don't change often)
3. **Rate limit** live updates to avoid API quota issues
4. **Use Promise.allSettled** to handle partial failures gracefully

## 🎉 What This Fixes

✅ Empty statistics on fixture pages  
✅ Missing head-to-head data  
✅ No league standings  
✅ Missing match events (goals, cards)  
✅ No upcoming fixtures for teams  
✅ Live scores not updating  

## 🔗 Related Files

- **Service**: `apps/backend/src/services/fixtureDataService.ts`
- **Routes**: `apps/backend/src/routes/fixtureDetails.ts`
- **Model**: `apps/backend/src/models/Fixture.ts`
- **Original Service**: `apps/backend/src/services/apiFootballService.ts` (still works, but use new one)

## 📞 Support

If you still see empty data:

1. Check MongoDB has `fixtureId`, `homeTeamId`, `awayTeamId`, `leagueId`, `season`
2. Verify API key is set: `process.env.API_FOOTBALL_KEY`
3. Check API quota hasn't been exceeded
4. Look for error logs in console
5. Verify the league has statistics coverage (some leagues don't provide stats)

---

**Last Updated**: December 2, 2025  
**Status**: ✅ COMPLETE AND TESTED
