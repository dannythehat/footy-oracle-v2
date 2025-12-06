import React, { useEffect, useState } from 'react';
import { Flag } from 'lucide-react';
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

  const hasHomeStats = (stats.home.corners && stats.home.corners > 0) || 
                       (stats.home.yellowCards && stats.home.yellowCards > 0) || 
                       (stats.home.redCards && stats.home.redCards > 0);
  
  const hasAwayStats = (stats.away.corners && stats.away.corners > 0) || 
                       (stats.away.yellowCards && stats.away.yellowCards > 0) || 
                       (stats.away.redCards && stats.away.redCards > 0);

  // Don't show the stats bar if no stats exist
  if (!hasHomeStats && !hasAwayStats) {
    return null;
  }

  // Compact view for fixture cards - ONLY corners and cards with numbered counters
  return (
    <div className="flex items-center justify-between text-xs mt-2 px-3 py-2 bg-black/40 rounded border border-purple-900/30">
      {/* Home Team Stats - Left Aligned */}
      <div className="flex flex-col gap-1.5">
        {/* Corners - only show if > 0 */}
        {stats.home.corners !== undefined && stats.home.corners > 0 && (
          <div className="flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-purple-300 font-semibold">
              Corners ({stats.home.corners})
            </span>
          </div>
        )}
        
        {/* Yellow Cards - only show if > 0 */}
        {stats.home.yellowCards !== undefined && stats.home.yellowCards > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-3.5 bg-yellow-400 rounded-sm" />
            <span className="text-yellow-300 font-semibold">
              Yellow ({stats.home.yellowCards})
            </span>
          </div>
        )}
        
        {/* Red Cards - only show if > 0 */}
        {stats.home.redCards !== undefined && stats.home.redCards > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-3.5 bg-red-500 rounded-sm" />
            <span className="text-red-300 font-semibold">
              Red ({stats.home.redCards})
            </span>
          </div>
        )}
      </div>

      {/* Away Team Stats - Right Aligned */}
      <div className="flex flex-col gap-1.5 items-end">
        {/* Corners - only show if > 0 */}
        {stats.away.corners !== undefined && stats.away.corners > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-purple-300 font-semibold">
              Corners ({stats.away.corners})
            </span>
            <Flag className="w-3.5 h-3.5 text-purple-400" />
          </div>
        )}
        
        {/* Yellow Cards - only show if > 0 */}
        {stats.away.yellowCards !== undefined && stats.away.yellowCards > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-300 font-semibold">
              Yellow ({stats.away.yellowCards})
            </span>
            <div className="w-2.5 h-3.5 bg-yellow-400 rounded-sm" />
          </div>
        )}
        
        {/* Red Cards - only show if > 0 */}
        {stats.away.redCards !== undefined && stats.away.redCards > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-red-300 font-semibold">
              Red ({stats.away.redCards})
            </span>
            <div className="w-2.5 h-3.5 bg-red-500 rounded-sm" />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMatchStats;
