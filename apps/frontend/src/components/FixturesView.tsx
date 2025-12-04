import React, { useState, useEffect } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, RefreshCw,
  ChevronDown, ChevronUp, AlertCircle, Radio
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

  // Generate date range: 7 days past, today, 7 days future
  const generateDateRange = () => {
    const dates: Date[] = [];
    const today = new Date();
    
    // 7 days in the past
    for (let i = 7; i > 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
    
    // Today
    dates.push(new Date(today));
    
    // 7 days in the future
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const dateRange = generateDateRange();

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
    console.log('🎯 Fixture clicked!', fixture);
    console.log('🎯 Fixture ID:', fixture.id || fixture.fixtureId);
    
    try {
      const response = await fixturesApi.getById(Number(fixture.id || fixture.fixtureId));
      console.log('✅ Fixture data fetched:', response);
      
      if (response.success && response.data) {
        console.log('✅ Setting selected fixture and opening drawer');
        setSelectedFixture(response.data);
        setIsMatchDetailOpen(true);
      } else {
        console.log('⚠️ No data in response, using original fixture');
        setSelectedFixture(fixture);
        setIsMatchDetailOpen(true);
      }
    } catch (err) {
      console.error('❌ Error fetching fixture details:', err);
      console.log('⚠️ Using original fixture data');
      setSelectedFixture(fixture);
      setIsMatchDetailOpen(true);
    }
    
    console.log('🎯 isMatchDetailOpen:', true);
    console.log('🎯 selectedFixture:', fixture);
  };

  const closeMatchDetail = () => {
    console.log('🚪 Closing match detail drawer');
    setIsMatchDetailOpen(false);
    setTimeout(() => setSelectedFixture(null), 300);
  };

  const isLive = (fixture: Fixture): boolean => {
    const status = fixture.status;
    const statusShort = fixture.statusShort;
    return status === 'live' || ['1H', '2H', 'ET', 'BT', 'P', 'HT'].includes(statusShort || '');
  };

  // Get live fixtures
  const liveFixtures = fixtures.filter(isLive);

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

  const formatDateShort = (date: Date) => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short'
    });
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
        <div className="flex items-center gap-1.5">
          <span className="text-red-500 font-bold text-xs">{elapsed}'</span>
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      );
    }

    // Half time
    if (statusShort === 'HT') {
      return <span className="text-orange-400 font-semibold text-xs">HT</span>;
    }

    // Finished
    if (status === 'finished' || statusShort === 'FT') {
      return <span className="text-gray-600 font-semibold text-xs">FT</span>;
    }

    // Postponed/Cancelled
    if (status === 'postponed' || statusShort === 'PST') {
      return <span className="text-yellow-500 font-semibold text-xs">PST</span>;
    }

    if (statusShort === 'CANC') {
      return <span className="text-red-500 font-semibold text-xs">CANC</span>;
    }

    // Scheduled - show time
    return <span className="text-gray-500 text-xs">{formatTime(fixture)}</span>;
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

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const renderFixtureRow = (fixture: Fixture) => {
    const score = getScore(fixture);
    const showScore = shouldShowScore(fixture);
    const live = isLive(fixture);
    
    return (
      <div 
        key={fixture.fixtureId || fixture.id} 
        onClick={() => handleFixtureClick(fixture)}
        className={`px-3 py-2 border-b border-gray-800/50 last:border-b-0 hover:bg-gray-800/30 transition-colors cursor-pointer ${live ? 'bg-red-950/20' : ''}`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Time/Status Column */}
          <div className="flex items-center justify-center w-12 flex-shrink-0">
            {getStatusDisplay(fixture)}
          </div>

          {/* Teams Column */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className={`text-xs font-medium truncate ${live ? 'text-white' : 'text-gray-300'}`}>
                {fixture.homeTeamName || fixture.homeTeam}
              </span>
              {showScore && (
                <span className={`text-sm font-bold ml-2 ${live ? 'text-red-400' : 'text-white'}`}>
                  {score.home ?? '-'}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium truncate ${live ? 'text-white' : 'text-gray-300'}`}>
                {fixture.awayTeamName || fixture.awayTeam}
              </span>
              {showScore && (
                <span className={`text-sm font-bold ml-2 ${live ? 'text-red-400' : 'text-white'}`}>
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

  return (
    <div className={`${embedded ? '' : 'min-h-screen'} bg-[#0a0a0a]`}>
      <div className="container mx-auto px-3 py-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">FIXTURES</h1>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded text-sm transition-colors border border-gray-800"
            >
              Close
            </button>
          )}
        </div>

        {/* Date Range Selector - Horizontal Scroll */}
        <div className="bg-[#0f0f0f] border border-gray-800 rounded p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-xs font-semibold text-white">Select Date</span>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            {dateRange.map((date, index) => {
              const selected = isSameDay(date, selectedDate);
              const today = isToday(date);
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`flex-shrink-0 px-3 py-2 rounded text-xs font-medium transition-colors border ${
                    selected
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : today
                      ? 'bg-gray-800 border-gray-700 text-blue-400'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  <div className="text-center">
                    <div className={`font-semibold ${selected ? 'text-white' : today ? 'text-blue-400' : 'text-gray-300'}`}>
                      {date.getDate()}
                    </div>
                    <div className={`text-xs ${selected ? 'text-blue-200' : 'text-gray-600'}`}>
                      {date.toLocaleDateString('en-GB', { month: 'short' })}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeDate(-1)}
                className="p-1 hover:bg-gray-900 rounded transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
              </button>
              
              <span className="text-xs font-semibold text-white">
                {formatDate(selectedDate)}
              </span>

              <button
                onClick={() => changeDate(1)}
                className="p-1 hover:bg-gray-900 rounded transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchFixtures}
                disabled={loading}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-900 hover:bg-gray-800 text-white rounded text-xs transition-colors disabled:opacity-50 border border-gray-800"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              <label className="flex items-center gap-1.5 text-white text-xs">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-3 h-3"
                />
                Auto
              </label>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-10">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
            <p className="text-gray-600 text-xs">Loading fixtures...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-950/30 border border-red-900/50 rounded p-3 mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          </div>
        )}

        {/* No Fixtures */}
        {!loading && !error && fixtures.length === 0 && (
          <div className="text-center py-10">
            <Calendar className="w-10 h-10 text-gray-700 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">No fixtures for this date</p>
          </div>
        )}

        {/* Live Now Section - Flat Design */}
        {!loading && !error && liveFixtures.length > 0 && (
          <div className="mb-3">
            <div className="bg-[#0f0f0f] border-l-2 border-red-500 border-r border-t border-b border-gray-800 rounded overflow-hidden">
              <div className="px-3 py-2 flex items-center justify-between bg-red-950/20 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  <span className="text-xs font-bold text-red-400">LIVE NOW</span>
                  <span className="text-xs text-red-500 bg-red-950/40 px-1.5 py-0.5 rounded border border-red-900/50">
                    {liveFixtures.length}
                  </span>
                </div>
              </div>
              <div>
                {liveFixtures.map(renderFixtureRow)}
              </div>
            </div>
          </div>
        )}

        {/* Fixtures List - Flat Design */}
        {!loading && !error && fixtures.length > 0 && (
          <div className="space-y-2">
            {Object.entries(groupedFixtures).map(([league, leagueFixtures]) => (
              <div key={league} className="bg-[#0f0f0f] border border-gray-800 rounded overflow-hidden">
                {/* League Header - Compact */}
                <button
                  onClick={() => toggleLeague(league)}
                  className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-900/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{league}</span>
                    <span className="text-xs text-gray-600">({leagueFixtures.length})</span>
                  </div>
                  {expandedLeagues.has(league) ? (
                    <ChevronUp className="w-3.5 h-3.5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                  )}
                </button>

                {/* League Fixtures - Compact Style */}
                {expandedLeagues.has(league) && (
                  <div className="border-t border-gray-800">
                    {leagueFixtures.map(renderFixtureRow)}
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