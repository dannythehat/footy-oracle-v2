import React from 'react';
import { Trophy, MapPin, Calendar, Clock, Radio } from 'lucide-react';

interface MatchDetailHeaderProps {
  fixture: any;
}

const MatchDetailHeader: React.FC<MatchDetailHeaderProps> = ({ fixture }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isLive = (status?: string) => {
    if (!status) return false;
    const s = status.toLowerCase();
    return s.includes('live') || s.includes('1h') || s.includes('2h') || s.includes('ht');
  };

  const isFinished = (status?: string) => {
    if (!status) return false;
    return status.toLowerCase().includes('ft');
  };

  const hasScore = () => {
    return (fixture.homeScore !== null && fixture.homeScore !== undefined) ||
           (fixture.awayScore !== null && fixture.awayScore !== undefined);
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    const statusConfig: Record<string, { label: string; className: string }> = {
      'scheduled': { label: 'Scheduled', className: 'bg-gray-500 shadow-lg shadow-gray-500/50' },
      'NS': { label: 'Not Started', className: 'bg-gray-500 shadow-lg shadow-gray-500/50' },
      'live': { label: 'LIVE', className: 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' },
      '1H': { label: '1st Half', className: 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' },
      'HT': { label: 'Half Time', className: 'bg-yellow-500 shadow-lg shadow-yellow-500/50' },
      '2H': { label: '2nd Half', className: 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' },
      'finished': { label: 'Full Time', className: 'bg-blue-500 shadow-lg shadow-blue-500/50' },
      'FT': { label: 'Full Time', className: 'bg-blue-500 shadow-lg shadow-blue-500/50' },
      'postponed': { label: 'Postponed', className: 'bg-gray-500 shadow-lg shadow-gray-500/50' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-500 shadow-lg shadow-gray-500/50' };

    return (
      <div className="flex items-center gap-2">
        {isLive(status) && <Radio className="w-4 h-4 text-red-500 animate-pulse drop-shadow-lg" />}
        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${config.className} drop-shadow-lg`}>
          {config.label}
        </span>
      </div>
    );
  };

  return (
    <div className="px-6 pb-4 border-b border-gray-700/50 shadow-lg">
      {/* League & Country - Enhanced */}
      <div className="flex items-center gap-2 mb-4 bg-gradient-to-r from-gray-800/40 to-transparent rounded-lg px-3 py-2 border border-gray-700/30 shadow-lg">
        <Trophy className="w-4 h-4 text-yellow-400 drop-shadow-lg" />
        <span className="text-sm text-gray-300 font-medium drop-shadow-lg">{fixture.leagueName || fixture.league}</span>
        {fixture.country && (
          <>
            <span className="text-gray-600">•</span>
            <MapPin className="w-3 h-3 text-gray-400" />
            <span className="text-sm text-gray-400">{fixture.country}</span>
          </>
        )}
      </div>

      {/* Teams & Score - Enhanced */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="text-xl font-bold text-white mb-3 drop-shadow-lg">
            {fixture.homeTeamName || fixture.homeTeam}
          </div>
          <div className="text-xl font-bold text-white drop-shadow-lg">
            {fixture.awayTeamName || fixture.awayTeam}
          </div>
        </div>

        {/* Score - Enhanced with depth */}
        {hasScore() && (
          <div className="text-center px-8 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl py-4 border border-gray-700/50 shadow-xl backdrop-blur-sm">
            <div className={`text-4xl font-bold drop-shadow-2xl ${isLive(fixture.status) ? 'text-red-400' : 'text-white'}`}>
              {fixture.homeScore ?? '-'}
            </div>
            <div className="text-gray-500 text-sm my-2 font-bold">-</div>
            <div className={`text-4xl font-bold drop-shadow-2xl ${isLive(fixture.status) ? 'text-red-400' : 'text-white'}`}>
              {fixture.awayScore ?? '-'}
            </div>
          </div>
        )}
      </div>

      {/* Match Info - Enhanced */}
      <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
        <div className="flex items-center gap-1.5 bg-gray-800/40 px-3 py-1.5 rounded-lg shadow-lg">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(fixture.date)}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-gray-800/40 px-3 py-1.5 rounded-lg shadow-lg">
          <Clock className="w-4 h-4" />
          <span>{fixture.time}</span>
        </div>
        {getStatusBadge(fixture.status)}
      </div>
    </div>
  );
};

export default MatchDetailHeader;
