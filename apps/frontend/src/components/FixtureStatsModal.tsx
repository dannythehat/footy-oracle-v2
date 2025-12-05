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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90">
      <div className="bg-[#0a0a0a] rounded-lg border border-gray-800 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with Team Logos - Mobile optimized */}
        <div className="sticky top-0 bg-[#0a0a0a] border-b border-gray-800 p-3 sm:p-4 flex items-center justify-between safe-top">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <TeamLogo teamId={homeTeamId} teamName={homeTeam} size="md" />
            <h2 className="text-sm sm:text-lg font-semibold truncate">
              <span className="text-white">{homeTeam}</span>
              <span className="text-gray-600 mx-1 sm:mx-2">vs</span>
              <span className="text-white">{awayTeam}</span>
            </h2>
            <TeamLogo teamId={awayTeamId} teamName={awayTeam} size="md" />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-900 active:bg-gray-800 rounded transition-colors touch-target no-tap-highlight flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Mobile optimized */}
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 safe-bottom">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-800 border-t-blue-500" />
            </div>
          )}

          {error && (
            <div className="bg-red-950/30 border border-red-900/50 rounded p-3 text-red-400 text-xs sm:text-sm">
              {error}
            </div>
          )}

          {data && !loading && (
            <div className="space-y-3 sm:space-y-4">
              {/* League Standings - Mobile optimized */}
              {(homeStanding || awayStanding) && (
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                    <h3 className="text-xs sm:text-sm font-semibold text-white">League Standings</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
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

              {/* Head to Head - Mobile optimized */}
              {data.h2h?.matches && data.h2h.matches.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                    <h3 className="text-xs sm:text-sm font-semibold text-white">Head to Head</h3>
                  </div>
                  
                  {/* H2H Stats Summary - Mobile optimized */}
                  {data.h2h.stats && (
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                      <div className="bg-[#0f0f0f] border border-gray-800 rounded p-2 sm:p-2.5 text-center">
                        <div className="text-lg sm:text-xl font-bold text-green-500">
                          {data.h2h.stats.homeWins || 0}
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">{homeTeam} Wins</div>
                      </div>
                      <div className="bg-[#0f0f0f] border border-gray-800 rounded p-2 sm:p-2.5 text-center">
                        <div className="text-lg sm:text-xl font-bold text-gray-400">
                          {data.h2h.stats.draws || 0}
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Draws</div>
                      </div>
                      <div className="bg-[#0f0f0f] border border-gray-800 rounded p-2 sm:p-2.5 text-center">
                        <div className="text-lg sm:text-xl font-bold text-red-500">
                          {data.h2h.stats.awayWins || 0}
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">{awayTeam} Wins</div>
                      </div>
                    </div>
                  )}

                  {/* Recent Matches - Mobile optimized */}
                  <div className="space-y-1.5">
                    {data.h2h.matches.slice(0, 5).map((match: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-[#0f0f0f] border border-gray-800 rounded p-2 sm:p-2.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-[10px] sm:text-xs text-gray-600 w-14 sm:w-20 flex-shrink-0">
                              {new Date(match.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                            </span>
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                              <TeamLogo teamId={match.homeTeamId} teamName={match.homeTeam} size="sm" />
                              <span className="text-white text-[10px] sm:text-xs truncate">{match.homeTeam}</span>
                              <span className="text-gray-600 text-[10px] sm:text-xs flex-shrink-0">vs</span>
                              <span className="text-white text-[10px] sm:text-xs truncate">{match.awayTeam}</span>
                              <TeamLogo teamId={match.awayTeamId} teamName={match.awayTeam} size="sm" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 justify-between sm:justify-end">
                            <span className="font-semibold text-white text-xs sm:text-sm">
                              {match.score.home} - {match.score.away}
                            </span>
                            <span className="text-[10px] sm:text-xs text-gray-600 truncate max-w-[100px] sm:max-w-none">{match.league}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Statistics - Mobile optimized */}
              {data.statistics && (
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <Target className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                    <h3 className="text-xs sm:text-sm font-semibold text-white">Match Statistics</h3>
                  </div>
                  <div className="bg-[#0f0f0f] border border-gray-800 rounded p-2.5 sm:p-3">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                          <TeamLogo teamId={homeTeamId} teamName={homeTeam} size="sm" />
                          <h4 className="font-semibold text-green-500 text-xs sm:text-sm truncate">{homeTeam}</h4>
                        </div>
                        <StatRow label="Possession" value={data.statistics.home?.possession || '0%'} />
                        <StatRow label="Shots" value={data.statistics.home?.totalShots || 0} />
                        <StatRow label="On Target" value={data.statistics.home?.shotsOnGoal || 0} />
                        <StatRow label="Corners" value={data.statistics.home?.corners || 0} />
                        <StatRow label="Fouls" value={data.statistics.home?.fouls || 0} />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                          <TeamLogo teamId={awayTeamId} teamName={awayTeam} size="sm" />
                          <h4 className="font-semibold text-red-500 text-xs sm:text-sm truncate">{awayTeam}</h4>
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

              {/* Upcoming Fixtures - Mobile optimized */}
              {(data.homeUpcoming?.length > 0 || data.awayUpcoming?.length > 0) && (
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-500" />
                    <h3 className="text-xs sm:text-sm font-semibold text-white">Upcoming Fixtures</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    {data.homeUpcoming?.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                          <TeamLogo teamId={homeTeamId} teamName={homeTeam} size="sm" />
                          <h4 className="font-semibold text-green-500 text-[10px] sm:text-xs">{homeTeam}</h4>
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
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                          <TeamLogo teamId={awayTeamId} teamName={awayTeam} size="sm" />
                          <h4 className="font-semibold text-red-500 text-[10px] sm:text-xs">{awayTeam}</h4>
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

// Standing Card Component - Mobile optimized
const StandingCard: React.FC<{ team: string; teamId: number; standing: any; isHome: boolean }> = ({ team, teamId, standing, isHome }) => (
  <div className={`bg-[#0f0f0f] border-l-2 ${isHome ? 'border-green-500' : 'border-red-500'} border-r border-t border-b border-gray-800 rounded p-2.5 sm:p-3`}>
    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
      <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
        <TeamLogo teamId={teamId} teamName={team} size="sm" />
        <span className={`font-semibold text-xs sm:text-sm ${isHome ? 'text-green-500' : 'text-red-500'} truncate`}>
          {team}
        </span>
      </div>
      <span className="text-[10px] sm:text-xs text-gray-600 flex-shrink-0">
        Position: <span className="text-white font-semibold">{standing.rank}</span>
      </span>
    </div>
    <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
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
    <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-gray-800 flex justify-between text-[10px] sm:text-xs">
      <span className="text-gray-500">
        GD: <span className="text-white font-semibold">{standing.goalsDiff > 0 ? '+' : ''}{standing.goalsDiff}</span>
      </span>
      <span className="text-gray-500">
        Form: <span className="text-white font-semibold">{standing.form || 'N/A'}</span>
      </span>
    </div>
  </div>
);

// Stat Row Component - Mobile optimized
const StatRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex justify-between items-center text-[10px] sm:text-xs">
    <span className="text-gray-500">{label}</span>
    <span className="text-white font-semibold">{value}</span>
  </div>
);

// Upcoming Fixture Card - Mobile optimized
const UpcomingFixtureCard: React.FC<{ fixture: any }> = ({ fixture }) => (
  <div className="bg-[#0f0f0f] border border-gray-800 rounded p-2 text-[10px] sm:text-xs">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
          <TeamLogo teamId={fixture.homeTeamId} teamName={fixture.homeTeam} size="sm" />
          <span className="text-white font-medium truncate">{fixture.homeTeam}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <TeamLogo teamId={fixture.awayTeamId} teamName={fixture.awayTeam} size="sm" />
          <span className="text-white font-medium truncate">{fixture.awayTeam}</span>
        </div>
      </div>
      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1">
        <div className="text-gray-600 text-[10px] sm:text-xs">
          {new Date(fixture.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
        </div>
        <div className="text-gray-500 text-[10px] sm:text-xs truncate max-w-[100px] sm:max-w-none">{fixture.league}</div>
      </div>
    </div>
  </div>
);

export default FixtureStatsModal;
