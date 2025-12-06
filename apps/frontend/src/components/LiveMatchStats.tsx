import React, { useEffect, useState } from 'react';
import { Flag, AlertTriangle } from 'lucide-react';
import { fixturesApi } from '../services/api';

interface LiveMatchStatsProps {
  fixtureId: number;
  compact?: boolean;
}

interface LiveStats {
  home: {
    corners?: number;
    yellowCards?: number;
    redCards?: number;
  };
  away: {
    corners?: number;
    yellowCards?: number;
    redCards?: number;
  };
}

const LiveMatchStats: React.FC<LiveMatchStatsProps> = ({ fixtureId, compact = false }) => {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveData();
    // Refresh every 30 seconds for live matches
    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, [fixtureId]);

  const fetchLiveData = async () => {
    try {
      const statsRes = await fixturesApi.getStats(fixtureId);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
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

  // Compact view for fixture cards - ONLY corners and cards
  return (
    <div className="flex items-center justify-between text-[10px] sm:text-[9px] mt-2 px-2 py-1.5 bg-black/40 rounded border border-purple-900/30">
      {/* Home Team Stats */}
      <div className="flex items-center gap-2 sm:gap-1.5">
        {/* Corners */}
        {stats.home.corners !== undefined && (
          <div className="flex items-center gap-1">
            <Flag className="w-3 h-3 sm:w-2.5 sm:h-2.5 text-purple-400" />
            <span className="text-purple-300 font-medium">{stats.home.corners}</span>
          </div>
        )}
        
        {/* Cards */}
        {(stats.home.yellowCards || stats.home.redCards) ? (
          <div className="flex items-center gap-1">
            {stats.home.yellowCards > 0 && (
              <div className="flex items-center gap-0.5">
                <div className="w-2 h-2.5 bg-yellow-400 rounded-sm" />
                {stats.home.yellowCards > 1 && (
                  <span className="text-yellow-400 font-medium">{stats.home.yellowCards}</span>
                )}
              </div>
            )}
            {stats.home.redCards > 0 && (
              <div className="flex items-center gap-0.5 ml-1">
                <div className="w-2 h-2.5 bg-red-500 rounded-sm" />
                {stats.home.redCards > 1 && (
                  <span className="text-red-400 font-medium">{stats.home.redCards}</span>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Away Team Stats */}
      <div className="flex items-center gap-2 sm:gap-1.5">
        {/* Cards */}
        {(stats.away.yellowCards || stats.away.redCards) ? (
          <div className="flex items-center gap-1">
            {stats.away.redCards > 0 && (
              <div className="flex items-center gap-0.5">
                {stats.away.redCards > 1 && (
                  <span className="text-red-400 font-medium">{stats.away.redCards}</span>
                )}
                <div className="w-2 h-2.5 bg-red-500 rounded-sm" />
              </div>
            )}
            {stats.away.yellowCards > 0 && (
              <div className="flex items-center gap-0.5 ml-1">
                {stats.away.yellowCards > 1 && (
                  <span className="text-yellow-400 font-medium">{stats.away.yellowCards}</span>
                )}
                <div className="w-2 h-2.5 bg-yellow-400 rounded-sm" />
              </div>
            )}
          </div>
        ) : null}
        
        {/* Corners */}
        {stats.away.corners !== undefined && (
          <div className="flex items-center gap-1">
            <span className="text-purple-300 font-medium">{stats.away.corners}</span>
            <Flag className="w-3 h-3 sm:w-2.5 sm:h-2.5 text-purple-400" />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMatchStats;
