import React, { useEffect, useState } from 'react';
import { Target, Flag, AlertTriangle, Activity } from 'lucide-react';
import { fixturesApi } from '../services/api';

interface LiveMatchStatsProps {
  fixtureId: number;
  compact?: boolean;
}

interface LiveStats {
  home: {
    shots?: { total: number; on: number };
    corners?: number;
    yellowCards?: number;
    redCards?: number;
    possession?: number;
  };
  away: {
    shots?: { total: number; on: number };
    corners?: number;
    yellowCards?: number;
    redCards?: number;
    possession?: number;
  };
}

interface LiveEvent {
  time: { elapsed: number };
  team: { id: number; name: string };
  player: { name: string };
  type: string;
  detail: string;
}

const LiveMatchStats: React.FC<LiveMatchStatsProps> = ({ fixtureId, compact = false }) => {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveData();
    // Refresh every 30 seconds for live matches
    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, [fixtureId]);

  const fetchLiveData = async () => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        fixturesApi.getStats(fixtureId),
        fixturesApi.getEvents(fixtureId)
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }

      if (eventsRes.success && eventsRes.data) {
        // Get recent goal scorers and cards
        const recentEvents = eventsRes.data
          .filter((e: LiveEvent) => e.type === 'Goal' || e.type === 'Card')
          .slice(-5); // Last 5 events
        setEvents(recentEvents);
      }
    } catch (err) {
      console.error('Error fetching live data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return null;
  }

  if (compact) {
    // Compact view for fixture cards
    return (
      <div className="flex items-center justify-between text-xs text-gray-400 mt-2 px-2">
        <div className="flex items-center gap-3">
          {stats.home.possession !== undefined && (
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              <span>{stats.home.possession}%</span>
            </div>
          )}
          {stats.home.shots && (
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span>{stats.home.shots.on}/{stats.home.shots.total}</span>
            </div>
          )}
          {stats.home.corners !== undefined && (
            <div className="flex items-center gap-1">
              <Flag className="w-3 h-3" />
              <span>{stats.home.corners}</span>
            </div>
          )}
          {(stats.home.yellowCards || stats.home.redCards) ? (
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-400">{stats.home.yellowCards || 0}</span>
              {stats.home.redCards > 0 && (
                <span className="text-red-400 ml-1">{stats.home.redCards}</span>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {(stats.away.yellowCards || stats.away.redCards) ? (
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-400">{stats.away.yellowCards || 0}</span>
              {stats.away.redCards > 0 && (
                <span className="text-red-400 ml-1">{stats.away.redCards}</span>
              )}
            </div>
          ) : null}
          {stats.away.corners !== undefined && (
            <div className="flex items-center gap-1">
              <span>{stats.away.corners}</span>
              <Flag className="w-3 h-3" />
            </div>
          )}
          {stats.away.shots && (
            <div className="flex items-center gap-1">
              <span>{stats.away.shots.on}/{stats.away.shots.total}</span>
              <Target className="w-3 h-3" />
            </div>
          )}
          {stats.away.possession !== undefined && (
            <div className="flex items-center gap-1">
              <span>{stats.away.possession}%</span>
              <Activity className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full view with recent events
  return (
    <div className="mt-3 space-y-2">
      {/* Stats bar */}
      <div className="flex items-center justify-between text-xs text-gray-400 px-2">
        <div className="flex items-center gap-4">
          {stats.home.possession !== undefined && (
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              <span className="font-medium">{stats.home.possession}%</span>
            </div>
          )}
          {stats.home.shots && (
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span className="font-medium">{stats.home.shots.on}/{stats.home.shots.total}</span>
            </div>
          )}
          {stats.home.corners !== undefined && (
            <div className="flex items-center gap-1">
              <Flag className="w-3 h-3" />
              <span className="font-medium">{stats.home.corners}</span>
            </div>
          )}
          {(stats.home.yellowCards || stats.home.redCards) ? (
            <div className="flex items-center gap-1">
              {stats.home.yellowCards > 0 && (
                <div className="w-2 h-3 bg-yellow-400 rounded-sm" />
              )}
              {stats.home.yellowCards > 1 && (
                <span className="text-yellow-400 text-xs">{stats.home.yellowCards}</span>
              )}
              {stats.home.redCards > 0 && (
                <div className="w-2 h-3 bg-red-500 rounded-sm ml-1" />
              )}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-4">
          {(stats.away.yellowCards || stats.away.redCards) ? (
            <div className="flex items-center gap-1">
              {stats.away.redCards > 0 && (
                <div className="w-2 h-3 bg-red-500 rounded-sm" />
              )}
              {stats.away.yellowCards > 1 && (
                <span className="text-yellow-400 text-xs">{stats.away.yellowCards}</span>
              )}
              {stats.away.yellowCards > 0 && (
                <div className="w-2 h-3 bg-yellow-400 rounded-sm ml-1" />
              )}
            </div>
          ) : null}
          {stats.away.corners !== undefined && (
            <div className="flex items-center gap-1">
              <span className="font-medium">{stats.away.corners}</span>
              <Flag className="w-3 h-3" />
            </div>
          )}
          {stats.away.shots && (
            <div className="flex items-center gap-1">
              <span className="font-medium">{stats.away.shots.on}/{stats.away.shots.total}</span>
              <Target className="w-3 h-3" />
            </div>
          )}
          {stats.away.possession !== undefined && (
            <div className="flex items-center gap-1">
              <span className="font-medium">{stats.away.possession}%</span>
              <Activity className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>

      {/* Recent events */}
      {events.length > 0 && (
        <div className="text-xs text-gray-500 px-2">
          {events.map((event, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-gray-600">{event.time.elapsed}'</span>
              {event.type === 'Goal' && <Target className="w-3 h-3 text-green-400" />}
              {event.type === 'Card' && event.detail.includes('Yellow') && (
                <div className="w-2 h-3 bg-yellow-400 rounded-sm" />
              )}
              {event.type === 'Card' && event.detail.includes('Red') && (
                <div className="w-2 h-3 bg-red-500 rounded-sm" />
              )}
              <span className="text-gray-400">{event.player.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveMatchStats;
