import React from 'react';
import { Trophy, AlertCircle } from 'lucide-react';

interface StandingTeam {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
}

interface MatchStandingsProps {
  fixture: any;
  standings?: StandingTeam[][];
}

const MatchStandings: React.FC<MatchStandingsProps> = ({ fixture, standings }) => {
  // Guard against missing fixture data
  if (!fixture) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-red-400 mb-2">
                No Fixture Data
              </div>
              <p className="text-xs text-gray-300">
                Unable to load fixture information.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extract standings array - API returns nested array [[standings]]
  const standingsData = standings && Array.isArray(standings) && standings.length > 0 
    ? (Array.isArray(standings[0]) ? standings[0] : standings)
    : null;

  const hasStandings = standingsData && standingsData.length > 0;

  const getTeamRowClass = (teamId: number) => {
    if (teamId === fixture.teams?.home?.id) return 'bg-blue-500/10 border-l-2 border-blue-500';
    if (teamId === fixture.teams?.away?.id) return 'bg-red-500/10 border-l-2 border-red-500';
    return '';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-purple-400" />
        <h2 className="text-lg font-bold text-white">League Standings</h2>
      </div>

      {/* No Data Available */}
      {!hasStandings && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-purple-400 mb-2">
                No Standings Available
              </div>
              <p className="text-xs text-gray-300">
                League standings data is not available for this fixture.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Standings Table */}
      {hasStandings && (
        <div className="overflow-x-auto rounded-xl border border-gray-700/50">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50 border-b border-gray-700">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">#</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">Team</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-400">P</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-400">W</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-400">D</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-400">L</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-400">GF</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-400">GA</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-400">GD</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-400">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {standingsData.map((standing: StandingTeam) => (
                <tr 
                  key={standing.team.id}
                  className={`hover:bg-gray-800/30 transition-colors ${getTeamRowClass(standing.team.id)}`}
                >
                  <td className="px-3 py-2 font-medium text-white">{standing.rank}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <img 
                        src={standing.team.logo} 
                        alt={standing.team.name}
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <span className="text-white text-xs font-medium truncate max-w-[150px]">
                        {standing.team.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-center text-gray-300">{standing.all.played}</td>
                  <td className="px-2 py-2 text-center text-green-400">{standing.all.win}</td>
                  <td className="px-2 py-2 text-center text-yellow-400">{standing.all.draw}</td>
                  <td className="px-2 py-2 text-center text-red-400">{standing.all.lose}</td>
                  <td className="px-2 py-2 text-center text-gray-300">{standing.all.goals?.for || 0}</td>
                  <td className="px-2 py-2 text-center text-gray-300">{standing.all.goals?.against || 0}</td>
                  <td className={`px-2 py-2 text-center font-medium ${
                    standing.goalsDiff > 0 ? 'text-green-400' : 
                    standing.goalsDiff < 0 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {standing.goalsDiff > 0 ? '+' : ''}{standing.goalsDiff}
                  </td>
                  <td className="px-3 py-2 text-center font-bold text-white">{standing.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* League Info */}
      {hasStandings && (
        <div className="mt-4 text-center text-xs text-gray-500">
          {fixture?.league?.name || 'League'} • Season {fixture?.league?.season || new Date().getFullYear()}
        </div>
      )}
    </div>
  );
};

export default MatchStandings;
