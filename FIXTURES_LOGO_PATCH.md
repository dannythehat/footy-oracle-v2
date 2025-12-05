// Patch for FixturesView.tsx to add team and league logos

// ADD TO IMPORTS (line 8):
import { TeamLogo } from './TeamLogo';
import { LeagueLogo } from './LeagueLogo';

// REPLACE renderFixtureRow function (around line 305):
const renderFixtureRow = (fixture: Fixture) => {
  const score = getScore(fixture);
  const showScore = shouldShowScore(fixture);
  const live = isLive(fixture);
  
  return (
    <div 
      key={fixture.fixtureId || fixture.id} 
      onClick={() => handleFixtureClick(fixture)}
      className={`px-2 py-1.5 border-b border-gray-800/50 last:border-b-0 hover:bg-gray-800/30 transition-colors cursor-pointer ${live ? 'bg-red-950/20' : ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Time/Status Column */}
        <div className="flex items-center justify-center w-10 flex-shrink-0">
          {getStatusDisplay(fixture)}
        </div>

        {/* Teams Column with Logos */}
        <div className="flex-1 min-w-0">
          {/* Home Team */}
          <div className="flex items-center justify-between mb-0.5 gap-1.5">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <TeamLogo 
                teamId={fixture.homeTeamId} 
                teamName={fixture.homeTeamName || fixture.homeTeam}
                size="sm"
              />
              <span className={`text-[11px] font-medium truncate ${live ? 'text-white' : 'text-gray-300'}`}>
                {fixture.homeTeamName || fixture.homeTeam}
              </span>
            </div>
            {showScore && (
              <span className={`text-xs font-bold ml-2 ${live ? 'text-red-400' : 'text-white'}`}>
                {score.home ?? '-'}
              </span>
            )}
          </div>
          
          {/* Away Team */}
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <TeamLogo 
                teamId={fixture.awayTeamId} 
                teamName={fixture.awayTeamName || fixture.awayTeam}
                size="sm"
              />
              <span className={`text-[11px] font-medium truncate ${live ? 'text-white' : 'text-gray-300'}`}>
                {fixture.awayTeamName || fixture.awayTeam}
              </span>
            </div>
            {showScore && (
              <span className={`text-xs font-bold ml-2 ${live ? 'text-red-400' : 'text-white'}`}>
                {score.away ?? '-'}
              </span>
            )}
          </div>
        </div>

        {/* Favorite Button */}
        <div className="flex-shrink-0">
          <FavoriteButton
            fixtureId={Number(fixture.fixtureId || fixture.id)}
            homeTeam={fixture.homeTeamName || fixture.homeTeam}
            awayTeam={fixture.awayTeamName || fixture.awayTeam}
            date={fixture.date || selectedDate.toISOString()}
            league={fixture.league || fixture.leagueName || ''}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
};

// REPLACE League Header section (around line 515):
<button
  onClick={() => toggleLeague(league)}
  className="w-full px-2 py-1.5 flex items-center justify-between hover:bg-gray-900/50 transition-colors"
>
  <div className="flex items-center gap-1.5">
    <LeagueLogo 
      leagueId={leagueFixtures[0]?.leagueId}
      leagueName={league}
      size="sm"
    />
    <span className="text-[11px] font-bold text-white">{league}</span>
    <span className="text-[9px] text-gray-600">({leagueFixtures.length})</span>
  </div>
  {expandedLeagues.has(league) ? (
    <ChevronUp className="w-3 h-3 text-gray-600" />
  ) : (
    <ChevronDown className="w-3 h-3 text-gray-600" />
  )}
</button>
