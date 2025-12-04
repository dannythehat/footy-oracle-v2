import React, { useEffect, useState } from 'react';
import { History, Loader, AlertCircle, Calendar } from 'lucide-react';
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
    if (fixture && (fixture.id || fixture.fixtureId) && fixture.homeTeamId && fixture.awayTeamId) {
      fetchH2H();
    } else {
      setError('Missing required fixture data');
      setLoading(false);
    }
  }, [fixture?.id, fixture?.fixtureId]);

  const fetchH2H = async () => {
    try {
      setLoading(true);
      setError(null);

      const homeTeamId = fixture.homeTeamId;
      const awayTeamId = fixture.awayTeamId;

      if (!homeTeamId || !awayTeamId) {
        throw new Error('Missing required IDs for H2H data');
      }

      const response = await fixturesApi.getH2H(
        Number(homeTeamId),
        Number(awayTeamId)
      );

      if (response.success && response.data) {
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
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

  const getResultBadge = (match: H2HMatch, isHome: boolean) => {
    const homeScore = match.score?.home ?? 0;
    const awayScore = match.score?.away ?? 0;

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
      D: 'bg-gray-400 text-white',
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
      <div className="p-6 flex flex-col items-center justify-center py-12 bg-gray-50">
        <Loader className="w-8 h-8 text-pink-600 animate-spin mb-3" />
        <p className="text-gray-600 text-sm">Loading head-to-head data...</p>
      </div>
    );
  }

  if (error || !h2hData) {
    return (
      <div className="p-4 bg-gray-50">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-yellow-900 mb-1">
                H2H Data Not Available
              </div>
              <p className="text-xs text-yellow-700">
                {error || 'No previous meetings found between these teams.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <History className="w-5 h-5 text-gray-600" />
        <h2 className="text-base font-bold text-gray-900">Head-to-Head</h2>
      </div>

      {/* Overall Stats */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{h2hData.stats.homeWins || 0}</div>
            <div className="text-xs text-gray-600 mt-1">Home Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{h2hData.stats.draws || 0}</div>
            <div className="text-xs text-gray-600 mt-1">Draws</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{h2hData.stats.awayWins || 0}</div>
            <div className="text-xs text-gray-600 mt-1">Away Wins</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {h2hData.stats.bttsCount || 0}/{h2hData.stats.totalMatches || 0}
            </div>
            <div className="text-xs text-gray-600 mt-1">BTTS</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {h2hData.stats.over25Count || 0}/{h2hData.stats.totalMatches || 0}
            </div>
            <div className="text-xs text-gray-600 mt-1">Over 2.5 Goals</div>
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="bg-gray-200 px-4 py-2 rounded">
        <h3 className="text-xs font-semibold text-gray-700 uppercase">
          Head-to-Head Matches
        </h3>
      </div>

      {/* Last Meetings */}
      {h2hData.matches && h2hData.matches.length > 0 ? (
        <div className="space-y-3">
          {h2hData.matches.map((match, index) => {
            const isHomeTeamHome = match.homeTeam === (fixture.homeTeamName || fixture.homeTeam);

            return (
              <div
                key={index}
                className="bg-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(match.date)}</span>
                  </div>
                  <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {match.league || 'Unknown'}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm text-gray-900 font-medium">{match.homeTeam || 'Unknown'}</div>
                    <div className="text-sm text-gray-900 font-medium mt-1">{match.awayTeam || 'Unknown'}</div>
                  </div>

                  <div className="text-center px-4 bg-gray-50 rounded py-2 mx-4">
                    <div className="text-base font-bold text-gray-900">
                      {match.score?.home ?? 0} - {match.score?.away ?? 0}
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
      ) : (
        <div className="text-center text-gray-500 py-8 bg-white rounded-lg border border-gray-200">
          <p className="text-sm">No previous meetings found</p>
        </div>
      )}
    </div>
  );
};

export default MatchH2H;
