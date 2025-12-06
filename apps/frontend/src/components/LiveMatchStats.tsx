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

  // Convert to numbers to handle API returning strings
  const homeCorners = Number(stats.home.corners) || 0;
  const homeYellow = Number(stats.home.yellowCards) || 0;
  const homeRed = Number(stats.home.redCards) || 0;
  const awayCorners = Number(stats.away.corners) || 0;
  const awayYellow = Number(stats.away.yellowCards) || 0;
  const awayRed = Number(stats.away.redCards) || 0;

  const hasHomeStats = homeCorners > 0 || homeYellow > 0 || homeRed > 0;
  const hasAwayStats = awayCorners > 0 || awayYellow > 0 || awayRed > 0;

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
        {homeCorners > 0 && (
          <div className="flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-purple-300 font-semibold">
              Corners ({homeCorners})
            </span>
          </div>
        )}
        
        {/* Yellow Cards - only show if > 0 */}
        {homeYellow > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-3.5 bg-yellow-400 rounded-sm" />
            <span className="text-yellow-300 font-semibold">
              Yellow ({homeYellow})
            </span>
          </div>
        )}
        
        {/* Red Cards - only show if > 0 */}
        {homeRed > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-3.5 bg-red-500 rounded-sm" />
            <span className="text-red-300 font-semibold">
              Red ({homeRed})
            </span>
          </div>
        )}
      </div>

      {/* Away Team Stats - Right Aligned */}
      <div className="flex flex-col gap-1.5 items-end">
        {/* Corners - only show if > 0 */}
        {awayCorners > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-purple-300 font-semibold">
              Corners ({awayCorners})
            </span>
            <Flag className="w-3.5 h-3.5 text-purple-400" />
          </div>
        )}
        
        {/* Yellow Cards - only show if > 0 */}
        {awayYellow > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-300 font-semibold">
              Yellow ({awayYellow})
            </span>
            <div className="w-2.5 h-3.5 bg-yellow-400 rounded-sm" />
          </div>
        )}
        
        {/* Red Cards - only show if > 0 */}
        {awayRed > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-red-300 font-semibold">
              Red ({awayRed})
            </span>
            <div className="w-2.5 h-3.5 bg-red-500 rounded-sm" />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMatchStats;
