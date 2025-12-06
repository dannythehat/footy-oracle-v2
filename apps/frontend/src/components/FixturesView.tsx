import React, { useState, useEffect } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, RefreshCw,
  ChevronDown, ChevronUp, AlertCircle, Radio, Star
} from 'lucide-react';
import { fixturesApi } from '../services/api';
import MatchDetailDrawer from './fixtures/MatchDetailDrawer';
import { FavoriteButton } from './FavoriteButton';
import LiveMatchStats from './LiveMatchStats';
import { LeagueLogo } from './LeagueLogo';
import { TeamLogo } from './TeamLogo';
import { useFavoriteLeagues } from '../hooks/useFavoriteLeagues';

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
  const [expandedLiveLeagues, setExpandedLiveLeagues] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Match Detail Drawer State
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [isMatchDetailOpen, setIsMatchDetailOpen] = useState(false);

  // Favorite Leagues Hook
  const { isFavoriteLeague, toggleFavoriteLeague } = useFavoriteLeagues();

  // Helper function to format league name with country
  const formatLeagueName = (fixture: Fixture): string => {
    const league = fixture.league || fixture.leagueName || 'Unknown League';
    const country = fixture.country;
    
    // If country exists and is not already in the league name, prepend it
    if (country && !league.toLowerCase().includes(country.toLowerCase())) {
      return `${country}: ${league}`;
    }
    
    return league;
  };

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
    fetchFixtures(true);
    
    // Auto-refresh every 30 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(() => fetchFixtures(false), 30000);
      return () => clearInterval(interval);
    }
  }, [selectedDate, autoRefresh]);

  const fetchFixtures = async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
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
        
        // Auto-expand all regular leagues on first load
        if (expandedLeagues.size === 0) {
          const leagues = new Set<string>(
            response.data
              .map((f: Fixture) => formatLeagueName(f))
              .filter((league: string | undefined): league is string => Boolean(league))
          );
          setExpandedLeagues(leagues);
        }
        
        // Auto-expand all live leagues
        const liveFixtures = response.data.filter(isLive);
        const liveLeagues = new Set<string>(
          liveFixtures
            .map((f: Fixture) => formatLeagueName(f))
            .filter((league: string | undefined): league is string => Boolean(league))
        );
        setExpandedLiveLeagues(liveLeagues);
      } else {
        setFixtures([]);
      }
    } catch (err: any) {
      console.error('Error fetching fixtures:', err);
      setError(err.message || 'Failed to load fixtures');
      setFixtures([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const toggleLiveLeague = (league: string) => {
    const newExpanded = new Set(expandedLiveLeagues);
    if (newExpanded.has(league)) {
      newExpanded.delete(league);
    } else {
      newExpanded.add(league);
    }
    setExpandedLiveLeagues(newExpanded);
  };

  const handleLeagueFavoriteClick = (e: React.MouseEvent, league: string, country?: string) => {
    e.stopPropagation();
    toggleFavoriteLeague({ leagueName: league, country });
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

  // Group live fixtures by league (with country)
  const groupedLiveFixtures: GroupedFixtures = liveFixtures.reduce((acc, fixture) => {
    const league = formatLeagueName(fixture);
    if (!acc[league]) {
      acc[league] = [];
    }
    acc[league].push(fixture);
    return acc;
  }, {} as GroupedFixtures);

  // Group fixtures by league (with country)
  const groupedFixtures: GroupedFixtures = fixtures.reduce((acc, fixture) => {
    const league = formatLeagueName(fixture);
    if (!acc[league]) {
      acc[league] = [];
    }
    acc[league].push(fixture);
    return acc;
  }, {} as GroupedFixtures);

  // Sort leagues: favorites first, then alphabetically
  const sortLeagues = (leagues: [string, Fixture[]][]): [string, Fixture[]][] => {
    return leagues.sort(([leagueA], [leagueB]) => {
      const aIsFavorite = isFavoriteLeague(leagueA);
      const bIsFavorite = isFavoriteLeague(leagueB);
      
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return leagueA.localeCompare(leagueB);
    });
  };

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
          <span className="text-red-500 font-bold text-[10px] sm:text-xs">{elapsed}'</span>
          <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      );
    }

    // Half time
    if (statusShort === 'HT') {
      return <span className="text-orange-400 font-semibold text-[10px] sm:text-xs">HT</span>;
    }

    // Finished
    if (status === 'finished' || statusShort === 'FT') {
      return <span className="text-gray-600 font-semibold text-[10px] sm:text-xs">FT</span>;
    }

    // Postponed/Cancelled
    if (status === 'postponed' || statusShort === 'PST') {
      return <span className="text-yellow-500 font-semibold text-[10px] sm:text-xs">PST</span>;
    }

    if (statusShort === 'CANC') {
      return <span className="text-red-500 font-semibold text-[10px] sm:text-xs">CANC</span>;
    }

    // Scheduled - show time
    return <span className="text-gray-500 text-[10px] sm:text-xs">{formatTime(fixture)}</span>;
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
        className={`px-3 py-2 sm:px-2 sm:py-1.5 border-b border-gray-800/50 last:border-b-0 hover:bg-gray-800/30 active:bg-gray-800/50 transition-colors cursor-pointer ${live ? 'bg-purple-950/20 border-l-2 border-l-purple-500' : ''}`}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-1.5">
          {/* Time/Status Column - Mobile optimized */}
          <div className="flex items-center justify-center w-12 sm:w-10 flex-shrink-0">
            {getStatusDisplay(fixture)}
          </div>

          {/* Teams Column with Logos - Mobile optimized */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1 sm:mb-0.5">
              <div className="flex items-center gap-2 sm:gap-1.5 flex-1 min-w-0">
                <TeamLogo
                  teamId={fixture.homeTeamId}
                  teamName={fixture.homeTeamName || fixture.homeTeam}
                  size="sm"
                />
                <span className={`text-xs sm:text-[11px] font-medium truncate ${live ? 'text-white' : 'text-gray-300'}`}>
                  {fixture.homeTeamName || fixture.homeTeam}
                </span>
              </div>
              {showScore && (
                <span className={`text-sm sm:text-xs font-bold ml-2 ${live ? 'text-purple-400' : 'text-white'}`}>
                  {score.home ?? '-'}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-1.5 flex-1 min-w-0">
                <TeamLogo
                  teamId={fixture.awayTeamId}
                  teamName={fixture.awayTeamName || fixture.awayTeam}
                  size="sm"
                />
                <span className={`text-xs sm:text-[11px] font-medium truncate ${live ? 'text-white' : 'text-gray-300'}`}>
                  {fixture.awayTeamName || fixture.awayTeam}
                </span>
              </div>
              {showScore && (
                <span className={`text-sm sm:text-xs font-bold ml-2 ${live ? 'text-purple-400' : 'text-white'}`}>
                  {score.away ?? '-'}
                </span>
              )}
            </div>
          </div>

          {/* Favorite Button - Mobile optimized touch target */}
          <div className="flex-shrink-0 min-w-[44px] flex items-center justify-center sm:min-w-0">
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

        {/* Live Stats - Only show for live matches */}
        {live && (
          <LiveMatchStats 
            fixtureId={Number(fixture.fixtureId || fixture.id)} 
            compact={true}
          />
        )}
      </div>
    );
  };

  return (
    <div className={`${embedded ? '' : 'min-h-screen'} bg-[#0a0a0a]`}>
      <div className="container mx-auto px-3 py-4 sm:px-2 sm:py-3 max-w-6xl">
        {/* Header - Mobile optimized */}
        <div className="flex items-center justify-between mb-3 sm:mb-2">
          <h1 className="text-lg sm:text-base font-bold text-white">FIXTURES</h1>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 sm:px-2 sm:py-1 bg-gray-900 hover:bg-gray-800 active:bg-gray-700 text-white rounded text-sm sm:text-xs transition-colors border border-gray-800 min-h-[44px] sm:min-h-0"
            >
              Close
            </button>
          )}
        </div>

        {/* Date Selector - Mobile optimized */}
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-3 sm:p-2 mb-3 sm:mb-2">
          <div className="flex items-center gap-2 sm:gap-1.5 mb-2 sm:mb-1.5">
            <Calendar className="w-4 h-4 sm:w-3 sm:h-3 text-gray-600" />
            <span className="text-xs sm:text-[10px] font-semibold text-white">SELECT DATE</span>
          </div>
          
          {/* Horizontal scroll date picker - Mobile optimized */}
          <div className="flex items-center gap-2 sm:gap-1.5 overflow-x-auto pb-2 sm:pb-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 -mx-1 px-1">
            {dateRange.map((date, index) => {
              const selected = isSameDay(date, selectedDate);
              const today = isToday(date);
              const dateLabel = today ? 'Today' : date.getDate().toString();
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`flex-shrink-0 px-3 py-2 sm:px-2 sm:py-1 rounded text-xs sm:text-[10px] font-medium transition-all border min-h-[44px] sm:min-h-0 ${
                    selected
                      ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/50'
                      : today
                      ? 'bg-purple-900/30 border-purple-700 text-purple-400 font-bold'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800 active:bg-gray-700'
                  }`}
                >
                  <div className="text-center">
                    <div className={`font-semibold ${selected ? 'text-white' : today ? 'text-purple-400' : 'text-gray-300'}`}>
                      {dateLabel}
                    </div>
                    <div className={`text-[10px] sm:text-[9px] ${selected ? 'text-purple-200' : today ? 'text-purple-500' : 'text-gray-600'}`}>
                      {date.toLocaleDateString('en-GB', { month: 'short' })}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Controls - Mobile optimized */}
          <div className="flex items-center justify-between mt-2 sm:mt-1.5 pt-2 sm:pt-1.5 border-t border-gray-800">
            <div className="flex items-center gap-2 sm:gap-1.5">
              <button
                onClick={() => changeDate(-1)}
                className="p-2 sm:p-0.5 hover:bg-gray-900 active:bg-gray-800 rounded transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4 sm:w-3 sm:h-3 text-gray-500" />
              </button>
              
              <span className={`text-xs sm:text-[10px] font-semibold ${isToday(selectedDate) ? 'text-purple-400' : 'text-white'}`}>
                {formatDate(selectedDate)}
              </span>

              <button
                onClick={() => changeDate(1)}
                className="p-2 sm:p-0.5 hover:bg-gray-900 active:bg-gray-800 rounded transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4 sm:w-3 sm:h-3 text-gray-500" />
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-1.5">
              <button
                onClick={() => fetchFixtures(true)}
                disabled={loading || refreshing}
                className="flex items-center gap-1.5 sm:gap-1 px-3 py-2 sm:px-2 sm:py-0.5 bg-gray-900 hover:bg-gray-800 active:bg-gray-700 text-white rounded text-xs sm:text-[10px] transition-colors disabled:opacity-50 border border-gray-800 min-h-[44px] sm:min-h-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-2.5 sm:h-2.5 ${(loading || refreshing) ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <label className="flex items-center gap-1.5 sm:gap-1 text-white text-xs sm:text-[10px] min-h-[44px] sm:min-h-0">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 sm:w-2.5 sm:h-2.5"
                />
                Auto
              </label>
            </div>
          </div>
        </div>

        {/* Loading State - Only show on initial load */}
        {loading && !refreshing && (
          <div className="text-center py-8 sm:py-6">
            <RefreshCw className="w-8 h-8 sm:w-6 sm:h-6 text-purple-500 animate-spin mx-auto mb-2 sm:mb-1.5" />
            <p className="text-gray-600 text-xs sm:text-[10px]">Loading fixtures...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3 sm:p-2 mb-3 sm:mb-2">
            <div className="flex items-center gap-2 sm:gap-1.5">
              <AlertCircle className="w-4 h-4 sm:w-3 sm:h-3 text-red-400" />
              <p className="text-red-400 text-xs sm:text-[10px]">{error}</p>
            </div>
          </div>
        )}

        {/* No Fixtures */}
        {!loading && !error && fixtures.length === 0 && (
          <div className="text-center py-8 sm:py-6">
            <Calendar className="w-10 h-10 sm:w-8 sm:h-8 text-gray-700 mx-auto mb-2 sm:mb-1.5" />
            <p className="text-gray-600 text-sm sm:text-xs">No fixtures for this date</p>
          </div>
        )}

        {/* Live Now Section - Grouped by League - Mobile optimized */}
        {!loading && !error && liveFixtures.length > 0 && (
          <div className="mb-3 sm:mb-2">
            <div className="bg-[#0f0f0f] border-l-2 border-purple-500 border-r border-t border-b border-gray-800 rounded-lg overflow-hidden shadow-lg shadow-purple-500/20">
              <div className="px-3 py-2 sm:px-2 sm:py-1.5 flex items-center justify-between bg-purple-950/30 border-b border-gray-800">
                <div className="flex items-center gap-2 sm:gap-1.5">
                  <Radio className="w-4 h-4 sm:w-3 sm:h-3 text-purple-500 animate-pulse" />
                  <span className="text-xs sm:text-[10px] font-bold text-purple-400">LIVE NOW</span>
                  <span className="text-[10px] sm:text-[9px] text-purple-400 bg-purple-950/60 px-1.5 py-0.5 sm:px-1 sm:py-0.5 rounded border border-purple-700/50">
                    {liveFixtures.length}
                  </span>
                </div>
              </div>
              
              {/* Live Leagues - Mobile optimized with enhanced borders */}
              <div className="space-y-0">
                {sortLeagues(Object.entries(groupedLiveFixtures)).map(([league, leagueFixtures], index, array) => {
                  const firstFixture = leagueFixtures[0];
                  const isFavorite = isFavoriteLeague(league);
                  const isLast = index === array.length - 1;
                  return (
                    <div 
                      key={league} 
                      className={`${!isLast ? 'border-b-2 border-purple-900/50 mb-2' : ''}`}
                    >
                      {/* Live League Header - Mobile optimized touch target */}
                      <div className="w-full px-3 py-2 sm:px-2 sm:py-1.5 flex items-center justify-between hover:bg-gray-900/30 min-h-[44px] sm:min-h-0 bg-gradient-to-r from-purple-950/20 to-transparent">
                        <button
                          onClick={() => toggleLiveLeague(league)}
                          className="flex items-center gap-2 sm:gap-1.5 flex-1"
                        >
                          <LeagueLogo
                            leagueId={firstFixture.leagueId}
                            leagueName={league}
                            size="sm"
                          />
                          <span className="text-xs sm:text-[10px] font-semibold text-white">{league}</span>
                          <span className="text-[10px] sm:text-[9px] text-gray-600">({leagueFixtures.length})</span>
                        </button>
                        <div className="flex items-center gap-2 sm:gap-1">
                          <button
                            onClick={(e) => handleLeagueFavoriteClick(e, league, firstFixture.country)}
                            className="p-1 hover:bg-gray-800/50 rounded transition-colors"
                            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Star
                              className={`w-4 h-4 sm:w-3 sm:h-3 ${isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                            />
                          </button>
                          <button onClick={() => toggleLiveLeague(league)}>
                            {expandedLiveLeagues.has(league) ? (
                              <ChevronUp className="w-4 h-4 sm:w-3 sm:h-3 text-gray-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 sm:w-3 sm:h-3 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Live League Fixtures */}
                      {expandedLiveLeagues.has(league) && (
                        <div>
                          {leagueFixtures.map(renderFixtureRow)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Fixtures List - Mobile optimized */}
        {!loading && !error && fixtures.length > 0 && (
          <div className="space-y-2 sm:space-y-1.5">
            {sortLeagues(Object.entries(groupedFixtures)).map(([league, leagueFixtures]) => {
              const firstFixture = leagueFixtures[0];
              const isFavorite = isFavoriteLeague(league);
              return (
                <div key={league} className="bg-[#0f0f0f] border border-gray-800 rounded-lg overflow-hidden">
                  {/* League Header with Logo and Star - Mobile optimized */}
                  <div className="w-full px-3 py-2 sm:px-2 sm:py-1.5 flex items-center justify-between hover:bg-gray-900/50 min-h-[44px] sm:min-h-0">
                    <button
                      onClick={() => toggleLeague(league)}
                      className="flex items-center gap-2 sm:gap-1.5 flex-1"
                    >
                      <LeagueLogo
                        leagueId={firstFixture.leagueId}
                        leagueName={league}
                        size="sm"
                      />
                      <span className="text-xs sm:text-[11px] font-bold text-white">{league}</span>
                      <span className="text-[10px] sm:text-[9px] text-gray-600">({leagueFixtures.length})</span>
                    </button>
                    <div className="flex items-center gap-2 sm:gap-1">
                      <button
                        onClick={(e) => handleLeagueFavoriteClick(e, league, firstFixture.country)}
                        className="p-1 hover:bg-gray-800/50 rounded transition-colors"
                        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star
                          className={`w-4 h-4 sm:w-3 sm:h-3 ${isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                        />
                      </button>
                      <button onClick={() => toggleLeague(league)}>
                        {expandedLeagues.has(league) ? (
                          <ChevronUp className="w-4 h-4 sm:w-3 sm:h-3 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 sm:w-3 sm:h-3 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* League Fixtures */}
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
