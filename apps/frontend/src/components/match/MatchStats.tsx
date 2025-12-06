import React, { useState } from 'react';
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

// Individual stat box component
const StatBox: React.FC<{
  label: string;
  value: string | number;
  teamColor: 'blue' | 'red';
}> = ({ label, value, teamColor }) => {
  const colorClasses = teamColor === 'blue' 
    ? 'border-blue-500/30 bg-blue-950/20' 
    : 'border-red-500/30 bg-red-950/20';
  
  const textColor = teamColor === 'blue' ? 'text-blue-400' : 'text-red-400';

  return (
    <div className={`border ${colorClasses} rounded-lg p-3`}>
      <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className={`text-2xl font-bold ${textColor}`}>
        {value}
      </div>
    </div>
  );
};

export default function MatchStats({ stats, homeTeam = 'Home', awayTeam = 'Away' }: MatchStatsProps) {
  const [showAllStats, setShowAllStats] = useState(false);

  if (!stats || stats.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500 text-sm">No statistics available yet</p>
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

  const displayStats = showAllStats ? stats : (essentialStats.length > 0 ? essentialStats : stats.slice(0, 8));

  // Format stat value
  const formatValue = (value: any, type: string) => {
    if (value === null || value === undefined) return '0';
    
    // Handle percentage stats
    if (type?.toLowerCase().includes('possession') || 
        type?.toLowerCase().includes('accuracy')) {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return `${num}%`;
    }
    
    return String(value);
  };

  return (
    <div className="bg-[#0a0a0a]">
      {/* Team Headers */}
      <div className="grid grid-cols-2 gap-4 mb-4 px-4 py-3 bg-gray-900/30 border-b border-gray-800">
        <div className="text-center">
          <div className="text-sm font-bold text-blue-400 uppercase tracking-wide">
            {homeTeam}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-red-400 uppercase tracking-wide">
            {awayTeam}
          </div>
        </div>
      </div>

      {/* Stats Grid - Two Columns */}
      <div className="px-4 pb-4">
        {displayStats.map((stat, index) => (
          <div key={index} className="grid grid-cols-2 gap-4 mb-3">
            {/* Home Team Stat */}
            <StatBox
              label={stat.type || 'Stat'}
              value={formatValue(stat.home, stat.type)}
              teamColor="blue"
            />
            
            {/* Away Team Stat */}
            <StatBox
              label={stat.type || 'Stat'}
              value={formatValue(stat.away, stat.type)}
              teamColor="red"
            />
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {detailedStats.length > 0 && (
        <button
          onClick={() => setShowAllStats(!showAllStats)}
          className="w-full px-4 py-3 flex items-center justify-center gap-2 bg-gray-900/30 hover:bg-gray-900/50 transition-colors border-t border-gray-800"
        >
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {showAllStats ? 'Show Less' : `Show ${detailedStats.length} More Stats`}
          </span>
          {showAllStats ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
      )}

      {/* Stats Summary */}
      <div className="px-4 py-3 bg-gray-900/30 border-t border-gray-800">
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="text-[10px] text-gray-600 uppercase tracking-wide">Total Stats</div>
            <div className="text-sm font-bold text-white">{stats.length}</div>
          </div>
          <div className="w-px h-8 bg-gray-800" />
          <div className="text-center">
            <div className="text-[10px] text-gray-600 uppercase tracking-wide">Showing</div>
            <div className="text-sm font-bold text-white">{displayStats.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
