import React from 'react';
import { Trophy, MapPin, Calendar, Clock } from 'lucide-react';

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

  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    const statusConfig: Record<string, { label: string; className: string }> = {
      'scheduled': { label: 'Scheduled', className: 'bg-gray-500' },
      'NS': { label: 'Not Started', className: 'bg-gray-500' },
      'live': { label: 'LIVE', className: 'bg-red-500 animate-pulse' },
      '1H': { label: '1st Half', className: 'bg-green-500' },
      'HT': { label: 'Half Time', className: 'bg-yellow-500' },
      '2H': { label: '2nd Half', className: 'bg-green-500' },
      'finished': { label: 'Full Time', className: 'bg-blue-500' },
      'FT': { label: 'Full Time', className: 'bg-blue-500' },
      'postponed': { label: 'Postponed', className: 'bg-gray-500' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-500' };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="px-6 pb-4 border-b border-gray-700">
      {/* League & Country */}
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-yellow-400" />
        <span className="text-sm text-gray-300">{fixture.leagueName || fixture.league}</span>
        {fixture.country && (
          <>
            <span className="text-gray-600">•</span>
            <MapPin className="w-3 h-3 text-gray-400" />
            <span className="text-sm text-gray-400">{fixture.country}</span>
          </>
        )}
      </div>

      {/* Teams & Score */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <div className="text-xl font-bold text-white mb-2">
            {fixture.homeTeamName || fixture.homeTeam}
          </div>
          <div className="text-xl font-bold text-white">
            {fixture.awayTeamName || fixture.awayTeam}
          </div>
        </div>

        {/* Score */}
        {fixture.score && (
          <div className="text-center px-6">
            <div className="text-3xl font-bold text-white">
              {fixture.score.home}
            </div>
            <div className="text-gray-500 text-sm my-1">-</div>
            <div className="text-3xl font-bold text-white">
              {fixture.score.away}
            </div>
          </div>
        )}
      </div>

      {/* Match Info */}
      <div className="flex items-center gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(fixture.date)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>{fixture.time}</span>
        </div>
        {getStatusBadge(fixture.status)}
      </div>
    </div>
  );
};

export default MatchDetailHeader;
