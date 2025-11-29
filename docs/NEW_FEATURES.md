# 🚀 New Features - Footy Oracle v2

## Overview

This document covers the newly implemented features for Footy Oracle v2, including favorites, live scores, notifications, and real-time statistics.

---

## ⭐ 1. Favorites System

### Description
Users can star/favorite fixtures for quick access. Favorites are persisted in localStorage and survive page refreshes.

### Components
- **`useFavorites` hook** (`src/hooks/useFavorites.ts`)
  - Manages favorite fixtures with localStorage persistence
  - Methods: `addFavorite`, `removeFavorite`, `isFavorite`, `toggleFavorite`, `clearFavorites`

- **`FavoriteButton` component** (`src/components/FavoriteButton.tsx`)
  - Star icon button to toggle favorites
  - Visual feedback (filled/unfilled star)
  - Sizes: `sm`, `md`, `lg`

- **`FavoritesPanel` component** (`src/components/FavoritesPanel.tsx`)
  - Displays all favorited fixtures
  - Shows team names, league, date/time
  - Quick remove and clear all functionality

### Usage Example
```tsx
import { FavoriteButton } from './components/FavoriteButton';
import { FavoritesPanel } from './components/FavoritesPanel';

// In your fixture card
<FavoriteButton
  fixtureId={fixture.id}
  homeTeam={fixture.homeTeam}
  awayTeam={fixture.awayTeam}
  date={fixture.date}
  league={fixture.league}
/>

// In your sidebar or dashboard
<FavoritesPanel />
```

---

## ⚡ 2. Live Score Updates

### Description
Real-time score updates via WebSocket connection. Automatically subscribes to fixtures and receives live updates.

### Architecture

#### Frontend
- **`websocket.ts` service** (`src/services/websocket.ts`)
  - WebSocket client with auto-reconnect
  - Subscription management per fixture
  - Heartbeat mechanism (30s ping)
  - Max 5 reconnection attempts

- **`useLiveScore` hook** (`src/hooks/useLiveScore.ts`)
  - React hook for live score data
  - Auto-subscribes/unsubscribes on mount/unmount
  - Returns `liveScore` and `isConnected` status

- **`LiveScoreBadge` component** (`src/components/LiveScoreBadge.tsx`)
  - Displays live scores with visual indicators
  - Shows match status (LIVE, FT, HT, etc.)
  - Animated "LIVE" badge with pulse effect
  - Elapsed time display

#### Backend
- **`websocket.ts` service** (`apps/backend/src/services/websocket.ts`)
  - WebSocket server on `/ws` path
  - Client subscription management
  - Periodic updates every 30 seconds
  - Broadcasts to subscribed clients only

### Configuration
Add to your `.env` files:

**Frontend** (`.env` or `.env.production`):
```env
VITE_WS_URL=ws://localhost:10000/ws
# Production:
VITE_WS_URL=wss://footy-oracle-backend.onrender.com/ws
```

### Usage Example
```tsx
import { LiveScoreBadge } from './components/LiveScoreBadge';

<LiveScoreBadge
  fixtureId={fixture.id}
  homeTeam={fixture.homeTeam}
  awayTeam={fixture.awayTeam}
  initialHomeScore={fixture.homeScore}
  initialAwayScore={fixture.awayScore}
/>
```

### WebSocket Message Format
```typescript
// Subscribe to fixture
{
  type: 'subscribe',
  fixtureId: 12345
}

// Live score update (server → client)
{
  fixtureId: 12345,
  homeScore: 2,
  awayScore: 1,
  status: 'LIVE',
  elapsed: 67,
  events: [
    {
      time: 23,
      type: 'goal',
      team: 'home',
      player: 'John Doe'
    }
  ]
}
```

---

## 🔔 3. Browser Notifications

### Description
Push notifications for important events: fixture starting, goals, golden bets.

### Components
- **`notifications.ts` service** (`src/services/notifications.ts`)
  - Browser Notification API wrapper
  - Permission management
  - Pre-built notification templates

- **`NotificationSettings` component** (`src/components/NotificationSettings.tsx`)
  - UI for enabling/disabling notifications
  - Shows permission status
  - Test notification on enable

### Notification Types
1. **Fixture Starting** - Alert when a match starts soon
2. **Golden Bet** - Alert for high-confidence bets
3. **Goal Scored** - Real-time goal notifications

### Usage Example
```tsx
import { notificationService } from './services/notifications';
import { NotificationSettings } from './components/NotificationSettings';

// Request permission
await notificationService.requestPermission();

// Send notification
await notificationService.notifyFixtureStarting(
  'Arsenal',
  'Chelsea',
  12345,
  15 // minutes until start
);

// In your UI
<NotificationSettings />
```

### Browser Support
- ✅ Chrome, Firefox, Edge, Safari (macOS)
- ❌ Safari (iOS) - not supported
- Requires HTTPS in production

---

## 📊 4. Real Stats API Integration

### Description
Display real head-to-head and team statistics from API-Football.

### Components
- **`FixtureStatsModal` component** (`src/components/FixtureStatsModal.tsx`)
  - Modal dialog with comprehensive stats
  - Head-to-head history
  - Team statistics (wins, losses, goals, form)
  - Loading and error states

