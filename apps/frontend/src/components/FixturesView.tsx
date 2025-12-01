import React, { useState, useEffect } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, Clock, RefreshCw,
  ChevronDown, ChevronUp, Trophy, AlertCircle
} from 'lucide-react';
import { fixturesApi } from '../services/api';
import MatchDetailDrawer from './fixtures/MatchDetailDrawer';
import { FavoriteButton } from './FavoriteButton';

interface Fixture {
  fixtureId: string;
  id?: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamName?: string;
  awayTeamName?: string;
  kickoff?: string;
  date?: string;
  time?: string;
  league: string;
  leagueName?: string;
  homeTeamId?: number;
  awayTeamId?: number;
  leagueId?: number;
  season?: number;
  country?: string;
  status?: string;
  homeScore?: number;
  awayScore?: number;
  score?: {
    home: number;
    away: number;
  };
  odds?: any;
  aiBets?: any;
}

interface GroupedFixtures {
  [league: string]: Fixture[];
}

interface FixturesViewProps {
  onClose?: () => void;
  embedded?: boolean;
}

const FixturesView: React.FC<FixturesViewProps> = ({ onClose, embedded = false }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [expandedLeagues, setExpandedLeagues] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Match Detail Drawer State
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [isMatchDetailOpen, setIsMatchDetailOpen] = useState(false);

  useEffect(() => {
    fetchFixtures();
    
    // Auto-refresh every 60 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchFixtures, 60000);
      return () => clearInterval(interval);
    }
  }, [selectedDate, autoRefresh]);

  const fetchFixtures = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dateStr = selectedDate.toISOString().split('T')[0];
      console.log('Fetching fixtures for:', dateStr);
      
      const response = await fixturesApi.getByDate(dateStr);
      
      if (response && response.data) {
        setFixtures(response.data);
        // Auto-expand all leagues on first load
        if (expandedLeagues.size === 0) {
          const leagues = new Set<string>(
            response.data
              .map((f: Fixture) => f.league || f.leagueName)
              .filter((league: string | undefined): league is string => Boolean(league))
          );
          setExpandedLeagues(leagues);
        }
      } else {
        setFixtures([]);
      }
    } catch (err: any) {
      console.error('Error fetching fixtures:', err);
      setError(err.message || 'Failed to load fixtures');
      setFixtures([]);
    } finally {
      setLoading(false);
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const toggleLeague = (league: string) => {
    const newExpanded = new Set(expandedLeagues);
    if (newExpanded.has(league)) {
      newExpanded.delete(league);
    } else {
      newExpanded.add(league);
    }
    setExpandedLeagues(newExpanded);
  };

  const handleFixtureClick = async (fixture: Fixture) => {
    try {
      // Fetch full fixture details including odds and aiBets
      const response = await fixturesApi.getById(Number(fixture.id || fixture.fixtureId));
      
      if (response.success && response.data) {
        setSelectedFixture(response.data);
        setIsMatchDetailOpen(true);
      } else {
        // Fallback to basic fixture data
        setSelectedFixture(fixture);
        setIsMatchDetailOpen(true);
      }
    } catch (err) {
      console.error('Error fetching fixture details:', err);
      // Still open drawer with basic data
      setSelectedFixture(fixture);
      setIsMatchDetailOpen(true);
    }
  };

  const closeMatchDetail = () => {
    setIsMatchDetailOpen(false);
    setTimeout(() => setSelectedFixture(null), 300); // Clear after animation
  };

  // Group fixtures by league
  const groupedFixtures: GroupedFixtures = fixtures.reduce((acc, fixture) => {
    const league = fixture.league || fixture.leagueName || 'Unknown League';
    if (!acc[league]) {
      acc[league] = [];
    }
    acc[league].push(fixture);
    return acc;
  }, {} as GroupedFixtures);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (fixture: Fixture) => {
    // Use time if available, otherwise parse kickoff or date
    if (fixture.time) return fixture.time;
    
    const dateStr = fixture.kickoff || fixture.date;
    if (!dateStr) return 'TBD';
    
    return new Date(dateStr).toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusConfig: Record<string, { label: string; className: string }> = {
      'scheduled': { label: 'Scheduled', className: 'bg-gray-500' },
      'NS': { label: 'Not Started', className: 'bg-gray-500' },
      'live': { label: 'LIVE', className: 'bg-red-500 animate-pulse' },
      'LIVE': { label: 'LIVE', className: 'bg-red-500 animate-pulse' },
      '1H': { label: '1st Half', className: 'bg-green-500' },
      'HT': { label: 'Half Time', className: 'bg-yellow-500' },
      '2H': { label: '2nd Half', className: 'bg-green-500' },
      'finished': { label: 'Full Time', className: 'bg-blue-500' },
      'FT': { label: 'Full Time', className: 'bg-blue-500' },
      'AET': { label: 'Extra Time', className: 'bg-purple-500' },
      'PEN': { label: 'Penalties', className: 'bg-purple-500' },
      'postponed': { label: 'Postponed', className: 'bg-gray-500' },
      'PST': { label: 'Postponed', className: 'bg-gray-500' },
      'CANC': { label: 'Cancelled', className: 'bg-red-500' },
      'ABD': { label: 'Abandoned', className: 'bg-red-500' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-500' };
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getScoreDisplay = (fixture: Fixture) => {
    // Check for score object first
    if (fixture.score) {
      return (
        <div className="text-lg font-bold text-white">
          {fixture.score.home ?? 0} - {fixture.score.away ?? 0}
        </div>
      );
    }
    
    // Fallback to individual score fields
    if (fixture.status && ['live', 'LIVE', '1H', 'HT', '2H', 'finished', 'FT', 'AET', 'PEN'].includes(fixture.status)) {
      return (
        <div className="text-lg font-bold text-white">
          {fixture.homeScore ?? 0} - {fixture.awayScore ?? 0}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`${embedded ? '' : 'min-h-screen'} bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">Match Fixtures</h1>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>

        {/* Date Navigation */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <button
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span className="text-xl font-semibold text-white">
                {formatDate(selectedDate)}
              </span>
            </div>

            <button
              onClick={() => changeDate(1)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Today
            </button>
            
            <button
              onClick={fetchFixtures}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4"
              />
              Auto-refresh
            </label>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading fixtures...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Fixtures List */}
        {!loading && !error && fixtures.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No fixtures found for this date</p>
          </div>
        )}

        {!loading && !error && fixtures.length > 0 && (
          <div className="space-y-4">
            {Object.entries(groupedFixtures).map(([league, leagueFixtures]) => (
              <div key={league} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                {/* League Header */}
                <button
                  onClick={() => toggleLeague(league)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span className="text-lg font-semibold text-white">{league}</span>
                    <span className="text-sm text-gray-400">({leagueFixtures.length} matches)</span>
                  </div>
                  {expandedLeagues.has(league) ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {/* League Fixtures */}
                {expandedLeagues.has(league) && (
                  <div className="border-t border-gray-700">
                    {leagueFixtures.map((fixture) => (
                      <div 
                        key={fixture.fixtureId || fixture.id} 
                        onClick={() => handleFixtureClick(fixture)}
                        className="px-6 py-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/30 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-400 w-16">
                                {formatTime(fixture)}
                              </span>
                              <FavoriteButton
                                fixtureId={Number(fixture.fixtureId || fixture.id)}
                                homeTeam={fixture.homeTeamName || fixture.homeTeam}
                                awayTeam={fixture.awayTeamName || fixture.awayTeam}
                                date={fixture.date || selectedDate.toISOString()}
                                league={league}
                                size="sm"
                              />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-white font-medium">
                                  {fixture.homeTeamName || fixture.homeTeam}
                                </span>
                                {getScoreDisplay(fixture) && (
                                  <span className="mx-4">{getScoreDisplay(fixture)}</span>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-white font-medium">
                                  {fixture.awayTeamName || fixture.awayTeam}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {getStatusBadge(fixture.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Match Detail Drawer */}
      <MatchDetailDrawer
        fixture={selectedFixture}
        isOpen={isMatchDetailOpen}
        onClose={closeMatchDetail}
      />
    </div>
  );
};

export default FixturesView;
