import React, { useEffect, useState } from 'react';
import { BarChart3, Loader, AlertCircle, Target, Flag, Activity } from 'lucide-react';
import { fixturesApi } from '../../../services/api';

interface MatchStatsProps {
  fixture: any;
}

interface TeamStats {
  shots?: { total: number; on: number };
  corners?: number;
  fouls?: number;
  yellowCards?: number;
  redCards?: number;
  possession?: number;
  attacks?: number;
  dangerousAttacks?: number;
}

interface FixtureStats {
  home: TeamStats;
  away: TeamStats;
}

const MatchStats: React.FC<MatchStatsProps> = ({ fixture }) => {
  const [stats, setStats] = useState<FixtureStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [fixture.id]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fixturesApi.getFixtureStats(
        fixture.id || fixture.fixtureId,
        fixture.homeTeamId,
        fixture.awayTeamId,
        fixture.leagueId,
        fixture.season
      );

      if (response.success) {
        setStats(response.data);
      } else {
        setError('Stats not available');
      }
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setError(err.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const renderStatBar = (label: string, homeValue: number, awayValue: number, icon?: React.ReactNode) => {
    const total = homeValue + awayValue || 1;
    const homePercent = (homeValue / total) * 100;
    const awayPercent = (awayValue / total) * 100;

    return (
      <div className="mb-4 bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-lg p-3 border border-gray-700/50 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-white font-semibold drop-shadow-lg">{homeValue}</span>
          <div className="flex items-center gap-2 text-gray-400">
            {icon}
            <span>{label}</span>
          </div>
          <span className="text-white font-semibold drop-shadow-lg">{awayValue}</span>
        </div>
        <div className="flex h-2.5 bg-gray-700/50 rounded-full overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500 shadow-lg"
            style={{ width: `${homePercent}%` }}
          />
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 shadow-lg"
            style={{ width: `${awayPercent}%` }}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-12">
        <div className="relative">
          <Loader className="w-8 h-8 text-purple-400 animate-spin mb-3 drop-shadow-lg" />
          <div className="absolute inset-0 blur-xl bg-purple-500/20 animate-pulse"></div>
        </div>
        <p className="text-gray-400">Loading match statistics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 drop-shadow-lg" />
            <div>
              <div className="text-sm font-semibold text-yellow-400 mb-1">
                Statistics Not Available
              </div>
              <p className="text-xs text-gray-300">
                Match statistics will be available during and after the match.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-purple-400 drop-shadow-lg" />
        <h2 className="text-lg font-bold text-white drop-shadow-lg">Match Statistics</h2>
      </div>

      {/* Team Names */}
      <div className="flex items-center justify-between mb-6 text-sm bg-gradient-to-r from-purple-900/30 via-gray-900/30 to-blue-900/30 rounded-lg p-3 border border-gray-700/50 shadow-lg">
        <span className="text-purple-400 font-semibold drop-shadow-lg">{fixture.homeTeamName || fixture.homeTeam}</span>
        <span className="text-blue-400 font-semibold drop-shadow-lg">{fixture.awayTeamName || fixture.awayTeam}</span>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        {/* Possession */}
        {stats.home.possession !== undefined && stats.away.possession !== undefined && (
          <div className="mb-4 bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-lg p-3 border border-gray-700/50 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-white font-semibold drop-shadow-lg">{stats.home.possession}%</span>
              <div className="flex items-center gap-2 text-gray-400">
                <Activity className="w-4 h-4" />
                <span>Possession</span>
              </div>
              <span className="text-white font-semibold drop-shadow-lg">{stats.away.possession}%</span>
            </div>
            <div className="flex h-2.5 bg-gray-700/50 rounded-full overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500 shadow-lg"
                style={{ width: `${stats.home.possession}%` }}
              />
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 shadow-lg"
                style={{ width: `${stats.away.possession}%` }}
              />
            </div>
          </div>
        )}

        {/* Shots */}
        {stats.home.shots && stats.away.shots && (
          renderStatBar(
            'Shots',
            stats.home.shots.total || 0,
            stats.away.shots.total || 0,
            <Target className="w-4 h-4" />
          )
        )}

        {/* Shots on Target */}
        {stats.home.shots && stats.away.shots && (
          renderStatBar(
            'Shots on Target',
            stats.home.shots.on || 0,
            stats.away.shots.on || 0,
            <Target className="w-4 h-4" />
          )
        )}

        {/* Corners */}
        {stats.home.corners !== undefined && stats.away.corners !== undefined && (
          renderStatBar(
            'Corners',
            stats.home.corners,
            stats.away.corners,
            <Flag className="w-4 h-4" />
          )
        )}

        {/* Yellow Cards */}
        {stats.home.yellowCards !== undefined && stats.away.yellowCards !== undefined && (
          renderStatBar(
            'Yellow Cards',
            stats.home.yellowCards,
            stats.away.yellowCards
          )
        )}

        {/* Red Cards */}
        {stats.home.redCards !== undefined && stats.away.redCards !== undefined && (
          renderStatBar(
            'Red Cards',
            stats.home.redCards,
            stats.away.redCards
          )
        )}

        {/* Fouls */}
        {stats.home.fouls !== undefined && stats.away.fouls !== undefined && (
          renderStatBar(
            'Fouls',
            stats.home.fouls,
            stats.away.fouls
          )
        )}

        {/* Attacks */}
        {stats.home.attacks !== undefined && stats.away.attacks !== undefined && (
          renderStatBar(
            'Attacks',
            stats.home.attacks,
            stats.away.attacks
          )
        )}

        {/* Dangerous Attacks */}
        {stats.home.dangerousAttacks !== undefined && stats.away.dangerousAttacks !== undefined && (
          renderStatBar(
            'Dangerous Attacks',
            stats.home.dangerousAttacks,
            stats.away.dangerousAttacks
          )
        )}
      </div>
    </div>
  );
};

export default MatchStats;
