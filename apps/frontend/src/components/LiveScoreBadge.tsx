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

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Live Indicator */}
      {isLive && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-white text-xs font-bold">LIVE</span>
          </div>
          {elapsed && (
            <span className="text-sm font-semibold text-gray-300">
              {elapsed}'
            </span>
          )}
        </div>
      )}

      {/* Score Display */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-gray-300">{homeTeam}</span>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-800 rounded-lg border border-gray-700">
          <span className={`text-2xl font-bold ${isLive ? 'text-green-400' : 'text-white'}`}>
            {homeScore}
          </span>
          <span className="text-gray-500">-</span>
          <span className={`text-2xl font-bold ${isLive ? 'text-green-400' : 'text-white'}`}>
            {awayScore}
          </span>
        </div>

        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-gray-300">{awayTeam}</span>
        </div>
      </div>

      {/* Status Badge */}
      {!isLive && (
        <div className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
          {status === 'NS' && 'Not Started'}
          {status === 'FT' && 'Full Time'}
          {status === 'PST' && 'Postponed'}
          {status === 'CANC' && 'Cancelled'}
          {status === 'ABD' && 'Abandoned'}
        </div>
      )}

      {/* Connection Status */}
      {isLive && !isConnected && (
        <div className="text-xs text-yellow-500">
          Reconnecting...
        </div>
      )}
    </div>
  );
};
