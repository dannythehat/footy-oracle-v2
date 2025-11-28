# FixturesModal API Integration Fix

## Problem
The FixturesModal component uses hardcoded mock data instead of fetching from the backend API.

## Solution
Replace the mock data in the `useEffect` hook with an actual API call.

## Changes Required

### File: `apps/frontend/src/components/FixturesModal.tsx`

#### 1. Add import at the top (line 2)
```typescript
import { fixturesApi } from '../services/api';
```

#### 2. Add error state (around line 79)
```typescript
const [error, setError] = useState<string | null>(null);
```

#### 3. Replace the entire useEffect hook (lines 82-283)

**REMOVE THIS:**
```typescript
useEffect(() => {
  // Mock fixtures data with team IDs for API calls
  const mockFixtures: Fixture[] = [
    // ... 200 lines of hardcoded mock data ...
  ];

  setFixtures(mockFixtures);
  setLoading(false);
}, []);
```

**REPLACE WITH THIS:**
```typescript
useEffect(() => {
  fetchFixtures();
}, []);

const fetchFixtures = async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    console.log('Fetching fixtures for date:', today);
    const response = await fixturesApi.getByDate(today);
    
    console.log('Fixtures API response:', response);
    
    if (response && response.data) {
      setFixtures(response.data);
    } else {
      setFixtures([]);
    }
  } catch (err: any) {
    console.error('Error fetching fixtures:', err);
    setError(err.message || 'Failed to load fixtures. Please try again.');
    setFixtures([]);
  } finally {
    setLoading(false);
  }
};
```

#### 4. Update the loading/error UI (around line 520)

**REPLACE:**
```typescript
{loading ? (
  <div className="text-center py-12 text-gray-400">Loading fixtures...</div>
) : filteredFixtures.length === 0 ? (
  <div className="text-center py-12 text-gray-400">No fixtures found</div>
) : (
```

**WITH:**
```typescript
{loading ? (
  <div className="text-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
    <div className="text-gray-400">Loading fixtures from API...</div>
  </div>
) : error ? (
  <div className="text-center py-12">
    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
    <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Fixtures</h3>
    <p className="text-gray-400 mb-4">{error}</p>
    <button
      onClick={fetchFixtures}
      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-all"
    >
      Retry
    </button>
  </div>
) : filteredFixtures.length === 0 ? (
  <div className="text-center py-12 text-gray-400">
    {fixtures.length === 0 ? 'No fixtures available for today' : 'No fixtures found matching your search'}
  </div>
) : (
```

#### 5. Add AlertCircle to imports (line 2)
```typescript
import { X, Search, Filter, ChevronDown, ChevronUp, Star, TrendingUp, Calendar, History, BarChart3, Users, AlertCircle } from 'lucide-react';
```

## Testing

After making these changes:

1. Check browser console for API calls
2. Verify fixtures load from backend
3. Test error handling by stopping backend
4. Confirm retry button works

## Reference
- Backend API: `https://footy-oracle-backend.onrender.com/api/fixtures`
- API Service: `apps/frontend/src/services/api.ts`
- Related Issues: #38, #39, #40, #41
