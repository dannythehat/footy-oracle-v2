import React, { useEffect, useState } from 'react';
import { wsService, LiveScoreUpdate, MatchEvent } from '../../services/websocket';

interface LiveFootballPitchProps {
  fixtureId: number;
  homeTeam?: string;
  awayTeam?: string;
  initialStats?: any[];
  initialEvents?: any[];
}

interface PitchEvent {
  id: string;
  type: 'goal' | 'card' | 'corner' | 'substitution' | 'attack';
  team: 'home' | 'away';
  minute: number;
  player?: string;
  x: number; // Position on pitch (0-100)
  y: number; // Position on pitch (0-100)
  timestamp: number;
  detail?: string;
}

export default function LiveFootballPitch({ 
  fixtureId,
  homeTeam = 'Home', 
  awayTeam = 'Away',
  initialStats = [],
  initialEvents = []
}: LiveFootballPitchProps) {
  const [liveData, setLiveData] = useState<LiveScoreUpdate | null>(null);
  const [pitchEvents, setPitchEvents] = useState<PitchEvent[]>([]);
  const [dangerZone, setDangerZone] = useState<'home' | 'away' | null>(null);
  const [possession, setPossession] = useState({ home: 50, away: 50 });

  // Extract possession from stats
  useEffect(() => {
    const possessionStat = initialStats?.find(s => s.type === 'Ball Possession');
    if (possessionStat) {
      setPossession({
        home: parseFloat(possessionStat.home) || 50,
        away: parseFloat(possessionStat.away) || 50
      });
    }
  }, [initialStats]);

  // Convert initial events to pitch events
  useEffect(() => {
    if (initialEvents && initialEvents.length > 0) {
      const converted = initialEvents.slice(0, 5).map((ev, idx) => ({
        id: `initial-${idx}`,
        type: mapEventType(ev.type),
        team: ev.team?.name?.toLowerCase().includes(homeTeam.toLowerCase()) ? 'home' : 'away',
        minute: ev.time?.elapsed || 0,
        player: ev.player?.name || ev.player,
        x: getEventX(ev.type, ev.team?.name?.toLowerCase().includes(homeTeam.toLowerCase()) ? 'home' : 'away'),
        y: 50 + (Math.random() - 0.5) * 40,
        timestamp: Date.now() - (idx * 10000),
        detail: ev.detail
      }));
      setPitchEvents(converted);
    }
  }, [initialEvents, homeTeam]);

  // WebSocket subscription for live updates
  useEffect(() => {
    const unsubscribe = wsService.subscribe(fixtureId, (data: LiveScoreUpdate) => {
      setLiveData(data);
      
      // Add new events to pitch
      if (data.events && data.events.length > 0) {
        const newEvents = data.events.map((ev, idx) => ({
          id: `live-${Date.now()}-${idx}`,
          type: ev.type,
          team: ev.team,
          minute: ev.time,
          player: ev.player,
          x: getEventX(ev.type, ev.team),
          y: 50 + (Math.random() - 0.5) * 40,
          timestamp: Date.now(),
          detail: ev.detail
        }));
        
        setPitchEvents(prev => [...newEvents, ...prev].slice(0, 5));
        
        // Set danger zone for attacks
        if (newEvents.some(e => e.type === 'attack')) {
          const attackTeam = newEvents.find(e => e.type === 'attack')?.team;
          setDangerZone(attackTeam || null);
          setTimeout(() => setDangerZone(null), 5000);
        }
      }
    });

    return () => unsubscribe();
  }, [fixtureId]);

  // Auto-remove old events
  useEffect(() => {
    const interval = setInterval(() => {
      setPitchEvents(prev => 
        prev.filter(e => Date.now() - e.timestamp < 30000) // Keep events for 30s
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-80 bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden">
      {/* Live Indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-red-600/90 px-3 py-1 rounded-full">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        <span className="text-white text-xs font-bold">LIVE</span>
        {liveData && (
          <span className="text-white text-xs ml-1">{liveData.elapsed}'</span>
        )}
      </div>

      {/* SVG Football Pitch */}
      <svg
        viewBox="0 0 600 400"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Grass gradient */}
          <linearGradient id="grassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a4d2e" />
            <stop offset="50%" stopColor="#2d5f3f" />
            <stop offset="100%" stopColor="#1a4d2e" />
          </linearGradient>

          {/* Stripe pattern */}
          <pattern id="stripes" x="0" y="0" width="60" height="400" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="30" height="400" fill="#1a4d2e" fillOpacity="0.3" />
            <rect x="30" y="0" width="30" height="400" fill="#2d5f3f" fillOpacity="0.3" />
          </pattern>

          {/* Danger zone glow */}
          <radialGradient id="dangerGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>

          {/* Possession glow - Home */}
          <radialGradient id="homeGlow" cx="15%" cy="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={possession.home > 55 ? "0.5" : "0.2"} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>

          {/* Possession glow - Away */}
          <radialGradient id="awayGlow" cx="85%" cy="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={possession.away > 55 ? "0.5" : "0.2"} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Grass base */}
        <rect x="0" y="0" width="600" height="400" fill="url(#grassGradient)" />
        <rect x="0" y="0" width="600" height="400" fill="url(#stripes)" />

        {/* Possession zones with dynamic intensity */}
        <rect 
          x="0" 
          y="0" 
          width={`${possession.home * 6}px`} 
          height="400" 
          fill="url(#homeGlow)"
          className={possession.home > 55 ? "animate-pulse" : ""}
          style={{ animationDuration: '2s' }}
        />
        
        <rect 
          x={`${600 - (possession.away * 6)}px`}
          y="0" 
          width={`${possession.away * 6}px`} 
          height="400" 
          fill="url(#awayGlow)"
          className={possession.away > 55 ? "animate-pulse" : ""}
          style={{ animationDuration: '2s' }}
        />

        {/* Danger zones */}
        {dangerZone === 'home' && (
          <rect 
            x="400" 
            y="0" 
            width="200" 
            height="400" 
            fill="url(#dangerGlow)"
            className="animate-pulse"
            style={{ animationDuration: '1s' }}
          />
        )}
        
        {dangerZone === 'away' && (
          <rect 
            x="0" 
            y="0" 
            width="200" 
            height="400" 
            fill="url(#dangerGlow)"
            className="animate-pulse"
            style={{ animationDuration: '1s' }}
          />
        )}

        {/* Pitch markings */}
        <rect x="30" y="30" width="540" height="340" fill="none" stroke="white" strokeWidth="2" opacity="0.8" />
        <line x1="300" y1="30" x2="300" y2="370" stroke="white" strokeWidth="2" opacity="0.8" />
        <circle cx="300" cy="200" r="50" fill="none" stroke="white" strokeWidth="2" opacity="0.8" />
        <circle cx="300" cy="200" r="3" fill="white" opacity="0.8" />

        {/* Penalty areas */}
        <rect x="30" y="120" width="90" height="160" fill="none" stroke="white" strokeWidth="2" opacity="0.8" />
        <rect x="30" y="160" width="40" height="80" fill="none" stroke="white" strokeWidth="2" opacity="0.8" />
        <circle cx="95" cy="200" r="3" fill="white" opacity="0.8" />
        
        <rect x="480" y="120" width="90" height="160" fill="none" stroke="white" strokeWidth="2" opacity="0.8" />
        <rect x="530" y="160" width="40" height="80" fill="none" stroke="white" strokeWidth="2" opacity="0.8" />
        <circle cx="505" cy="200" r="3" fill="white" opacity="0.8" />

        {/* Corner arcs */}
        <path d="M 30 30 Q 40 30 40 40" fill="none" stroke="white" strokeWidth="2" opacity="0.8" />
        <path d="M 570 30 Q 560 30 560 40" fill="none" stroke="white" strokeWidth="2" opacity="0.8" />
        <path d="M 30 370 Q 40 370 40 360" fill="none" stroke="white" strokeWidth="2" opacity="0.8" />
        <path d="M 570 370 Q 560 370 560 360" fill="none" stroke="white" strokeWidth="2" opacity="0.8" />

        {/* Event markers on pitch */}
        {pitchEvents.map((event, idx) => {
          const opacity = 1 - (idx * 0.15); // Fade older events
          return (
            <g key={event.id} opacity={opacity}>
              {event.type === 'goal' && (
                <g transform={`translate(${event.x * 5.4 + 30}, ${event.y * 3.4 + 30})`}>
                  <circle r="12" fill="#22c55e" className="animate-ping" style={{ animationDuration: '2s' }} />
                  <circle r="8" fill="#22c55e" />
                  <text x="0" y="4" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">⚽</text>
                </g>
              )}
              
              {event.type === 'card' && (
                <g transform={`translate(${event.x * 5.4 + 30}, ${event.y * 3.4 + 30})`}>
                  <rect x="-6" y="-8" width="12" height="16" fill={event.detail === 'Red Card' ? '#ef4444' : '#fbbf24'} rx="1" />
                </g>
              )}
              
              {event.type === 'corner' && (
                <g transform={`translate(${event.x * 5.4 + 30}, ${event.y * 3.4 + 30})`}>
                  <circle r="8" fill="#8b5cf6" />
                  <text x="0" y="4" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">C</text>
                </g>
              )}
            </g>
          );
        })}

        {/* Attack direction arrows */}
        {possession.home > 60 && (
          <g opacity="0.6" className="animate-pulse" style={{ animationDuration: '1.5s' }}>
            <path d="M 200 200 L 350 200 L 340 190 M 350 200 L 340 210" 
                  stroke="#3b82f6" strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
        )}
        
        {possession.away > 60 && (
          <g opacity="0.6" className="animate-pulse" style={{ animationDuration: '1.5s' }}>
            <path d="M 400 200 L 250 200 L 260 190 M 250 200 L 260 210" 
                  stroke="#ef4444" strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
        )}
      </svg>

      {/* Possession Stats Overlay */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-6">
        <div className="bg-blue-600/80 backdrop-blur-sm px-3 py-1.5 rounded-lg">
          <div className="text-white text-xs font-bold">{homeTeam}</div>
          <div className="text-white text-lg font-bold">{possession.home}%</div>
        </div>

        <div className="bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-gray-300 text-xs font-medium">POSSESSION</span>
        </div>

        <div className="bg-red-600/80 backdrop-blur-sm px-3 py-1.5 rounded-lg">
          <div className="text-white text-xs font-bold text-right">{awayTeam}</div>
          <div className="text-white text-lg font-bold">{possession.away}%</div>
        </div>
      </div>

      {/* Recent Events Timeline */}
      {pitchEvents.length > 0 && (
        <div className="absolute top-16 right-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-2 max-w-xs">
          <div className="text-xs font-bold text-gray-300 mb-1">Recent Events</div>
          {pitchEvents.slice(0, 3).map((event, idx) => (
            <div key={event.id} className="text-xs text-gray-400 flex items-center gap-2 mb-1">
              <span className="text-white font-bold">{event.minute}'</span>
              <span className={event.team === 'home' ? 'text-blue-400' : 'text-red-400'}>
                {getEventIcon(event.type)} {event.player || event.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper functions
function mapEventType(type: string): 'goal' | 'card' | 'corner' | 'substitution' | 'attack' {
  const lower = type?.toLowerCase() || '';
  if (lower.includes('goal')) return 'goal';
  if (lower.includes('card')) return 'card';
  if (lower.includes('corner')) return 'corner';
  if (lower.includes('subst')) return 'substitution';
  return 'attack';
}

function getEventX(type: string, team: 'home' | 'away'): number {
  const eventType = mapEventType(type);
  
  if (eventType === 'goal') {
    return team === 'home' ? 85 : 15; // Near opponent's goal
  }
  if (eventType === 'corner') {
    return team === 'home' ? 90 : 10; // Corner positions
  }
  if (eventType === 'card') {
    return 40 + Math.random() * 20; // Midfield area
  }
  
  return team === 'home' ? 60 + Math.random() * 20 : 20 + Math.random() * 20;
}

function getEventIcon(type: string): string {
  switch (type) {
    case 'goal': return '⚽';
    case 'card': return '🟨';
    case 'corner': return '🚩';
    case 'substitution': return '🔄';
    default: return '⚡';
  }
}
