import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Users, Target, Trophy, Calendar } from 'lucide-react';
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
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCompleteData();
    }
  }, [isOpen, fixtureId]);

  const loadCompleteData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fixturesApi.getComplete(fixtureId);
      setData(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load fixture data');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const homeStanding = data?.standings?.find((s: any) => s.team?.id === homeTeamId);
  const awayStanding = data?.standings?.find((s: any) => s.team?.id === awayTeamId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-gray-900 rounded-lg border border-gray-700 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {homeTeam} vs {awayTeam}
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

          {data && !loading && (
            <div className="space-y-6">
              {/* League Standings */}
              {(homeStanding || awayStanding) && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-white">
                      League Standings
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {homeStanding && (
                      <StandingCard
                        team={homeTeam}
                        standing={homeStanding}
                        isHome={true}
                      />
                    )}
                    {awayStanding && (
                      <StandingCard
                        team={awayTeam}
                        standing={awayStanding}
                        isHome={false}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Head to Head */}
              {data.h2h?.matches && data.h2h.matches.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Head to Head
                    </h3>
                  </div>
                  
                  {/* H2H Stats Summary */}
                  {data.h2h.stats && (
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {data.h2h.stats.homeWins || 0}
                        </div>
                        <div className="text-sm text-gray-400">{homeTeam} Wins</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-gray-400">
                          {data.h2h.stats.draws || 0}
                        </div>
                        <div className="text-sm text-gray-400">Draws</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-red-400">
                          {data.h2h.stats.awayWins || 0}
                        </div>
                        <div className="text-sm text-gray-400">{awayTeam} Wins</div>
                      </div>
                    </div>
                  )}

                  {/* Recent Matches */}
                  <div className="space-y-2">
                    {data.h2h.matches.slice(0, 5).map((match: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-gray-800 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-400">
                            {new Date(match.date).toLocaleDateString()}
                          </span>
                          <span className="text-white text-sm">
                            {match.homeTeam} vs {match.awayTeam}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">
                            {match.score.home} - {match.score.away}
                          </span>
                          <span className="text-xs text-gray-500">{match.league}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Statistics (if available) */}
              {data.statistics && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Match Statistics
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-400">{homeTeam}</h4>
                      <StatRow label="Possession" value={data.statistics.home?.possession || '0%'} />
                      <StatRow label="Shots" value={data.statistics.home?.totalShots || 0} />
                      <StatRow label="Shots on Target" value={data.statistics.home?.shotsOnGoal || 0} />
                      <StatRow label="Corners" value={data.statistics.home?.corners || 0} />
                      <StatRow label="Fouls" value={data.statistics.home?.fouls || 0} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-400">{awayTeam}</h4>
                      <StatRow label="Possession" value={data.statistics.away?.possession || '0%'} />
                      <StatRow label="Shots" value={data.statistics.away?.totalShots || 0} />
                      <StatRow label="Shots on Target" value={data.statistics.away?.shotsOnGoal || 0} />
                      <StatRow label="Corners" value={data.statistics.away?.corners || 0} />
                      <StatRow label="Fouls" value={data.statistics.away?.fouls || 0} />
                    </div>
                  </div>
                </div>
              )}

              {/* Upcoming Fixtures */}
              {(data.homeUpcoming?.length > 0 || data.awayUpcoming?.length > 0) && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Upcoming Fixtures
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.homeUpcoming?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-green-400 mb-2">{homeTeam}</h4>
                        <div className="space-y-2">
                          {data.homeUpcoming.slice(0, 3).map((fixture: any, idx: number) => (
                            <UpcomingFixtureCard key={idx} fixture={fixture} />
                          ))}
                        </div>
                      </div>
                    )}
                    {data.awayUpcoming?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-red-400 mb-2">{awayTeam}</h4>
                        <div className="space-y-2">
                          {data.awayUpcoming.slice(0, 3).map((fixture: any, idx: number) => (
                            <UpcomingFixtureCard key={idx} fixture={fixture} />
                          ))}
                        </div>
                      </div>
                    )}
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

// Standing Card Component
const StandingCard: React.FC<{ team: string; standing: any; isHome: boolean }> = ({ team, standing, isHome }) => (
  <div className={`bg-gray-800 rounded-lg p-4 border-l-4 ${isHome ? 'border-green-400' : 'border-red-400'}`}>
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-semibold text-white">{team}</h4>
      <span className="text-2xl font-bold text-blue-400">#{standing.rank}</span>
    </div>
    <div className="grid grid-cols-3 gap-2 text-sm">
      <div>
        <div className="text-gray-400">Played</div>
        <div className="font-semibold text-white">{standing.all?.played || 0}</div>
      </div>
      <div>
        <div className="text-gray-400">Points</div>
        <div className="font-semibold text-white">{standing.points || 0}</div>
      </div>
      <div>
        <div className="text-gray-400">GD</div>
        <div className="font-semibold text-white">{standing.goalsDiff || 0}</div>
      </div>
    </div>
    <div className="mt-2 text-xs text-gray-400">
      W: {standing.all?.win || 0} | D: {standing.all?.draw || 0} | L: {standing.all?.lose || 0}
    </div>
    {standing.form && (
      <div className="mt-2 flex gap-1">
        {standing.form.split('').slice(0, 5).map((result: string, idx: number) => (
          <span
            key={idx}
            className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
              result === 'W' ? 'bg-green-600 text-white' :
              result === 'D' ? 'bg-gray-600 text-white' :
              'bg-red-600 text-white'
            }`}
          >
            {result}
          </span>
        ))}
      </div>
    )}
  </div>
);

// Stat Row Component
const StatRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-400">{label}</span>
    <span className="text-white font-semibold">{value}</span>
  </div>
);

// Upcoming Fixture Card Component
const UpcomingFixtureCard: React.FC<{ fixture: any }> = ({ fixture }) => (
  <div className="bg-gray-800 rounded p-2 text-sm">
    <div className="text-gray-400 text-xs mb-1">
      {new Date(fixture.date).toLocaleDateString()}
    </div>
    <div className="text-white">
      {fixture.homeTeam} vs {fixture.awayTeam}
    </div>
    <div className="text-gray-500 text-xs">{fixture.league}</div>
  </div>
);

export default FixtureStatsModal;
