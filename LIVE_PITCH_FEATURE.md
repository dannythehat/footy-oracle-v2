# ⚽ Live Football Pitch Visualization

## Overview

The Live Pitch feature provides real-time, interactive visualization of in-play football matches, similar to Bet365's live match tracker. It shows dangerous attacks, possession zones, recent events, and match flow on an animated football pitch.

## 🎯 Features

### Current Implementation

1. **Animated Football Pitch**
   - Realistic SVG pitch with all markings
   - Gradient grass effect with striped pattern
   - Responsive design that scales to any screen size

2. **Real-Time Match Data**
   - WebSocket connection for live updates
   - Possession percentage display
   - Live match time indicator
   - Pulsing "LIVE" badge

3. **Event Visualization**
   - ⚽ Goals - Green pulsing markers
   - 🟨 Yellow/Red Cards - Colored rectangles
   - 🚩 Corner Kicks - Purple markers
   - 🔄 Substitutions - Event markers
   - ⚡ Attacks - Danger zone highlights

4. **Dynamic Animations**
   - Possession-based field tilt (blue for home, red for away)
   - Pulsing danger zones during attacks
   - Attack direction arrows when team dominates
   - Event markers that fade over time (30s lifespan)
   - Smooth transitions and animations

5. **Recent Events Timeline**
   - Last 3 events displayed in sidebar
   - Shows minute, player, and event type
   - Color-coded by team
   - Auto-updates with new events

## 🏗️ Architecture

### Component Structure

```
MatchPage.tsx
├── Detects if match is live
├── Shows "Live Pitch" tab for in-play matches
└── LiveFootballPitch.tsx
    ├── WebSocket subscription
    ├── Event processing
    ├── Pitch rendering (SVG)
    └── Real-time updates
```

### Data Flow

```
API/WebSocket → LiveFootballPitch → State Updates → Visual Changes
                      ↓
              Event Processing
                      ↓
              Position Calculation
                      ↓
              SVG Rendering
```

## 📊 Event Mapping

### Event Types

| Event Type | Visual | Position Logic | Duration |
|-----------|--------|----------------|----------|
| Goal | Green pulsing circle with ⚽ | Near opponent's goal (85% or 15%) | 30s |
| Yellow Card | Yellow rectangle | Midfield area (40-60%) | 30s |
| Red Card | Red rectangle | Midfield area (40-60%) | 30s |
| Corner | Purple circle with "C" | Corner positions (90% or 10%) | 30s |
| Attack | Danger zone glow | Attacking third | 5s |

### Position Calculation

Events are positioned on the pitch using X/Y coordinates:
- **X-axis**: 0-100 (left to right)
- **Y-axis**: 0-100 (top to bottom)
- Converted to SVG coordinates: `x * 5.4 + 30`, `y * 3.4 + 30`

### Team-Based Positioning

```javascript
Home Team (Blue):
- Goals: 85% (attacking right)
- Corners: 90%
- Attacks: 60-80%

Away Team (Red):
- Goals: 15% (attacking left)
- Corners: 10%
- Attacks: 20-40%
```

## 🎨 Visual Effects

### Possession Zones

```javascript
// Home possession > 55%
- Blue glow from left side
- Pulsing animation (2s duration)
- Intensity based on possession %

// Away possession > 55%
- Red glow from right side
- Pulsing animation (2s duration)
- Intensity based on possession %
```

### Danger Zones

```javascript
// Triggered by attack events
- Red pulsing overlay
- Covers attacking third (200px width)
- 1s pulse animation
- Auto-clears after 5s
```

### Attack Arrows

```javascript
// Home dominating (possession > 60%)
- Blue arrow pointing right
- Pulsing animation (1.5s)
- Positioned at center

// Away dominating (possession > 60%)
- Red arrow pointing left
- Pulsing animation (1.5s)
- Positioned at center
```

## 🔌 WebSocket Integration

### Connection

```typescript
// Subscribe to fixture updates
wsService.subscribe(fixtureId, (data: LiveScoreUpdate) => {
  // Update live data
  // Process new events
  // Update danger zones
});
```

### Data Structure

```typescript
interface LiveScoreUpdate {
  fixtureId: number;
  homeScore: number;
  awayScore: number;
  status: string;
  elapsed: number;
  events?: MatchEvent[];
}

interface MatchEvent {
  time: number;
  type: 'goal' | 'card' | 'substitution';
  team: 'home' | 'away';
  player: string;
  detail?: string;
}
```

## 🚀 Usage

### For Live Matches

1. Navigate to any live match page
2. Look for the **🔴 Live Pitch** tab (pulsing red)
3. Click to see real-time visualization
4. Watch as events appear on the pitch
5. Observe possession changes and attacks

### Tab Visibility

