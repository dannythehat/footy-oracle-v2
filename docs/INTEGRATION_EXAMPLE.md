# Integration Example - New Features

## Quick Start: Add All Features to Fixtures Page

Here's how to integrate favorites, live scores, notifications, and stats into your existing fixtures page.

### 1. Import New Components

Add these imports to `apps/frontend/src/pages/fixtures.tsx`:

```tsx
import { FavoriteButton } from '../components/FavoriteButton';
import { LiveScoreBadge } from '../components/LiveScoreBadge';
import { FixtureStatsModal } from '../components/FixtureStatsModal';
import { NotificationSettings } from '../components/NotificationSettings';
import { FavoritesPanel } from '../components/FavoritesPanel';
```

### 2. Add State for Stats Modal

```tsx
const [showStatsModal, setShowStatsModal] = useState(false);
const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
```

### 3. Update Fixture Card Component

Replace your existing fixture card rendering with this enhanced version:

```tsx
function FixtureCard({ fixture }: { fixture: Fixture }) {
  const handleShowStats = () => {
    setSelectedFixture(fixture);
    setShowStatsModal(true);
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors">
      {/* Header with League and Favorite */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">{fixture.league}</span>
        </div>
        <FavoriteButton
          fixtureId={parseInt(fixture.fixture_id)}
          homeTeam={fixture.home_team}
          awayTeam={fixture.away_team}
          date={fixture.kickoff}
          league={fixture.league}
          size="sm"
        />
      </div>

      {/* Live Score Badge */}
      {fixture.status === 'LIVE' || fixture.status === '1H' || fixture.status === '2H' ? (
        <LiveScoreBadge
          fixtureId={parseInt(fixture.fixture_id)}
          homeTeam={fixture.home_team}
          awayTeam={fixture.away_team}
          initialHomeScore={fixture.home_score || 0}
          initialAwayScore={fixture.away_score || 0}
        />
      ) : (
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-white">{fixture.home_team}</span>
          <span className="text-gray-500">vs</span>
          <span className="font-medium text-white">{fixture.away_team}</span>
        </div>
      )}

      {/* Kickoff Time */}
      <div className="text-sm text-gray-400 mb-3">
        {new Date(fixture.kickoff).toLocaleString()}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleShowStats}
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
        >
          View Stats
        </button>
        <button
          onClick={() => setExpandedFixture(
            expandedFixture === fixture.fixture_id ? null : fixture.fixture_id
          )}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium transition-colors"
        >
          {expandedFixture === fixture.fixture_id ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {/* Expanded Details (existing code) */}
      {expandedFixture === fixture.fixture_id && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          {/* Your existing expanded content */}
        </div>
      )}
    </div>
  );
}
```

### 4. Add Favorites Panel to Sidebar

Add this above or below your fixtures list:

```tsx
<div className="mb-6">
  <FavoritesPanel />
</div>
```

### 5. Add Notification Settings to Header

```tsx
<div className="flex items-center justify-between mb-6">
  <h1 className="text-2xl font-bold text-white">Fixtures</h1>
  <NotificationSettings />
</div>
```

### 6. Add Stats Modal at Bottom

Add this at the end of your component, before the closing tag:

```tsx
{selectedFixture && (
  <FixtureStatsModal
    isOpen={showStatsModal}
    onClose={() => {
      setShowStatsModal(false);
      setSelectedFixture(null);
    }}
    fixtureId={parseInt(selectedFixture.fixture_id)}
    homeTeamId={selectedFixture.home_team_id || 0}
    awayTeamId={selectedFixture.away_team_id || 0}
    homeTeam={selectedFixture.home_team}
    awayTeam={selectedFixture.away_team}
    leagueId={selectedFixture.league_id || 0}
    season={selectedFixture.season || 2024}
  />
)}
```

---

## Complete Example Component

Here's a minimal complete example:

