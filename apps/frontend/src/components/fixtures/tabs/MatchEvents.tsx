import React from 'react';
import { Activity, AlertCircle, Target, Users, AlertTriangle, ArrowRightLeft } from 'lucide-react';

interface MatchEventsProps {
  fixture: any;
}

const MatchEvents: React.FC<MatchEventsProps> = ({ fixture }) => {
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

  const events = fixture.events || [];
  const hasEvents = events && events.length > 0;

  const getEventIcon = (type: string) => {
    const iconClass = "w-4 h-4";
    switch (type.toLowerCase()) {
      case 'goal':
        return <Target className={`${iconClass} text-green-600`} />;
      case 'card':
      case 'yellow card':
        return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
      case 'red card':
        return <AlertTriangle className={`${iconClass} text-red-600`} />;
      case 'subst':
      case 'substitution':
        return <ArrowRightLeft className={`${iconClass} text-blue-600`} />;
      default:
        return <Activity className={`${iconClass} text-gray-600`} />;
    }
  };

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-900">Match Events</h3>
      </div>

      {!hasEvents && (
        <div className="text-center py-8 text-gray-500 text-sm">
          Events will appear here during the match
        </div>
      )}

      {hasEvents && (
        <div className="space-y-3">
          {events.map((event: any, index: number) => {
            const isHome = event.team?.id === fixture.teams?.home?.id;
            
            return (
              <div 
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  isHome ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'
                }`}
              >
                {/* Time */}
                <div className="text-xs font-bold text-gray-900 w-8">
                  {event.time?.elapsed}'
                </div>

                {/* Icon */}
                <div className="flex-shrink-0">
                  {getEventIcon(event.type)}
                </div>

                {/* Event Details */}
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {event.player?.name || 'Unknown Player'}
                  </div>
                  {event.assist?.name && (
                    <div className="text-xs text-gray-600">
                      Assist: {event.assist.name}
                    </div>
                  )}
                  {event.detail && (
                    <div className="text-xs text-gray-600">
                      {event.detail}
                    </div>
                  )}
                </div>

                {/* Team Badge */}
                <div className={`text-xs font-semibold px-2 py-1 rounded ${
                  isHome ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                }`}>
                  {isHome ? 'H' : 'A'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MatchEvents;
