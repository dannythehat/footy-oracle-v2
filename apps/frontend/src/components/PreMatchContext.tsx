import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, Trophy, Loader } from 'lucide-react';
import { fixturesApi } from '../services/api';

interface PreMatchContextProps {
  fixtureId: number;
  homeTeamId: number;
  awayTeamId: number;
  leagueId?: number;
  season?: number;
  compact?: boolean;
}

interface H2HStats {
  totalMatches: number;
  homeWins: number;
  awayWins: number;
  draws: number;
  bttsCount: number;
  over25Count: number;
}

interface TeamStanding {
  rank: number;
  team: { name: string };
  points: number;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
  };
  form: string;
}

const PreMatchContext: React.FC<PreMatchContextProps> = ({
  fixtureId,
  homeTeamId,
  awayTeamId,
  leagueId,
  season,
  compact = false
}) => {
  const [h2hStats, setH2hStats] = useState<H2HStats | null>(null);
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreMatchData();
  }, [fixtureId]);

  const fetchPreMatchData = async () => {
    try {
      setLoading(true);

      // Fetch H2H data
      const h2hRes = await fixturesApi.getH2H(fixtureId);
      if (h2hRes.success && h2hRes.data?.stats) {
        setH2hStats(h2hRes.data.stats);
      }

      // Fetch standings if league info available
      if (leagueId && season) {
        const standingsRes = await fixturesApi.getStandings(leagueId, season);
        if (standingsRes.success && standingsRes.data) {
          // Find home and away team positions
          const homeStanding = standingsRes.data.find((s: TeamStanding) => 
            s.team.name.toLowerCase().includes(homeTeamId.toString())
          );
          const awayStanding = standingsRes.data.find((s: TeamStanding) => 
            s.team.name.toLowerCase().includes(awayTeamId.toString())
          );
          
          if (homeStanding || awayStanding) {
            setStandings([homeStanding, awayStanding].filter(Boolean));
          }
        }
      }
    } catch (err) {
      console.error('Error fetching pre-match data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return compact ? null : (
      <div className="flex items-center justify-center py-4">
        <Loader className="w-4 h-4 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!h2hStats && standings.length === 0) {
    return null;
  }

  if (compact) {
    // Compact view for fixture cards
    return (
      <div className="flex items-center justify-between text-xs text-gray-400 mt-2 px-2">
        {h2hStats && h2hStats.totalMatches > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>H2H: {h2hStats.homeWins}W-{h2hStats.draws}D-{h2hStats.awayWins}W</span>
            </div>
            {h2hStats.bttsCount > 0 && (
              <div className="flex items-center gap-1">
                <span>BTTS: {Math.round((h2hStats.bttsCount / h2hStats.totalMatches) * 100)}%</span>
              </div>
            )}
          </div>
        )}

        {standings.length === 2 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              <span>#{standings[0]?.rank}</span>
            </div>
            <span className="text-gray-600">vs</span>
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              <span>#{standings[1]?.rank}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full view
  return (
    <div className="mt-3 space-y-3 px-2">
      {/* H2H Stats */}
      {h2hStats && h2hStats.totalMatches > 0 && (
        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-gray-300">Head to Head</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-green-400 font-bold">{h2hStats.homeWins}</div>
              <div className="text-gray-500">Home Wins</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 font-bold">{h2hStats.draws}</div>
              <div className="text-gray-500">Draws</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-bold">{h2hStats.awayWins}</div>
              <div className="text-gray-500">Away Wins</div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700/50 text-xs text-gray-400">
            <span>BTTS: {Math.round((h2hStats.bttsCount / h2hStats.totalMatches) * 100)}%</span>
            <span>O2.5: {Math.round((h2hStats.over25Count / h2hStats.totalMatches) * 100)}%</span>
          </div>
        </div>
      )}

      {/* League Positions */}
      {standings.length > 0 && (
        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-semibold text-gray-300">League Position</span>
          </div>
          <div className="space-y-2">
            {standings.map((standing, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 font-bold">#{standing.rank}</span>
                  <span className="text-gray-300">{standing.team.name}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <span>{standing.points}pts</span>
                  {standing.form && (
                    <div className="flex items-center gap-0.5">
                      {standing.form.split('').slice(-5).map((result, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            result === 'W' ? 'bg-green-500' :
                            result === 'D' ? 'bg-gray-500' :
                            'bg-red-500'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PreMatchContext;
