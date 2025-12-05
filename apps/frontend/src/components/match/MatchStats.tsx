import React, { useState } from 'react';
import { CompactStatBar } from './CompactStatBar';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MatchStatsProps {
  stats: any[];
  homeTeam?: string;
  awayTeam?: string;
}

// Essential stats that are always visible
const ESSENTIAL_STATS = [
  'Ball Possession',
  'Total Shots',
  'Shots on Goal',
  'Shots off Goal',
  'Corner Kicks',
  'Fouls',
  'Yellow Cards',
  'Red Cards',
];

export default function MatchStats({ stats, homeTeam = 'Home', awayTeam = 'Away' }: MatchStatsProps) {
  const [showAllStats, setShowAllStats] = useState(false);

  if (!stats || stats.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-gray-500 text-sm mb-1">No statistics available</div>
          <div className="text-gray-600 text-xs">Stats will appear once the match starts</div>
        </div>
      </div>
    );
  }

  // Separate essential and detailed stats
  const essentialStats = stats.filter(stat => 
    ESSENTIAL_STATS.includes(stat.type)
  );
  
  const detailedStats = stats.filter(stat => 
    !ESSENTIAL_STATS.includes(stat.type)
  );

  const renderStat = (stat: any, index: number) => {
    const homeValue = typeof stat.home === 'string' ? parseFloat(stat.home) || 0 : stat.home || 0;
    const awayValue = typeof stat.away === 'string' ? parseFloat(stat.away) || 0 : stat.away || 0;
    
    // Determine if it's a percentage stat
    const isPercentage = stat.type?.toLowerCase().includes('possession') || 
                         stat.type?.toLowerCase().includes('accuracy');

    return (
      <CompactStatBar
        key={index}
        label={stat.type || 'Stat'}
        homeValue={homeValue}
        awayValue={awayValue}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        format={isPercentage ? 'percentage' : 'number'}
        className="border-b border-gray-800/50 last:border-b-0"
      />
    );
  };

  return (
    <div className="bg-[#0a0a0a]">
      {/* Team Names Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900/50 border-b border-gray-800">
        <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide">
          {homeTeam}
        </span>
        <span className="text-[9px] text-gray-600">VS</span>
        <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">
          {awayTeam}
        </span>
      </div>

      {/* Essential Stats */}
      <div className="px-2">
        {essentialStats.length > 0 ? (
          essentialStats.map(renderStat)
        ) : (
          stats.slice(0, 8).map(renderStat)
        )}
      </div>

      {/* Detailed Stats (Collapsible) */}
      {detailedStats.length > 0 && (
        <>
          <button
            onClick={() => setShowAllStats(!showAllStats)}
            className="w-full px-4 py-2 flex items-center justify-center gap-2 bg-gray-900/30 hover:bg-gray-900/50 transition-colors border-t border-gray-800"
          >
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
              {showAllStats ? 'Show Less' : 'Show More Stats'}
            </span>
            {showAllStats ? (
              <ChevronUp className="w-3 h-3 text-gray-500" />
            ) : (
              <ChevronDown className="w-3 h-3 text-gray-500" />
            )}
          </button>

          {showAllStats && (
            <div className="px-2 border-t border-gray-800">
              {detailedStats.map(renderStat)}
            </div>
          )}
        </>
      )}

      {/* Stats Summary */}
      <div className="px-4 py-2 bg-gray-900/30 border-t border-gray-800">
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="text-[9px] text-gray-600 uppercase">Total Stats</div>
            <div className="text-xs font-bold text-white">{stats.length}</div>
          </div>
          <div className="w-px h-6 bg-gray-800" />
          <div className="text-center">
            <div className="text-[9px] text-gray-600 uppercase">Showing</div>
            <div className="text-xs font-bold text-white">
              {showAllStats ? stats.length : Math.min(essentialStats.length || 8, stats.length)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
