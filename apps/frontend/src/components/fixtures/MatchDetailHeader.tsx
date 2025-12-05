import React from 'react';
import { Star, MapPin, Calendar, Clock } from 'lucide-react';
import { TeamLogo } from '../TeamLogo';

interface MatchDetailHeaderProps {
  fixture: any;
}

const MatchDetailHeader: React.FC<MatchDetailHeaderProps> = ({ fixture }) => {
  if (!fixture) return null;

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'TBD';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'TBD';
    }
  };

  const formatTime = (dateStr: string | undefined) => {
    if (!dateStr) return 'TBD';
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'TBD';
    }
  };

  const isLive = (status?: string) => {
    if (!status) return false;
    const s = status.toLowerCase();
    return s.includes('live') || s.includes('1h') || s.includes('2h') || s.includes('ht');
  };

  const hasScore = () => {
    if (fixture.score && (fixture.score.home !== null || fixture.score.away !== null)) {
      return true;
    }
    return (fixture.homeScore !== null && fixture.homeScore !== undefined) ||
           (fixture.awayScore !== null && fixture.awayScore !== undefined);
  };

  const getHomeScore = () => {
    if (fixture.score && fixture.score.home !== null && fixture.score.home !== undefined) {
      return fixture.score.home;
    }
    return fixture.homeScore ?? '-';
  };

  const getAwayScore = () => {
    if (fixture.score && fixture.score.away !== null && fixture.score.away !== undefined) {
      return fixture.score.away;
    }
    return fixture.awayScore ?? '-';
  };

  const getStatusText = (status?: string) => {
    if (!status) return 'Scheduled';
    
    const statusMap: Record<string, string> = {
      'NS': 'Not Started',
      '1H': '1ST HALF',
      'HT': 'HALF TIME',
      '2H': '2ND HALF',
      'FT': 'FULL TIME',
      'finished': 'FULL TIME',
      'live': 'LIVE',
    };

    return statusMap[status] || status;
  };

  const getHalfTimeScore = () => {
    if (fixture.score?.halftime) {
      return `${fixture.score.halftime.home} - ${fixture.score.halftime.away}`;
    }
    return null;
  };

  return (
    <div className="bg-white px-4 sm:px-6 pb-4 sm:pb-3">
      {/* Breadcrumb - Mobile optimized */}
      <div className="flex items-center gap-2 py-3 sm:py-2 text-xs sm:text-[10px] text-gray-500 overflow-x-auto scrollbar-none">
        <span className="whitespace-nowrap">⚽ FOOTBALL</span>
        <span>›</span>
        <span className="whitespace-nowrap">{fixture.country || fixture.league?.country?.name || 'COUNTRY'}</span>
        <span>›</span>
        <span className="text-gray-900 font-medium whitespace-nowrap truncate">
          {fixture.leagueName || fixture.league?.name || 'LEAGUE'}
        </span>
      </div>

      {/* Match Info - Mobile optimized */}
      <div className="flex items-center justify-between mb-4 sm:mb-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-sm sm:text-xs text-gray-600">
            {formatDate(fixture.date || fixture.kickoff)} {formatTime(fixture.date || fixture.kickoff)}
          </div>
        </div>
        <button 
          className="p-3 sm:p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
          aria-label="Add to favorites"
        >
          <Star className="w-5 h-5 sm:w-4 sm:h-4 text-gray-400" />
        </button>
      </div>

      {/* Teams & Score - Mobile optimized */}
      <div className="flex items-center justify-between py-4 sm:py-3 gap-2 sm:gap-4">
        {/* Home Team - Mobile optimized */}
        <div className="flex items-center gap-3 sm:gap-2 flex-1 min-w-0">
          <TeamLogo
            teamId={fixture.homeTeamId}
            teamName={fixture.homeTeamName || fixture.homeTeam}
            size="lg"
            className="flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="text-base sm:text-sm font-semibold text-gray-900 truncate">
              {fixture.homeTeamName || fixture.homeTeam || 'Home Team'}
            </div>
            <div className="text-xs sm:text-[10px] text-gray-500 truncate">
              {fixture.country || fixture.league?.country?.name}
            </div>
          </div>
        </div>

        {/* Score - Mobile optimized */}
        <div className="text-center px-4 sm:px-6 flex-shrink-0">
          {hasScore() ? (
            <>
              <div className={`text-4xl sm:text-3xl font-bold ${isLive(fixture.status) ? 'text-pink-600' : 'text-gray-900'}`}>
                {getHomeScore()} - {getAwayScore()}
              </div>
              {getHalfTimeScore() && (
                <div className="text-xs sm:text-[10px] text-gray-500 mt-1">
                  ({getHalfTimeScore()})
                </div>
              )}
              <div className={`text-xs sm:text-[10px] font-semibold mt-2 sm:mt-1 ${ 
                isLive(fixture.status) ? 'text-pink-600' : 'text-gray-600'
              }`}>
                {getStatusText(fixture.status)}
              </div>
            </>
          ) : (
            <div className="text-2xl sm:text-xl font-bold text-gray-400">
              - : -
            </div>
          )}
        </div>

        {/* Away Team - Mobile optimized */}
        <div className="flex items-center gap-3 sm:gap-2 flex-1 justify-end min-w-0">
          <div className="text-right min-w-0 flex-1">
            <div className="text-base sm:text-sm font-semibold text-gray-900 truncate">
              {fixture.awayTeamName || fixture.awayTeam || 'Away Team'}
            </div>
            <div className="text-xs sm:text-[10px] text-gray-500 truncate">
              {fixture.country || fixture.league?.country?.name}
            </div>
          </div>
          <TeamLogo
            teamId={fixture.awayTeamId}
            teamName={fixture.awayTeamName || fixture.awayTeam}
            size="lg"
            className="flex-shrink-0"
          />
        </div>
      </div>
    </div>
  );
};

export default MatchDetailHeader;
