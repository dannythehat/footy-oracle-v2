import React, { useEffect, useState } from 'react';
import { History, Loader, AlertCircle, Trophy, Calendar } from 'lucide-react';
import { fixturesApi } from '../../../services/api';

interface MatchH2HProps {
  fixture: any;
}

interface H2HMatch {
  date: string;
  homeTeam: string;
  awayTeam: string;
  score: { home: number; away: number };
  league: string;
}

interface H2HData {
  matches: H2HMatch[];
  stats: {
    totalMatches: number;
    homeWins: number;
    awayWins: number;
    draws: number;
    bttsCount: number;
    over25Count: number;
  };
}

const MatchH2H: React.FC<MatchH2HProps> = ({ fixture }) => {
  const [h2hData, setH2hData] = useState<H2HData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchH2H();
  }, [fixture.id]);

  const fetchH2H = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fixturesApi.getH2H(
        fixture.id || fixture.fixtureId,
        fixture.homeTeamId,
        fixture.awayTeamId,
        10
      );

      if (response.success) {
        setH2hData(response.data);
      } else {
        setError('H2H data not available');
      }
    } catch (err: any) {
      console.error('Error fetching H2H:', err);
      setError(err.message || 'Failed to load H2H data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getResultBadge = (match: H2HMatch, isHome: boolean) => {
    const homeScore = match.score.home;
    const awayScore = match.score.away;

    let result: 'W' | 'D' | 'L';
    if (homeScore > awayScore) {
      result = isHome ? 'W' : 'L';
    } else if (homeScore < awayScore) {
      result = isHome ? 'L' : 'W';
    } else {
      result = 'D';
    }

    const colors = {
      W: 'bg-green-500 text-white',
      D: 'bg-yellow-500 text-white',
      L: 'bg-red-500 text-white'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-bold ${colors[result]}`}>
        {result}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-12">
        <Loader className="w-8 h-8 text-purple-400 animate-spin mb-3" />
        <p className="text-gray-400">Loading head-to-head data...</p>
      </div>
    );
  }

  if (error || !h2hData) {
    return (
      <div className="p-6">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-yellow-400 mb-1">
                H2H Data Not Available
              </div>
              <p className="text-xs text-gray-300">
                No previous meetings found between these teams.
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
        <History className="w-5 h-5 text-purple-400" />
        <h2 className="text-lg font-bold text-white">Head-to-Head</h2>
      </div>

      {/* Overall Stats */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-700">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{h2hData.stats.homeWins}</div>
            <div className="text-xs text-gray-400 mt-1">Home Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{h2hData.stats.draws}</div>
            <div className="text-xs text-gray-400 mt-1">Draws</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{h2hData.stats.awayWins}</div>
            <div className="text-xs text-gray-400 mt-1">Away Wins</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              {h2hData.stats.bttsCount}/{h2hData.stats.totalMatches}
            </div>
            <div className="text-xs text-gray-400 mt-1">BTTS</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              {h2hData.stats.over25Count}/{h2hData.stats.totalMatches}
            </div>
            <div className="text-xs text-gray-400 mt-1">Over 2.5 Goals</div>
          </div>
        </div>
      </div>

      {/* Last Meetings */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Last {h2hData.matches.length} Meetings</h3>
        <div className="space-y-2">
          {h2hData.matches.map((match, index) => {
            const isHomeTeamHome = match.homeTeam === (fixture.homeTeamName || fixture.homeTeam);

            return (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(match.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Trophy className="w-3 h-3" />
                    <span>{match.league}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">{match.homeTeam}</div>
                    <div className="text-sm text-white font-medium mt-1">{match.awayTeam}</div>
                  </div>

                  <div className="text-center px-4">
                    <div className="text-lg font-bold text-white">
                      {match.score.home} - {match.score.away}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    {getResultBadge(match, isHomeTeamHome)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MatchH2H;
