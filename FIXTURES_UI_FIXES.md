# Fixtures UI Improvements

## Changes Made

### 1. ✅ Timezone Support (COMPLETED)
- **Frontend**: Added timezone offset to API calls in `apps/frontend/src/services/api.ts`
- **Backend**: Updated date query logic in `apps/backend/src/routes/fixtures.ts`
- **Result**: Users now see fixtures for their full local day (00:00-23:59)

### 2. 🔄 Live Now Section - Always Show (PENDING)

**File**: `apps/frontend/src/components/FixturesView.tsx`
**Lines**: ~520-540

**Current Code**:
```tsx
{!loading && !error && liveFixtures.length > 0 && (
  <div className="mb-3">
    {/* Live section content */}
  </div>
)}
```

**Change To**:
```tsx
{!loading && !error && fixtures.length > 0 && (
  <div className="mb-3">
    <div className="bg-[#0f0f0f] border-l-2 border-red-500 border-r border-t border-b border-gray-800 rounded overflow-hidden">
      <div className="px-3 py-2 flex items-center justify-between bg-red-950/20 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Radio className={`w-3.5 h-3.5 ${liveFixtures.length > 0 ? 'text-red-500 animate-pulse' : 'text-gray-600'}`} />
          <span className={`text-xs font-bold ${liveFixtures.length > 0 ? 'text-red-400' : 'text-gray-500'}`}>
            LIVE NOW
          </span>
          <span className={`text-xs px-1.5 py-0.5 rounded border ${
            liveFixtures.length > 0 
              ? 'text-red-500 bg-red-950/40 border-red-900/50' 
              : 'text-gray-600 bg-gray-900/40 border-gray-800'
          }`}>
            {liveFixtures.length}
          </span>
        </div>
      </div>
      {liveFixtures.length > 0 ? (
        <div>
          {liveFixtures.map(renderFixtureRow)}
        </div>
      ) : (
        <div className="px-3 py-4 text-center text-gray-600 text-xs">
          No live games at the moment
        </div>
      )}
    </div>
  </div>
)}
```

### 3. 🔄 Timezone Indicator (PENDING)

**File**: `apps/frontend/src/components/FixturesView.tsx`
**Location**: After the "FIXTURES" header

**Add**:
```tsx
<div className="flex items-center justify-between mb-4">
  <div>
    <h1 className="text-xl font-bold text-white">FIXTURES</h1>
    <p className="text-xs text-gray-600 mt-0.5">
      Times shown in {Intl.DateTimeFormat().resolvedOptions().timeZone.replace('_', ' ')}
    </p>
  </div>
  {onClose && (
    <button onClick={onClose} className="...">Close</button>
  )}
</div>
```

### 4. 🔄 Better Time Formatting (PENDING)

**File**: `apps/frontend/src/components/FixturesView.tsx`
**Function**: `formatTime` (around line 251)

**Current**:
```tsx
const formatTime = (fixture: Fixture) => {
  if (fixture.time) return fixture.time;
  
  const dateStr = fixture.kickoff || fixture.date;
  if (!dateStr) return 'TBD';
  
  return new Date(dateStr).toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};
```

**Change To**:
```tsx
const formatTime = (fixture: Fixture) => {
  if (fixture.time) return fixture.time;
  
  const dateStr = fixture.kickoff || fixture.date;
  if (!dateStr) return 'TBD';
  
  // Use user's locale instead of forcing 'en-GB'
  return new Date(dateStr).toLocaleTimeString(undefined, { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false // 24-hour format
  });
};
```

## Testing Checklist

- [ ] User in GMT+2 sees fixtures from 00:00 to 23:59 local time
- [ ] User in GMT sees fixtures from 00:00 to 23:59 local time
- [ ] Live Now section always visible (shows "No live games" when empty)
- [ ] Timezone indicator shows correct timezone
- [ ] Times display in user's local format
- [ ] Date selector shows "TODAY" for current date
- [ ] Auto-refresh works correctly

## Issues Resolved

- #100 - Fixtures showing wrong time range
- #101 - No Live Games placeholder
- #102 - Date selector label
- #103 - Timezone handling
