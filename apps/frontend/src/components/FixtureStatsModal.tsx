import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Users, Target, Activity } from 'lucide-react';
import { fixturesApi } from '../services/api';

interface FixtureStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixtureId: number;
  homeTeamId: number;
  awayTeamId: number;
  homeTeam: string;
  awayTeam: string;
  leagueId: number;
  season: number;
}

export const FixtureStatsModal: React.FC<FixtureStatsModalProps> = ({
  isOpen,
  onClose,
  fixtureId,
  homeTeamId,
  awayTeamId,
  homeTeam,
  awayTeam,
  leagueId,
  season,
}) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen, fixtureId]);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fixturesApi.getFixtureStats(
        fixtureId,
        homeTeamId,
        awayTeamId,
        leagueId,
        season
      );
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-gray-900 rounded-lg border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {homeTeam} vs {awayTeam} - Statistics
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-300">
              {error}
            </div>
          )}

          {stats && !loading && (
            <div className="space-y-6">
              {/* Head to Head */}
              {stats.h2h && stats.h2h.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Head to Head (Last {stats.h2h.length} Matches)
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {stats.h2h.map((match: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-gray-800 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-400">
                            {new Date(match.date).toLocaleDateString()}
                          </span>
                          <span className="text-white">
                            {match.homeTeam} vs {match.awayTeam}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-white">
                            {match.homeScore} - {match.awayScore}
                          </span>
                          <span className={`
                            px-2 py-1 rounded text-xs font-medium
                            ${match.winner === homeTeam ? 'bg-green-900/50 text-green-300' : ''}
                            ${match.winner === awayTeam ? 'bg-red-900/50 text-red-300' : ''}
                            ${match.winner === 'Draw' ? 'bg-gray-700 text-gray-300' : ''}
                          `}>
                            {match.winner}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Home Team Stats */}
              {stats.homeTeam && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">
                      {homeTeam} Statistics
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                      label="Matches Played"
                      value={stats.homeTeam.matchesPlayed}
                    />
                    <StatCard
                      label="Wins"
                      value={stats.homeTeam.wins}
                      color="green"
                    />
                    <StatCard
                      label="Draws"
                      value={stats.homeTeam.draws}
                      color="gray"
                    />
                    <StatCard
                      label="Losses"
                      value={stats.homeTeam.losses}
                      color="red"
                    />
                    <StatCard
                      label="Goals For"
                      value={stats.homeTeam.goalsFor}
                    />
                    <StatCard
                      label="Goals Against"
                      value={stats.homeTeam.goalsAgainst}
                    />
                    <StatCard
                      label="Clean Sheets"
                      value={stats.homeTeam.cleanSheets}
                    />
                    <StatCard
                      label="Form"
                      value={stats.homeTeam.form || 'N/A'}
                    />
                  </div>
                </div>
              )}

              {/* Away Team Stats */}
              {stats.awayTeam && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">
                      {awayTeam} Statistics
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                      label="Matches Played"
                      value={stats.awayTeam.matchesPlayed}
                    />
                    <StatCard
                      label="Wins"
                      value={stats.awayTeam.wins}
                      color="green"
                    />
                    <StatCard
                      label="Draws"
                      value={stats.awayTeam.draws}
                      color="gray"
                    />
                    <StatCard
                      label="Losses"
                      value={stats.awayTeam.losses}
                      color="red"
                    />
                    <StatCard
                      label="Goals For"
                      value={stats.awayTeam.goalsFor}
                    />
                    <StatCard
                      label="Goals Against"
                      value={stats.awayTeam.goalsAgainst}
                    />
                    <StatCard
                      label="Clean Sheets"
                      value={stats.awayTeam.cleanSheets}
                    />
                    <StatCard
                      label="Form"
                      value={stats.awayTeam.form || 'N/A'}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  color?: 'green' | 'red' | 'gray' | 'blue';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => {
  const colorClasses = {
    green: 'text-green-400',
    red: 'text-red-400',
    gray: 'text-gray-400',
    blue: 'text-blue-400',
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color ? colorClasses[color] : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
};
