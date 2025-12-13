# Fixtures Data Loading Fix

## Problem
FixturesView component not loading fixtures - shows "No fixtures for this date"

## Root Cause
Double `.data` extraction:
- `fixturesApi.getByDate()` already extracts `.data` from backend response
- `FixturesView` tries to access `.data` again on the already-extracted array

## Fix Required
In `apps/frontend/src/components/FixturesView.tsx`, line 140:

**CHANGE FROM:**
```typescript
if (response && response.data) {
  setFixtures(response.data);
  // ... rest using response.data
}
```

**CHANGE TO:**
```typescript
if (response && Array.isArray(response)) {
  setFixtures(response);
  // ... rest using response directly
}
```

## Complete Fix (lines 138-161)
```typescript
const response = await fixturesApi.getByDate(dateStr);

// response is already the data array (extracted by API service)
if (response && Array.isArray(response)) {
  setFixtures(response);
  
  // Auto-expand all regular leagues on first load
  if (expandedLeagues.size === 0) {
    const leagues = new Set<string>(
      response
        .map((f: Fixture) => formatLeagueName(f))
        .filter((league: string | undefined): league is string => Boolean(league))
    );
    setExpandedLeagues(leagues);
  }
  
  // Auto-expand all live leagues
  const liveFixtures = response.filter(isLive);
  const liveLeagues = new Set<string>(
    liveFixtures
      .map((f: Fixture) => formatLeagueName(f))
      .filter((league: string | undefined): league is string => Boolean(league))
  );
  setExpandedLiveLeagues(liveLeagues);
} else {
  setFixtures([]);
}
```