The Live Pitch tab only appears when:
```typescript
fixture.status.short === '1H' ||  // First Half
fixture.status.short === '2H' ||  // Second Half
fixture.status.short === 'HT' ||  // Half Time
fixture.status.short === 'ET' ||  // Extra Time
fixture.status.short === 'P'  ||  // Penalties
fixture.status.short === 'LIVE'   // Generic Live
```

## 🎯 Future Enhancements

### Planned Features

1. **Player Positions**
   - Show actual player positions from API
   - Formation visualization (4-4-2, 4-3-3, etc.)
   - Player movement tracking

2. **Heat Maps**
   - Possession heat map overlay
   - Attack intensity zones
   - Defensive pressure areas

3. **Shot Maps**
   - Show all shots on goal
   - xG (expected goals) visualization
   - Shot accuracy indicators

4. **Pass Networks**
   - Key passing lanes
   - Player connections
   - Pass completion rates

5. **Advanced Stats Overlay**
   - Distance covered
   - Sprint speed
   - Tackles won/lost
   - Aerial duels

6. **Replay Mode**
   - Scrub through match timeline
   - Replay key moments
   - Event filtering

7. **Multi-Match View**
   - Side-by-side pitch comparison
   - Synchronized timelines
   - Cross-match analysis

### Technical Improvements

1. **Performance**
   - Canvas rendering for better performance
   - Event batching
   - Optimized animations

2. **Accessibility**
   - Screen reader support
   - Keyboard navigation
   - High contrast mode

3. **Mobile Optimization**
   - Touch gestures
   - Pinch to zoom
   - Landscape mode optimization

## 🐛 Troubleshooting

### Common Issues

**Issue**: Live Pitch tab not showing
- **Solution**: Check if match status is live (1H, 2H, HT, etc.)

**Issue**: Events not appearing
- **Solution**: Verify WebSocket connection in browser console

**Issue**: Possession not updating
- **Solution**: Check if stats API is returning possession data

**Issue**: Animations stuttering
- **Solution**: Reduce number of simultaneous animations, check browser performance

### Debug Mode

Enable debug logging:
```typescript
// In LiveFootballPitch.tsx
console.log('Live data:', liveData);
console.log('Pitch events:', pitchEvents);
console.log('Possession:', possession);
```

## 📝 Code Examples

### Adding Custom Event Type

```typescript
// 1. Add to event type union
type EventType = 'goal' | 'card' | 'corner' | 'substitution' | 'attack' | 'offside';

// 2. Add mapping logic
function mapEventType(type: string): EventType {
  if (type.includes('offside')) return 'offside';
  // ... existing logic
}

// 3. Add visual rendering
{event.type === 'offside' && (
  <g transform={`translate(${event.x * 5.4 + 30}, ${event.y * 3.4 + 30})`}>
    <circle r="8" fill="#f59e0b" />
    <text>⚠️</text>
  </g>
)}

// 4. Add icon
function getEventIcon(type: string): string {
  if (type === 'offside') return '⚠️';
  // ... existing logic
}
```

### Customizing Danger Zone Duration

```typescript
// In LiveFootballPitch.tsx, find:
setTimeout(() => setDangerZone(null), 5000); // 5 seconds

// Change to:
setTimeout(() => setDangerZone(null), 10000); // 10 seconds
```

### Adjusting Event Lifespan

```typescript
// In auto-remove effect, find:
prev.filter(e => Date.now() - e.timestamp < 30000) // 30 seconds

// Change to:
prev.filter(e => Date.now() - e.timestamp < 60000) // 60 seconds
```

## 🎨 Styling Customization

### Colors

```typescript
// Home team color
const homeColor = '#3b82f6'; // Blue

// Away team color
const awayColor = '#ef4444'; // Red

// Danger zone color
const dangerColor = '#ef4444'; // Red

// Goal marker color
const goalColor = '#22c55e'; // Green
```

### Animation Speeds

```typescript
// Possession pulse
style={{ animationDuration: '2s' }}

// Danger zone pulse
style={{ animationDuration: '1s' }}

// Attack arrow pulse
style={{ animationDuration: '1.5s' }}
```

## 📚 Related Files

- `apps/frontend/src/components/match/LiveFootballPitch.tsx` - Main component
- `apps/frontend/src/components/match/FootballPitchGraphic.tsx` - Static pitch
- `apps/frontend/src/pages/MatchPage.tsx` - Page integration
- `apps/frontend/src/services/websocket.ts` - WebSocket service
- `apps/frontend/src/services/api.ts` - API calls

## 🤝 Contributing

To add new features:

1. Update `LiveFootballPitch.tsx` with new visual elements
2. Add corresponding event types to `websocket.ts` if needed
3. Update this documentation
4. Test with live matches
5. Submit PR with screenshots/videos

## 📄 License

Part of Footy Oracle v2 project.
