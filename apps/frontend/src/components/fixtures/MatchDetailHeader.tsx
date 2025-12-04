import React from 'react';
import { Star, MapPin, Calendar, Clock } from 'lucide-react';

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
    <div className="bg-white px-6 pb-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 py-3 text-xs text-gray-500">
        <span>⚽ FOOTBALL</span>
        <span>›</span>
        <span>{fixture.country || fixture.league?.country?.name || 'COUNTRY'}</span>
        <span>›</span>
        <span className="text-gray-900 font-medium">
          {fixture.leagueName || fixture.league?.name || 'LEAGUE'}
        </span>
      </div>

      {/* Match Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            {formatDate(fixture.date || fixture.kickoff)} {formatTime(fixture.date || fixture.kickoff)}
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Star className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Teams & Score */}
      <div className="flex items-center justify-between py-4">
        {/* Home Team */}
        <div className="flex items-center gap-3 flex-1">
          <img 
            src={fixture.homeTeamLogo || '/placeholder-team.png'} 
            alt={fixture.homeTeamName || fixture.homeTeam}
            className="w-12 h-12 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-team.png';
            }}
          />
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {fixture.homeTeamName || fixture.homeTeam || 'Home Team'}
            </div>
            <div className="text-xs text-gray-500">
              {fixture.country || fixture.league?.country?.name}
            </div>
          </div>
        </div>

        {/* Score */}
        <div className="text-center px-8">
          {hasScore() ? (
            <>
              <div className={`text-5xl font-bold ${isLive(fixture.status) ? 'text-pink-600' : 'text-gray-900'}`}>
                {getHomeScore()} - {getAwayScore()}
              </div>
              {getHalfTimeScore() && (
                <div className="text-xs text-gray-500 mt-1">
                  ({getHalfTimeScore()})
                </div>
              )}
              <div className={`text-xs font-semibold mt-2 ${
                isLive(fixture.status) ? 'text-pink-600' : 'text-gray-600'
              }`}>
                {getStatusText(fixture.status)}
              </div>
            </>
          ) : (
            <div className="text-2xl font-bold text-gray-400">
              - : -
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {fixture.awayTeamName || fixture.awayTeam || 'Away Team'}
            </div>
            <div className="text-xs text-gray-500">
              {fixture.country || fixture.league?.country?.name}
            </div>
          </div>
          <img 
            src={fixture.awayTeamLogo || '/placeholder-team.png'} 
            alt={fixture.awayTeamName || fixture.awayTeam}
            className="w-12 h-12 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-team.png';
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MatchDetailHeader;