### API Endpoints (Already in `api.ts`)
```typescript
// Get H2H data
fixturesApi.getH2H(fixtureId, homeTeamId, awayTeamId, last = 10)

// Get team stats
fixturesApi.getTeamStats(teamId, leagueId, season)

// Get complete fixture stats
fixturesApi.getFixtureStats(fixtureId, homeTeamId, awayTeamId, leagueId, season)

// Get team's last fixtures
fixturesApi.getTeamLastFixtures(teamId, last = 5)
```

### Usage Example
```tsx
import { FixtureStatsModal } from './components/FixtureStatsModal';

const [showStats, setShowStats] = useState(false);

<button onClick={() => setShowStats(true)}>
  View Stats
</button>

<FixtureStatsModal
  isOpen={showStats}
  onClose={() => setShowStats(false)}
  fixtureId={fixture.id}
  homeTeamId={fixture.homeTeamId}
  awayTeamId={fixture.awayTeamId}
  homeTeam={fixture.homeTeam}
  awayTeam={fixture.awayTeam}
  leagueId={fixture.leagueId}
  season={2024}
/>
```

---

## 🎯 Integration Guide

### Step 1: Update Your Fixture Cards

Add favorites and stats to your fixture display:

```tsx
import { FavoriteButton } from './components/FavoriteButton';
import { LiveScoreBadge } from './components/LiveScoreBadge';
import { FixtureStatsModal } from './components/FixtureStatsModal';

function FixtureCard({ fixture }) {
  const [showStats, setShowStats] = useState(false);

  return (
    <div className="fixture-card">
      {/* Favorite Button */}
      <FavoriteButton
        fixtureId={fixture.id}
        homeTeam={fixture.homeTeam}
        awayTeam={fixture.awayTeam}
        date={fixture.date}
        league={fixture.league}
      />

      {/* Live Score */}
      <LiveScoreBadge
        fixtureId={fixture.id}
        homeTeam={fixture.homeTeam}
        awayTeam={fixture.awayTeam}
      />

      {/* Stats Button */}
      <button onClick={() => setShowStats(true)}>
        View Stats
      </button>

      {/* Stats Modal */}
      <FixtureStatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        {...fixture}
      />
    </div>
  );
}
```

### Step 2: Add Favorites Panel to Dashboard

```tsx
import { FavoritesPanel } from './components/FavoritesPanel';

function Dashboard() {
  return (
    <div className="dashboard">
      <FavoritesPanel />
      {/* Other dashboard content */}
    </div>
  );
}
```

### Step 3: Add Notification Settings

```tsx
import { NotificationSettings } from './components/NotificationSettings';

function Settings() {
  return (
    <div className="settings">
      <h2>Notifications</h2>
      <NotificationSettings />
    </div>
  );
}
```

---

## 🔧 Environment Variables

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:10000
VITE_WS_URL=ws://localhost:10000/ws
```

### Frontend (`.env.production`)
```env
VITE_API_URL=https://footy-oracle-backend.onrender.com
VITE_WS_URL=wss://footy-oracle-backend.onrender.com/ws
```

### Backend (`.env`)
```env
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=production
PORT=10000
```

---

## 🚀 Deployment Notes

### Backend (Render)
1. Install dependencies: `npm install` (includes `ws` package)
2. WebSocket server runs on same port as HTTP (10000)
3. Ensure Render allows WebSocket connections
4. Update CORS to include your frontend domain

### Frontend (Vercel)
1. Set environment variables in Vercel dashboard
2. Use `wss://` for production WebSocket URL
3. Ensure HTTPS is enabled (required for notifications)

---

## 📱 Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Favorites | ✅ | ✅ | ✅ | ✅ |
| Live Scores | ✅ | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | ✅ (macOS) | ✅ |
| WebSocket | ✅ | ✅ | ✅ | ✅ |

---

## 🐛 Troubleshooting

### WebSocket Connection Issues
- Check `VITE_WS_URL` is correct
- Verify backend WebSocket server is running
- Check browser console for connection errors
- Ensure firewall allows WebSocket connections

### Notifications Not Working
- Check browser permissions
- Verify HTTPS in production
- Test with `notificationService.isSupported()`
- Safari iOS doesn't support notifications

### Favorites Not Persisting
- Check localStorage is enabled
- Verify browser allows localStorage
- Check for quota exceeded errors

---

## 🎨 Customization

### Styling
All components use Tailwind CSS. Customize by modifying class names:

```tsx
// Example: Change favorite button color
<FavoriteButton
  className="text-blue-400 hover:text-blue-300"
  // ... other props
/>
```

### WebSocket Update Frequency
Modify in `apps/backend/src/services/websocket.ts`:

```typescript
// Change from 30s to 10s
this.updateInterval = setInterval(() => {
  this.fetchAndBroadcastUpdates();
}, 10000); // 10 seconds
```

---

## 📈 Future Enhancements

- [ ] Notification scheduling (e.g., 15 min before match)
- [ ] Favorite fixtures sync across devices
- [ ] Live commentary integration
- [ ] Match events timeline
- [ ] Push notifications via service worker
- [ ] Historical stats comparison charts

---

## 🤝 Contributing

When adding new features:
1. Follow existing component patterns
2. Use TypeScript for type safety
3. Add Tailwind classes for styling
4. Document in this file
5. Test across browsers

---

## 📞 Support

For issues or questions:
- Check browser console for errors
- Verify environment variables
- Review this documentation
- Check API endpoint responses
