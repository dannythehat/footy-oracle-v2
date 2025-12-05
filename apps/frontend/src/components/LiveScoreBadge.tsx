import React from 'react';
import { useLiveScore } from '../hooks/useLiveScore';

interface LiveScoreBadgeProps {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  initialHomeScore?: number;
  initialAwayScore?: number;
}

export const LiveScoreBadge: React.FC<LiveScoreBadgeProps> = ({
  fixtureId,
  homeTeam,
  awayTeam,
  initialHomeScore = 0,
  initialAwayScore = 0,
}) => {
  const { liveScore, isConnected } = useLiveScore(fixtureId);

  const homeScore = liveScore?.homeScore ?? initialHomeScore;
  const awayScore = liveScore?.awayScore ?? initialAwayScore;
  const status = liveScore?.status || 'NS';
  const elapsed = liveScore?.elapsed;

  const isLive = status === 'LIVE' || status === '1H' || status === '2H' || status === 'HT';

  // Truncate team names for mobile
  const truncateTeam = (name: string, maxLength: number = 12) => {
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
  };

  return (
    <div className="flex items-center justify-center gap-2 w-full">
      {/* Single-line compact layout */}
      <div className="flex items-center gap-2 px-2 py-1 bg-gray-800/50 rounded border border-gray-700/50 w-full max-w-md">
        {/* Live Indicator - Compact */}
        {isLive && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-500 rounded-full flex-shrink-0">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="text-white text-[8px] font-bold">LIVE</span>
          </div>
        )}

        {/* Home Team */}
        <span className="text-[11px] font-medium text-gray-300 truncate flex-1 text-right">
          {truncateTeam(homeTeam)}
        </span>

        {/* Score Display - Compact */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-900 rounded flex-shrink-0">
          <span className={`text-sm font-bold ${isLive ? 'text-green-400' : 'text-white'}`}>
            {homeScore}
          </span>
          <span className="text-gray-500 text-xs">-</span>
          <span className={`text-sm font-bold ${isLive ? 'text-green-400' : 'text-white'}`}>
            {awayScore}
          </span>
        </div>

        {/* Away Team */}
        <span className="text-[11px] font-medium text-gray-300 truncate flex-1 text-left">
          {truncateTeam(awayTeam)}
        </span>

        {/* Time/Status - Compact */}
        {isLive && elapsed ? (
          <span className="text-[10px] font-semibold text-red-400 flex-shrink-0">
            {elapsed}'
          </span>
        ) : (
          <div className="flex-shrink-0">
            <div className="px-1.5 py-0.5 bg-gray-700/50 rounded text-[9px] text-gray-400">
              {status === 'NS' && 'NS'}
              {status === 'FT' && 'FT'}
              {status === 'PST' && 'PST'}
              {status === 'CANC' && 'CANC'}
              {status === 'ABD' && 'ABD'}
              {status === 'HT' && 'HT'}
            </div>
          </div>
        )}

        {/* Connection Status - Minimal */}
        {isLive && !isConnected && (
          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse flex-shrink-0" title="Reconnecting..." />
        )}
      </div>
    </div>
  );
};
