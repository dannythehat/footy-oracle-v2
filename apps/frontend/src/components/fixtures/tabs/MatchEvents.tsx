import React, { useEffect, useState } from 'react';
import { Target, AlertCircle, ArrowRightLeft, Loader, Clock } from 'lucide-react';
import { fixturesApi } from '../../../services/api';

interface MatchEventsProps {
  fixture: any;
}

interface MatchEvent {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: {
    id: number;
    name: string;
    logo: string;
  };
  player: {
    id: number;
    name: string;
  };
  assist: {
    id: number | null;
    name: string | null;
  };
  type: string; // 'Goal', 'Card', 'subst'
  detail: string; // 'Normal Goal', 'Yellow Card', 'Substitution 1', etc.
  comments: string | null;
}

const MatchEvents: React.FC<MatchEventsProps> = ({ fixture }) => {
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // CRITICAL: Check for valid fixture ID before attempting to fetch
    const fixtureId = fixture?.id || fixture?.fixtureId;
    
    if (!fixtureId) {
      console.warn('⚠️ MatchEvents: No fixture ID available');
      setError('Missing fixture data');
      setLoading(false);
      return;
    }

    fetchEvents();
  }, [fixture?.id, fixture?.fixtureId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const fixtureId = fixture.id || fixture.fixtureId;

      if (!fixtureId) {
        throw new Error('Missing fixture ID');
      }

      console.log('⚡ Fetching events for fixture:', fixtureId);
      const response = await fixturesApi.getEvents(Number(fixtureId));

      if (response.success && response.data) {
        setEvents(response.data);
      } else {
        setError('No events available yet');
      }
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string, detail: string) => {
    if (type === 'Goal') {
      return <Target className="w-5 h-5 text-green-400" />;
    }
    if (type === 'Card') {
      if (detail.includes('Red')) {
        return <div className="w-4 h-6 bg-red-500 rounded-sm shadow-lg" />;
      }
      return <div className="w-4 h-6 bg-yellow-400 rounded-sm shadow-lg" />;
    }
    if (type === 'subst') {
      return <ArrowRightLeft className="w-5 h-5 text-blue-400" />;
    }
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  const getEventColor = (type: string, detail: string) => {
    if (type === 'Goal') return 'border-green-500/50 bg-green-900/20';
    if (type === 'Card' && detail.includes('Red')) return 'border-red-500/50 bg-red-900/20';
    if (type === 'Card') return 'border-yellow-500/50 bg-yellow-900/20';
    if (type === 'subst') return 'border-blue-500/50 bg-blue-900/20';
    return 'border-gray-500/50 bg-gray-900/20';
  };

  const isHomeTeam = (teamId: number) => {
    return teamId === fixture.homeTeamId;
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-12">
        <div className="relative">
          <Loader className="w-8 h-8 text-purple-400 animate-spin mb-3 drop-shadow-lg" />
          <div className="absolute inset-0 blur-xl bg-purple-500/20 animate-pulse"></div>
        </div>
        <p className="text-gray-400 text-sm">Loading match events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-700/50 rounded-lg p-4 flex items-start gap-3 shadow-lg backdrop-blur-sm">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5 drop-shadow-lg" />
          <div>
            <p className="text-yellow-300 font-medium drop-shadow-lg">No Events Available</p>
            <p className="text-yellow-400/80 text-sm mt-1">
              {error === 'No events available yet' 
                ? 'Match events will appear here once the game starts'
                : error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 rounded-lg p-8 text-center shadow-lg backdrop-blur-sm">
          <Clock className="w-12 h-12 text-gray-500 mx-auto mb-3 drop-shadow-lg" />
          <p className="text-gray-400 font-medium drop-shadow-lg">No Events Yet</p>
          <p className="text-gray-500 text-sm mt-1">Match events will appear here during the game</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-3">
        {events.map((event, index) => {
          const isHome = isHomeTeam(event.team.id);
          
          return (
            <div
              key={index}
              className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-lg backdrop-blur-sm ${getEventColor(event.type, event.detail)}`}
            >
              <div className="flex items-center gap-4">
                {/* Time */}
                <div className="flex-shrink-0 w-12 text-center">
                  <span className="text-white font-bold text-lg drop-shadow-lg">
                    {event.time.elapsed}'
                  </span>
                  {event.time.extra && (
                    <span className="text-xs text-gray-400">+{event.time.extra}</span>
                  )}
                </div>

                {/* Icon */}
                <div className="flex-shrink-0">
                  {getEventIcon(event.type, event.detail)}
                </div>

                {/* Event Details */}
                <div className="flex-1">
                  <div className={`flex items-center gap-2 ${isHome ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={isHome ? 'text-left' : 'text-right'}>
                      <p className="text-white font-semibold drop-shadow-lg">
                        {event.player.name}
                      </p>
                      {event.assist.name && event.type === 'Goal' && (
                        <p className="text-gray-400 text-sm">
                          Assist: {event.assist.name}
                        </p>
                      )}
                      <p className="text-gray-500 text-xs mt-0.5">
                        {event.detail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Team Badge */}
                <div className="flex-shrink-0">
                  <img
                    src={event.team.logo}
                    alt={event.team.name}
                    className="w-8 h-8 object-contain drop-shadow-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>

              {event.comments && (
                <div className="mt-2 pl-16 text-gray-400 text-sm italic">
                  {event.comments}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MatchEvents;
