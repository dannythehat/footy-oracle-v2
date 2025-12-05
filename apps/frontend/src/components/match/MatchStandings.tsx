import React, { useState } from 'react';
import { TeamLogo } from '../TeamLogo';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Standing {
  rank?: number;
  position?: number;
  team?: {
    id?: number;
    name?: string;
    logo?: string;
  };
  teamName?: string;
  teamId?: number;
  played?: number;
  win?: number;
  draw?: number;
  loss?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  goalsDiff?: number;
  points?: number;
  form?: string;
  description?: string;
}

interface MatchStandingsProps {
  standings: Standing[] | any;
  league?: string;
  season?: number;
  homeTeam?: string;
  awayTeam?: string;
}

export default function MatchStandings({ 
  standings, 
  league, 
  season,
  homeTeam,
  awayTeam 
}: MatchStandingsProps) {
  const [showFullTable, setShowFullTable] = useState(false);

  if (!standings || (Array.isArray(standings) && standings.length === 0)) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="text-gray-500 text-sm mb-1">No standings available</div>
          <div className="text-gray-600 text-xs">League table will appear here</div>
        </div>
      </div>
    );
  }

  const standingsArray: Standing[] = Array.isArray(standings) ? standings : [];

  // Show top 6 by default, full table when expanded
  const displayedStandings = showFullTable ? standingsArray : standingsArray.slice(0, 6);

  // Get position color based on rank
  const getPositionColor = (position: number, total: number): string => {
    if (position <= 4) return 'bg-green-600'; // Champions League
    if (position <= 6) return 'bg-blue-600'; // Europa League
    if (position >= total - 2) return 'bg-red-600'; // Relegation
    return 'bg-gray-700';
  };

  // Parse form string (e.g., "WWDLW") into icons
  const renderForm = (form?: string) => {
    if (!form) return null;
    
    const formArray = form.split('').slice(-5); // Last 5 games
    
    return (
      <div className="flex items-center gap-0.5">
        {formArray.map((result, idx) => (
          <div
            key={idx}
            className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${
              result === 'W' ? 'bg-green-600 text-white' :
              result === 'D' ? 'bg-gray-600 text-white' :
              'bg-red-600 text-white'
            }`}
            title={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
          >
            {result}
          </div>
        ))}
      </div>
    );
  };

  // Check if team is in the match
  const isMatchTeam = (teamName: string): boolean => {
    return teamName === homeTeam || teamName === awayTeam;
  };

  return (
    <div className="bg-[#0a0a0a]">
      {/* Header */}
      <div className="px-4 py-2 bg-gray-900/50 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[11px] font-bold text-white uppercase tracking-wide">
              {league || 'League Table'}
            </h3>
            {season && (
              <span className="text-[9px] text-gray-600">Season {season}</span>
            )}
          </div>
          <span className="text-[9px] text-gray-600">
            {standingsArray.length} teams
          </span>
        </div>
      </div>

      {/* Table Header */}
      <div className="px-2 py-1.5 bg-gray-900/30 border-b border-gray-800">
        <div className="grid grid-cols-12 gap-1 text-[9px] font-semibold text-gray-500 uppercase">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5">Team</div>
          <div className="col-span-1 text-center">P</div>
          <div className="col-span-2 text-center">GD</div>
          <div className="col-span-2 text-center">Pts</div>
          <div className="col-span-1"></div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-800/50">
        {displayedStandings.map((standing, index) => {
          const position = standing.rank || standing.position || index + 1;
          const teamName = standing.team?.name || standing.teamName || 'Team';
          const teamId = standing.team?.id || standing.teamId;
          const teamLogo = standing.team?.logo;
          const isHighlighted = isMatchTeam(teamName);

          return (
            <div
              key={index}
              className={`px-2 py-1.5 hover:bg-gray-900/30 transition-colors ${
                isHighlighted ? 'bg-blue-950/20 border-l-2 border-blue-500' : ''
              }`}
            >
              <div className="grid grid-cols-12 gap-1 items-center text-[10px]">
                {/* Position */}
                <div className="col-span-1 flex items-center justify-center">
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-1 h-4 rounded-full ${getPositionColor(position, standingsArray.length)}`}
                      title={standing.description || ''}
                    />
                    <span className={`font-semibold ${isHighlighted ? 'text-blue-400' : 'text-gray-400'}`}>
                      {position}
                    </span>
                  </div>
                </div>

                {/* Team */}
                <div className="col-span-5 flex items-center gap-1.5 min-w-0">
                  <TeamLogo
                    teamId={teamId}
                    teamName={teamName}
                    logoUrl={teamLogo}
                    size="sm"
                  />
                  <span className={`truncate font-medium ${isHighlighted ? 'text-white' : 'text-gray-300'}`}>
                    {teamName}
                  </span>
                </div>

                {/* Played */}
                <div className="col-span-1 text-center text-gray-400">
                  {standing.played || 0}
                </div>

                {/* Goal Difference */}
                <div className="col-span-2 text-center">
                  <span className={`font-semibold ${
                    (standing.goalsDiff || 0) > 0 ? 'text-green-400' :
                    (standing.goalsDiff || 0) < 0 ? 'text-red-400' :
                    'text-gray-400'
                  }`}>
                    {(standing.goalsDiff || 0) > 0 ? '+' : ''}{standing.goalsDiff || 0}
                  </span>
                </div>

                {/* Points */}
                <div className="col-span-2 text-center">
                  <span className={`font-bold ${isHighlighted ? 'text-blue-400' : 'text-white'}`}>
                    {standing.points || 0}
                  </span>
                </div>

                {/* Form (hidden on mobile, shown on larger screens) */}
                <div className="col-span-1 hidden sm:flex justify-end">
                  {renderForm(standing.form)}
                </div>
              </div>

              {/* Form on mobile (below team row) */}
              {standing.form && (
                <div className="sm:hidden mt-1 flex justify-end">
                  {renderForm(standing.form)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show More/Less Button */}
      {standingsArray.length > 6 && (
        <button
          onClick={() => setShowFullTable(!showFullTable)}
          className="w-full px-4 py-2 flex items-center justify-center gap-2 bg-gray-900/30 hover:bg-gray-900/50 transition-colors border-t border-gray-800"
        >
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
            {showFullTable ? 'Show Less' : `Show All ${standingsArray.length} Teams`}
          </span>
          {showFullTable ? (
            <ChevronUp className="w-3 h-3 text-gray-500" />
          ) : (
            <ChevronDown className="w-3 h-3 text-gray-500" />
          )}
        </button>
      )}

      {/* Legend */}
      <div className="px-4 py-2 bg-gray-900/30 border-t border-gray-800">
        <div className="flex items-center gap-3 text-[9px] text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-600" />
            <span>UCL</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <span>UEL</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-600" />
            <span>Relegation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
