import React from 'react';
import { Trophy, AlertCircle } from 'lucide-react';

interface MatchStandingsProps {
  fixture: any;
}

const MatchStandings: React.FC<MatchStandingsProps> = ({ fixture }) => {
  // Placeholder for standings - will be implemented when backend endpoint is ready
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-purple-400" />
        <h2 className="text-lg font-bold text-white">League Standings</h2>
      </div>

      {/* Coming Soon */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-purple-400 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-purple-400 mb-2">
              Coming Soon
            </div>
            <p className="text-xs text-gray-300 mb-4">
              League standings will be available soon. This will show the current league table with team positions, points, and recent form.
            </p>
            <div className="text-xs text-gray-400">
              <div className="mb-1">• Current league position</div>
              <div className="mb-1">• Points and goal difference</div>
              <div className="mb-1">• Last 5 matches form</div>
              <div>• Home/Away records</div>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder Table */}
      <div className="mt-6 bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
        <div className="text-center text-gray-500 py-8">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">League: {fixture.leagueName || fixture.league}</p>
          <p className="text-xs mt-1">Season: {fixture.season}</p>
        </div>
      </div>
    </div>
  );
};

export default MatchStandings;
