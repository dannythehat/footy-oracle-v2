import React, { useState, useEffect } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, RefreshCw,
  ChevronDown, ChevronUp, AlertCircle, Radio
} from 'lucide-react';
import { fixturesApi } from '../services/api';
import MatchDetailDrawer from './fixtures/MatchDetailDrawer';
import { FavoriteButton } from './FavoriteButton';
import { LeagueLogo } from './LeagueLogo';
import { TeamLogo } from './TeamLogo';

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
      
      // Refresh scores from API-Football BEFORE fetching from database
      try {
        await fixturesApi.refreshScores(dateStr);
      } catch (refreshError) {
        console.warn('Score refresh failed (continuing with cached data):', refreshError);
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
      const fixtureId = Number(fixture.id || fixture.fixtureId);
      
      // Use getComplete to get fixture + stats + events + h2h + standings
      const response = await fixturesApi.getComplete(fixtureId);
      
      // Extract the actual fixture data
      const fixtureData = response?.data || response;
      
      if (fixtureData && (fixtureData.fixtureId || fixtureData.id)) {
        // CRITICAL: Set fixture data FIRST, then open drawer
        setSelectedFixture(fixtureData);
        setIsMatchDetailOpen(true);
      } else {
        setSelectedFixture(fixture);
        setIsMatchDetailOpen(true);
      }
    } catch (err) {
      console.error('Error fetching complete fixture details:', err);
      // Even on error, set the fixture first, then open
      setSelectedFixture(fixture);
      setIsMatchDetailOpen(true);
    }
  };

  const closeMatchDetail = () => {
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
        <div className="flex items-center gap-1">
          <span className="text-red-500 font-bold text-[10px]">{elapsed}'</span>
          <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      );
    }

    // Half time
    if (statusShort === 'HT') {
      return <span className="text-orange-400 font-semibold text-[10px]">HT</span>;
    }

    // Finished
    if (status === 'finished' || statusShort === 'FT') {
      return <span className="text-gray-600 font-semibold text-[10px]">FT</span>;
    }

    // Postponed/Cancelled
    if (status === 'postponed' || statusShort === 'PST') {
      return <span className="text-yellow-500 font-semibold text-[10px]">PST</span>;
    }

    if (statusShort === 'CANC') {
      return <span className="text-red-500 font-semibold text-[10px]">CANC</span>;
    }

    // Scheduled - show time
    return <span className="text-gray-500 text-[10px]">{formatTime(fixture)}</span>;
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
        className={`px-2 py-1.5 border-b border-gray-800/50 last:border-b-0 hover:bg-gray-800/30 transition-colors cursor-pointer ${live ? 'bg-red-950/20' : ''}`}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Time/Status Column */}
          <div className="flex items-center justify-center w-10 flex-shrink-0">
            {getStatusDisplay(fixture)}
          </div>

          {/* Teams Column with Logos */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
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
            <div className="flex items-center justify-between">
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

  return (
    <div className={`${embedded ? '' : 'min-h-screen'} bg-[#0a0a0a]`}>
      <div className="container mx-auto px-2 py-3 max-w-6xl">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-base font-bold text-white">FIXTURES</h1>
          {onClose && (
            <button
              onClick={onClose}
              className="px-2 py-1 bg-gray-900 hover:bg-gray-800 text-white rounded text-xs transition-colors border border-gray-800"
            >
              Close
            </button>
          )}
        </div>

        {/* Compact Date Selector */}
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-2 mb-2">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Calendar className="w-3 h-3 text-gray-600" />
            <span className="text-[10px] font-semibold text-white">SELECT DATE</span>
          </div>
          
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            {dateRange.map((date, index) => {
              const selected = isSameDay(date, selectedDate);
              const today = isToday(date);
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`flex-shrink-0 px-2 py-1 rounded text-[10px] font-medium transition-colors border ${
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
                    <div className={`text-[9px] ${selected ? 'text-blue-200' : 'text-gray-600'}`}>
                      {date.toLocaleDateString('en-GB', { month: 'short' })}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Compact Controls */}
          <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-gray-800">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => changeDate(-1)}
                className="p-0.5 hover:bg-gray-900 rounded transition-colors"
              >
                <ChevronLeft className="w-3 h-3 text-gray-500" />
              </button>
              
              <span className="text-[10px] font-semibold text-white">
                {formatDate(selectedDate)}
              </span>

              <button
                onClick={() => changeDate(1)}
                className="p-0.5 hover:bg-gray-900 rounded transition-colors"
              >
                <ChevronRight className="w-3 h-3 text-gray-500" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={fetchFixtures}
                disabled={loading}
                className="flex items-center gap-1 px-2 py-0.5 bg-gray-900 hover:bg-gray-800 text-white rounded text-[10px] transition-colors disabled:opacity-50 border border-gray-800"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              <label className="flex items-center gap-1 text-white text-[10px]">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-2.5 h-2.5"
                />
                Auto
              </label>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-6">
            <RefreshCw className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-1.5" />
            <p className="text-gray-600 text-[10px]">Loading fixtures...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-2 mb-2">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3 text-red-400" />
              <p className="text-red-400 text-[10px]">{error}</p>
            </div>
          </div>
        )}

        {/* No Fixtures */}
        {!loading && !error && fixtures.length === 0 && (
          <div className="text-center py-6">
            <Calendar className="w-8 h-8 text-gray-700 mx-auto mb-1.5" />
            <p className="text-gray-600 text-xs">No fixtures for this date</p>
          </div>
        )}

        {/* Live Now Section - Compact Box */}
        {!loading && !error && liveFixtures.length > 0 && (
          <div className="mb-2">
            <div className="bg-[#0f0f0f] border-l-2 border-red-500 border-r border-t border-b border-gray-800 rounded-lg overflow-hidden">
              <div className="px-2 py-1.5 flex items-center justify-between bg-red-950/20 border-b border-gray-800">
                <div className="flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-red-400">LIVE NOW</span>
                  <span className="text-[9px] text-red-500 bg-red-950/40 px-1 py-0.5 rounded border border-red-900/50">
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

        {/* Fixtures List - Compact Boxes with League Logos */}
        {!loading && !error && fixtures.length > 0 && (
          <div className="space-y-1.5">
            {Object.entries(groupedFixtures).map(([league, leagueFixtures]) => {
              const firstFixture = leagueFixtures[0];
              return (
                <div key={league} className="bg-[#0f0f0f] border border-gray-800 rounded-lg overflow-hidden">
                  {/* League Header with Logo */}
                  <button
                    onClick={() => toggleLeague(league)}
                    className="w-full px-2 py-1.5 flex items-center justify-between hover:bg-gray-900/50 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <LeagueLogo
                        leagueId={firstFixture.leagueId}
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

                  {/* League Fixtures - Compact */}
                  {expandedLeagues.has(league) && (
                    <div className="border-t border-gray-800">
                      {leagueFixtures.map(renderFixtureRow)}
                    </div>
                  )}
                </div>
              );
            })}
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