import React, { useState, useEffect } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, RefreshCw,
  ChevronDown, ChevronUp, AlertCircle
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
  statusShort?: string;
  elapsed?: number;
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
    
    // Auto-refresh every 30 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchFixtures, 30000);
      return () => clearInterval(interval);
    }
  }, [selectedDate, autoRefresh]);

  const fetchFixtures = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dateStr = selectedDate.toISOString().split('T')[0];
      console.log('Fetching fixtures for:', dateStr);
      
      // Refresh scores from API-Football BEFORE fetching from database
      try {
        console.log('🔄 Refreshing live scores from API...');
        await fixturesApi.refreshScores(dateStr);
        console.log('✅ Scores refreshed successfully');
      } catch (refreshError) {
        console.warn('⚠️ Score refresh failed (continuing with cached data):', refreshError);
      }
      
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
      const response = await fixturesApi.getById(Number(fixture.id || fixture.fixtureId));
      
      if (response.success && response.data) {
        setSelectedFixture(response.data);
        setIsMatchDetailOpen(true);
      } else {
        setSelectedFixture(fixture);
        setIsMatchDetailOpen(true);
      }
    } catch (err) {
      console.error('Error fetching fixture details:', err);
      setSelectedFixture(fixture);
      setIsMatchDetailOpen(true);
    }
  };

  const closeMatchDetail = () => {
    setIsMatchDetailOpen(false);
    setTimeout(() => setSelectedFixture(null), 300);
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
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'TODAY';
    if (date.toDateString() === tomorrow.toDateString()) return 'TOMORROW';
    if (date.toDateString() === yesterday.toDateString()) return 'YESTERDAY';
    
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    }).toUpperCase();
  };

  const formatTime = (fixture: Fixture) => {
    if (fixture.time) return fixture.time;
    
    const dateStr = fixture.kickoff || fixture.date;
    if (!dateStr) return 'TBD';
    
    return new Date(dateStr).toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusDisplay = (fixture: Fixture) => {
    const status = fixture.status;
    const statusShort = fixture.statusShort;
    const elapsed = fixture.elapsed;

    // Live match statuses
    if (status === 'live' || ['1H', '2H', 'ET', 'BT', 'P'].includes(statusShort || '')) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-red-500 font-bold text-sm">{elapsed}'</span>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      );
    }

    // Half time
    if (statusShort === 'HT') {
      return <span className="text-orange-400 font-semibold text-sm">HT</span>;
    }

    // Finished
    if (status === 'finished' || statusShort === 'FT') {
      return <span className="text-gray-500 font-semibold text-sm">FT</span>;
    }

    // Postponed/Cancelled
    if (status === 'postponed' || statusShort === 'PST') {
      return <span className="text-yellow-500 font-semibold text-sm">PST</span>;
    }

    if (statusShort === 'CANC') {
      return <span className="text-red-500 font-semibold text-sm">CANC</span>;
    }

    // Scheduled - show time
    return <span className="text-gray-400 text-sm">{formatTime(fixture)}</span>;
  };

  const getScore = (fixture: Fixture): { home: number | null; away: number | null } => {
    // Try score object first
    if (fixture.score) {
      return {
        home: fixture.score.home ?? null,
        away: fixture.score.away ?? null
      };
    }
    
    // Try individual fields
    if (fixture.homeScore !== undefined || fixture.awayScore !== undefined) {
      return {
        home: fixture.homeScore ?? null,
        away: fixture.awayScore ?? null
      };
    }

    return { home: null, away: null };
  };

  const shouldShowScore = (fixture: Fixture): boolean => {
    const status = fixture.status;
    const statusShort = fixture.statusShort;
    return status === 'live' || 
           status === 'finished' || 
           ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'FT', 'AET', 'PEN'].includes(statusShort || '');
  };

  return (
    <div className={`${embedded ? '' : 'min-h-screen'} bg-[#1a1a2e]`}>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">FIXTURES</h1>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
            >
              Close
            </button>
          )}
        </div>

        {/* Date Navigation - FlashScore Style */}
        <div className="bg-[#16213e] rounded-lg p-4 mb-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-lg font-bold text-white">
                {formatDate(selectedDate)}
              </span>
            </div>

            <button
              onClick={() => changeDate(1)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-3 py-1.5 bg-[#0f3460] hover:bg-[#1a4d7a] text-white rounded text-sm transition-colors"
            >
              Today
            </button>
            
            <button
              onClick={fetchFixtures}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#0f3460] hover:bg-[#1a4d7a] text-white rounded text-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <label className="flex items-center gap-2 text-white text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-3.5 h-3.5"
              />
              Auto
            </label>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Loading fixtures...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* No Fixtures */}
        {!loading && !error && fixtures.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No fixtures for this date</p>
          </div>
        )}

        {/* Fixtures List - FlashScore Style */}
        {!loading && !error && fixtures.length > 0 && (
          <div className="space-y-3">
            {Object.entries(groupedFixtures).map(([league, leagueFixtures]) => (
              <div key={league} className="bg-[#16213e] rounded-lg border border-gray-700 overflow-hidden">
                {/* League Header - Compact */}
                <button
                  onClick={() => toggleLeague(league)}
                  className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{league}</span>
                    <span className="text-xs text-gray-500">({leagueFixtures.length})</span>
                  </div>
                  {expandedLeagues.has(league) ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {/* League Fixtures - FlashScore Compact Style */}
                {expandedLeagues.has(league) && (
                  <div className="border-t border-gray-700">
                    {leagueFixtures.map((fixture) => {
                      const score = getScore(fixture);
                      const showScore = shouldShowScore(fixture);
                      
                      return (
                        <div 
                          key={fixture.fixtureId || fixture.id} 
                          onClick={() => handleFixtureClick(fixture)}
                          className="px-4 py-3 border-b border-gray-700/50 last:border-b-0 hover:bg-gray-700/20 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-4">
                            {/* Time/Status Column */}
                            <div className="flex items-center justify-center w-16 flex-shrink-0">
                              {getStatusDisplay(fixture)}
                            </div>

                            {/* Teams Column */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-white text-sm font-medium truncate">
                                  {fixture.homeTeamName || fixture.homeTeam}
                                </span>
                                {showScore && (
                                  <span className="text-white text-base font-bold ml-2">
                                    {score.home ?? '-'}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-white text-sm font-medium truncate">
                                  {fixture.awayTeamName || fixture.awayTeam}
                                </span>
                                {showScore && (
                                  <span className="text-white text-base font-bold ml-2">
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
                                league={league}
                                size="sm"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
