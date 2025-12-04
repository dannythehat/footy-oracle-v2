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

  const standingsData = standings && Array.isArray(standings) && standings.length > 0 
    ? (Array.isArray(standings[0]) ? standings[0] : standings)
    : null;

  const hasStandings = standingsData && standingsData.length > 0;

  const getTeamRowClass = (teamId: number) => {
    if (teamId === fixture.teams?.home?.id) return 'bg-blue-50';
    if (teamId === fixture.teams?.away?.id) return 'bg-red-50';
    return '';
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-200 px-4 py-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-gray-700" />
          <h3 className="text-xs font-semibold text-gray-700 uppercase">Standings</h3>
        </div>
      </div>

      {!hasStandings && (
        <div className="p-4 text-center text-gray-500 text-sm">
          Standings data not available
        </div>
      )}

      {hasStandings && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">#</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">Team</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-600">P</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-600">W</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-600">D</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-600">L</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-600">GF</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-600">GA</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-600">GD</th>
                <th className="px-3 py-2 text-center font-semibold text-gray-600">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {standingsData.map((standing: StandingTeam) => (
                <tr 
                  key={standing.team.id}
                  className={`hover:bg-gray-50 transition-colors ${getTeamRowClass(standing.team.id)}`}
                >
                  <td className="px-3 py-2 font-medium text-gray-900">{standing.rank}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <img 
                        src={standing.team.logo} 
                        alt={standing.team.name}
                        className="w-4 h-4 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <span className="text-gray-900 font-medium truncate max-w-[120px]">
                        {standing.team.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-center text-gray-700">{standing.all.played}</td>
                  <td className="px-2 py-2 text-center text-green-600 font-medium">{standing.all.win}</td>
                  <td className="px-2 py-2 text-center text-gray-600">{standing.all.draw}</td>
                  <td className="px-2 py-2 text-center text-red-600 font-medium">{standing.all.lose}</td>
                  <td className="px-2 py-2 text-center text-gray-700">{standing.all.goals?.for || 0}</td>
                  <td className="px-2 py-2 text-center text-gray-700">{standing.all.goals?.against || 0}</td>
                  <td className={`px-2 py-2 text-center font-medium ${
                    standing.goalsDiff > 0 ? 'text-green-600' : 
                    standing.goalsDiff < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {standing.goalsDiff > 0 ? '+' : ''}{standing.goalsDiff}
                  </td>
                  <td className="px-3 py-2 text-center font-bold text-gray-900">{standing.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MatchStandings;
