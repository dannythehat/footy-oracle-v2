import React from 'react';
import { BarChart3, AlertCircle } from 'lucide-react';

interface MatchStatsProps {
  fixture: any;
}

interface StatItem {
  label: string;
  home: number | string;
  away: number | string;
}

const MatchStats: React.FC<MatchStatsProps> = ({ fixture }) => {
  if (!fixture) {
    return (
      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">No fixture data available</span>
        </div>
      </div>
    );
  }

  const stats: StatItem[] = [
    {
      label: 'Ball Possession',
      home: fixture.stats?.ballPossession?.home ?? fixture.stats?.possession?.home ?? '-',
      away: fixture.stats?.ballPossession?.away ?? fixture.stats?.possession?.away ?? '-',
    },
    {
      label: 'Shots',
      home: fixture.stats?.totalShots?.home ?? fixture.stats?.shots?.total?.home ?? '-',
      away: fixture.stats?.totalShots?.away ?? fixture.stats?.shots?.total?.away ?? '-',
    },
    {
      label: 'Shots on Target',
      home: fixture.stats?.shotsOnTarget?.home ?? fixture.stats?.shots?.on?.home ?? '-',
      away: fixture.stats?.shotsOnTarget?.away ?? fixture.stats?.shots?.on?.away ?? '-',
    },
    {
      label: 'Corners',
      home: fixture.stats?.corners?.home ?? '-',
      away: fixture.stats?.corners?.away ?? '-',
    },
    {
      label: 'Fouls',
      home: fixture.stats?.fouls?.home ?? '-',
      away: fixture.stats?.fouls?.away ?? '-',
    },
    {
      label: 'Yellow Cards',
      home: fixture.stats?.yellowCards?.home ?? '-',
      away: fixture.stats?.yellowCards?.away ?? '-',
    },
    {
      label: 'Red Cards',
      home: fixture.stats?.redCards?.home ?? '-',
      away: fixture.stats?.redCards?.away ?? '-',
    },
  ];

  const hasStats = stats.some(stat => stat.home !== '-' || stat.away !== '-');

  if (!hasStats) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Match Statistics</h3>
        </div>
        <div className="text-center py-8 text-gray-500 text-sm">
          Statistics will be available during or after the match
        </div>
      </div>
    );
  }

  const getPercentage = (home: number | string, away: number | string) => {
    const homeNum = typeof home === 'string' ? parseFloat(home) : home;
    const awayNum = typeof away === 'string' ? parseFloat(away) : away;
    
    if (isNaN(homeNum) || isNaN(awayNum) || (homeNum + awayNum) === 0) {
      return { home: 50, away: 50 };
    }
    
    const total = homeNum + awayNum;
    return {
      home: (homeNum / total) * 100,
      away: (awayNum / total) * 100,
    };
  };

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-900">Match Statistics</h3>
      </div>

      <div className="space-y-4">
        {stats.map((stat, index) => {
          const percentage = getPercentage(stat.home, stat.away);
          
          return (
            <div key={index}>
              {/* Values */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-900">{stat.home}</span>
                <span className="text-xs text-gray-600">{stat.label}</span>
                <span className="text-sm font-semibold text-gray-900">{stat.away}</span>
              </div>
              
              {/* Progress Bar */}
              <div className="flex h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 transition-all"
                  style={{ width: `${percentage.home}%` }}
                />
                <div 
                  className="bg-red-500 transition-all"
                  style={{ width: `${percentage.away}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MatchStats;
