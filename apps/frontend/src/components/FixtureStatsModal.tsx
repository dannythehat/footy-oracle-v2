import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Users, Target, Trophy, Calendar } from 'lucide-react';
import { fixturesApi } from '../services/api';
import { LeagueLogo } from './LeagueLogo';
import { TeamLogo } from './TeamLogo';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
      <div className="bg-[#0a0a0a] rounded-lg border border-gray-800 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with Team Logos */}
        <div className="sticky top-0 bg-[#0a0a0a] border-b border-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TeamLogo teamId={homeTeamId} teamName={homeTeam} size="md" />
            <h2 className="text-lg font-semibold">
              <span className="text-white">{homeTeam}</span>
              <span className="text-gray-600 mx-2">vs</span>
              <span className="text-white">{awayTeam}</span>
            </h2>
            <TeamLogo teamId={awayTeamId} teamName={awayTeam} size="md" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-900 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-800 border-t-blue-500" />
            </div>
          )}

          {error && (
            <div className="bg-red-950/30 border border-red-900/50 rounded p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {data && !loading && (
            <div className="space-y-4">
              {/* League Standings - Compact Boxes */}
              {(homeStanding || awayStanding) && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <h3 className="text-sm font-semibold text-white">League Standings</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {homeStanding && (
                      <StandingCard
                        team={homeTeam}
                        teamId={homeTeamId}
                        standing={homeStanding}
                        isHome={true}
                      />
                    )}
                    {awayStanding && (
                      <StandingCard
                        team={awayTeam}
                        teamId={awayTeamId}
                        standing={awayStanding}
                        isHome={false}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Head to Head - Compact */}
              {data.h2h?.matches && data.h2h.matches.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-blue-500" />
                    <h3 className="text-sm font-semibold text-white">Head to Head</h3>
                  </div>
                  
                  {/* H2H Stats Summary - Flat Boxes */}
                  {data.h2h.stats && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-[#0f0f0f] border border-gray-800 rounded p-2.5 text-center">
                        <div className="text-xl font-bold text-green-500">
                          {data.h2h.stats.homeWins || 0}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{homeTeam} Wins</div>
                      </div>
                      <div className="bg-[#0f0f0f] border border-gray-800 rounded p-2.5 text-center">
                        <div className="text-xl font-bold text-gray-400">
                          {data.h2h.stats.draws || 0}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">Draws</div>
                      </div>
                      <div className="bg-[#0f0f0f] border border-gray-800 rounded p-2.5 text-center">
                        <div className="text-xl font-bold text-red-500">
                          {data.h2h.stats.awayWins || 0}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{awayTeam} Wins</div>
                      </div>
                    </div>
                  )}

                  {/* Recent Matches with Team Logos */}
                  <div className="space-y-1.5">
                    {data.h2h.matches.slice(0, 5).map((match: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-[#0f0f0f] border border-gray-800 rounded p-2.5 flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-600 w-20">
                            {new Date(match.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </span>
                          <div className="flex items-center gap-2">
                            <TeamLogo teamId={match.homeTeamId} teamName={match.homeTeam} size="sm" />
                            <span className="text-white text-xs">{match.homeTeam}</span>
                            <span className="text-gray-600 text-xs">vs</span>
                            <span className="text-white text-xs">{match.awayTeam}</span>
                            <TeamLogo teamId={match.awayTeamId} teamName={match.awayTeam} size="sm" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">
                            {match.score.home} - {match.score.away}
                          </span>
                          <span className="text-xs text-gray-600">{match.league}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Statistics - Compact Side by Side */}
              {data.statistics && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-purple-500" />
                    <h3 className="text-sm font-semibold text-white">Match Statistics</h3>
                  </div>
                  <div className="bg-[#0f0f0f] border border-gray-800 rounded p-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <TeamLogo teamId={homeTeamId} teamName={homeTeam} size="sm" />
                          <h4 className="font-semibold text-green-500 text-sm">{homeTeam}</h4>
                        </div>
                        <StatRow label="Possession" value={data.statistics.home?.possession || '0%'} />
                        <StatRow label="Shots" value={data.statistics.home?.totalShots || 0} />
                        <StatRow label="On Target" value={data.statistics.home?.shotsOnGoal || 0} />
                        <StatRow label="Corners" value={data.statistics.home?.corners || 0} />
                        <StatRow label="Fouls" value={data.statistics.home?.fouls || 0} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <TeamLogo teamId={awayTeamId} teamName={awayTeam} size="sm" />
                          <h4 className="font-semibold text-red-500 text-sm">{awayTeam}</h4>
                        </div>
                        <StatRow label="Possession" value={data.statistics.away?.possession || '0%'} />
                        <StatRow label="Shots" value={data.statistics.away?.totalShots || 0} />
                        <StatRow label="On Target" value={data.statistics.away?.shotsOnGoal || 0} />
                        <StatRow label="Corners" value={data.statistics.away?.corners || 0} />
                        <StatRow label="Fouls" value={data.statistics.away?.fouls || 0} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Upcoming Fixtures with Team Logos */}
              {(data.homeUpcoming?.length > 0 || data.awayUpcoming?.length > 0) && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-cyan-500" />
                    <h3 className="text-sm font-semibold text-white">Upcoming Fixtures</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.homeUpcoming?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <TeamLogo teamId={homeTeamId} teamName={homeTeam} size="sm" />
                          <h4 className="font-semibold text-green-500 text-xs">{homeTeam}</h4>
                        </div>
                        <div className="space-y-1.5">
                          {data.homeUpcoming.slice(0, 3).map((fixture: any, idx: number) => (
                            <UpcomingFixtureCard key={idx} fixture={fixture} />
                          ))}
                        </div>
                      </div>
                    )}
                    {data.awayUpcoming?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <TeamLogo teamId={awayTeamId} teamName={awayTeam} size="sm" />
                          <h4 className="font-semibold text-red-500 text-xs">{awayTeam}</h4>
                        </div>
                        <div className="space-y-1.5">
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

// Standing Card Component with Team Logo
const StandingCard: React.FC<{ team: string; teamId: number; standing: any; isHome: boolean }> = ({ team, teamId, standing, isHome }) => (
  <div className={`bg-[#0f0f0f] border-l-2 ${isHome ? 'border-green-500' : 'border-red-500'} border-r border-t border-b border-gray-800 rounded p-3`}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <TeamLogo teamId={teamId} teamName={team} size="sm" />
        <span className={`font-semibold text-sm ${isHome ? 'text-green-500' : 'text-red-500'}`}>
          {team}
        </span>
      </div>
      <span className="text-xs text-gray-600">
        Position: <span className="text-white font-semibold">{standing.rank}</span>
      </span>
    </div>
    <div className="grid grid-cols-4 gap-2 text-xs">
      <div className="text-center">
        <div className="text-gray-500">Pts</div>
        <div className="text-white font-semibold mt-0.5">{standing.points}</div>
      </div>
      <div className="text-center">
        <div className="text-gray-500">W</div>
        <div className="text-green-400 font-semibold mt-0.5">{standing.all?.win || 0}</div>
      </div>
      <div className="text-center">
        <div className="text-gray-500">D</div>
        <div className="text-gray-400 font-semibold mt-0.5">{standing.all?.draw || 0}</div>
      </div>
      <div className="text-center">
        <div className="text-gray-500">L</div>
        <div className="text-red-400 font-semibold mt-0.5">{standing.all?.lose || 0}</div>
      </div>
    </div>
    <div className="mt-2 pt-2 border-t border-gray-800 flex justify-between text-xs">
      <span className="text-gray-500">
        GD: <span className="text-white font-semibold">{standing.goalsDiff > 0 ? '+' : ''}{standing.goalsDiff}</span>
      </span>
      <span className="text-gray-500">
        Form: <span className="text-white font-semibold">{standing.form || 'N/A'}</span>
      </span>
    </div>
  </div>
);

// Stat Row Component - Minimal
const StatRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex justify-between items-center text-xs">
    <span className="text-gray-500">{label}</span>
    <span className="text-white font-semibold">{value}</span>
  </div>
);

// Upcoming Fixture Card with Team Logos
const UpcomingFixtureCard: React.FC<{ fixture: any }> = ({ fixture }) => (
  <div className="bg-[#0f0f0f] border border-gray-800 rounded p-2 text-xs">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <TeamLogo teamId={fixture.homeTeamId} teamName={fixture.homeTeam} size="sm" />
          <span className="text-white font-medium">{fixture.homeTeam}</span>
        </div>
        <div className="flex items-center gap-2">
          <TeamLogo teamId={fixture.awayTeamId} teamName={fixture.awayTeam} size="sm" />
          <span className="text-white font-medium">{fixture.awayTeam}</span>
        </div>
        <div className="text-gray-600 text-xs mt-1">
          {new Date(fixture.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
        </div>
      </div>
      <div className="text-gray-500 text-xs">{fixture.league}</div>
    </div>
  </div>
);

export default FixtureStatsModal;