```tsx
import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { fixturesApi } from '../services/api';
import { FavoriteButton } from '../components/FavoriteButton';
import { LiveScoreBadge } from '../components/LiveScoreBadge';
import { FixtureStatsModal } from '../components/FixtureStatsModal';
import { NotificationSettings } from '../components/NotificationSettings';
import { FavoritesPanel } from '../components/FavoritesPanel';

export default function FixturesPage() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedFixture, setSelectedFixture] = useState(null);

  useEffect(() => {
    loadFixtures();
  }, []);

  const loadFixtures = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await fixturesApi.getByDate(today);
      setFixtures(data.fixtures || []);
    } catch (error) {
      console.error('Failed to load fixtures:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Today's Fixtures</h1>
        <NotificationSettings />
      </div>

      {/* Favorites Panel */}
      <div className="mb-6">
        <FavoritesPanel />
      </div>

      {/* Fixtures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fixtures.map((fixture) => (
          <div
            key={fixture.fixture_id}
            className="bg-gray-800 rounded-lg border border-gray-700 p-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">{fixture.league}</span>
              </div>
              <FavoriteButton
                fixtureId={parseInt(fixture.fixture_id)}
                homeTeam={fixture.home_team}
                awayTeam={fixture.away_team}
                date={fixture.kickoff}
                league={fixture.league}
                size="sm"
              />
            </div>

            {/* Live Score or Teams */}
            {fixture.status === 'LIVE' ? (
              <LiveScoreBadge
                fixtureId={parseInt(fixture.fixture_id)}
                homeTeam={fixture.home_team}
                awayTeam={fixture.away_team}
                initialHomeScore={fixture.home_score || 0}
                initialAwayScore={fixture.away_score || 0}
              />
            ) : (
              <div className="text-center mb-3">
                <div className="font-medium">{fixture.home_team}</div>
                <div className="text-gray-500 text-sm">vs</div>
                <div className="font-medium">{fixture.away_team}</div>
              </div>
            )}

            {/* Kickoff */}
            <div className="text-sm text-gray-400 text-center mb-3">
              {new Date(fixture.kickoff).toLocaleTimeString()}
            </div>

            {/* Stats Button */}
            <button
              onClick={() => {
                setSelectedFixture(fixture);
                setShowStatsModal(true);
              }}
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
            >
              View Stats
            </button>
          </div>
        ))}
      </div>

      {/* Stats Modal */}
      {selectedFixture && (
        <FixtureStatsModal
          isOpen={showStatsModal}
          onClose={() => {
            setShowStatsModal(false);
            setSelectedFixture(null);
          }}
          fixtureId={parseInt(selectedFixture.fixture_id)}
          homeTeamId={selectedFixture.home_team_id || 0}
          awayTeamId={selectedFixture.away_team_id || 0}
          homeTeam={selectedFixture.home_team}
          awayTeam={selectedFixture.away_team}
          leagueId={selectedFixture.league_id || 0}
          season={selectedFixture.season || 2024}
        />
      )}
    </div>
  );
}
```

---

## Environment Setup

### 1. Frontend `.env`
```env
VITE_API_URL=http://localhost:10000
VITE_WS_URL=ws://localhost:10000/ws
```

### 2. Frontend `.env.production`
```env
VITE_API_URL=https://footy-oracle-backend.onrender.com
VITE_WS_URL=wss://footy-oracle-backend.onrender.com/ws
```

### 3. Backend `.env`
```env
MONGODB_URI=your_mongodb_uri
NODE_ENV=production
PORT=10000
```

---

## Testing Checklist

- [ ] Favorites persist after page refresh
- [ ] Star icon fills/unfills on click
- [ ] Favorites panel shows all starred fixtures
- [ ] WebSocket connects successfully
- [ ] Live scores update in real-time
- [ ] Notification permission prompt appears
- [ ] Test notification sends successfully
- [ ] Stats modal loads H2H data
- [ ] Stats modal loads team statistics
- [ ] Modal closes properly

---

## Common Issues

### WebSocket Not Connecting
```bash
# Check backend logs
npm run dev

# Should see:
# ✅ WebSocket server initialized
# 🔌 WebSocket server ready at ws://localhost:10000/ws
```

### Notifications Not Working
```javascript
// Check in browser console
console.log(Notification.permission); // Should be 'granted'
console.log('Notification' in window); // Should be true
```

### Stats Not Loading
```javascript
// Check API response
const stats = await fixturesApi.getFixtureStats(
  fixtureId,
  homeTeamId,
  awayTeamId,
  leagueId,
  season
);
console.log(stats);
```

---

## Next Steps

1. **Deploy Backend** - Push to Render with WebSocket support
2. **Deploy Frontend** - Push to Vercel with env vars
3. **Test Production** - Verify all features work
4. **Monitor** - Check logs for errors
5. **Optimize** - Add caching, reduce API calls

---

## Support

See [NEW_FEATURES.md](./NEW_FEATURES.md) for detailed documentation.
